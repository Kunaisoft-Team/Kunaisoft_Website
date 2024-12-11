import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
};

type PostWithProfile = Tables<'posts'> & {
  profiles: Profile;
};

export function BlogPost() {
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!inner(
            id,
            full_name,
            avatar_url,
            created_at
          )
        `)
        .order('created_at', { ascending: false })
        .returns<PostWithProfile[]>();

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="p-0">
            <AspectRatio ratio={16 / 9}>
              <img
                src={post.image_url || '/placeholder.svg'}
                alt={post.title}
                className="object-cover w-full h-full"
              />
            </AspectRatio>
          </CardHeader>
          <CardContent className="p-6">
            <Link to={`/blog/${post.slug || post.id}`}>
              <h2 className="text-2xl font-bold mb-4 hover:text-[#0BD255] transition-colors">
                {post.title}
              </h2>
            </Link>
            {post.excerpt && (
              <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
            )}
          </CardContent>
          <CardFooter className="px-6 py-4 bg-gray-50">
            {post.profiles && (
              <div className="text-sm text-gray-500">
                By {post.profiles.full_name} • {new Date(post.created_at).toLocaleDateString()}
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default BlogPost;