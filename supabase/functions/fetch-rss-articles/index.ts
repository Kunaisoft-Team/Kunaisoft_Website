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
    const xml = await response.text()
    const parser = new Parser()
    return await parser.parse(xml)
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

  console.log(`Found ${sources?.length} active RSS sources`)

  // Process each source
  for (const source of sources || []) {
    console.log(`Processing source: ${source.name}`)
    
    const feed = await fetchRSSFeed(source.url)
    if (!feed) continue

    // Update last fetch time
    await supabase
      .from('rss_sources')
      .update({ last_fetch_at: new Date().toISOString() })
      .eq('id', source.id)

    console.log(`Successfully processed ${source.name}`)
  }

  console.log('RSS feed processing completed')
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
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
      JSON.stringify({ error: 'Failed to process RSS feeds' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})