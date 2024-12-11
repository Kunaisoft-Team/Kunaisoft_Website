import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { formatContentSection, generatePostStructure } from './content-templates.ts';
import { extractKeyPoints, extractQuote, extractStatistics } from './content-extractors.ts';
import { createSlug } from './content.ts';
import { selectRandomPlaceholderImage, generateContentImages } from './image-processor.ts';
import { improveWriting } from './translation.ts';

async function generateImageForPost(title: string, excerpt: string, supabaseUrl: string) {
  try {
    console.log('Requesting image generation for:', title);
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-post-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify({ title, excerpt }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate image: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Image generation successful');
    return data.image;
  } catch (error) {
    console.error('Error in generateImageForPost:', error);
    return null;
  }
}

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
                      `Latest insights and developments in ${category ? category.replace(/_/g, ' ') : 'technology'}`;

    // Enhance content
    const enhancedContent = await improveWriting(rawContent);
    const excerpt = enhancedContent.substring(0, 300) + '...';

    // Generate a unique image for the post
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const generatedImage = await generateImageForPost(title, excerpt, supabaseUrl);
    const heroImage = generatedImage || `https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80`;

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