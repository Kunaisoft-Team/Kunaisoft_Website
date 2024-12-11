import { Navigation } from "@/components/Navigation";
import { BlogList } from "@/components/BlogList";
import { BlogFilters } from "@/components/BlogFilters";
import { useState } from "react";

const Blog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);

  return (
    <main className="min-h-screen pt-20">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Our Blog</h1>
        <BlogFilters
          onTagChange={setSelectedTag}
          onYearChange={setSelectedYear}
          onAuthorChange={setSelectedAuthor}
        />
        <BlogList
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          selectedTag={selectedTag}
          selectedYear={selectedYear}
          selectedAuthor={selectedAuthor}
        />
      </div>
    </main>
  );
};

export default Blog;