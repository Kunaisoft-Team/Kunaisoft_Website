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
    console.log(`Processing ${sources.length} reliable sources`);
    
    const results = [];
    const errors = [];

    for (const source of sources) {
      try {
        if (!source?.url) {
          console.error(`Invalid source configuration:`, source);
          continue;
        }

        console.log(`Processing source: ${source.name} (${source.url})`);
        const { entries, error } = await fetchRSSFeed(source.url);
        
        if (error) {
          console.error(`Error fetching feed from ${source.name}:`, error);
          errors.push(`Failed to fetch from ${source.name}: ${error.message}`);
          continue;
        }

        if (!entries || entries.length === 0) {
          console.log(`No valid entries found for ${source.name}`);
          continue;
        }

        console.log(`Processing ${entries.length} entries from ${source.name}`);

        for (const entry of entries) {
          try {
            if (!entry) {
              console.log(`Skipping null entry from ${source.name}`);
              continue;
            }

            const post = await processAndStorePost(supabaseClient, entry, botId);
            if (post) {
              results.push(post);
              console.log(`Created post: ${post.title}`);
            }
          } catch (entryError) {
            console.error(`Error processing entry from ${source.name}:`, entryError);
            errors.push(`Error processing entry from ${source.name}: ${entryError?.message || 'Unknown error'}`);
            continue;
          }
        }

        // Update last fetch timestamp
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