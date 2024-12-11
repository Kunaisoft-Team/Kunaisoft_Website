import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function processAndStorePost(
  supabaseClient: ReturnType<typeof createClient>,
  entry: any,
  botId: string
) {
  const title = entry?.title?._text;
  if (!title?.trim()) {
    throw new Error('Invalid title');
  }

  const content = entry?.content?._text || 
                 entry?.['content:encoded']?._text || 
                 entry?.description?._text || 
                 '';
  
  if (!content?.trim()) {
    throw new Error('Invalid content');
  }

  const timestamp = new Date().getTime();
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${timestamp}`;

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
    throw postError;
  }

  return post;
}