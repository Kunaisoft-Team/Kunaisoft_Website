import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { toast } from "sonner";
import { TagManagement } from "@/components/admin/TagManagement";
import { PostForm } from "@/components/admin/PostForm";
import { PostList } from "@/components/admin/PostList";

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

        <TagManagement
          tags={tags}
          selectedTags={selectedTags}
          onTagsChange={fetchTags}
          onTagToggle={toggleTag}
        />

        <PostForm
          title={title}
          content={content}
          excerpt={excerpt}
          onTitleChange={setTitle}
          onContentChange={setContent}
          onExcerptChange={setExcerpt}
          onSubmit={handleSubmit}
          tags={tags}
          selectedTags={selectedTags}
          onTagToggle={toggleTag}
        />

        <PostList
          posts={posts}
          tags={tags}
          onDelete={handleDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default AdminBlog;