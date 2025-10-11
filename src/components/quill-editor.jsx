'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css';

function QuillEditor({ onUpdate, initialContent = '' }) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const onUpdateRef = useRef(onUpdate);
  const [Quill, setQuill] = useState(null);
  
  onUpdateRef.current = onUpdate;

  // Load Quill dynamically
  useEffect(() => {
    import('quill').then((QuillModule) => {
      setQuill(() => QuillModule.default);
    });
  }, []);

  useEffect(() => {
    if (!editorRef.current || quillRef.current || !Quill) return;

    const quill = new Quill(editorRef.current, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'align': [] }],
          ['link', 'image'],
          ['clean']
        ]
      },
      placeholder: 'Viết nội dung...',
    });

    if (initialContent) {
      quill.clipboard.dangerouslyPasteHTML(initialContent);
    }

    quill.on('text-change', () => {
      onUpdateRef.current?.(quill.root.innerHTML);
    });

    quillRef.current = quill;

    // Debug font-size
    console.log('Editor font-size:', window.getComputedStyle(quill.root).fontSize);

    return () => {
      if (quillRef.current) {
        // Cleanup khi unmount
        const toolbar = editorRef.current?.previousSibling;
        if (toolbar && toolbar.className === 'ql-toolbar') {
          toolbar.remove();
        }
        quillRef.current = null;
      }
    };
  }, [Quill]); // BỎ initialContent khỏi dependency

  if (!Quill) {
    return <div className="p-4 text-center text-gray-500">Đang tải editor...</div>;
  }

  return (
    <div style={{ minHeight: '300px' }}>
      <div ref={editorRef} />
      <style jsx global>{`
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #e5e7eb !important;
          background: #f9fafb;
        }
        
        .ql-container.ql-snow {
          border: none !important;
        }
        
        .ql-editor {
          font-size: 16px;
          line-height: 1.6;
          min-height: 300px;
        }
        
        /* Xóa toolbar duplicate */
        .ql-toolbar.ql-snow:not(:first-of-type) {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

export default QuillEditor;