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

  // Convert markdown-style headers to HTML with proper classes
  const formatContent = (content: string) => {
    return content
      .replace(/^# (.*$)/gm, '<h1 class="text-4xl font-bold mb-6 mt-8">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-3xl font-bold mb-5 mt-7">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-2xl font-bold mb-4 mt-6">$1</h3>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      // Convert bullet points
      .replace(/^- (.*$)/gm, '<li class="ml-6 mb-2">$1</li>')
      // Convert numbered lists
      .replace(/^\d\. (.*$)/gm, '<li class="ml-6 mb-2">$1</li>')
      // Wrap paragraphs
      .replace(/^(?!<[hl]|<li)(.*$)/gm, '<p class="mb-4">$1</p>')
      // Wrap lists
      .replace(/<li.*?>([\s\S]*?)(?=<\/li>)/g, '<ul class="list-disc mb-4">$1</ul>')
      // Add emphasis
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

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

        <h1 className="text-5xl font-bold mb-8">{post.title}</h1>

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
          className="prose prose-lg max-w-none prose-headings:font-bold prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:font-bold prose-ul:list-disc prose-ol:list-decimal"
          dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
        />
      </article>
    </main>
  );
}

export default BlogPostDetail;