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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
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
      
      <article className="max-w-[800px] mx-auto px-4 py-12">
        {/* Hero Section */}
        <header className="mb-12">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>{new Date(post.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}</span>
            <span>•</span>
            <span>{post.reading_time_minutes} min read</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-[#1A1F2C] leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              {post.excerpt}
            </p>
          )}

          {post.image_url && (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full aspect-[16/9] object-cover rounded-xl mb-8"
            />
          )}

          {/* Author Info */}
          <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
            <img
              src={post.profiles?.avatar_url || "/placeholder.svg"}
              alt={post.profiles?.full_name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-[#1A1F2C]">
                {post.profiles?.full_name}
              </p>
              <p className="text-sm text-gray-600">
                {post.profiles?.title || "Content Creator"}
              </p>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none
            prose-headings:text-[#1A1F2C] prose-headings:font-bold
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-primary hover:prose-a:text-primary/80
            prose-strong:text-[#1A1F2C] prose-strong:font-semibold
            prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
            prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
            prose-li:text-gray-600 prose-li:mb-2
            prose-img:rounded-lg prose-img:my-8
            prose-blockquote:border-l-4 prose-blockquote:border-primary
            prose-blockquote:pl-6 prose-blockquote:italic
            prose-blockquote:text-gray-600 prose-blockquote:my-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Share Section */}
        <div className="mt-12 pt-6 border-t border-gray-100">
          <h3 className="text-lg font-semibold text-[#1A1F2C] mb-4">Share this article</h3>
          <div className="flex gap-3">
            <button 
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
              className="px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm"
            >
              Twitter
            </button>
            <button 
              onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.title)}`, '_blank')}
              className="px-4 py-2 bg-[#0077B5] text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm"
            >
              LinkedIn
            </button>
          </div>
        </div>
      </article>
    </main>
  );
}

export default BlogPostDetail;