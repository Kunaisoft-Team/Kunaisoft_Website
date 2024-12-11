import { parse as parseXML } from "https://deno.land/x/xml@2.1.1/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { RSSSource, RSSEntry } from './types.ts';
import { RELIABLE_SOURCES } from './config.ts';

export async function fetchReliableSources(supabase: ReturnType<typeof createClient>): Promise<RSSSource[]> {
  if (!supabase) {
    console.error('Supabase client is null');
    return [];
  }

  console.log('Fetching RSS sources...');
  
  // Create an array of conditions for each reliable source
  const conditions = RELIABLE_SOURCES.map(domain => `url.ilike('%${domain}%')`).join(' or ');
  
  const { data: sources, error: sourcesError } = await supabase
    .from('rss_sources')
    .select('*')
    .eq('active', true)
    .or(conditions)
    .limit(5);

  if (sourcesError) {
    console.error('Error fetching RSS sources:', sourcesError);
    return [];
  }

  if (!sources || sources.length === 0) {
    console.log('No active RSS sources found');
    return [];
  }

  console.log(`Found ${sources.length} active RSS sources:`, sources.map(s => s.url));
  return sources;
}

export async function fetchRSSFeed(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    console.log(`Attempting to fetch RSS feed from: ${url}`);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
        'User-Agent': 'RSS Reader Bot/1.0 (compatible)',
        'Cache-Control': 'no-cache'
      }
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status} for URL: ${url}`);
      throw new Error(`Failed to fetch RSS feed: ${response.status}`);
    }

    const xml = await response.text();
    if (!xml?.trim()) {
      console.error('Empty XML response received');
      throw new Error('Empty XML response received');
    }

    console.log(`Received XML response of length: ${xml.length} from ${url}`);
    
    let parsedXML;
    try {
      parsedXML = parseXML(xml);
    } catch (parseError) {
      console.error('Failed to parse XML:', parseError);
      throw new Error('Failed to parse XML feed');
    }

    if (!parsedXML) {
      console.error('Parsed XML is null');
      throw new Error('Failed to parse XML feed: null result');
    }

    // Safely extract entries with null checks
    const entries = [];
    if (parsedXML.rss?.channel?.item) {
      const items = Array.isArray(parsedXML.rss.channel.item) 
        ? parsedXML.rss.channel.item 
        : [parsedXML.rss.channel.item];
      entries.push(...items.filter(item => item !== null));
    } else if (parsedXML.feed?.entry) {
      const items = Array.isArray(parsedXML.feed.entry)
        ? parsedXML.feed.entry
        : [parsedXML.feed.entry];
      entries.push(...items.filter(item => item !== null));
    }

    if (entries.length === 0) {
      console.log('No valid entries found in feed');
      return { entries: [] };
    }

    console.log(`Successfully parsed ${entries.length} entries from feed`);
    return { entries };
  } catch (error) {
    clearTimeout(timeout);
    console.error(`Error fetching RSS feed from ${url}:`, error);
    return { entries: [], error };
  }
}