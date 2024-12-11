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
  const readingTime = post.reading_time_minutes || 5;
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white border-none">
      <CardHeader className="p-0">
        <AspectRatio ratio={16 / 9}>
          <img
            src={post.image_url || '/placeholder.svg'}
            alt={post.title}
            className="object-cover w-full h-full rounded-t-lg"
          />
        </AspectRatio>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <span>{readingTime} min read</span>
          <span>•</span>
          <span>{new Date(post.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}</span>
        </div>
        <Link to={`/blog/${post.slug || post.id}`}>
          <h2 className="text-2xl font-bold mb-4 text-[#1A1F2C] hover:text-[#9b87f5] transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>
        {post.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3 text-base leading-relaxed">
            {post.excerpt}
          </p>
        )}
      </CardContent>
      <CardFooter className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <img
            src={post.profiles?.avatar_url || "/placeholder.svg"}
            alt={authorName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-sm font-medium text-gray-700">{authorName}</span>
        </div>
      </CardFooter>
    </Card>
  );
}

export default BlogPost;