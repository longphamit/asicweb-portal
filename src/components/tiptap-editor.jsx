'use client';

import React, { useMemo, useRef } from 'react';
import './styles.scss';
import { TextStyle as TextStyleKit } from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ResizableImage } from 'tiptap-extension-resizable-image';
import 'tiptap-extension-resizable-image/styles.css';
import TextAlign from '@tiptap/extension-text-align';
import {
  BiBold, BiItalic, BiStrikethrough, BiCode, BiListUl, BiListOl, BiSolidQuoteLeft,
  BiUndo, BiRedo, BiTrash, BiHeading,
  BiAlignLeft, BiAlignMiddle, BiAlignRight
} from 'react-icons/bi';
import sanitizeHtml from 'sanitize-html';

// Extensions
const extensions = [
  TextStyleKit,
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
    },
  }),
  ResizableImage.configure({
    defaultWidth: 200,
    defaultHeight: 200,
    keepAspectRatio: true,
  }),
  TextAlign.configure({
    types: ['paragraph', 'heading', 'image'],
  }),
];

// MenuBar Component
function MenuBar({ editor }) {
  if (!editor) return null;

  const node = editor.state.selection.$from.node();
  const textAlign = node.attrs.textAlign || 'left';

  // Lấy heading level hiện tại
  const getCurrentHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'H1';
    if (editor.isActive('heading', { level: 2 })) return 'H2';
    if (editor.isActive('heading', { level: 3 })) return 'H3';
    if (editor.isActive('heading', { level: 4 })) return 'H4';
    if (editor.isActive('heading', { level: 5 })) return 'H5';
    if (editor.isActive('heading', { level: 6 })) return 'H6';
    return 'Normal';
  };

  const buttons = [
    { icon: BiBold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { icon: BiItalic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { icon: BiStrikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
    { icon: BiCode, action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code') },
    { icon: BiTrash, action: () => editor.chain().focus().unsetAllMarks().clearNodes().run() },
    { icon: BiListUl, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
    { icon: BiListOl, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
    { icon: BiSolidQuoteLeft, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
    { icon: BiUndo, action: () => editor.chain().focus().undo().run() },
    { icon: BiRedo, action: () => editor.chain().focus().redo().run() },
    {
      icon: BiAlignLeft,
      action: () => editor.chain().focus().setTextAlign('left').run(),
      active: textAlign === 'left',
    },
    {
      icon: BiAlignMiddle,
      action: () => editor.chain().focus().setTextAlign('center').run(),
      active: textAlign === 'center',
    },
    {
      icon: BiAlignRight,
      action: () => editor.chain().focus().setTextAlign('right').run(),
      active: textAlign === 'right',
    },
  ];

  const headingOptions = [
    { label: 'Normal', action: () => editor.chain().focus().setParagraph().run() },
    { label: 'H1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { label: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: 'H3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: 'H4', action: () => editor.chain().focus().toggleHeading({ level: 4 }).run() },
    { label: 'H5', action: () => editor.chain().focus().toggleHeading({ level: 5 }).run() },
    { label: 'H6', action: () => editor.chain().focus().toggleHeading({ level: 6 }).run() },
  ];

  return (
    <div className="control-group" style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 100 }}>
      <div className="button-group">
        {/* Heading Dropdown */}
        <select
          onChange={(e) => {
            const option = headingOptions.find(opt => opt.label === e.target.value);
            option?.action();
          }}
          value={getCurrentHeading()}
          className="heading-select"
        >
          {headingOptions.map((opt) => (
            <option key={opt.label} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Các button khác */}
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={btn.action}
            className={btn.active ? 'is-active' : ''}
            type="button"
          >
            <btn.icon size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}

// Main Component
export default function TiptapEditor({ onUpdate, initialContent = '' }) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const cleanContent = useMemo(() => {
    return sanitizeHtml(initialContent, {
      allowedTags: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'em', 'img', 'blockquote'],
      allowedAttributes: {
        img: ['src', 'alt', 'width', 'height', 'style'],
        '*': ['style', 'id', 'class'],
      },
    });
  }, [initialContent]);

  const editor = useEditor({
    extensions,
    content: cleanContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onUpdateRef.current?.(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="tiptap-wrapper">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="tiptap" />
    </div>
  );
}