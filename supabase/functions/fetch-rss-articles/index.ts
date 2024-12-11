import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { Feed } from "https://deno.land/x/rss@1.0.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting RSS fetch from Machine Learning Mastery...')
    
    // Fetch RSS feed
    const response = await fetch('https://machinelearningmastery.com/feed/')
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`)
    }

    const xml = await response.text()
    const feed = await Feed.load(xml)
    
    console.log(`Fetched ${feed.entries.length} articles from RSS feed`)

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Process each article
    for (const entry of feed.entries) {
      const title = entry.title?.value
      const content = entry.content?.value || entry.description?.value || ''
      const excerpt = content.substring(0, 300) + '...'
      const link = entry.links[0]?.href
      
      // Check if post already exists
      const { data: existingPost } = await supabaseClient
        .from('posts')
        .select('id')
        .eq('title', title)
        .single()

      if (!existingPost) {
        // Get or create bot profile for RSS posts
        const { data: botProfile } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('full_name', 'ML Mastery Bot')
          .eq('is_bot', true)
          .single()

        let botId
        if (!botProfile) {
          const { data: newBot } = await supabaseClient
            .from('profiles')
            .insert({
              full_name: 'ML Mastery Bot',
              is_bot: true,
            })
            .select()
            .single()
          botId = newBot?.id
        } else {
          botId = botProfile.id
        }

        // Insert new post
        const { error: insertError } = await supabaseClient
          .from('posts')
          .insert({
            title,
            content,
            excerpt,
            author_id: botId,
            slug: link,
          })

        if (insertError) {
          console.error('Error inserting post:', insertError)
        } else {
          console.log('Successfully inserted post:', title)
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in RSS fetch:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})