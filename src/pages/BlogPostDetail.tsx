import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet";
import { Share2, Twitter, Linkedin, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const BlogPostDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  async function fetchPost() {
    setIsLoading(true);
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
    setIsLoading(false);
  }

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`,
      "_blank"
    );
  };

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.title)}`,
      "_blank"
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-[800px] mx-auto px-4 py-12">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-[400px] w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-2xl text-gray-600">Post not found</div>
      </div>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-white">
      <Helmet>
        <title>{post.title} | Kunaisoft Blog</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
        {post.meta_keywords && (
          <meta name="keywords" content={post.meta_keywords.join(", ")} />
        )}
        <meta property="og:title" content={post.title} />
        <meta
          property="og:description"
          content={post.meta_description || post.excerpt}
        />
        {post.image_url && <meta property="og:image" content={post.image_url} />}
      </Helmet>

      <Navigation />

      <article className="w-full bg-[#F1F0FB] pt-20">
        {/* Hero Section */}
        <div className="max-w-[800px] mx-auto px-4 py-12 animate-fade-in">
          <header className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.created_at}>
                {formatDate(post.created_at)}
              </time>
              <span>•</span>
              <Clock className="w-4 h-4" />
              <span>{post.reading_time_minutes} min read</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-[#1A1F2C] leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto">
                {post.excerpt}
              </p>
            )}

            {/* Author Info */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <img
                src={
                  post.profiles?.avatar_url ||
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
                }
                alt={post.profiles?.full_name}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary"
              />
              <div className="text-left">
                <p className="font-semibold text-[#1A1F2C]">
                  {post.profiles?.full_name}
                </p>
                <p className="text-sm text-gray-600">
                  Content Strategist at Kunaisoft
                </p>
              </div>
            </div>

            {/* Social Share */}
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={shareOnTwitter}
              >
                <Twitter className="w-4 h-4" />
                Share on Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={shareOnLinkedIn}
              >
                <Linkedin className="w-4 h-4" />
                Share on LinkedIn
              </Button>
            </div>
          </header>
        </div>

        {/* Main Content */}
        <div className="bg-white w-full py-16">
          <div className="max-w-[800px] mx-auto px-4">
            {post.image_url && (
              <figure className="mb-16 animate-fade-in">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </figure>
            )}

            {/* Article Content */}
            <div
              className={cn(
                "prose prose-lg max-w-none",
                "prose-headings:text-[#1A1F2C] prose-headings:font-bold",
                "prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6",
                "prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4",
                "prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6",
                "prose-a:text-primary hover:prose-a:text-primary/80",
                "prose-strong:text-[#1A1F2C] prose-strong:font-semibold",
                "prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6",
                "prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6",
                "prose-li:text-gray-600 prose-li:mb-2",
                "prose-img:rounded-xl prose-img:my-8 prose-img:shadow-lg",
                "prose-blockquote:border-l-4 prose-blockquote:border-primary",
                "prose-blockquote:pl-6 prose-blockquote:italic",
                "prose-blockquote:text-gray-600 prose-blockquote:my-8",
                "animate-fade-in"
              )}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Key Takeaways */}
            <div className="mt-16 p-8 bg-[#F1F0FB] rounded-xl animate-fade-in">
              <h2 className="text-2xl font-bold text-[#1A1F2C] mb-6">
                Key Takeaways
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <span className="text-gray-600">
                    Understanding the core concepts and implementation details
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <span className="text-gray-600">
                    Best practices for optimal performance and scalability
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <span className="text-gray-600">
                    Real-world applications and practical examples
                  </span>
                </li>
              </ul>
            </div>

            {/* Share Section */}
            <div className="mt-16 pt-8 border-t border-gray-100 animate-fade-in">
              <h3 className="text-lg font-semibold text-[#1A1F2C] mb-4">
                Share this article
              </h3>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={shareOnTwitter}
                >
                  <Twitter className="w-4 h-4" />
                  Share on Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={shareOnLinkedIn}
                >
                  <Linkedin className="w-4 h-4" />
                  Share on LinkedIn
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
};

export default BlogPostDetail;