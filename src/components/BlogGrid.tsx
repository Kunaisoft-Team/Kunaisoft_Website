import { BlogPost } from "@/components/BlogPost";
import { PostWithProfile } from "@/hooks/useBlogPosts";

interface BlogGridProps {
  posts: PostWithProfile[];
}

export function BlogGrid({ posts }: BlogGridProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 px-4 max-w-7xl mx-auto">
      {posts.map((post) => (
        <div key={post.id} className="animate-fade-in">
          <BlogPost post={post} />
        </div>
      ))}
    </div>
  );
}