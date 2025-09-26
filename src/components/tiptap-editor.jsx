'use client'

import React, { useEffect } from 'react'
import './styles.scss'
import { TextStyle as TextStyleKit } from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { ResizableImage } from 'tiptap-extension-resizable-image'
import 'tiptap-extension-resizable-image/styles.css'
import TextAlign from '@tiptap/extension-text-align'

import {
  BiBold, BiItalic, BiStrikethrough, BiCode, BiListUl, BiListOl, BiSolidQuoteLeft,
  BiUndo, BiRedo, BiTrash, BiHeading,
  BiAlignLeft, BiAlignMiddle, BiAlignRight
} from 'react-icons/bi'

// ========================
// EXTENSIONS
// ========================
const extensions = [
  TextStyleKit,
  StarterKit.configure({
    document: { content: 'block+' },
    bold: true,
    italic: true,
    strike: true,
    code: true,
  }),
  ResizableImage.configure({
    defaultWidth: 200,
    defaultHeight: 200,
    keepAspectRatio: true,
  }),
  TextAlign.configure({
    types: ['paragraph', 'heading', 'image'],
  }),
]

// ========================
// MENU BAR
// ========================
function MenuBar({ editor }) {
  if (!editor) return null

  const node = editor.state.selection.$from.node()
  const textAlign = node.attrs.textAlign || 'left'

  const buttons = [
    { icon: BiBold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { icon: BiItalic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { icon: BiStrikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
    { icon: BiCode, action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code') },
    { icon: BiTrash, action: () => editor.chain().focus().unsetAllMarks().clearNodes().run() },
    { icon: BiHeading, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { icon: BiListUl, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
    { icon: BiListOl, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
    { icon: BiSolidQuoteLeft, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
    { icon: BiUndo, action: () => editor.chain().focus().undo().run() },
    { icon: BiRedo, action: () => editor.chain().focus().redo().run() },
    { icon: BiAlignLeft, action: () => editor.chain()
        .updateAttributes('paragraph', { textAlign: 'left' })
        .updateAttributes('heading', { textAlign: 'left' })
        .updateAttributes('image', { textAlign: 'left' })
        .run({ scrollIntoView: false }),
      active: textAlign === 'left'
    },
    { icon: BiAlignMiddle, action: () => editor.chain()
        .updateAttributes('paragraph', { textAlign: 'center' })
        .updateAttributes('heading', { textAlign: 'center' })
        .updateAttributes('image', { textAlign: 'center' })
        .run({ scrollIntoView: false }),
      active: textAlign === 'center'
    },
    { icon: BiAlignRight, action: () => editor.chain()
        .updateAttributes('paragraph', { textAlign: 'right' })
        .updateAttributes('heading', { textAlign: 'right' })
        .updateAttributes('image', { textAlign: 'right' })
        .run({ scrollIntoView: false }),
      active: textAlign === 'right'
    },
  ]

  return (
    <div className="control-group" style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 100 }}>
      <div className="button-group">
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
  )
}

// ========================
// MAIN COMPONENT
// ========================
export default function TiptapEditor({ onUpdate, initialContent = "" }) {
  const editor = useEditor({
    extensions,
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent)
    }
  }, [editor, initialContent])

  if (!editor) return null

  return (
    <div className="tiptap-wrapper">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="tiptap" />
    </div>
  )
}
