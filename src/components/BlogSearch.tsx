import { Input } from "@/components/ui/input";

interface BlogSearchProps {
  onSearch: (query: string) => void;
}

export function BlogSearch({ onSearch }: BlogSearchProps) {
  return (
    <div className="w-full max-w-sm mb-8">
      <Input
        type="search"
        placeholder="Search articles..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-full"
      />
    </div>
  );
}