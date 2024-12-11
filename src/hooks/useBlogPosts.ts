import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
};

export type PostWithProfile = Tables<'posts'> & {
  profiles: Profile;
};

interface UseBlogPostsProps {
  currentPage: number;
  selectedTag: string | null;
  selectedYear: number | null;
  selectedAuthor: string | null;
}

export function useBlogPosts({
  currentPage,
  selectedTag,
  selectedYear,
  selectedAuthor,
}: UseBlogPostsProps) {
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const postsPerPage = 9;

  useEffect(() => {
    fetchPosts();
  }, [currentPage, selectedTag, selectedYear, selectedAuthor]);

  async function fetchPosts() {
    setIsLoading(true);
    try {
      let query = supabase
        .from("posts")
        .select(`
          *,
          profiles!inner (
            id,
            full_name,
            avatar_url,
            created_at
          ),
          posts_tags!inner(tag_id)
        `, { count: "exact" });

      if (selectedTag) {
        query = query.eq("posts_tags.tag_id", selectedTag);
      }
      if (selectedYear) {
        query = query.gte("created_at", `${selectedYear}-01-01`)
          .lt("created_at", `${selectedYear + 1}-01-01`);
      }
      if (selectedAuthor) {
        query = query.eq("author_id", selectedAuthor);
      }

      const from = (currentPage - 1) * postsPerPage;
      const to = from + postsPerPage - 1;
      
      const { data, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (data && count) {
        const transformedPosts = data.map(post => ({
          ...post,
          profiles: post.profiles[0],
        })) as PostWithProfile[];
        
        setPosts(transformedPosts);
        setTotalPages(Math.ceil(count / postsPerPage));
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return { posts, totalPages, isLoading, postsPerPage };
}