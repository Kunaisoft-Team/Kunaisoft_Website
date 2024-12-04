import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

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
          profiles:author_id(
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
    return <div>Loading posts...</div>;
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <article key={post.id} className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
            {post.excerpt && (
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
            )}
            <div className="prose max-w-none">
              {post.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph.trim()}
                </p>
              ))}
            </div>
            {post.profiles && (
              <div className="mt-4 text-sm text-gray-500">
                By {post.profiles.full_name}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export default BlogPost;