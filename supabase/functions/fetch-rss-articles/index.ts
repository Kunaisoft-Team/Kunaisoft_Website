import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Parser } from 'https://deno.land/x/rss@1.0.0/mod.ts'

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchRSSFeed(url: string) {
  try {
    console.log(`Fetching RSS feed from ${url}...`)
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`Failed to fetch RSS feed from ${url}. Status: ${response.status}`)
      return null
    }
    const xml = await response.text()
    console.log(`Successfully fetched XML content from ${url}`)
    const parser = new Parser()
    const feed = await parser.parse(xml)
    console.log(`Successfully parsed feed from ${url}. Found ${feed.entries?.length || 0} entries`)
    return feed
  } catch (error) {
    console.error(`Error fetching RSS feed from ${url}:`, error)
    return null
  }
}

async function processRSSFeeds() {
  console.log('Starting RSS feed processing...')
  
  // Get active RSS sources
  const { data: sources, error: sourcesError } = await supabase
    .from('rss_sources')
    .select('*')
    .eq('active', true)

  if (sourcesError) {
    console.error('Error fetching RSS sources:', sourcesError)
    return
  }

  console.log(`Found ${sources?.length || 0} active RSS sources`)

  // Process each source
  for (const source of sources || []) {
    console.log(`Processing source: ${source.name} (${source.url})`)
    
    const feed = await fetchRSSFeed(source.url)
    if (!feed) {
      console.log(`Skipping source ${source.name} due to fetch/parse error`)
      continue
    }

    // Here you would process the feed entries
    // For now, we'll just log them
    console.log(`Feed ${source.name} entries:`, feed.entries?.length)

    // Update last fetch time
    const { error: updateError } = await supabase
      .from('rss_sources')
      .update({ last_fetch_at: new Date().toISOString() })
      .eq('id', source.id)

    if (updateError) {
      console.error(`Error updating last_fetch_at for source ${source.name}:`, updateError)
    } else {
      console.log(`Successfully updated last_fetch_at for source ${source.name}`)
    }
  }

  console.log('RSS feed processing completed')
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting RSS feed processing endpoint')
    await processRSSFeeds()
    return new Response(
      JSON.stringify({ message: 'RSS feeds processed successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing RSS feeds:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process RSS feeds', details: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})