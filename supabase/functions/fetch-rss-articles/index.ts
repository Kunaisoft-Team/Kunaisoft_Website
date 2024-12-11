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
  category: string;
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
    'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
    'User-Agent': 'RSS Reader Bot/1.0',
    'Cache-Control': 'no-cache'
  }
  return headers;
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
  return item.content || 
         item['content:encoded'] || 
         item.description || 
         item.summary || 
         '';
}

// Function to extract image URL from content or media
function extractImageUrl(item: any, content: string): string | null {
  // Try to get image from media:content
  if (item['media:content']?.url) {
    return item['media:content'].url;
  }

  // Try to get image from enclosure
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }

  // Try to extract first image from content
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : null;
}

// Function to fetch RSS sources from Supabase
async function fetchRSSSources(supabase: any): Promise<RSSSource[]> {
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

// Function to store an article as a blog post
async function storeArticleAsPost(supabase: any, article: any, sourceCategory: string) {
  const content = extractContent(article);
  const imageUrl = extractImageUrl(article, content);
  const slug = createSlug(article.title);

  // Get the system bot user (create if doesn't exist)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('full_name', 'RSS Bot')
    .single();

  if (profileError) {
    // Create the RSS bot profile
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
  }

  const botId = profile?.id || newProfile.id;

  // Create the blog post
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

  return true;
}

// Function to fetch and parse RSS feed
async function fetchAndParseRSSFeed(supabase: any, source: RSSSource): Promise<FetchResult> {
  try {
    console.log(`Fetching RSS feed: ${source.name} (${source.url})`);
    
    const headers = getRSSHeaders(source.url);
    const response = await fetch(source.url, { headers });
    
    if (!response.ok) {
      console.error(`HTTP error fetching ${source.name}: ${response.status} - ${response.statusText}`);
      return { 
        source: source.name, 
        status: 'error', 
        message: `HTTP error! status: ${response.status} - ${response.statusText}` 
      };
    }
    
    const xml = await response.text();
    
    if (!xml || xml.trim().length === 0) {
      console.error(`Empty response from ${source.name}`);
      return {
        source: source.name,
        status: 'error',
        message: 'Empty response received'
      };
    }
    
    const parsedXML = parseXML(xml);
    
    if (!parsedXML?.rss?.channel && !parsedXML?.feed) {
      throw new Error('Invalid feed structure - neither RSS nor Atom format detected');
    }
    
    const entries = parsedXML.rss?.channel?.item || parsedXML.feed?.entry || [];
    let storedCount = 0;

    for (const entry of entries) {
      const stored = await storeArticleAsPost(supabase, entry, source.category);
      if (stored) storedCount++;
    }
    
    console.log(`Successfully processed feed: ${source.name} - Stored ${storedCount} entries`);
    return { 
      source: source.name, 
      status: 'success',
      entries: storedCount
    };
    
  } catch (error) {
    console.error(`Error processing feed ${source.name}:`, error);
    return { 
      source: source.name, 
      status: 'error', 
      message: error.message 
    };
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
    const sources = await fetchRSSSources(supabase);
    
    console.log(`Processing ${sources?.length || 0} RSS sources`);
    
    const results: FetchResult[] = [];
    
    for (const source of sources || []) {
      const result = await fetchAndParseRSSFeed(supabase, source);
      results.push(result);
      
      if (result.status === 'success') {
        await updateLastFetchTime(supabase, source.id);
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