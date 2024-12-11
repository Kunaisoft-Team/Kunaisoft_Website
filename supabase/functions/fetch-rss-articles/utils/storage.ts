import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { RSSEntry } from './types.ts';
import { createSlug, extractContent, extractImageUrl } from './content.ts';

export async function storeArticleAsPost(
  supabase: ReturnType<typeof createClient>,
  entry: RSSEntry,
  category: string,
  botId: string
): Promise<boolean> {
  try {
    if (!entry || !botId) {
      console.error('Missing required parameters:', { entry: !!entry, botId: !!botId });
      return false;
    }

    const title = entry.title?._text;
    if (!title) {
      console.log('Skipping entry without title');
      return false;
    }

    console.log('Processing entry:', title);
    
    const content = extractContent(entry);
    const slug = createSlug(title);
    const imageUrl = extractImageUrl(entry, content);

    // Check if post already exists
    const { data: existingPost, error: checkError } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing post:', checkError);
      return false;
    }

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
      throw postError;
    }

    if (!post || !post.id) {
      console.error('Post was created but no ID was returned');
      return false;
    }

    // Get or create tag for the category
    const { data: existingTag, error: tagError } = await supabase
      .from('tags')
      .select('id')
      .eq('name', category)
      .single();

    let tagId: string;
    if (tagError && tagError.code === 'PGRST116') {
      // Tag doesn't exist, create it
      const { data: newTag, error: createTagError } = await supabase
        .from('tags')
        .insert({ name: category })
        .select()
        .single();

      if (createTagError) {
        console.error('Error creating tag:', createTagError);
        throw createTagError;
      }
      tagId = newTag.id;
    } else if (tagError) {
      console.error('Error checking existing tag:', tagError);
      throw tagError;
    } else {
      tagId = existingTag.id;
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
      throw tagRelationError;
    }

    console.log(`Successfully created post: ${title} with tag ${category}`);
    return true;
  } catch (error) {
    console.error('Error in storeArticleAsPost:', error);
    throw error;
  }
}