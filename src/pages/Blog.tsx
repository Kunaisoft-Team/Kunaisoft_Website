import { Navigation } from "@/components/Navigation";
import { BlogPost } from "@/components/BlogPost";

const Blog = () => {
  return (
    <main className="min-h-screen pt-20">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Our Blog</h1>
        <BlogPost />
      </div>
    </main>
  );
};

export default Blog;