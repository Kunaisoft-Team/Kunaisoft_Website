import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './utils/cors.ts';
import { getRSSBotProfile } from './utils/profile.ts';
import { fetchRSSSources, updateLastFetchTime, fetchAndParseRSSFeed } from './utils/fetch.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    );
  }

  try {
    console.log('Starting RSS feed processing');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get or create RSS Bot profile
    let botId;
    try {
      botId = await getRSSBotProfile(supabase);
      if (!botId) throw new Error('Failed to get bot ID');
      console.log('Using RSS Bot ID:', botId);
    } catch (error) {
      console.error('Failed to get/create RSS bot profile:', error);
      throw error;
    }
    
    // Fetch active RSS sources
    let sources;
    try {
      sources = await fetchRSSSources(supabase);
      console.log(`Processing ${sources?.length || 0} RSS sources`);
    } catch (error) {
      console.error('Failed to fetch RSS sources:', error);
      throw error;
    }
    
    let totalNewPosts = 0;
    const errors = [];
    
    // Process each source
    if (sources && sources.length > 0) {
      for (const source of sources) {
        try {
          console.log(`Processing source: ${source.name}`);
          const newPosts = await fetchAndParseRSSFeed(supabase, source, botId);
          console.log(`Successfully processed ${newPosts} new posts from ${source.name}`);
          totalNewPosts += newPosts;
          
          // Only update last fetch time if we successfully processed posts
          if (newPosts > 0) {
            await updateLastFetchTime(supabase, source.id);
          }
        } catch (error) {
          console.error(`Error processing source ${source.name}:`, error);
          errors.push({ source: source.name, error: error.message });
          continue;
        }
      }
    } else {
      console.log('No active RSS sources found');
    }

    // Return appropriate response based on results
    if (errors.length > 0 && totalNewPosts === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process RSS feeds', 
          errors 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ 
          message: 'RSS feeds partially processed', 
          totalNewPosts,
          processedSources: sources?.length || 0,
          errors
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 207
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: 'RSS feeds processed successfully', 
        totalNewPosts,
        processedSources: sources?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in RSS feed processing:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process RSS feeds', 
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});