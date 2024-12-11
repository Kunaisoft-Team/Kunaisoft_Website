import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { translateContent, improveWriting } from './translation.ts';
import { RSSEntry } from './types.ts';

async function checkDailyPostLimits(
  supabase: ReturnType<typeof createClient>,
  sourceUrl: string
): Promise<boolean> {
  // Temporarily disable limits for testing
  console.log('Daily post limits temporarily disabled for testing');
  return true;

  // Original limit logic commented out for testing
  /*
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check total posts for today
  const { count: totalDailyPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  if (totalDailyPosts && totalDailyPosts >= 5) {
    console.log('Daily post limit (5) reached');
    return false;
  }

  // Check posts from this source today
  const { count: sourceDailyPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('meta_keywords', [sourceUrl])
    .gte('created_at', today.toISOString());

  if (sourceDailyPosts && sourceDailyPosts >= 1) {
    console.log(`Daily limit (1) reached for source: ${sourceUrl}`);
    return false;
  }

  return true;
  */
}

export async function processAndStorePost(
  supabase: ReturnType<typeof createClient>,
  entry: RSSEntry,
  botId: string,
  sourceUrl?: string
) {
  try {
    // Extract title with fallbacks
    const title = entry.title?._text || 
                 entry.title?.toString() || 
                 'Untitled Post';

    // Extract content with fallbacks
    let content = entry['content:encoded']?._text ||
                 entry.content?._text ||
                 entry.description?._text ||
                 entry.summary?._text ||
                 'Not content available';

    console.log(`Processing entry: "${title}" (content length: ${content.length})`);

    // Basic validation
    if (title === 'Untitled Post' && content === 'Not content available') {
      console.log('Skipping entry: Both title and content are missing');
      return null;
    }

    // Check limits before processing
    if (sourceUrl && !(await checkDailyPostLimits(supabase, sourceUrl))) {
      return null;
    }

    // Translate content if needed
    content = await translateContent(content);
    
    // Improve writing
    content = await improveWriting(content);

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if post already exists
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingPost) {
      console.log(`Post with slug ${slug} already exists, skipping`);
      return null;
    }

    // Create new post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        slug,
        author_id: botId,
        excerpt: content.substring(0, 200) + '...',
        meta_description: content.substring(0, 160),
        meta_keywords: sourceUrl ? [sourceUrl] : [],
        reading_time_minutes: Math.ceil(content.split(' ').length / 200)
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return null;
    }

    console.log(`Successfully created post: ${title}`);
    return post;
  } catch (error) {
    console.error('Error in processAndStorePost:', error);
    return null;
  }
}