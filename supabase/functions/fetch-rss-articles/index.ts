// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { parse as parseXML } from "https://deno.land/x/xml@2.1.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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

    const { data: sources, error: sourcesError } = await supabase
      .from('rss_sources')
      .select('*')
      .eq('active', true)

    if (sourcesError) {
      console.error('Error fetching RSS sources:', sourcesError)
      throw new Error('Failed to fetch RSS sources')
    }

    console.log(`Processing ${sources?.length || 0} RSS sources`)
    
    const results = []
    
    for (const source of sources || []) {
      try {
        console.log(`Fetching RSS feed: ${source.name} (${source.url})`)
        
        // Use simple, standard headers for RSS feeds
        const headers = {
          'Accept': 'application/rss+xml, application/xml, text/xml',
          'User-Agent': 'RSS Reader Bot/1.0'
        }

        // Add specific handling for Lifehacker
        if (source.url.includes('lifehacker.com')) {
          headers['Accept'] = 'application/rss+xml, application/xml, text/xml, application/atom+xml';
          headers['Cache-Control'] = 'no-cache';
        }
        
        const response = await fetch(source.url, { headers })
        
        if (!response.ok) {
          console.error(`HTTP error fetching ${source.name}: ${response.status} - ${response.statusText}`)
          results.push({ 
            source: source.name, 
            status: 'error', 
            message: `HTTP error! status: ${response.status} - ${response.statusText}` 
          })
          continue
        }
        
        const xml = await response.text()
        
        // Check if we got a valid XML response
        if (!xml || xml.trim().length === 0) {
          console.error(`Empty response from ${source.name}`);
          results.push({
            source: source.name,
            status: 'error',
            message: 'Empty response received'
          });
          continue;
        }
        
        try {
          const parsedXML = parseXML(xml)
          
          // Validate RSS structure
          if (!parsedXML?.rss?.channel) {
            // Check for Atom format as fallback
            if (!parsedXML?.feed) {
              throw new Error('Invalid feed structure - neither RSS nor Atom format detected')
            }
          }
          
          // Extract feed entries from the parsed XML
          const entries = parsedXML.rss?.channel?.item || parsedXML.feed?.entry || []
          
          console.log(`Successfully parsed feed: ${source.name} with ${entries.length} entries`)
          results.push({ 
            source: source.name, 
            status: 'success',
            entries: entries.length
          })

          const { error: updateError } = await supabase
            .from('rss_sources')
            .update({ last_fetch_at: new Date().toISOString() })
            .eq('id', source.id)

          if (updateError) {
            console.error(`Error updating last_fetch_at for ${source.name}:`, updateError)
          }
        } catch (parseError) {
          console.error(`Error parsing feed for ${source.name}:`, parseError)
          results.push({ 
            source: source.name, 
            status: 'error', 
            message: `Feed parsing error: ${parseError.message}` 
          })
        }

      } catch (error) {
        console.error(`Error processing source ${source.name}:`, error)
        results.push({ 
          source: source.name, 
          status: 'error', 
          message: error.message 
        })
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