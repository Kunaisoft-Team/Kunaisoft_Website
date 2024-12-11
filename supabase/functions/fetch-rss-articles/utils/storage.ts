import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { RSSEntry } from './types.ts';
import { createSlug, extractContent, extractImageUrl } from './content.ts';
import { selectRandomPlaceholderImage } from './image-processor.ts';

export async function storeArticleAsPost(
  supabase: ReturnType<typeof createClient>,
  entry: RSSEntry,
  category: string,
  botId: string
): Promise<boolean> {
  try {
    if (!supabase || !entry || !category || !botId) {
      console.error('Missing required parameters:', { 
        hasSupabase: !!supabase, 
        hasEntry: !!entry, 
        hasCategory: !!category, 
        hasBotId: !!botId 
      });
      return false;
    }

    const title = entry.title?._text;
    if (!title) {
      console.log('Skipping entry without title');
      return false;
    }

    console.log('Processing entry:', title);
    
    const content = extractContent(entry);
    if (!content) {
      console.log('Skipping entry without content');
      return false;
    }

    const slug = createSlug(title);
    if (!slug) {
      console.log('Failed to create slug for entry');
      return false;
    }

    // Select a random image based on the category
    const imageUrl = selectRandomPlaceholderImage(category);

    // Check if post already exists
    try {
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
    } catch (error) {
      console.error('Error checking existing post:', error);
      return false;
    }

    // Insert new post
    try {
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
          meta_keywords: category ? [category] : [],
          reading_time_minutes: Math.ceil(content.split(' ').length / 200)
        })
        .select()
        .single();

      if (postError) {
        console.error('Error creating post:', postError);
        return false;
      }

      if (!post || !post.id) {
        console.error('Post was created but no ID was returned');
        return false;
      }

      // Get or create tag for the category
      let tagId: string;
      try {
        const { data: existingTag, error: tagError } = await supabase
          .from('tags')
          .select('id')
          .eq('name', category)
          .single();

        if (tagError && tagError.code === 'PGRST116') {
          // Tag doesn't exist, create it
          const { data: newTag, error: createTagError } = await supabase
            .from('tags')
            .insert({ name: category })
            .select()
            .single();

          if (createTagError) {
            console.error('Error creating tag:', createTagError);
            return false;
          }
          tagId = newTag.id;
        } else if (tagError) {
          console.error('Error checking existing tag:', tagError);
          return false;
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
          return false;
        }
      } catch (error) {
        console.error('Error handling tags:', error);
        return false;
      }

      console.log(`Successfully created post: ${title} with tag ${category}`);
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      return false;
    }
  } catch (error) {
    console.error('Error in storeArticleAsPost:', error);
    return false;
  }
}