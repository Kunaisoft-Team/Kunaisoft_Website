import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { parseFeed } from "https://deno.land/x/rss/mod.ts";

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
    const feed = await parseFeed(xml)
    
    console.log(`Fetched ${feed.entries?.length || 0} articles from RSS feed`)

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

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

    // Get default tag for RSS posts
    const { data: aiToolsTag } = await supabaseClient
      .from('tags')
      .select('id')
      .eq('name', 'ai_tools')
      .single()

    let tagId
    if (!aiToolsTag) {
      const { data: newTag } = await supabaseClient
        .from('tags')
        .insert({
          name: 'ai_tools'
        })
        .select()
        .single()
      tagId = newTag?.id
    } else {
      tagId = aiToolsTag.id
    }

    // Process each article
    if (feed.entries) {
      for (const entry of feed.entries) {
        const title = entry.title?.value || entry.title
        const content = entry.content?.value || entry.description?.value || entry.description || ''
        const excerpt = content.substring(0, 297) + '...' // Ensure we don't exceed text field limits
        const link = entry.links?.[0]?.href || entry.link
        
        // Skip if any required field is missing
        if (!title || !content) {
          console.log(`Skipping entry due to missing required fields: ${title}`)
          continue
        }

        try {
          // Check if post already exists
          const { data: existingPost } = await supabaseClient
            .from('posts')
            .select('id')
            .eq('title', title)
            .single()

          if (!existingPost) {
            // Insert new post with all required fields
            const { data: newPost, error: postError } = await supabaseClient
              .from('posts')
              .insert({
                title,
                content,
                excerpt,
                author_id: botId,
                slug: link,
                reading_time_minutes: Math.ceil(content.split(' ').length / 200), // Estimate reading time
                meta_description: excerpt,
                meta_keywords: ['ai', 'machine learning', 'tutorial']
              })
              .select()
              .single()

            if (postError) {
              console.error('Error inserting post:', postError)
              continue
            }

            // Add tag to post
            if (newPost) {
              const { error: tagError } = await supabaseClient
                .from('posts_tags')
                .insert({
                  post_id: newPost.id,
                  tag_id: tagId
                })

              if (tagError) {
                console.error('Error adding tag to post:', tagError)
              } else {
                console.log('Successfully created post with tag:', title)
              }
            }
          } else {
            console.log('Post already exists:', title)
          }
        } catch (error) {
          console.error('Error processing entry:', error)
          continue
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Processed ${feed.entries?.length || 0} entries`
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in RSS fetch:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})