import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "./RichTextEditor";

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
        <label className="block text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
          placeholder="Enter post title"
          className="mt-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Content <span className="text-red-500">*</span>
        </label>
        <RichTextEditor 
          content={content} 
          onChange={onContentChange} 
          required={true}
        />
        {content.length === 0 && (
          <p className="text-sm text-red-500 mt-1">Content is required</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Excerpt <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          value={excerpt}
          onChange={(e) => onExcerptChange(e.target.value)}
          required
          placeholder="Enter post excerpt"
          className="mt-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Tags <span className="text-red-500">*</span>
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
        {selectedTags.length === 0 && (
          <p className="text-sm text-red-500 mt-1">Please select at least one tag</p>
        )}
      </div>
      <Button 
        type="submit" 
        disabled={!title || !content || !excerpt || selectedTags.length === 0}
      >
        Create Post
      </Button>
    </form>
  );
};