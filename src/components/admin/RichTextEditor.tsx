import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { EditorToolbar } from './editor/EditorToolbar';

interface RichTextEditorProps {
  content: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export const RichTextEditor = ({ content, onChange, required = false }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor border rounded-lg shadow-sm">
      <EditorToolbar editor={editor} />
      <EditorContent 
        editor={editor} 
        className={`prose max-w-none p-4 min-h-[200px] focus:outline-none ${
          required && !content ? 'border-red-500' : ''
        }`}
      />
    </div>
  );
};