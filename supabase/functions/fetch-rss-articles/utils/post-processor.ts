import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function processAndStorePost(
  supabaseClient: ReturnType<typeof createClient>,
  entry: any,
  botId: string
) {
  // Handle different RSS title formats
  const title = entry?.title?._text || // XML format
               entry?.title?.toString() || // String format
               entry?.title; // Direct value
               
  if (!title?.trim()) {
    console.error('Invalid title format:', entry?.title);
    throw new Error('Invalid title');
  }

  // Handle different content formats
  const content = entry?.content?._text || 
                 entry?.['content:encoded']?._text || 
                 entry?.description?._text ||
                 entry?.content?.toString() ||
                 entry?.description?.toString() ||
                 '';
  
  if (!content?.trim()) {
    console.error('Invalid content format:', entry?.content);
    throw new Error('Invalid content');
  }

  const timestamp = new Date().getTime();
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${timestamp}`;

  console.log('Processing post:', { title, contentLength: content.length, slug });

  const { data: post, error: postError } = await supabaseClient
    .from('posts')
    .insert({
      title,
      content,
      excerpt: content.substring(0, 200),
      author_id: botId,
      slug,
      meta_description: content.substring(0, 160),
      reading_time_minutes: Math.ceil((content?.split(' ')?.length || 0) / 200) || 5
    })
    .select()
    .single();

  if (postError) {
    console.error('Error storing post:', postError);
    throw postError;
  }

  return post;
}