import { useBlogPosts } from "@/hooks/useBlogPosts";
import { BlogGrid } from "@/components/BlogGrid";
import { BlogPagination } from "@/components/BlogPagination";

interface BlogListProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  selectedTag: string | null;
  selectedYear: number | null;
  selectedAuthor: string | null;
}

export function BlogList({
  currentPage,
  onPageChange,
  selectedTag,
  selectedYear,
  selectedAuthor,
}: BlogListProps) {
  const { posts, totalPages, isLoading } = useBlogPosts({
    currentPage,
    selectedTag,
    selectedYear,
    selectedAuthor,
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div>
      <BlogGrid posts={posts} />
      <BlogPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}