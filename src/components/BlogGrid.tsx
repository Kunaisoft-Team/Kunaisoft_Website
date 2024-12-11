import { BlogPost } from "@/components/BlogPost";
import { PostWithProfile } from "@/hooks/useBlogPosts";

interface BlogGridProps {
  posts: PostWithProfile[];
}

export function BlogGrid({ posts }: BlogGridProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogPost key={post.id} post={post} />
      ))}
    </div>
  );
}