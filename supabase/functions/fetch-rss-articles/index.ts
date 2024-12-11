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

    // Get first available bot profile for RSS feed posts
    const { data: botProfiles, error: botError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('is_bot', true)
      .limit(1)
      .single();

    if (botError) {
      console.error('Error fetching bot profile:', botError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch bot profile' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!botProfiles) {
      console.error('No bot profiles found');
      return new Response(
        JSON.stringify({ error: 'No bot profiles found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const botId = botProfiles.id;
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
          console.log(`Processing source: ${source.name}`);
          const newPosts = await fetchAndParseRSSFeed(supabaseClient, source, botId);
          console.log(`Successfully processed ${newPosts} new posts from ${source.name}`);
          
          if (typeof newPosts === 'number') {
            totalNewPosts += newPosts;
            
            if (newPosts > 0) {
              await updateLastFetchTime(supabaseClient, source.id);
            }
          }
        } catch (sourceError) {
          console.error(`Error processing source ${source.name}:`, sourceError);
          errors.push(`${source.name}: ${sourceError.message}`);
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