import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './utils/cors.ts';
import { fetchRSSSources, fetchAndParseRSSFeed, updateLastFetchTime } from './utils/fetch.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    console.log('Fetching existing RSS bot profile...');
    
    // Get the single RSS bot profile with proper error handling
    let botProfile;
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('is_bot', true)
        .eq('full_name', 'RSS Bot')
        .single();

      if (error) throw error;
      if (!data) throw new Error('RSS Bot profile not found');
      botProfile = data;
    } catch (error) {
      console.error('Error fetching bot profile:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch bot profile', details: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const botId = botProfile.id;
    console.log('Using Bot ID:', botId);

    let totalNewPosts = 0;
    const errors: string[] = [];

    try {
      const sources = await fetchRSSSources(supabaseClient);
      
      if (!sources || sources.length === 0) {
        return new Response(
          JSON.stringify({ message: 'No active RSS sources found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      for (const source of sources) {
        try {
          if (!source?.id || !source?.name || !source?.url) {
            console.error('Invalid source data:', source);
            errors.push(`Invalid source data: ${JSON.stringify(source)}`);
            continue;
          }

          console.log(`Processing source: ${source.name}`);
          const newPosts = await fetchAndParseRSSFeed(supabaseClient, source, botId);
          
          if (typeof newPosts !== 'number') {
            throw new Error('Invalid return value from fetchAndParseRSSFeed');
          }
          
          console.log(`Successfully processed ${newPosts} new posts from ${source.name}`);
          totalNewPosts += newPosts;
          
          if (newPosts > 0) {
            await updateLastFetchTime(supabaseClient, source.id).catch(error => {
              console.error(`Failed to update last fetch time for ${source.name}:`, error);
              errors.push(`Failed to update last fetch time for ${source.name}: ${error.message}`);
            });
          }
        } catch (sourceError) {
          console.error(`Error processing source ${source?.name || 'unknown'}:`, sourceError);
          errors.push(`${source?.name || 'unknown'}: ${sourceError.message}`);
        }
      }

      // Return appropriate response based on results
      if (errors.length > 0 && totalNewPosts === 0) {
        return new Response(
          JSON.stringify({ 
            error: 'Failed to process RSS feeds', 
            errors 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      if (errors.length > 0) {
        return new Response(
          JSON.stringify({ 
            message: 'RSS feeds partially processed', 
            totalNewPosts,
            errors
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 207 }
        );
      }

      return new Response(
        JSON.stringify({ 
          message: 'RSS feeds successfully processed',
          totalNewPosts 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } catch (processError) {
      console.error('Error in RSS feed processing:', processError);
      return new Response(
        JSON.stringify({ error: processError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in main function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});