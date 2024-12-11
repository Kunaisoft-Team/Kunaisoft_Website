import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { parse as parseXML } from "https://deno.land/x/xml@2.1.1/mod.ts";
import { RSSSource, RSSEntry } from './types.ts';
import { storeArticleAsPost } from './storage.ts';

export async function fetchRSSSources(supabase: ReturnType<typeof createClient>): Promise<RSSSource[]> {
  console.log('Fetching RSS sources...');
  const { data: sources, error: sourcesError } = await supabase
    .from('rss_sources')
    .select('*')
    .eq('active', true);

  if (sourcesError) {
    console.error('Error fetching RSS sources:', sourcesError);
    throw new Error('Failed to fetch RSS sources');
  }

  if (!sources || sources.length === 0) {
    console.log('No active RSS sources found');
    return [];
  }

  console.log(`Found ${sources.length} active RSS sources`);
  return sources as RSSSource[];
}

export async function updateLastFetchTime(
  supabase: ReturnType<typeof createClient>, 
  sourceId: string
): Promise<void> {
  if (!sourceId) {
    console.error('Invalid source ID provided');
    throw new Error('Invalid source ID');
  }

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
  if (!source || !source.url || !botId) {
    console.error('Invalid parameters provided:', { source: !!source, botId: !!botId });
    throw new Error('Invalid parameters for RSS feed processing');
  }

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
    if (!xml) {
      throw new Error('Empty XML response received');
    }

    console.log(`Received XML response of length: ${xml.length}`);
    
    const parsedXML = parseXML(xml);
    if (!parsedXML) {
      throw new Error('Failed to parse XML');
    }

    const entries = (parsedXML.rss?.channel?.item || parsedXML.feed?.entry || []) as RSSEntry[];
    if (!entries || entries.length === 0) {
      console.log('No entries found in feed');
      return 0;
    }

    console.log(`Found ${entries.length} entries in feed`);
    
    let storedCount = 0;
    for (const entry of entries) {
      try {
        if (!entry) continue;
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
    throw error;
  }
}