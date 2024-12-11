import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PostListProps {
  posts: any[];
  tags: any[];
  onDelete: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PostList = ({
  posts,
  tags,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: PostListProps) => {
  return (
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
              onClick={() => onDelete(post.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(Math.max(1, currentPage - 1));
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page);
                  }}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(Math.min(totalPages, currentPage + 1));
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};