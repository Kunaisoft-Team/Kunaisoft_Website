import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";

const POSTS_PER_PAGE = 5;

const AdminBlog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    checkUser();
    fetchTags();
    fetchPosts();
  }, [currentPage, selectedTags]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast.error("Failed to fetch tags");
    }
  };

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from("posts")
        .select("*, posts_tags!inner(tag_id), tags!inner(id, name)", { count: "exact" });

      if (selectedTags.length > 0) {
        query = query.in("tags.id", selectedTags);
      }

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE - 1);

      if (error) throw error;
      
      // Deduplicate posts due to the join
      const uniquePosts = Array.from(new Set(data.map(post => post.id)))
        .map(id => data.find(post => post.id === id));

      setPosts(uniquePosts || []);
      setTotalPosts(count || 0);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert([
          {
            title,
            content,
            excerpt,
            author_id: session.user.id,
          },
        ])
        .select()
        .single();

      if (postError) throw postError;

      if (selectedTags.length > 0) {
        const postsTags = selectedTags.map(tagId => ({
          post_id: post.id,
          tag_id: tagId,
        }));

        const { error: tagsError } = await supabase
          .from("posts_tags")
          .insert(postsTags);

        if (tagsError) throw tagsError;
      }

      toast.success("Post created successfully");
      setTitle("");
      setContent("");
      setExcerpt("");
      setSelectedTags([]);
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
      toast.success("Post deleted successfully");
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    try {
      const { error } = await supabase
        .from("tags")
        .insert([{ name: newTag.trim() }]);

      if (error) throw error;

      toast.success("Tag created successfully");
      setNewTag("");
      fetchTags();
    } catch (error) {
      console.error("Error creating tag:", error);
      toast.error("Failed to create tag");
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
      toast.success("Tag deleted successfully");
      setSelectedTags(prev => prev.filter(tagId => tagId !== id));
      fetchTags();
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast.error("Failed to delete tag");
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-8">Blog Admin</h1>

        {/* Tag Management Section */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Tag Management</h2>
          <form onSubmit={handleCreateTag} className="flex gap-2 mb-4">
            <Input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter new tag name"
              className="max-w-xs"
            />
            <Button type="submit">Create Tag</Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: any) => (
              <Badge
                key={tag.id}
                variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                className="cursor-pointer group"
                onClick={() => toggleTag(tag.id)}
              >
                {tag.name}
                <X
                  className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTag(tag.id);
                  }}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Create Post Form */}
        <form onSubmit={handleSubmit} className="mb-8 space-y-4 max-w-2xl bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Excerpt</label>
            <Input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={6}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: any) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
          <Button type="submit">Create Post</Button>
        </form>

        {/* Posts List */}
        <div className="space-y-6">
          {posts.map((post: any) => (
            <div key={post.id} className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              {post.excerpt && <p className="text-gray-600 mb-4">{post.excerpt}</p>}
              <div className="flex flex-wrap gap-2 mb-4">
                {tags
                  .filter((tag: any) => 
                    post.posts_tags.some((pt: any) => pt.tag_id === tag.id)
                  )
                  .map((tag: any) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
              </div>
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(post.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
};

export default AdminBlog;