export async function storeArticleAsPost(supabase: any, article: any, sourceCategory: string, botId: string) {
  console.log('Processing article:', article.title);
  
  try {
    const content = extractContent(article);
    const imageUrl = extractImageUrl(article, content);
    const slug = createSlug(article.title);

    // Check if post with this title already exists
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id')
      .eq('title', article.title)
      .single();

    if (existingPost) {
      console.log('Post already exists:', article.title);
      return false;
    }

    // Create the blog post
    console.log('Creating new post:', article.title);
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        title: article.title,
        content: content,
        excerpt: content.substring(0, 200) + '...',
        author_id: botId,
        slug: slug,
        image_url: imageUrl,
        meta_description: content.substring(0, 160),
        meta_keywords: [sourceCategory],
        reading_time_minutes: Math.ceil(content.split(' ').length / 200)
      })
      .select()
      .single();

    if (postError) {
      console.error('Error creating post:', postError);
      return false;
    }

    // Get or create the tag for the category
    console.log('Processing tag for category:', sourceCategory);
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .select('id')
      .eq('name', sourceCategory)
      .single();

    if (!tagError && tag) {
      // Add the tag to the post
      const { error: tagLinkError } = await supabase
        .from('posts_tags')
        .insert({
          post_id: post.id,
          tag_id: tag.id
        });

      if (tagLinkError) {
        console.error('Error linking tag to post:', tagLinkError);
      }
    }

    console.log('Successfully created post:', post.id);
    return true;
  } catch (error) {
    console.error('Error in storeArticleAsPost:', error);
    return false;
  }
}