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
}

export async function processAndStorePost(
  supabase: ReturnType<typeof createClient>,
  entry: RSSEntry,
  botId: string,
  sourceUrl?: string
) {
  try {
    console.log('Processing entry:', entry);

    // Extract title with fallbacks
    const title = entry.title?._text || 
                 entry.title?.toString() || 
                 'Untitled Post';

    // Extract content with enhanced fallbacks
    let content = entry['content:encoded']?._text ||
                 entry.content?._text ||
                 entry.description?._text ||
                 entry.summary?._text;

    // Additional content extraction attempts
    if (!content) {
      content = entry.content?.['#text'] ||  // Some feeds use this format
               entry.description?.['#text'] ||
               entry['content:encoded']?.['#text'] ||
               entry.summary?.['#text'];
      
      if (!content && typeof entry.content === 'string') {
        content = entry.content;
      }
      if (!content && typeof entry.description === 'string') {
        content = entry.description;
      }
    }

    // If still no content, check for nested structures
    if (!content && entry.content && typeof entry.content === 'object') {
      content = Object.values(entry.content).find(val => typeof val === 'string');
    }

    if (!content) {
      console.log('No content found in entry:', entry);
      content = 'Content not available';
    }

    console.log(`Processing entry: "${title}" (content length: ${content.length})`);
    console.log('Content preview:', content.substring(0, 200));

    // Basic validation
    if (title === 'Untitled Post' && (!content || content === 'Content not available')) {
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