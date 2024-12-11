import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/components/BlogPost";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tables } from "@/integrations/supabase/types";

interface BlogListProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  selectedTag: string | null;
  selectedYear: number | null;
  selectedAuthor: string | null;
}

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
};

type PostWithProfile = Tables<'posts'> & {
  profiles: Profile;
};

export function BlogList({
  currentPage,
  onPageChange,
  selectedTag,
  selectedYear,
  selectedAuthor,
}: BlogListProps) {
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 9;

  useEffect(() => {
    fetchPosts();
  }, [currentPage, selectedTag, selectedYear, selectedAuthor]);

  async function fetchPosts() {
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

    // Apply filters
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

    // Add pagination
    const from = (currentPage - 1) * postsPerPage;
    const to = from + postsPerPage - 1;
    
    const { data, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (data && count) {
      // Transform the data to match our type
      const transformedPosts = data.map(post => ({
        ...post,
        profiles: post.profiles[0], // Take the first profile from the array
      })) as PostWithProfile[];
      
      setPosts(transformedPosts);
      setTotalPages(Math.ceil(count / postsPerPage));
    }
  }

  return (
    <div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogPost key={post.id} post={post} />
        ))}
      </div>

      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext
              onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}