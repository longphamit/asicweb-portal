"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Save, X, Edit2, Upload, RefreshCcw } from "lucide-react";
import dynamic from "next/dynamic";

// Import Quill dynamically to avoid SSR issues
const QuillEditor = dynamic(() => import("@/components/quill-editor"), {
  ssr: false,
  loading: () => <div className="p-4 text-center text-gray-500">Đang tải editor...</div>,
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

export default function NewsUpdatePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [existingThumbnail, setExistingThumbnail] = useState("");
  
  const fileInputRef = useRef(null);
  const userEditedSlug = useRef(false);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/news/${id}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setNews(data);
      setTitle(data.title);
      setSlug(data.slug || "");
      setShortDescription(data.shortDescription);
      setContent(data.content);
      setExistingThumbnail(data.thumbnail || "");
      setThumbnailPreview(data.thumbnail || "");
    } catch (err) {
      toast.error("Lỗi khi tải tin tức", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [id]);

  // ✅ Tự tạo slug khi title thay đổi nếu user chưa chỉnh tay
  useEffect(() => {
    if (!userEditedSlug.current && title) {
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
    setThumbnailPreview(existingThumbnail);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadBase64Image = async (base64String) => {
    try {
      const formData = new FormData();
      // Convert base64 to Blob
      const byteString = atob(base64String.split(",")[1]);
      const mimeString = base64String.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      formData.append("file", blob, "image.png");

      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return data.fileId;
    } catch (err) {
      throw new Error("Lỗi khi tải ảnh lên: " + err.message);
    }
  };

  const processImagesInContent = async (content) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const images = doc.querySelectorAll("img[src^='data:image/']");

    const host = window.location.origin;
    let updatedContent = content;

    for (const img of images) {
      const base64Src = img.getAttribute("src");
      try {
        const fileId = await uploadBase64Image(base64Src);
        const newSrc = `${host}/api/files/${fileId}`;
        updatedContent = updatedContent.replace(base64Src, newSrc);
      } catch (err) {
        toast.error(err.message);
        return null;
      }
    }

    return updatedContent;
  };

  const handleUpdate = async () => {
    if (!title || !shortDescription || !content) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề, mô tả và nội dung");
      return;
    }
    
    try {
      setSaving(true);
      let thumbnailUrl = existingThumbnail;

      // Upload new thumbnail if changed
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
        thumbnailUrl = `/api/files/${uploadData.fileId}`;
        setUploading(false);
      }

      // Process images in content
      const processedContent = await processImagesInContent(content);
      if (!processedContent) {
        throw new Error("Lỗi xử lý ảnh trong nội dung");
      }

      const res = await fetch(`/api/news/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          slug,
          shortDescription, 
          content: processedContent,
          thumbnail: thumbnailUrl 
        }),
      });
      
      if (!res.ok) throw new Error(await res.text());
      toast.success("Cập nhật tin tức thành công!");
      router.push(`/dashboard/news/${id}`);
    } catch (err) {
      toast.error("Lỗi khi cập nhật tin tức", { description: err.message });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/news/${id}`);
  };

  if (loading) return <LoadingCard />;
  if (!news) return <NotFoundCard />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8">
        <HeaderSection id={id} news={news} handleCancel={handleCancel} />
        <div className="max-w-4xl mx-auto space-y-6">
          <EditCard
            title={title}
            setTitle={setTitle}
            slug={slug}
            handleSlugChange={handleSlugChange}
            regenerateSlug={regenerateSlug}
            shortDescription={shortDescription}
            setShortDescription={setShortDescription}
            content={content}
            handleEditorUpdate={handleEditorUpdate}
            thumbnail={thumbnail}
            thumbnailPreview={thumbnailPreview}
            handleThumbnailChange={handleThumbnailChange}
            removeThumbnail={removeThumbnail}
            fileInputRef={fileInputRef}
            handleUpdate={handleUpdate}
            handleCancel={handleCancel}
            saving={saving}
            uploading={uploading}
          />
        </div>
      </div>
    </div>
  );
}

/* Header */
function HeaderSection({ id, news, handleCancel }) {
  const router = useRouter();
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/news")}
          className="hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay về
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Badge variant="secondary" className="text-sm">
          Tin tức #{id}
        </Badge>
        {news?.published ? (
          <>
            <Badge variant="success" className="ml-2 bg-green-100 text-green-700">
              ✅ Xuất bản
            </Badge>
            {news.publishedAt && (
              <Badge variant="outline" className="ml-2 bg-green-100 text-green-700">
                📅 {new Date(news.publishedAt).toLocaleDateString("vi-VN")}
              </Badge>
            )}
          </>
        ) : (
          <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700">
            ⏳ Chưa xuất bản
          </Badge>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCancel}>
          <X className="w-4 h-4 mr-2" /> Hủy
        </Button>
      </div>
    </div>
  );
}

/* Loading Card */
function LoadingCard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="w-96 shadow-lg">
        <CardContent className="p-8 flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-lg font-medium text-slate-600">
            Đang tải tin tức...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/* Not Found Card */
function NotFoundCard() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="w-96 shadow-lg">
        <CardContent className="p-8 flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-lg font-medium text-slate-600">
            Không tìm thấy tin tức
          </p>
          <Button onClick={() => router.push("/dashboard/news")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay về danh sách
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* Edit Mode Card */
function EditCard({
  title,
  setTitle,
  slug,
  handleSlugChange,
  regenerateSlug,
  shortDescription,
  setShortDescription,
  content,
  handleEditorUpdate,
  thumbnail,
  thumbnailPreview,
  handleThumbnailChange,
  removeThumbnail,
  fileInputRef,
  handleUpdate,
  handleCancel,
  saving,
  uploading,
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Edit2 className="w-5 h-5" /> Chỉnh sửa tin tức
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex flex-col gap-6">
        {/* Title */}
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
            className="text-lg font-medium"
            placeholder="Nhập tiêu đề tin tức..."
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
          
          {!thumbnail && thumbnailPreview && !imageError ? (
            <div className="relative border rounded-lg overflow-hidden group">
              <img 
                src={thumbnailPreview} 
                alt="Current thumbnail" 
                className="w-full h-64 object-cover"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <label htmlFor="thumbnail-upload-update">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="cursor-pointer"
                    asChild
                  >
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Thay đổi ảnh
                    </span>
                  </Button>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                  id="thumbnail-upload-update"
                />
              </div>
            </div>
          ) : thumbnail ? (
            <div className="relative border rounded-lg overflow-hidden group">
              <img 
                src={thumbnailPreview} 
                alt="New thumbnail preview" 
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
                  Hủy thay đổi
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
          ) : (
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
          )}
        </div>

        {/* Short Description */}
        <div className="space-y-2">
          <Label
            htmlFor="shortDescription"
            className="text-sm font-medium text-slate-700"
          >
            Mô tả ngắn
          </Label>
          <Textarea
            id="shortDescription"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            rows={4}
            className="resize-none"
            placeholder="Nhập mô tả ngắn..."
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label
            htmlFor="content"
            className="text-sm font-medium text-slate-700"
          >
            Nội dung
          </Label>
          <div className="border rounded-lg bg-white overflow-hidden">
            <QuillEditor initialContent={content} onUpdate={handleEditorUpdate} />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={handleCancel} size="lg">
            <X className="w-4 h-4 mr-2" /> Hủy
          </Button>
          <Button onClick={handleUpdate} disabled={saving || uploading} size="lg">
            {(saving || uploading) ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                {uploading ? "Đang tải ảnh..." : "Đang lưu..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}