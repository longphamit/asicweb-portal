'use client'

import React, { useEffect } from 'react'
import './styles.scss'
import { TextStyleKit } from '@tiptap/extension-text-style'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
// import icon từ react-icons
import { 
  BiBold, BiItalic, BiStrikethrough, BiCode, BiListUl, BiListOl, BiSolidQuoteLeft,
  BiUndo, BiRedo, BiTrash, BiHeading
} from 'react-icons/bi'

const extensions = [TextStyleKit, StarterKit]

function MenuBar({ editor }) {
  if (!editor) return null

  const editorState = useEditorState({
    editor,
    selector: ctx => ({
      isBold: ctx.editor.isActive('bold') ?? false,
      canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
      isItalic: ctx.editor.isActive('italic') ?? false,
      canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
      isStrike: ctx.editor.isActive('strike') ?? false,
      canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
      isCode: ctx.editor.isActive('code') ?? false,
      canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
      isBulletList: ctx.editor.isActive('bulletList') ?? false,
      isOrderedList: ctx.editor.isActive('orderedList') ?? false,
      isBlockquote: ctx.editor.isActive('blockquote') ?? false,
      canUndo: ctx.editor.can().chain().undo().run() ?? false,
      canRedo: ctx.editor.can().chain().redo().run() ?? false,
    }),
  })

  const buttons = [
    { icon: BiBold, action: () => editor.chain().focus().toggleBold().run(), active: editorState.isBold, disabled: !editorState.canBold },
    { icon: BiItalic, action: () => editor.chain().focus().toggleItalic().run(), active: editorState.isItalic, disabled: !editorState.canItalic },
    { icon: BiStrikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: editorState.isStrike, disabled: !editorState.canStrike },
    { icon: BiCode, action: () => editor.chain().focus().toggleCode().run(), active: editorState.isCode, disabled: !editorState.canCode },
    { icon: BiTrash, action: () => editor.chain().focus().unsetAllMarks().clearNodes().run() },
    { icon: BiHeading, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { icon: BiListUl, action: () => editor.chain().focus().toggleBulletList().run(), active: editorState.isBulletList },
    { icon: BiListOl, action: () => editor.chain().focus().toggleOrderedList().run(), active: editorState.isOrderedList },
    { icon: BiSolidQuoteLeft, action: () => editor.chain().focus().toggleBlockquote().run(), active: editorState.isBlockquote },
    { icon: BiUndo, action: () => editor.chain().focus().undo().run(), disabled: !editorState.canUndo },
    { icon: BiRedo, action: () => editor.chain().focus().redo().run(), disabled: !editorState.canRedo },
  ]

  return (
    <div className="control-group">
      <div className="button-group">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={btn.action}
            disabled={btn.disabled}
            className={btn.active ? 'is-active' : ''}
            type="button"
          >
            <btn.icon size={18} />
          </button>
        ))}
      </div>
    </div>
  )
}

export default function TiptapEditor({ onUpdate, initialContent = "" }) {
  const editor = useEditor({
    extensions,
    content: initialContent, 
    immediatelyRender: false, // 👈 quan trọng để tránh SSR mismatch
    onUpdate: ({ editor }) => {
      if (onUpdate) onUpdate(editor.getHTML());
    },
  });

  // Nếu initialContent thay đổi sau khi editor mount
  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  if (!editor) return null;

  return (
    <div className="tiptap-wrapper">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="tiptap p-3" />
    </div>
  );
}
