import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { formatContentSection, generatePostStructure } from './content-templates.ts';
import { extractKeyPoints, extractQuote, extractStatistics } from './content-extractors.ts';
import { createSlug } from './content.ts';
import { selectRandomPlaceholderImage, generateContentImages } from './image-processor.ts';

export async function processAndStorePost(
  supabase: ReturnType<typeof createClient>,
  entry: any,
  botId: string,
  sourceUrl: string
) {
  try {
    // Extract basic post information
    const title = entry?.title?._text || 
                 entry?.title || 
                 generateSEOTitle(entry?.description?._text, sourceUrl);

    console.log('Processing entry with title:', title);

    // Extract and process content
    const rawContent = entry?.content?._text || 
                      entry?.description?._text || 
                      generateDefaultContent(title, sourceUrl);

    // Generate images
    const heroImage = entry?.image_url || selectRandomPlaceholderImage();
    const contentImages = generateContentImages(title, rawContent);
    
    // Extract content components
    const keyPoints = extractKeyPoints(rawContent);
    const quote = extractQuote(rawContent);
    const statistics = extractStatistics(rawContent);
    
    // Format content with our new template
    const formattedContent = generatePostStructure(
      title,
      heroImage,
      formatContentSection(rawContent),
      keyPoints,
      quote,
      statistics,
      {
        name: 'Kunaisoft News',
        avatarUrl: '/placeholder.svg',
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    );

    // Calculate reading time
    const wordCount = rawContent.split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200);

    // Generate slug
    const slug = createSlug(title);
    console.log('Generated slug:', slug);

    // Prepare post data
    const postData = {
      title,
      content: formattedContent,
      excerpt: generateExcerpt(rawContent),
      author_id: botId,
      slug,
      image_url: heroImage,
      reading_time_minutes: readingTimeMinutes,
      meta_description: generateMetaDescription(rawContent, title),
      meta_keywords: extractKeywords(rawContent)
    };

    // Store in database
    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single();

    if (error) {
      console.error('Error storing post:', error);
      throw error;
    }

    console.log('Successfully processed and stored post:', data.id);
    return data;
  } catch (error) {
    console.error('Error in processAndStorePost:', error);
    throw error;
  }
}

function generateSEOTitle(description: string | null, sourceUrl: string): string {
  if (description) {
    const words = description.split(' ').slice(0, 8);
    return `${words.join(' ')}... | Latest Industry Insights`;
  }
  return `Latest Updates from ${new URL(sourceUrl).hostname} | Industry News`;
}

function generateDefaultContent(title: string, sourceUrl: string): string {
  return `
    Latest Industry Developments:
    
    In a rapidly evolving digital landscape, staying informed about the latest developments
    is crucial for business success. This article explores key insights from ${new URL(sourceUrl).hostname}
    regarding ${title.toLowerCase()}.
    
    Key Industry Trends:
    
    Recent market analysis shows significant shifts in how businesses approach digital transformation.
    Organizations are increasingly focusing on automation, efficiency, and scalable solutions.
  `;
}

function generateExcerpt(content: string): string {
  const cleanText = content.replace(/<[^>]*>/g, '');
  return cleanText.substring(0, 300) + '...';
}

function generateMetaDescription(content: string, title: string): string {
  const cleanText = content.replace(/<[^>]*>/g, '');
  return `${title} - ${cleanText.substring(0, 150)}...`;
}

function extractKeywords(content: string): string[] {
  const commonKeywords = ['artificial intelligence', 'productivity', 'technology', 'automation', 'digital transformation'];
  const words = content.toLowerCase()
    .replace(/<[^>]*>/g, '')
    .split(/\W+/)
    .filter(word => word.length > 3);
  
  const wordFrequency: { [key: string]: number } = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });

  const extractedKeywords = Object.entries(wordFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);

  return [...new Set([...commonKeywords, ...extractedKeywords])];
}