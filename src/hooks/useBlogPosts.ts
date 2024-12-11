import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";

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
  const postsPerPage = 9;
  
  const fetchPosts = async () => {
    console.log('Fetching posts with params:', { currentPage, selectedTag, selectedYear, selectedAuthor });
    
    let query = supabase
      .from("posts")
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url,
          created_at
        )
      `, { count: "exact" });

    if (selectedTag && selectedTag !== 'all') {
      query = query.eq("posts_tags.tag_id", selectedTag);
    }
    
    if (selectedYear) {
      query = query.gte("created_at", `${selectedYear}-01-01`)
        .lt("created_at", `${selectedYear + 1}-01-01`);
    }
    
    if (selectedAuthor && selectedAuthor !== 'all') {
      query = query.eq("author_id", selectedAuthor);
    }

    const from = (currentPage - 1) * postsPerPage;
    const to = from + postsPerPage - 1;
    
    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }

    console.log('Fetched posts:', data?.length, 'Total count:', count);

    if (data) {
      const transformedPosts = data.map(post => ({
        ...post,
        profiles: post.profiles || {
          id: post.author_id,
          full_name: 'Kunaisoft News',
          avatar_url: null,
          created_at: post.created_at
        },
      })) as PostWithProfile[];
      
      return {
        posts: transformedPosts,
        totalPages: count ? Math.ceil(count / postsPerPage) : 1
      };
    }

    return { posts: [], totalPages: 1 };
  };

  const { data, isLoading } = useQuery({
    queryKey: ['posts', currentPage, selectedTag, selectedYear, selectedAuthor],
    queryFn: fetchPosts,
    refetchInterval: 60000, // Refetch every minute
  });

  return {
    posts: data?.posts || [],
    totalPages: data?.totalPages || 1,
    isLoading,
    postsPerPage
  };
}