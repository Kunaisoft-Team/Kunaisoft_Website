import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { parse as parseXML } from "https://deno.land/x/xml@2.1.1/mod.ts";
import { RELIABLE_SOURCES } from './config.ts';

export async function fetchReliableSources(supabaseClient: ReturnType<typeof createClient>) {
  console.log('Fetching reliable RSS sources...');
  const sourcesQuery = supabaseClient
    .from('rss_sources')
    .select('*')
    .eq('active', true)
    .limit(5);

  // Add filter conditions for each reliable source
  const filterConditions = RELIABLE_SOURCES.map(source => `url.ilike.%${source}%`).join(',');
  sourcesQuery.or(filterConditions);

  const { data: sources, error: sourcesError } = await sourcesQuery;

  if (sourcesError) {
    console.error('Error fetching RSS sources:', sourcesError);
    throw sourcesError;
  }

  console.log(`Found ${sources?.length || 0} reliable RSS sources`);
  return sources || [];
}

export async function fetchRSSFeed(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
        'User-Agent': 'RSS Reader Bot/1.0'
      }
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const xml = await response.text();
    if (!xml.trim()) {
      throw new Error('Empty response');
    }

    const feed = parseXML(xml);
    if (!feed) {
      throw new Error('Invalid XML');
    }

    return feed;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}