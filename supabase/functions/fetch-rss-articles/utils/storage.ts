import { parse } from "https://deno.land/x/xml@2.1.1/mod.ts";

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function extractContent(entry: any): string {
  return entry.content?._text || 
         entry.description?._text || 
         entry['content:encoded']?._text || 
         entry.summary?._text || 
         '';
}

function extractImageUrl(content: string): string | null {
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : null;
}

export async function storeArticleAsPost(supabase: any, entry: any, category: string, botId: string) {
  try {
    const title = entry.title?._text || entry.title;
    if (!title) {
      console.log('Skipping entry without title');
      return false;
    }

    const content = extractContent(entry);
    const slug = createSlug(title);
    const imageUrl = extractImageUrl(content);
    
    // Check if post already exists
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingPost) {
      console.log(`Post with slug ${slug} already exists, skipping`);
      return false;
    }

    // Insert new post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        slug,
        image_url: imageUrl,
        author_id: botId,
        excerpt: content.substring(0, 200) + '...',
        meta_description: content.substring(0, 160),
        meta_keywords: [category],
        reading_time_minutes: Math.ceil(content.split(' ').length / 200)
      })
      .select()
      .single();

    if (postError) {
      console.error('Error creating post:', postError);
      return false;
    }

    console.log(`Successfully created post: ${title}`);
    return true;
  } catch (error) {
    console.error('Error in storeArticleAsPost:', error);
    return false;
  }
}