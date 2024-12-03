import { Navigation } from "@/components/Navigation";
import { BlogPost } from "@/components/BlogPost";
import { useQuery } from "@tanstack/react-query";

const DUMMY_POSTS = [
  {
    id: 1,
    title: "Getting Started with Cybersecurity",
    excerpt: "Learn the basics of protecting your digital assets",
    date: "2024-02-20",
    author: "John Doe",
    content: "Cybersecurity is crucial in today's digital world...",
  },
  {
    id: 2,
    title: "Best Practices for Network Security",
    excerpt: "Essential tips for securing your network",
    date: "2024-02-19",
    author: "Jane Smith",
    content: "Implementing proper network security measures...",
  },
];

const Blog = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => Promise.resolve(DUMMY_POSTS),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <main className="min-h-screen pt-20">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Our Blog</h1>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts?.map((post) => (
            <BlogPost key={post.id} post={post} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default Blog;