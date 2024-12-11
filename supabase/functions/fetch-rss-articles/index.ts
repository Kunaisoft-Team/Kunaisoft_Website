import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { parse as parseXML } from "https://deno.land/x/xml@2.1.1/mod.ts";
import { corsHeaders } from './utils/cors.ts';
import { getRSSBotProfile } from './utils/profile.ts';
import { storeArticleAsPost } from './utils/storage.ts';

async function fetchRSSSources(supabase: ReturnType<typeof createClient>) {
  console.log('Fetching RSS sources...');
  const { data: sources, error: sourcesError } = await supabase
    .from('rss_sources')
    .select('*')
    .eq('active', true);

  if (sourcesError) {
    console.error('Error fetching RSS sources:', sourcesError);
    throw new Error('Failed to fetch RSS sources');
  }

  console.log(`Found ${sources?.length || 0} active RSS sources`);
  return sources;
}

async function updateLastFetchTime(supabase: ReturnType<typeof createClient>, sourceId: string) {
  console.log('Updating last fetch time for source:', sourceId);
  const { error: updateError } = await supabase
    .from('rss_sources')
    .update({ last_fetch_at: new Date().toISOString() })
    .eq('id', sourceId);

  if (updateError) {
    console.error(`Error updating last_fetch_at for source ${sourceId}:`, updateError);
    throw updateError;
  }
}

async function fetchAndParseRSSFeed(supabase: ReturnType<typeof createClient>, source: any, botId: string) {
  console.log(`Fetching RSS feed: ${source.name} (${source.url})`);
  
  try {
    const response = await fetch(source.url, {
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
        'User-Agent': 'RSS Reader Bot/1.0',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xml = await response.text();
    console.log(`Received XML response of length: ${xml.length}`);
    
    const parsedXML = parseXML(xml);
    const entries = parsedXML.rss?.channel?.item || parsedXML.feed?.entry || [];
    console.log(`Found ${entries.length} entries in feed`);
    
    let storedCount = 0;
    for (const entry of entries) {
      try {
        await storeArticleAsPost(supabase, entry, source.category, botId);
        storedCount++;
      } catch (error) {
        console.error(`Error storing entry from ${source.name}:`, error);
        // Continue with next entry even if one fails
        continue;
      }
    }
    
    console.log(`Successfully stored ${storedCount} new posts from ${source.name}`);
    return storedCount;
  } catch (error) {
    console.error(`Error processing feed ${source.name}:`, error);
    return 0;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
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
    for (const source of sources || []) {
      try {
        const newPosts = await fetchAndParseRSSFeed(supabase, source, botId);
        totalNewPosts += newPosts;
        
        if (newPosts > 0) {
          await updateLastFetchTime(supabase, source.id);
        }
      } catch (error) {
        console.error(`Error processing source ${source.name}:`, error);
        errors.push({ source: source.name, error: error.message });
        // Continue with next source even if one fails
        continue;
      }
    }

    // If we have errors but also some successes, return a partial success response
    if (errors.length > 0 && totalNewPosts > 0) {
      return new Response(
        JSON.stringify({ 
          message: 'RSS feeds partially processed', 
          totalNewPosts,
          processedSources: sources?.length || 0,
          errors
        }),
        {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
          status: 207, // Multi-Status
        }
      );
    }

    // If we have only errors and no successes, return an error response
    if (errors.length > 0 && totalNewPosts === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process RSS feeds', 
          errors
        }),
        {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
          status: 500,
        }
      );
    }

    // If everything was successful
    return new Response(
      JSON.stringify({ 
        message: 'RSS feeds processed successfully', 
        totalNewPosts,
        processedSources: sources?.length || 0
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200,
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
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500,
      }
    );
  }
});