// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { parse as parseXML } from "https://deno.land/x/xml@2.1.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to get RSS bot profile or create if doesn't exist
async function getRSSBotProfile(supabase: any) {
  console.log('Getting or creating RSS Bot profile...');
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('full_name', 'RSS Bot')
    .single();

  if (profileError) {
    console.log('Creating new RSS Bot profile...');
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        full_name: 'RSS Bot',
        avatar_url: null
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating RSS bot profile:', createError);
      throw createError;
    }
    return newProfile.id;
  }

  return profile.id;
}

// Function to create a slug from a title
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Function to extract content from various RSS formats
function extractContent(item: any): string {
  const content = item.content || 
         item['content:encoded'] || 
         item.description || 
         item.summary || 
         '';
  
  console.log('Extracted content length:', content.length);
  return content;
}

// Function to extract image URL from content or media
function extractImageUrl(item: any, content: string): string | null {
  if (item['media:content']?.url) {
    console.log('Found media:content image:', item['media:content'].url);
    return item['media:content'].url;
  }

  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    console.log('Found enclosure image:', item.enclosure.url);
    return item.enclosure.url;
  }

  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch) {
    console.log('Found image in content:', imgMatch[1]);
    return imgMatch[1];
  }

  console.log('No image found in RSS item');
  return null;
}

// Function to store an article as a blog post
async function storeArticleAsPost(supabase: any, article: any, sourceCategory: string, botId: string) {
  console.log('Processing article:', article.title);
  
  try {
    const content = extractContent(article);
    const imageUrl = extractImageUrl(article, content);
    const slug = createSlug(article.title);

    // Check if post with this title already exists
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id')
      .eq('title', article.title)
      .single();

    if (existingPost) {
      console.log('Post already exists:', article.title);
      return false;
    }

    // Create the blog post
    console.log('Creating new post:', article.title);
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        title: article.title,
        content: content,
        excerpt: content.substring(0, 200) + '...',
        author_id: botId,
        slug: slug,
        image_url: imageUrl,
        meta_description: content.substring(0, 160),
        meta_keywords: [sourceCategory],
        reading_time_minutes: Math.ceil(content.split(' ').length / 200)
      })
      .select()
      .single();

    if (postError) {
      console.error('Error creating post:', postError);
      return false;
    }

    // Get or create the tag for the category
    console.log('Processing tag for category:', sourceCategory);
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .select('id')
      .eq('name', sourceCategory)
      .single();

    if (!tagError && tag) {
      // Add the tag to the post
      const { error: tagLinkError } = await supabase
        .from('posts_tags')
        .insert({
          post_id: post.id,
          tag_id: tag.id
        });

      if (tagLinkError) {
        console.error('Error linking tag to post:', tagLinkError);
      }
    }

    console.log('Successfully created post:', post.id);
    return true;
  } catch (error) {
    console.error('Error in storeArticleAsPost:', error);
    return false;
  }
}

// Function to fetch RSS sources from Supabase
async function fetchRSSSources(supabase: any) {
  console.log('Fetching RSS sources...');
  const { data: sources, error: sourcesError } = await supabase
    .from('rss_sources')
    .select('*')
    .eq('active', true);

  if (sourcesError) {
    console.error('Error fetching RSS sources:', sourcesError);
    throw new Error('Failed to fetch RSS sources');
  }

  console.log(`Found ${sources?.length || 0} active RSS sources`);
  return sources;
}

// Function to update last fetch time
async function updateLastFetchTime(supabase: any, sourceId: string) {
  console.log('Updating last fetch time for source:', sourceId);
  const { error: updateError } = await supabase
    .from('rss_sources')
    .update({ last_fetch_at: new Date().toISOString() })
    .eq('id', sourceId);

  if (updateError) {
    console.error(`Error updating last_fetch_at for source ${sourceId}:`, updateError);
  }
}

// Function to fetch and parse RSS feed
async function fetchAndParseRSSFeed(supabase: any, source: any, botId: string) {
  console.log(`Fetching RSS feed: ${source.name} (${source.url})`);
  
  try {
    const response = await fetch(source.url, {
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
        'User-Agent': 'RSS Reader Bot/1.0',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xml = await response.text();
    console.log(`Received XML response of length: ${xml.length}`);
    
    const parsedXML = parseXML(xml);
    const entries = parsedXML.rss?.channel?.item || parsedXML.feed?.entry || [];
    console.log(`Found ${entries.length} entries in feed`);
    
    let storedCount = 0;
    for (const entry of entries) {
      const stored = await storeArticleAsPost(supabase, entry, source.category, botId);
      if (stored) storedCount++;
    }
    
    console.log(`Successfully stored ${storedCount} new posts from ${source.name}`);
    return storedCount;
  } catch (error) {
    console.error(`Error processing feed ${source.name}:`, error);
    return 0;
  }
}

// Main request handler
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204,
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    console.log('Starting RSS feed processing');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get or create RSS Bot profile
    const botId = await getRSSBotProfile(supabase);
    console.log('Using RSS Bot ID:', botId);
    
    // Fetch active RSS sources
    const sources = await fetchRSSSources(supabase);
    console.log(`Processing ${sources?.length || 0} RSS sources`);
    
    let totalNewPosts = 0;
    
    // Process each source
    for (const source of sources || []) {
      const newPosts = await fetchAndParseRSSFeed(supabase, source, botId);
      totalNewPosts += newPosts;
      
      if (newPosts > 0) {
        await updateLastFetchTime(supabase, source.id);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'RSS feeds processed', 
        totalNewPosts,
        processedSources: sources?.length || 0
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in RSS feed processing:', error);
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
    );
  }
});