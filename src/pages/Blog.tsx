import { Navigation } from "@/components/Navigation";
import { BlogPost } from "@/components/BlogPost";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author_id: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

const fetchPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:author_id(full_name, avatar_url)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

const Blog = () => {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: fetchPosts,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen pt-20">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen pt-20">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Error loading blog posts. Please try again later.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Our Blog</h1>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts?.map((post) => (
            <BlogPost
              key={post.id}
              post={{
                id: post.id,
                title: post.title,
                excerpt: post.excerpt || '',
                date: post.created_at,
                author: post.profiles.full_name,
                content: post.content,
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default Blog;