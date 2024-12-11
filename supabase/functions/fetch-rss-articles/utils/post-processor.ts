import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function processAndStorePost(
  supabaseClient: ReturnType<typeof createClient>,
  entry: any,
  botId: string
) {
  // Handle different RSS title formats
  const title = entry?.title?._text || 
               entry?.title?.toString() || 
               entry?.title;
               
  if (!title?.trim()) {
    console.error('Invalid title format:', entry?.title);
    throw new Error('Invalid title');
  }

  // Handle different content formats and add proper HTML structure
  let content = entry?.content?._text || 
                entry?.['content:encoded']?._text || 
                entry?.description?._text ||
                entry?.content?.toString() ||
                entry?.description?.toString() ||
                '';
  
  if (!content?.trim()) {
    console.error('Invalid content format:', entry?.content);
    throw new Error('Invalid content');
  }

  // Create a more structured content with proper HTML formatting
  content = `
    <div class="article-content">
      <p class="lead">${content.substring(0, 150)}...</p>
      <div class="main-content">
        ${content}
      </div>
    </div>
  `;

  // Generate a clean slug with timestamp
  const timestamp = new Date().getTime();
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${timestamp}`;

  // Extract a proper excerpt
  const excerpt = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .substring(0, 200) + '...';

  // Calculate reading time (assuming 200 words per minute)
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Extract potential meta keywords from content
  const metaKeywords = [
    'ai tools',
    'artificial intelligence',
    'productivity',
    'technology',
    'automation'
  ];

  console.log('Processing post:', { 
    title, 
    contentLength: content.length, 
    slug,
    readingTimeMinutes 
  });

  const { data: post, error: postError } = await supabaseClient
    .from('posts')
    .insert({
      title,
      content,
      slug,
      author_id: botId,
      excerpt,
      meta_description: excerpt.substring(0, 160),
      meta_keywords: metaKeywords,
      reading_time_minutes: readingTimeMinutes,
      image_url: entry?.enclosure?.url || null // Try to get image from RSS if available
    })
    .select()
    .single();

  if (postError) {
    console.error('Error storing post:', postError);
    throw postError;
  }

  return post;
}