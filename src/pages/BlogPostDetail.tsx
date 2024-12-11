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
    <main className="min-h-screen bg-[#F1F0FB]">
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
      
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="mb-12">
          {post.image_url ? (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-[500px] object-cover rounded-xl shadow-lg mb-8"
            />
          ) : (
            <img
              src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
              alt="Technology"
              className="w-full h-[500px] object-cover rounded-xl shadow-lg mb-8"
            />
          )}

          <h1 className="text-5xl font-bold mb-6 text-[#1A1F2C] leading-tight">
            {post.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
            {post.profiles.avatar_url ? (
              <img
                src={post.profiles.avatar_url}
                alt={post.profiles.full_name}
                className="w-14 h-14 rounded-full mr-4 border-2 border-[#8B5CF6]"
              />
            ) : (
              <div className="w-14 h-14 rounded-full mr-4 bg-[#8B5CF6] flex items-center justify-center text-white text-xl">
                {post.profiles.full_name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-semibold text-lg text-[#1A1F2C]">
                {post.profiles.full_name}
              </p>
              <div className="flex items-center text-gray-600 text-sm">
                <span>{new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
                {post.reading_time_minutes && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{post.reading_time_minutes} min read</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none bg-white p-8 rounded-xl shadow-sm
            prose-headings:text-[#1A1F2C] prose-headings:font-bold
            prose-h1:text-4xl prose-h1:mb-8
            prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-12
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-[#8B5CF6] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-[#1A1F2C] prose-strong:font-semibold
            prose-ul:list-disc prose-ul:pl-6 prose-ul:my-6
            prose-li:text-gray-700 prose-li:mb-2
            prose-img:rounded-lg prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Social Share Section */}
        <div className="mt-12 p-6 bg-white rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold text-[#1A1F2C] mb-4">Share this article</h3>
          <div className="flex space-x-4">
            <button className="px-6 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-opacity-90 transition-colors">
              Twitter
            </button>
            <button className="px-6 py-2 bg-[#4267B2] text-white rounded-lg hover:bg-opacity-90 transition-colors">
              Facebook
            </button>
            <button className="px-6 py-2 bg-[#0077B5] text-white rounded-lg hover:bg-opacity-90 transition-colors">
              LinkedIn
            </button>
          </div>
        </div>
      </article>
    </main>
  );
}

export default BlogPostDetail;