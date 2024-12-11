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
  
  // Get the latest successful fetch time for each category
  const { data: lastFetches, error: fetchError } = await supabase
    .from('rss_sources')
    .select('category, last_fetch_at')
    .order('last_fetch_at', { ascending: false })
    .limit(5);

  if (fetchError) {
    console.error('Error fetching last fetch times:', fetchError);
    return [];
  }

  // Create a map of categories to their last fetch time
  const categoryLastFetch = new Map();
  lastFetches?.forEach(fetch => {
    if (!categoryLastFetch.has(fetch.category)) {
      categoryLastFetch.set(fetch.category, fetch.last_fetch_at);
    }
  });

  // Get one active source per category
  const { data: sources, error: sourcesError } = await supabase
    .from('rss_sources')
    .select('*')
    .eq('active', true)
    .or(RELIABLE_SOURCES.map(domain => `url.ilike.%${domain}%`).join(','));

  if (sourcesError) {
    console.error('Error fetching RSS sources:', sourcesError);
    return [];
  }

  if (!sources || sources.length === 0) {
    console.log('No active RSS sources found');
    return [];
  }

  // Filter to get one source per category
  const categoryMap = new Map();
  const filteredSources = sources.filter(source => {
    if (!categoryMap.has(source.category)) {
      categoryMap.set(source.category, source);
      return true;
    }
    return false;
  });

  console.log(`Found ${filteredSources.length} active RSS sources (one per category):`, 
    filteredSources.map(s => `${s.category}: ${s.url}`));
  return filteredSources;
}

export async function fetchRSSFeed(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

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
      console.log('Parsed XML structure:', JSON.stringify(parsedXML, null, 2));
    } catch (parseError) {
      console.error('Failed to parse XML:', parseError);
      throw new Error('Failed to parse XML feed');
    }

    if (!parsedXML) {
      console.error('Parsed XML is null');
      throw new Error('Failed to parse XML feed: null result');
    }

    const entries = [];
    if (parsedXML.rss?.channel?.item) {
      const items = Array.isArray(parsedXML.rss.channel.item) 
        ? parsedXML.rss.channel.item 
        : [parsedXML.rss.channel.item];
      console.log('RSS items found:', items.length);
      entries.push(...items.filter(item => {
        if (!item) {
          console.log('Skipping null RSS item');
          return false;
        }
        console.log('Processing RSS item:', JSON.stringify(item, null, 2));
        return true;
      }));
    } else if (parsedXML.feed?.entry) {
      const items = Array.isArray(parsedXML.feed.entry)
        ? parsedXML.feed.entry
        : [parsedXML.feed.entry];
      console.log('Atom entries found:', items.length);
      entries.push(...items.filter(item => {
        if (!item) {
          console.log('Skipping null Atom entry');
          return false;
        }
        console.log('Processing Atom entry:', JSON.stringify(item, null, 2));
        return true;
      }));
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