// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { parse as parseXML } from "https://deno.land/x/xml@2.1.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RSSSource {
  id: string;
  name: string;
  url: string;
}

interface FetchResult {
  source: string;
  status: 'success' | 'error';
  message?: string;
  entries?: number;
}

// Function to get headers for RSS request
function getRSSHeaders(sourceUrl: string) {
  const headers = {
    'Accept': 'application/rss+xml, application/xml, text/xml',
    'User-Agent': 'RSS Reader Bot/1.0'
  }

  if (sourceUrl.includes('lifehacker.com')) {
    headers['Accept'] = 'application/rss+xml, application/xml, text/xml, application/atom+xml';
    headers['Cache-Control'] = 'no-cache';
  }

  return headers;
}

// Function to fetch RSS sources from Supabase
async function fetchRSSSources(supabase: any) {
  const { data: sources, error: sourcesError } = await supabase
    .from('rss_sources')
    .select('*')
    .eq('active', true)

  if (sourcesError) {
    console.error('Error fetching RSS sources:', sourcesError)
    throw new Error('Failed to fetch RSS sources')
  }

  return sources;
}

// Function to update last fetch time
async function updateLastFetchTime(supabase: any, sourceId: string) {
  const { error: updateError } = await supabase
    .from('rss_sources')
    .update({ last_fetch_at: new Date().toISOString() })
    .eq('id', sourceId)

  if (updateError) {
    console.error(`Error updating last_fetch_at for source ${sourceId}:`, updateError)
  }
}

// Function to fetch and parse RSS feed
async function fetchAndParseRSSFeed(source: RSSSource): Promise<FetchResult> {
  try {
    console.log(`Fetching RSS feed: ${source.name} (${source.url})`)
    
    const headers = getRSSHeaders(source.url)
    const response = await fetch(source.url, { headers })
    
    if (!response.ok) {
      console.error(`HTTP error fetching ${source.name}: ${response.status} - ${response.statusText}`)
      return { 
        source: source.name, 
        status: 'error', 
        message: `HTTP error! status: ${response.status} - ${response.statusText}` 
      }
    }
    
    const xml = await response.text()
    
    if (!xml || xml.trim().length === 0) {
      console.error(`Empty response from ${source.name}`);
      return {
        source: source.name,
        status: 'error',
        message: 'Empty response received'
      }
    }
    
    const parsedXML = parseXML(xml)
    
    if (!parsedXML?.rss?.channel && !parsedXML?.feed) {
      throw new Error('Invalid feed structure - neither RSS nor Atom format detected')
    }
    
    const entries = parsedXML.rss?.channel?.item || parsedXML.feed?.entry || []
    
    console.log(`Successfully parsed feed: ${source.name} with ${entries.length} entries`)
    return { 
      source: source.name, 
      status: 'success',
      entries: entries.length
    }
    
  } catch (error) {
    console.error(`Error processing feed ${source.name}:`, error)
    return { 
      source: source.name, 
      status: 'error', 
      message: error.message 
    }
  }
}

// Main request handler
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204,
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    })
  }

  try {
    console.log('Starting RSS feed processing')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const sources = await fetchRSSSources(supabase)
    
    console.log(`Processing ${sources?.length || 0} RSS sources`)
    
    const results: FetchResult[] = []
    
    for (const source of sources || []) {
      const result = await fetchAndParseRSSFeed(source)
      results.push(result)
      
      if (result.status === 'success') {
        await updateLastFetchTime(supabase, source.id)
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'RSS feeds processed', 
        results 
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in RSS feed processing:', error)
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
    )
  }
})