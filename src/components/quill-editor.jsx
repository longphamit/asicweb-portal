'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import 'quill/dist/quill.snow.css';

function QuillEditor({ onUpdate, initialContent = '' }) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const onUpdateRef = useRef(onUpdate);
  const [Quill, setQuill] = useState(null);
  const [ImageResize, setImageResize] = useState(null);
  
  onUpdateRef.current = onUpdate;

  // Hàm xử lý Upload ảnh lên server
  const selectLocalImage = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      // Hiển thị trạng thái đang tải (tùy chọn)
      const range = quillRef.current.getSelection();
      
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/files', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Upload thất bại');

        const data = await res.json();
        const url = `/api/files/${data.fileId}`;

        // Chèn ảnh vào vị trí con trỏ chuột dưới dạng URL thay vì Base64
        quillRef.current.insertEmbed(range.index, 'image', url);
        quillRef.current.setSelection(range.index + 1);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Không thể tải ảnh lên server');
      }
    };
  }, []);

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
        toolbar: {
          container: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean']
          ],
          handlers: {
            // Đè lên handler mặc định của nút image
            image: selectLocalImage
          }
        },
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

    return () => {
      if (quillRef.current) {
        const toolbar = editorRef.current?.previousSibling;
        if (toolbar && toolbar.className === 'ql-toolbar') {
          toolbar.remove();
        }
        quillRef.current = null;
      }
    };
  }, [Quill, ImageResize, selectLocalImage]);

  if (!Quill || !ImageResize) {
    return <div className="p-4 text-center text-gray-500 font-medium">Đang khởi tạo trình soạn thảo...</div>;
  }

  return (
    <div style={{ minHeight: '300px' }} className="quill-editor-wrapper">
      <div ref={editorRef} />
      <style jsx global>{`
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #e5e7eb !important;
          background: #f9fafb;
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
        }
        
        .ql-container.ql-snow {
          border: none !important;
        }
        
        .ql-editor {
          font-size: 15px;
          line-height: 1.6;
          min-height: 300px;
          color: #1a1a1a;
        }

        /* Chỉnh sửa layout editor cho giống giao diện Devices mới */
        .quill-editor-wrapper {
          border-radius: 12px;
          background: white;
        }

        .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 10px 0;
        }

        /* Styles cho resize handles */
        .quill-resize-handle {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #3b82f6;
          border: 2px solid #fff;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}

export default QuillEditor;