import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { parseFeed } from "https://deno.land/x/rss/mod.ts";
import { enhanceContent } from './utils/contentEnhancer.ts';
import { getRandomPlaceholderImage } from './utils/imageUtils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting RSS fetch from Machine Learning Mastery...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Kunaisoft News profile
    const { data: kunaisoftProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('full_name', 'Kunaisoft News')
      .single()

    if (profileError) {
      throw new Error(`Error fetching Kunaisoft News profile: ${profileError.message}`)
    }

    if (!kunaisoftProfile?.id) {
      throw new Error('Kunaisoft News profile not found')
    }

    // Get default tag for RSS posts
    const { data: aiToolsTag } = await supabaseClient
      .from('tags')
      .select('id')
      .eq('name', 'ai_tools')
      .single()

    let tagId = aiToolsTag?.id

    if (!tagId) {
      const { data: newTag } = await supabaseClient
        .from('tags')
        .insert({ name: 'ai_tools' })
        .select()
        .single()
      tagId = newTag?.id
    }

    // Fetch RSS feed
    const response = await fetch('https://machinelearningmastery.com/feed/')
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`)
    }

    const xml = await response.text()
    const feed = await parseFeed(xml)
    
    console.log(`Fetched ${feed.entries?.length || 0} articles from RSS feed`)

    let processedCount = 0
    if (feed.entries) {
      for (const entry of feed.entries) {
        const title = entry.title?.value || entry.title
        const originalContent = entry.content?.value || entry.description?.value || entry.description || ''
        
        // Skip if any required field is missing
        if (!title || !originalContent) {
          console.log(`Skipping entry due to missing required fields: ${title}`)
          continue
        }

        const slug = generateSlug(title)

        try {
          // Check if post already exists
          const { data: existingPost } = await supabaseClient
            .from('posts')
            .select('id')
            .eq('slug', slug)
            .single()

          if (!existingPost) {
            console.log('Creating new post:', title)
            
            // Enhance content if needed
            const { content, excerpt, readingTime } = enhanceContent(originalContent, title)
            
            // Get a unique image for this post
            const imageUrl = getRandomPlaceholderImage()
            
            // Insert new post
            const { data: newPost, error: postError } = await supabaseClient
              .from('posts')
              .insert({
                title,
                content,
                excerpt,
                author_id: kunaisoftProfile.id,
                slug,
                image_url: imageUrl,
                reading_time_minutes: readingTime,
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
            if (newPost && tagId) {
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
                processedCount++
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
        message: `Successfully processed ${processedCount} new entries out of ${feed.entries?.length || 0} total entries`
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