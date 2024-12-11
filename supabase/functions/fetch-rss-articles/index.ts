import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { parseFeed } from "https://deno.land/x/rss/mod.ts";
import { enhanceContent } from './utils/contentEnhancer.ts';
import { getRandomTopicImage } from './utils/imageUtils.ts';

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

function determineTopicFromContent(content: string, title: string): string {
  const contentLower = (content + ' ' + title).toLowerCase();
  
  if (contentLower.includes('ai') || contentLower.includes('artificial intelligence') || contentLower.includes('machine learning')) {
    return 'ai_tools';
  }
  if (contentLower.includes('prompt') || contentLower.includes('gpt') || contentLower.includes('chatbot')) {
    return 'ai_prompts';
  }
  if (contentLower.includes('productivity') || contentLower.includes('efficiency') || contentLower.includes('workflow')) {
    return 'productivity';
  }
  if (contentLower.includes('task') || contentLower.includes('project') || contentLower.includes('management')) {
    return 'getting_things_done';
  }
  
  return 'productivity'; // default category
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting RSS fetch process...')
    
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
        
        if (!title || !originalContent) {
          console.log(`Skipping entry due to missing required fields: ${title}`)
          continue
        }

        const slug = generateSlug(title)
        const topic = determineTopicFromContent(originalContent, title)

        try {
          // Check if post already exists
          const { data: existingPost } = await supabaseClient
            .from('posts')
            .select('id')
            .eq('slug', slug)
            .single()

          if (!existingPost) {
            console.log('Creating new post:', title)
            
            // Enhance content with topic-specific formatting and images
            const { content, excerpt, readingTime } = enhanceContent(originalContent, title, topic)
            
            // Get a topic-specific image
            const imageUrl = getRandomTopicImage(topic)
            
            // Insert new post
            const { error: postError } = await supabaseClient
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
                meta_keywords: [topic, 'tutorial', 'guide', 'technology']
              })

            if (postError) {
              console.error('Error inserting post:', postError)
              continue
            }

            console.log('Successfully created post:', title)
            processedCount++
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