import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { BlogList } from "@/components/BlogList";
import { BlogFilters } from "@/components/BlogFilters";
import { BlogSearch } from "@/components/BlogSearch";

const Blog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <main className="min-h-screen pt-20">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Our Blog</h1>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <BlogSearch onSearch={handleSearch} />
          <BlogFilters
            onTagChange={setSelectedTag}
            onYearChange={setSelectedYear}
            onAuthorChange={setSelectedAuthor}
          />
        </div>
        <BlogList
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          selectedTag={selectedTag}
          selectedYear={selectedYear}
          selectedAuthor={selectedAuthor}
          searchQuery={searchQuery}
        />
      </div>
    </main>
  );
};

export default Blog;