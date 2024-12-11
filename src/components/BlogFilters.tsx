import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BlogFiltersProps {
  onTagChange: (tag: string | null) => void;
  onYearChange: (year: number | null) => void;
  onAuthorChange: (author: string | null) => void;
}

export function BlogFilters({ onTagChange, onYearChange, onAuthorChange }: BlogFiltersProps) {
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [authors, setAuthors] = useState<{ id: string; full_name: string }[]>([]);

  useEffect(() => {
    fetchFilters();
  }, []);

  async function fetchFilters() {
    // Fetch tags
    const { data: tagsData } = await supabase.from("tags").select("id, name");
    if (tagsData) setTags(tagsData);

    // Fetch unique years from posts
    const { data: postsData } = await supabase
      .from("posts")
      .select("created_at");
    if (postsData) {
      const uniqueYears = [...new Set(postsData.map(post => 
        new Date(post.created_at).getFullYear()
      ))].sort((a, b) => b - a);
      setYears(uniqueYears);
    }

    // Fetch authors
    const { data: authorsData } = await supabase
      .from("profiles")
      .select("id, full_name");
    if (authorsData) setAuthors(authorsData);
  }

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <Select onValueChange={(value) => onTagChange(value || null)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Tag" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tags</SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag.id} value={tag.id}>
              {tag.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={(value) => onYearChange(value ? parseInt(value) : null)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Years</SelectItem>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={(value) => onAuthorChange(value || null)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Author" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Authors</SelectItem>
          {authors.map((author) => (
            <SelectItem key={author.id} value={author.id}>
              {author.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}