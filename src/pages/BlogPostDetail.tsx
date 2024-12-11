import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogContent } from "@/components/blog/BlogContent";

const BlogPostDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [takeaways, setTakeaways] = useState<string[]>([]);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (post?.content) {
      const extractedTakeaways = extractTakeaways(post.content);
      setTakeaways(extractedTakeaways);
    }
  }, [post?.content]);

  const extractTakeaways = (content: string): string[] => {
    const paragraphs = content.split('</p>');
    const points = paragraphs
      .slice(0, 3)
      .map(p => p.replace(/<[^>]+>/g, '').trim())
      .filter(p => p.length > 50 && p.length < 150)
      .map(p => p.replace(/^[^a-zA-Z]+/, ''));
    
    return points.length >= 3 ? points : [
      "Understanding the core concepts and implementation details",
      "Best practices for optimal performance and scalability",
      "Real-world applications and practical examples"
    ];
  };

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
        <div className="max-w-[800px] mx-auto px-4 py-12 animate-fade-in">
          <BlogHeader
            title={post.title}
            excerpt={post.excerpt}
            createdAt={post.created_at}
            readingTimeMinutes={post.reading_time_minutes}
            author={{
              fullName: post.profiles.full_name,
              avatarUrl: post.profiles.avatar_url,
            }}
          />
        </div>

        <BlogContent
          content={post.content}
          imageUrl={post.image_url}
          title={post.title}
          takeaways={takeaways}
        />
      </article>
    </main>
  );
};

export default BlogPostDetail;