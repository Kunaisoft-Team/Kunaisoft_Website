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
    // Initialize Supabase client with null checks
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey, { 
      auth: { persistSession: false } 
    });

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

      if (error) {
        console.error('Database error fetching bot profile:', error);
        throw error;
      }
      
      if (!data || !data.id) {
        console.error('No valid bot profile found');
        throw new Error('No valid bot profile found');
      }
      
      botProfile = data;
    } catch (error) {
      console.error('Error in bot profile fetch:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch bot profile', 
          details: error.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    const botId = botProfile.id;
    if (!botId) {
      return new Response(
        JSON.stringify({ error: 'Invalid bot profile ID' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    console.log('Using Bot ID:', botId);

    let totalNewPosts = 0;
    const errors: string[] = [];

    try {
      const sources = await fetchRSSSources(supabaseClient);
      
      if (!Array.isArray(sources)) {
        throw new Error('Invalid response from fetchRSSSources');
      }
      
      if (sources.length === 0) {
        return new Response(
          JSON.stringify({ message: 'No active RSS sources found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      for (const source of sources) {
        try {
          if (!source?.id || !source?.name || !source?.url) {
            const errorMsg = `Invalid source data: ${JSON.stringify(source)}`;
            console.error(errorMsg);
            errors.push(errorMsg);
            continue;
          }

          console.log(`Processing source: ${source.name}`);
          
          const newPosts = await fetchAndParseRSSFeed(supabaseClient, source, botId);
          
          if (typeof newPosts !== 'number') {
            throw new Error(`Invalid return value from fetchAndParseRSSFeed for source ${source.name}`);
          }
          
          console.log(`Successfully processed ${newPosts} new posts from ${source.name}`);
          totalNewPosts += newPosts;
          
          if (newPosts > 0) {
            try {
              await updateLastFetchTime(supabaseClient, source.id);
            } catch (updateError) {
              const errorMsg = `Failed to update last fetch time for ${source.name}: ${updateError.message}`;
              console.error(errorMsg);
              errors.push(errorMsg);
            }
          }
        } catch (sourceError) {
          const errorMsg = `${source?.name || 'unknown'}: ${sourceError.message}`;
          console.error(`Error processing source:`, errorMsg);
          errors.push(errorMsg);
          continue;
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