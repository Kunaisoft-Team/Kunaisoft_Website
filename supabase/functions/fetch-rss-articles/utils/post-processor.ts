import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { formatContentSection, generatePostStructure } from './content-templates.ts';
import { extractKeyPoints, extractQuote, extractStatistics } from './content-extractors.ts';
import { createSlug } from './content.ts';
import { selectRandomPlaceholderImage, generateContentImages } from './image-processor.ts';
import { improveWriting } from './translation.ts';
import { expandContent, extractContent } from './content-generator.ts';

let lastUsedImageIndices: number[] = [];

export async function processAndStorePost(
  supabase: ReturnType<typeof createClient>,
  entry: any,
  botId: string,
  sourceUrl: string,
  category?: string
) {
  try {
    const title = entry?.title?._text || 
                 entry?.title || 
                 `Latest ${category ? category.replace(/_/g, ' ') : 'Technology'} Insights`;

    console.log('Processing entry with title:', title);

    const rawContent = entry?.content?._text || 
                      entry?.description?._text || 
                      '';

    // Generate expanded content using the category
    const expandedContent = expandContent(rawContent, title, category);
    
    // Enhance content
    const enhancedContent = await improveWriting(expandedContent);
    const excerpt = enhancedContent.substring(0, 300) + '...';

    // Generate a unique image for the post
    const heroImage = selectRandomPlaceholderImage(category);

    // Generate slug
    const slug = createSlug(title);
    console.log('Generated slug:', slug);

    // Store the post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title,
        content: enhancedContent,
        slug,
        image_url: heroImage,
        author_id: botId,
        excerpt,
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