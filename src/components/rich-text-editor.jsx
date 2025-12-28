"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import dynamic from "next/dynamic";

const QuillEditor = dynamic(() => import("@/components/quill-editor"), {
  ssr: false,
  loading: () => <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed text-gray-400 font-medium">Đang tải trình soạn thảo...</div>
});

const RichTextEditor = forwardRef(({ initialContent, onUpdate }, ref) => {
  const [content, setContent] = useState(initialContent || "");

  const uploadBase64Image = async (base64String) => {
    try {
      const byteString = atob(base64String.split(",")[1]);
      const mimeString = base64String.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });

      const formData = new FormData();
      formData.append("file", blob, "editor-upload.png");

      const res = await fetch("/api/files", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return data.fileId;
    } catch (err) {
      console.error("RichTextEditor Upload Error:", err);
      return null;
    }
  };

  // Hàm được gọi từ trang cha qua ref
  useImperativeHandle(ref, () => ({
    getCleanContent: async () => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");
      const images = doc.querySelectorAll("img[src^='data:image/']");
      const host = window.location.origin;

      // 1. Bước đầu: Vẫn upload và thay thế trong DOM để lấy list URL tương đối
      for (const img of images) {
        const base64Src = img.getAttribute("src");
        const fileId = await uploadBase64Image(base64Src);
        if (fileId) {
          const newUrl = `/api/files/${fileId}`;
          img.setAttribute("src", newUrl);
        }
      }

      // 2. Lấy HTML thô từ doc (Lúc này các link thường bị mất host do trình duyệt tối ưu)
      let finalHtml = doc.body.innerHTML;

      // 3. QUAN TRỌNG: Dùng Regex để ép thêm Host vào tất cả các thẻ img src="/api/files/..."
      // Tìm các src="/api/" và thay bằng src="http://localhost:3000/api/"
      const pattern = /src="\/api\/files\//g;
      finalHtml = finalHtml.replace(pattern, `src="${host}/api/files/`);

      return finalHtml;
    }
  }));

  return (
    <div className="rich-text-wrapper min-h-[300px]">
      <QuillEditor
        initialContent={initialContent}
        onUpdate={(html) => {
          setContent(html);
          if (onUpdate) onUpdate(html);
        }}
      />
    </div>
  );
});

RichTextEditor.displayName = "RichTextEditor";
export default RichTextEditor;