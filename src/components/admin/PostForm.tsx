import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface PostFormProps {
  title: string;
  content: string;
  excerpt: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onExcerptChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  tags: any[];
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
}

export const PostForm = ({
  title,
  content,
  excerpt,
  onTitleChange,
  onContentChange,
  onExcerptChange,
  onSubmit,
  tags,
  selectedTags,
  onTagToggle,
}: PostFormProps) => {
  return (
    <form onSubmit={onSubmit} className="mb-8 space-y-4 max-w-2xl bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <Input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Excerpt</label>
        <Input
          type="text"
          value={excerpt}
          onChange={(e) => onExcerptChange(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Content</label>
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={6}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag: any) => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.id) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onTagToggle(tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>
      <Button type="submit">Create Post</Button>
    </form>
  );
};