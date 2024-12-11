import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";

interface TagManagementProps {
  tags: any[];
  selectedTags: string[];
  onTagsChange: () => void;
  onTagToggle: (tagId: string) => void;
}

export const TagManagement = ({
  tags,
  selectedTags,
  onTagsChange,
  onTagToggle,
}: TagManagementProps) => {
  const [newTag, setNewTag] = useState("");

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    try {
      const { error } = await supabase
        .from("tags")
        .insert([{ name: newTag.trim() }]);

      if (error) throw error;

      toast.success("Tag created successfully");
      setNewTag("");
      onTagsChange();
    } catch (error) {
      console.error("Error creating tag:", error);
      toast.error("Failed to create tag");
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
      toast.success("Tag deleted successfully");
      onTagsChange();
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast.error("Failed to delete tag");
    }
  };

  return (
    <div className="mb-8 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Tag Management</h2>
      <form onSubmit={handleCreateTag} className="flex gap-2 mb-4">
        <Input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Enter new tag name"
          className="max-w-xs"
        />
        <Button type="submit">Create Tag</Button>
      </form>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag: any) => (
          <Badge
            key={tag.id}
            variant={selectedTags.includes(tag.id) ? "default" : "outline"}
            className="cursor-pointer group"
            onClick={() => onTagToggle(tag.id)}
          >
            {tag.name}
            <X
              className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTag(tag.id);
              }}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};