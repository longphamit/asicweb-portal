"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save, RefreshCcw, Upload, X, Image as ImageIcon } from "lucide-react";
import dynamic from "next/dynamic";

// Import Quill dynamically để tránh SSR issues
const QuillEditor = dynamic(() => import("@/components/quill-editor"), {
  ssr: false,
  loading: () => <div className="p-4 text-center text-gray-500">Đang tải editor...</div>
});

// 🌀 Hàm tạo slug chuẩn SEO
const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function CreateNewsPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const userEditedSlug = useRef(false);
  const fileInputRef = useRef(null);

  // ✅ Tự tạo slug khi title thay đổi nếu user chưa chỉnh tay
  useEffect(() => {
    if (!userEditedSlug.current) {
      setSlug(slugify(title));
    }
  }, [title]);

  const handleEditorUpdate = (html) => setContent(html);

  const handleSlugChange = (e) => {
    userEditedSlug.current = true;
    setSlug(slugify(e.target.value));
  };

  const regenerateSlug = () => {
    setSlug(slugify(title));
    userEditedSlug.current = false;
  };

  // 📸 Handle thumbnail upload
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    setThumbnail(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 🗑️ Remove thumbnail
  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !shortDescription || !content) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề, mô tả và nội dung");
      return;
    }

    try {
      setSaving(true);
      let thumbnailUrl = "";

      // Upload thumbnail if exists
      if (thumbnail) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", thumbnail);

        const uploadRes = await fetch("/api/files", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Lỗi khi upload ảnh");
        
        const uploadData = await uploadRes.json();
        // Tạo thumbnail URL từ fileId
        thumbnailUrl = `/api/files/${uploadData.fileId}`;
        setUploading(false);
      }

      // Create news
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          slug, 
          shortDescription, 
          content,
          thumbnail: thumbnailUrl 
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success("Tạo tin tức thành công!");
      router.push("/dashboard/news");
    } catch (err) {
      toast.error("Lỗi khi tạo tin tức", { description: err.message });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto shadow-xl bg-white/90 backdrop-blur-sm">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r border-b p-6 flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/news")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay về
            </Button>

            <CardTitle className="text-2xl font-bold text-slate-800">
              Tạo tin tức mới
            </CardTitle>

            <div className="w-20" />
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tiêu đề */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                  Tiêu đề
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (e.target.value === "") userEditedSlug.current = false;
                  }}
                  placeholder="Nhập tiêu đề tin tức"
                  className="text-lg font-medium"
                  required
                />
              </div>

              {/* 📌 Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium text-slate-700">
                  Slug (tự sinh, có thể chỉnh sửa)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="slug"
                    placeholder="slug-tu-dong"
                    value={slug}
                    onChange={handleSlugChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Tạo lại slug từ tiêu đề"
                    onClick={regenerateSlug}
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  💡 Slug sẽ xuất hiện trong URL: <code>/news/{slug || "slug-tu-dong"}</code>
                </p>
              </div>

              {/* 📸 Thumbnail Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Ảnh đại diện (Thumbnail)
                </Label>
                
                {!thumbnailPreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label 
                      htmlFor="thumbnail-upload" 
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Click để tải ảnh lên
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF tối đa 5MB
                        </p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="relative border rounded-lg overflow-hidden group">
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail preview" 
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeThumbnail}
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        Xóa ảnh
                      </Button>
                    </div>
                    {uploading && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-2"></div>
                          <p className="text-sm">Đang tải ảnh lên...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mô tả ngắn */}
              <div className="space-y-2">
                <Label htmlFor="shortDescription" className="text-sm font-medium text-slate-700">
                  Mô tả ngắn
                </Label>
                <Textarea
                  id="shortDescription"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Nhập mô tả ngắn"
                  rows={4}
                  className="resize-none p-3 font-medium whitespace-pre-line"
                  required
                />
              </div>

              {/* Nội dung */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium text-slate-700">
                  Nội dung
                </Label>
                <div className="border rounded-lg bg-white overflow-hidden">
                  <QuillEditor initialContent={content} onUpdate={handleEditorUpdate} />
                </div>
              </div>

              {/* Nút Lưu */}
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  type="submit"
                  disabled={saving || uploading}
                  size="lg"
                  className="from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {(saving || uploading) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      {uploading ? "Đang tải ảnh..." : "Đang lưu..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu tin tức
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}