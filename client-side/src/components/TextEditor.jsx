import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Dropzone from './DropZone.jsx';

const MenuBar = ({ editor, onImageUpload }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2 border-b border-gray-700 pb-2">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
      >
        Bullet List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
      >
        Ordered List
      </button>
      <Dropzone onDrop={onImageUpload} />
    </div>
  );
};

export const RichTextEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const addImage = useCallback(
    (url) => {
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    },
    [editor]
  );

  return (
    <div className="border border-gray-700 rounded p-4 bg-gray-800">
      <MenuBar editor={editor} onImageUpload={addImage} />
      <EditorContent editor={editor} className="min-h-[300px] p-2" />
    </div>
  );
};