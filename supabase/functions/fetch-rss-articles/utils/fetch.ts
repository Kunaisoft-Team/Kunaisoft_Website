import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { parse as parseXML } from "https://deno.land/x/xml@2.1.1/mod.ts";
import { RSSSource, RSSEntry } from './types.ts';
import { storeArticleAsPost } from './storage.ts';

export async function fetchRSSSources(supabase: ReturnType<typeof createClient>) {
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
  return sources as RSSSource[];
}

export async function updateLastFetchTime(
  supabase: ReturnType<typeof createClient>, 
  sourceId: string
) {
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

export async function fetchAndParseRSSFeed(
  supabase: ReturnType<typeof createClient>, 
  source: RSSSource, 
  botId: string
): Promise<number> {
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
    const entries = (parsedXML.rss?.channel?.item || parsedXML.feed?.entry || []) as RSSEntry[];
    console.log(`Found ${entries.length} entries in feed`);
    
    let storedCount = 0;
    for (const entry of entries) {
      try {
        const stored = await storeArticleAsPost(supabase, entry, source.category, botId);
        if (stored) storedCount++;
      } catch (error) {
        console.error(`Error storing entry from ${source.name}:`, error);
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