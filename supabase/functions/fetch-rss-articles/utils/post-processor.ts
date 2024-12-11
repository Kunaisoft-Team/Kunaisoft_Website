import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { selectRandomPlaceholderImage } from './image-processor.ts';

export async function processAndStorePost(
  supabase: ReturnType<typeof createClient>,
  entry: any,
  botId: string,
  sourceUrl: string
) {
  try {
    const title = entry?.title?._text || 
                 entry?.title || 
                 'Latest Technology Insights';

    console.log('Processing entry with title:', title);

    const rawContent = entry?.content?._text || 
                      entry?.description?._text || 
                      '';

    const excerpt = rawContent.substring(0, 300) + '...';
    const heroImage = selectRandomPlaceholderImage();

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Store the post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title,
        content: rawContent,
        slug,
        image_url: heroImage,
        author_id: botId,
        excerpt,
        meta_description: rawContent.substring(0, 160),
        meta_keywords: ['technology'],
        reading_time_minutes: Math.ceil(rawContent.split(/\s+/).length / 200)
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing post:', error);
      throw error;
    }

    console.log('Successfully stored post:', post.id);
    return post;
  } catch (error) {
    console.error('Error in processAndStorePost:', error);
    throw error;
  }
}