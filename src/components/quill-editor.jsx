'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css';

function QuillEditor({ onUpdate, initialContent = '' }) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const onUpdateRef = useRef(onUpdate);
  const [Quill, setQuill] = useState(null);
  const [ImageResize, setImageResize] = useState(null);
  
  onUpdateRef.current = onUpdate;

  // Load Quill và ImageResize dynamically
  useEffect(() => {
    Promise.all([
      import('quill'),
      import('quill-resize-image')
    ]).then(([QuillModule, ImageResizeModule]) => {
      setQuill(() => QuillModule.default);
      setImageResize(() => ImageResizeModule.default);
    });
  }, []);

  useEffect(() => {
    if (!editorRef.current || quillRef.current || !Quill || !ImageResize) return;

    // Register ImageResize module
    Quill.register('modules/resize', ImageResize);

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
        ],
        resize: {
          locale: {
            altTip: "Giữ ALT để thay đổi tỷ lệ tự do",
            floatLeft: "Trái",
            floatRight: "Phải",
            center: "Giữa",
            restore: "Khôi phục"
          }
        }
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

    console.log('Editor font-size:', window.getComputedStyle(quill.root).fontSize);

    return () => {
      if (quillRef.current) {
        const toolbar = editorRef.current?.previousSibling;
        if (toolbar && toolbar.className === 'ql-toolbar') {
          toolbar.remove();
        }
        quillRef.current = null;
      }
    };
  }, [Quill, ImageResize]);

  if (!Quill || !ImageResize) {
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
        
        .ql-toolbar.ql-snow:not(:first-of-type) {
          display: none !important;
        }

        /* Styles cho image resize */
        .ql-editor img {
          max-width: 100%;
          height: auto;
        }

        /* Style cho resize handles */
        .quill-resize-handle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #4a90e2;
          border: 1px solid #fff;
          border-radius: 50%;
          cursor: pointer;
        }

        .quill-resize-handle.quill-resize-handle-nw {
          top: -4px;
          left: -4px;
          cursor: nw-resize;
        }

        .quill-resize-handle.quill-resize-handle-ne {
          top: -4px;
          right: -4px;
          cursor: ne-resize;
        }

        .quill-resize-handle.quill-resize-handle-sw {
          bottom: -4px;
          left: -4px;
          cursor: sw-resize;
        }

        .quill-resize-handle.quill-resize-handle-se {
          bottom: -4px;
          right: -4px;
          cursor: se-resize;
        }

        /* Toolbar cho image alignment */
        .quill-image-toolbar {
          position: absolute;
          background: #fff;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          display: flex;
          gap: 4px;
          z-index: 1000;
        }

        .quill-image-toolbar button {
          padding: 4px 8px;
          border: 1px solid #ddd;
          background: #fff;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
        }

        .quill-image-toolbar button:hover {
          background: #f0f0f0;
        }

        .quill-image-toolbar button:active {
          background: #e0e0e0;
        }
      `}</style>
    </div>
  );
}

export default QuillEditor;