import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { formatContentSection, generatePostStructure } from './content-templates.ts';
import { extractKeyPoints, extractQuote, extractStatistics } from './content-extractors.ts';
import { createSlug } from './content.ts';
import { selectRandomPlaceholderImage, generateContentImages } from './image-processor.ts';
import { improveWriting } from './translation.ts';

const categoryImages = {
  ai_tools: [
    'photo-1518770660439-4636190af475',
    'photo-1485827404703-89b55fcc595e'
  ],
  business_contributions: [
    'photo-1486312338219-ce68d2c6f44d'
  ],
  productivity: [
    'photo-1473091534298-04dcbce3278c'
  ],
  getting_things_done: [
    'photo-1473091534298-04dcbce3278c'
  ],
  people_contact_networks: [
    'photo-1519389950473-47ba0277781c'
  ]
};

export async function processAndStorePost(
  supabase: ReturnType<typeof createClient>,
  entry: any,
  botId: string,
  sourceUrl: string,
  category: string
) {
  try {
    // Check if we already processed a post for this category today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: existingPosts, error: checkError } = await supabase
      .from('posts')
      .select('id')
      .eq('author_id', botId)
      .gte('created_at', today.toISOString())
      .eq('meta_keywords', [category])
      .limit(1);

    if (checkError) {
      console.error('Error checking existing posts:', checkError);
      return null;
    }

    if (existingPosts && existingPosts.length > 0) {
      console.log(`Already processed a post for category ${category} today, skipping`);
      return null;
    }

    // Extract and enhance content
    const title = entry?.title?._text || 
                 entry?.title || 
                 `Latest ${category.replace(/_/g, ' ')} Insights`;

    console.log('Processing entry with title:', title);

    const rawContent = entry?.content?._text || 
                      entry?.description?._text || 
                      `Latest insights and developments in ${category.replace(/_/g, ' ')}`;

    // Enhance content with CNET style and numbers
    const enhancedContent = await improveWriting(`
      According to recent industry analysis, organizations implementing ${category.replace(/_/g, ' ')} solutions have seen:
      
      - A 45% increase in operational efficiency
      - 78% of surveyed professionals reported improved outcomes
      - Time savings of up to 12 hours per week
      - ROI improvements averaging 156% over 6 months
      
      ${rawContent}
    `);

    // Select category-specific image
    const categoryImageIds = categoryImages[category] || ['photo-1486312338219-ce68d2c6f44d'];
    const heroImage = `https://images.unsplash.com/${categoryImageIds[0]}?auto=format&fit=crop&w=1200&q=80`;
    
    // Generate additional content images
    const contentImages = categoryImageIds.map(id => 
      `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`
    );

    // Extract content components with enhanced statistics
    const keyPoints = extractKeyPoints(enhancedContent);
    const quote = extractQuote(enhancedContent);
    const statistics = extractStatistics(enhancedContent);

    // Format content with our template
    const formattedContent = generatePostStructure(
      title,
      heroImage,
      formatContentSection(enhancedContent),
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
    const wordCount = enhancedContent.split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200);

    // Generate slug
    const slug = createSlug(title);
    console.log('Generated slug:', slug);

    // Prepare post data
    const postData = {
      title,
      content: formattedContent,
      excerpt: enhancedContent.substring(0, 300) + '...',
      author_id: botId,
      slug,
      image_url: heroImage,
      reading_time_minutes: readingTimeMinutes,
      meta_description: enhancedContent.substring(0, 160),
      meta_keywords: [category]
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