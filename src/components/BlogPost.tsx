import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export function BlogPost() {
  const [posts, setPosts] = useState<Tables<'posts'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

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
    <div className="max-w-4xl mx-auto py-8">
      {posts.map((post) => (
        <article key={post.id} className="mb-8 p-6 bg-white rounded-lg shadow">
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
        </article>
      ))}
    </div>
  );
}

export default BlogPost;