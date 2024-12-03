interface BlogPostProps {
  post: {
    id: number;
    title: string;
    excerpt: string;
    date: string;
    author: string;
    content: string;
  };
}

export const BlogPost = ({ post }: BlogPostProps) => {
  return (
    <article className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
        <p className="text-gray-600 mb-4">{post.excerpt}</p>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{post.author}</span>
          <span>{new Date(post.date).toLocaleDateString()}</span>
        </div>
      </div>
    </article>
  );
};