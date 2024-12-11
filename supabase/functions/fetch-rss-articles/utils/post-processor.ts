import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { formatContentSection, generatePostStructure } from './content-templates.ts';
import { extractKeyPoints, extractQuote, extractStatistics } from './content-extractors.ts';
import { createSlug } from './content.ts';
import { selectRandomPlaceholderImage, generateContentImages } from './image-processor.ts';
import { improveWriting } from './translation.ts';

export async function processAndStorePost(
  supabase: ReturnType<typeof createClient>,
  entry: any,
  botId: string,
  sourceUrl: string,
  category?: string
) {
  try {
    // Extract and enhance content
    const title = entry?.title?._text || 
                 entry?.title || 
                 `Latest ${category ? category.replace(/_/g, ' ') : 'Technology'} Insights`;

    console.log('Processing entry with title:', title);

    const rawContent = entry?.content?._text || 
                      entry?.description?._text || 
                      `Latest insights and developments in ${category ? category.replace(/_/g, ' ') : 'technology'}`;

    // Enhance content with CNET style and numbers
    const enhancedContent = await improveWriting(rawContent);

    // Generate slug
    const slug = createSlug(title);
    console.log('Generated slug:', slug);

    // Select category-specific image
    const heroImage = `https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80`;

    // Store the post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title,
        content: enhancedContent,
        slug,
        image_url: heroImage,
        author_id: botId,
        excerpt: enhancedContent.substring(0, 300) + '...',
        meta_description: enhancedContent.substring(0, 160),
        meta_keywords: category ? [category] : ['technology'],
        reading_time_minutes: Math.ceil(enhancedContent.split(/\s+/).length / 200)
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