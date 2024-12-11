import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet";

const BlogPostDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  async function fetchPost() {
    const { data } = await supabase
      .from("posts")
      .select(`
        *,
        profiles!inner(id, full_name, avatar_url)
      `)
      .eq("slug", slug)
      .single();

    if (data) {
      setPost(data);
    }
  }

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen pt-20">
      <Helmet>
        <title>{post.title} | Our Blog</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
        {post.meta_keywords && (
          <meta name="keywords" content={post.meta_keywords.join(", ")} />
        )}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.meta_description || post.excerpt} />
        {post.image_url && <meta property="og:image" content={post.image_url} />}
      </Helmet>

      <Navigation />
      
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {post.image_url && (
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-[400px] object-cover rounded-lg mb-8"
          />
        )}

        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center mb-8">
          {post.profiles.avatar_url && (
            <img
              src={post.profiles.avatar_url}
              alt={post.profiles.full_name}
              className="w-12 h-12 rounded-full mr-4"
            />
          )}
          <div>
            <p className="font-medium">{post.profiles.full_name}</p>
            <p className="text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
              {post.reading_time_minutes && ` · ${post.reading_time_minutes} min read`}
            </p>
          </div>
        </div>

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </main>
  );
}

export default BlogPostDetail;