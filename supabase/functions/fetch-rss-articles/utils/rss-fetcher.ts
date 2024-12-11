import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { parse } from 'https://deno.land/x/xml@2.1.1/mod.ts';

export async function fetchReliableSources(supabaseClient: ReturnType<typeof createClient>) {
  const { data: sources, error } = await supabaseClient
    .from('rss_sources')
    .select('*')
    .eq('active', true);

  if (error) {
    console.error('Error fetching RSS sources:', error);
    throw error;
  }

  return sources || [];
}

export async function fetchRSSFeed(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const xmlText = await response.text();
    const parsed = parse(xmlText);
    
    const entries = parsed.rss?.channel?.item || [];
    return { entries, error: null };
  } catch (error) {
    console.error(`Error fetching RSS feed from ${url}:`, error);
    return { entries: [], error };
  }
}