import { parse } from "https://deno.land/x/xml@2.1.1/mod.ts";

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function extractContent(entry: any): string {
  const content = entry.content?._text || 
         entry.description?._text || 
         entry['content:encoded']?._text || 
         entry.summary?._text || 
         '';
  
  // Clean up HTML content
  return content.replace(/<\/?[^>]+(>|$)/g, "");
}

function extractImageUrl(content: string): string | null {
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : null;
}

async function createTag(supabase: any, category: string) {
  console.log('Creating or finding tag for category:', category);
  
  // First try to find existing tag
  const { data: existingTag } = await supabase
    .from('tags')
    .select('id')
    .eq('name', category)
    .single();

  if (existingTag) {
    console.log('Found existing tag:', existingTag.id);
    return existingTag.id;
  }

  // Create new tag if it doesn't exist
  const { data: newTag, error: tagError } = await supabase
    .from('tags')
    .insert({ name: category })
    .select()
    .single();

  if (tagError) {
    console.error('Error creating tag:', tagError);
    throw tagError;
  }

  console.log('Created new tag:', newTag.id);
  return newTag.id;
}

export async function storeArticleAsPost(supabase: any, entry: any, category: string, botId: string) {
  try {
    console.log('Processing entry:', entry.title?._text);
    
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

    // Get or create tag for the category
    const tagId = await createTag(supabase, category);

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
      throw postError;
    }

    // Create posts_tags relationship
    const { error: tagRelationError } = await supabase
      .from('posts_tags')
      .insert({
        post_id: post.id,
        tag_id: tagId
      });

    if (tagRelationError) {
      console.error('Error creating post-tag relationship:', tagRelationError);
      // Consider if we should delete the post in this case
      throw tagRelationError;
    }

    console.log(`Successfully created post: ${title} with tag ${category}`);
    return true;
  } catch (error) {
    console.error('Error in storeArticleAsPost:', error);
    return false;
  }
}