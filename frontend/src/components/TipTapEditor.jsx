import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading2, Quote } from 'lucide-react';

const TipTapEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4 bg-slate-50 dark:bg-slate-800 rounded-b-xl border border-t-0 border-slate-200 dark:border-slate-700',
      },
    },
  });

  if (!editor) return null;

  const renderMenuBar = () => {
    return (
      <div className="flex flex-wrap gap-2 p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-t-xl">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('bold') ? 'bg-slate-300 dark:bg-slate-600' : ''}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('italic') ? 'bg-slate-300 dark:bg-slate-600' : ''}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 text-sm font-bold rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-300 dark:bg-slate-600' : ''}`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('bulletList') ? 'bg-slate-300 dark:bg-slate-600' : ''}`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('orderedList') ? 'bg-slate-300 dark:bg-slate-600' : ''}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('blockquote') ? 'bg-slate-300 dark:bg-slate-600' : ''}`}
        >
          <Quote className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {renderMenuBar()}
      <EditorContent editor={editor} />
    </div>
  );
};

export default TipTapEditor;
