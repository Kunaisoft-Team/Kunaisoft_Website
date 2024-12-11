import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
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

interface BlogPostProps {
  post: PostWithProfile;
}

export function BlogPost({ post }: BlogPostProps) {
  const authorName = post.profiles?.full_name || "Kunaisoft News";
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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
        <div className="text-sm text-gray-500">
          By {authorName} • {new Date(post.created_at).toLocaleDateString()}
        </div>
      </CardFooter>
    </Card>
  );
}

export default BlogPost;