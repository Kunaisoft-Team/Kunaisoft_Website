import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './utils/cors.ts';
import { fetchReliableSources, fetchRSSFeed } from './utils/rss-fetcher.ts';
import { processAndStorePost } from './utils/post-processor.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey, { 
      auth: { persistSession: false } 
    });

    console.log('Fetching RSS bot profile...');
    const { data: botProfile, error: botError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('is_bot', true)
      .eq('full_name', 'RSS Bot')
      .single();

    if (botError || !botProfile) {
      console.error('Error fetching bot profile:', botError);
      throw new Error('Failed to fetch bot profile');
    }

    const botId = botProfile.id;
    console.log('Using Bot ID:', botId);

    const sources = await fetchReliableSources(supabaseClient);
    const results = [];
    const errors = [];

    for (const source of sources) {
      try {
        console.log(`Processing source: ${source.name}`);
        
        const feed = await fetchRSSFeed(source.url);
        
        const entries = Array.isArray(feed?.rss?.channel?.item) 
          ? feed.rss?.channel?.item 
          : Array.isArray(feed?.feed?.entry) 
            ? feed.feed?.entry 
            : [];
        
        console.log(`Found ${entries.length} entries in ${source.name}`);

        for (const entry of entries) {
          try {
            const post = await processAndStorePost(supabaseClient, entry, botId);
            results.push(post);
            console.log(`Created post: ${post.title}`);
          } catch (entryError) {
            console.error(`Error processing entry from ${source.name}:`, entryError);
            errors.push(`Error processing entry from ${source.name}: ${entryError?.message || 'Unknown error'}`);
            continue;
          }
        }

        await supabaseClient
          .from('rss_sources')
          .update({ last_fetch_at: new Date().toISOString() })
          .eq('id', source.id);

      } catch (sourceError) {
        console.error(`Error processing source ${source.name}:`, sourceError);
        errors.push(`Failed to process source ${source.name}: ${sourceError?.message || 'Unknown error'}`);
        continue;
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Successfully processed ${results.length} posts from reliable sources`,
        posts: results,
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: errors.length > 0 ? 207 : 200
      }
    );

  } catch (error) {
    console.error('Error in main function:', error);
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Unknown error occurred',
        stack: error?.stack
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});