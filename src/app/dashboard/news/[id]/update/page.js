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
import { ArrowLeft, Save, X, Edit2, Upload, RefreshCcw, Tag, Plus } from "lucide-react";
import dynamic from "next/dynamic";

const QuillEditor = dynamic(() => import("@/components/quill-editor"), {
  ssr: false,
  loading: () => <div className="p-4 text-center text-gray-500">Đang tải editor...</div>,
});

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
  
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [originalTags, setOriginalTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  
  const fileInputRef = useRef(null);
  const userEditedSlug = useRef(false);
  const tagDropdownRef = useRef(null);

  const fetchAllTags = async () => {
    try {
      setTagsLoading(true);
      const res = await fetch("/api/tags?limit=100");
      if (!res.ok) throw new Error("Không thể tải tags");
      const data = await res.json();
      setAllTags(data);
    } catch (err) {
      toast.error("Lỗi khi tải tags", { description: err.message });
    } finally {
      setTagsLoading(false);
    }
  };

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
      
      if (data.tags && data.tags.length > 0) {
        setSelectedTags(data.tags);
        setOriginalTags(data.tags);
      }
    } catch (err) {
      toast.error("Lỗi khi tải tin tức", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    fetchAllTags();
  }, [id]);

  useEffect(() => {
    if (!userEditedSlug.current && title) {
      setSlug(slugify(title));
    }
  }, [title]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target)) {
        setShowTagDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditorUpdate = (html) => setContent(html);

  const handleSlugChange = (e) => {
    userEditedSlug.current = true;
    setSlug(slugify(e.target.value));
  };

  const regenerateSlug = () => {
    setSlug(slugify(title));
    userEditedSlug.current = false;
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    setThumbnail(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(existingThumbnail);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(t => t !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const removeTag = (tagId) => {
    setSelectedTags(prev => prev.filter(t => t !== tagId));
  };

  const createNewTag = async () => {
    if (!tagSearch.trim()) {
      toast.error("Vui lòng nhập tên tag");
      return;
    }

    const existingTag = allTags.find(
      t => t.name.toLowerCase() === tagSearch.toLowerCase()
    );
    if (existingTag) {
      toast.error("Tag này đã tồn tại");
      return;
    }

    try {
      setTagsLoading(true);
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: tagSearch.trim(),
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Không thể tạo tag");
      }

      const newTag = await res.json();
      
      setAllTags(prev => [...prev, newTag]);
      setSelectedTags(prev => [...prev, newTag._id]);
      setTagSearch("");
      setShowTagDropdown(false);
      
      toast.success(`Tag "${newTag.name}" đã được tạo`);
    } catch (err) {
      toast.error("Lỗi khi tạo tag", { description: err.message });
    } finally {
      setTagsLoading(false);
    }
  };

  const filteredTags = allTags.filter(tag => 
    tag.name.toLowerCase().includes(tagSearch.toLowerCase()) ||
    tag._id.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const hasExactMatch = filteredTags.some(
    tag => tag.name.toLowerCase() === tagSearch.toLowerCase()
  );

  const updateTagsInDB = async () => {
    const tagsToAdd = selectedTags.filter(t => !originalTags.includes(t));
    const tagsToRemove = originalTags.filter(t => !selectedTags.includes(t));

    for (const tagId of tagsToAdd) {
      try {
        await fetch("/api/tags?action=add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tagId,
            type: "news",
            referId: id
          })
        });
      } catch (err) {
        console.error(`Error adding tag ${tagId}:`, err);
      }
    }

    for (const tagId of tagsToRemove) {
      try {
        await fetch(`/api/tags?id=${tagId}&action=remove`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "news",
            referId: id
          })
        });
      } catch (err) {
        console.error(`Error removing tag ${tagId}:`, err);
      }
    }
  };

  const uploadBase64Image = async (base64String) => {
    try {
      const formData = new FormData();
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
          thumbnail: thumbnailUrl,
          tags: selectedTags
        }),
      });
      
      if (!res.ok) throw new Error(await res.text());

      await updateTagsInDB();

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
        <HeaderSection 
          id={id} 
          news={news} 
          handleCancel={handleCancel}
          handleUpdate={handleUpdate}
          saving={saving}
          uploading={uploading}
        />
        
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* LEFT COLUMN - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r">
                <CardTitle className="flex items-center gap-2">
                  <Edit2 className="w-5 h-5" /> Nội dung chính
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg font-medium"
                    placeholder="Nhập tiêu đề tin tức..."
                  />
                </div>

                {/* Short Description */}
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Mô tả ngắn</Label>
                  <Textarea
                    id="shortDescription"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    rows={4}
                    placeholder="Nhập mô tả ngắn..."
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Nội dung</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <QuillEditor initialContent={content} onUpdate={handleEditorUpdate} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - Sidebar */}
          <div className="space-y-6">
            {/* Thumbnail Card */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r">
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Ảnh đại diện
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ThumbnailUpload
                  thumbnail={thumbnail}
                  thumbnailPreview={thumbnailPreview}
                  handleThumbnailChange={handleThumbnailChange}
                  removeThumbnail={removeThumbnail}
                  fileInputRef={fileInputRef}
                  uploading={uploading}
                />
              </CardContent>
            </Card>

            {/* Tags Card */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <TagsSection
                  allTags={allTags}
                  selectedTags={selectedTags}
                  removeTag={removeTag}
                  toggleTag={toggleTag}
                  createNewTag={createNewTag}
                  tagsLoading={tagsLoading}
                  showTagDropdown={showTagDropdown}
                  setShowTagDropdown={setShowTagDropdown}
                  tagSearch={tagSearch}
                  setTagSearch={setTagSearch}
                  filteredTags={filteredTags}
                  hasExactMatch={hasExactMatch}
                  tagDropdownRef={tagDropdownRef}
                />
              </CardContent>
            </Card>

            {/* Slug Card */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r">
                <CardTitle className="text-base flex items-center gap-2">
                  <RefreshCcw className="w-4 h-4" /> URL Slug
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={slug}
                    onChange={handleSlugChange}
                    placeholder="slug-tu-dong"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={regenerateSlug}
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  💡 URL: <code className="bg-slate-100 px-1 rounded">/news/{slug || "..."}</code>
                </p>
              </CardContent>
            </Card>

            
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderSection({ id, news, handleCancel, handleUpdate, saving, uploading }) {
  const router = useRouter();
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/news")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay về
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Badge variant="secondary">Tin tức #{id}</Badge>
        {news?.published ? (
          <>
            <Badge className="bg-green-100 text-green-700">✅ Xuất bản</Badge>
            {news.publishedAt && (
              <Badge variant="outline" className="bg-green-100 text-green-700">
                📅 {new Date(news.publishedAt).toLocaleDateString("vi-VN")}
              </Badge>
            )}
          </>
        ) : (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            ⏳ Chưa xuất bản
          </Badge>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={handleCancel}
          size="sm"
        >
          <X className="w-4 h-4 mr-2" /> Hủy
        </Button>
        <Button 
          onClick={handleUpdate} 
          disabled={saving || uploading}
          size="sm"
        >
          {(saving || uploading) ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              {uploading ? "Đang tải..." : "Đang lưu..."}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function ThumbnailUpload({ thumbnail, thumbnailPreview, handleThumbnailChange, removeThumbnail, fileInputRef, uploading }) {
  const [imageError, setImageError] = useState(false);

  if (!thumbnail && thumbnailPreview && !imageError) {
    return (
      <div className="relative border rounded-lg overflow-hidden group">
        <img 
          src={thumbnailPreview} 
          alt="Thumbnail" 
          className="w-full h-48 object-cover"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <label htmlFor="thumbnail-upload">
            <Button variant="secondary" size="sm" asChild>
              <span className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Thay đổi
              </span>
            </Button>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="hidden"
            id="thumbnail-upload"
          />
        </div>
      </div>
    );
  }

  if (thumbnail) {
    return (
      <div className="relative border rounded-lg overflow-hidden group">
        <img 
          src={thumbnailPreview} 
          alt="Preview" 
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button variant="destructive" size="sm" onClick={removeThumbnail}>
            <X className="w-4 h-4 mr-2" /> Hủy
          </Button>
        </div>
        {uploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent mx-auto mb-2"></div>
              <p className="text-xs">Đang tải...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleThumbnailChange}
        className="hidden"
        id="thumbnail-upload"
      />
      <label htmlFor="thumbnail-upload" className="cursor-pointer flex flex-col items-center gap-2">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <Upload className="w-6 h-6 text-gray-400" />
        </div>
        <div>
          <p className="text-xs font-medium">Click để tải ảnh</p>
          <p className="text-xs text-gray-500">Max 5MB</p>
        </div>
      </label>
    </div>
  );
}

function TagsSection({
  allTags,
  selectedTags,
  removeTag,
  toggleTag,
  createNewTag,
  tagsLoading,
  showTagDropdown,
  setShowTagDropdown,
  tagSearch,
  setTagSearch,
  filteredTags,
  hasExactMatch,
  tagDropdownRef
}) {
  return (
    <>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tagId => {
            const tag = allTags.find(t => t._id === tagId);
            return tag ? (
              <div 
                key={tagId} 
                className="px-2.5 py-1 flex items-center gap-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
              >
                <span>{tag.name}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tagId)}
                  className="hover:text-red-600 focus:outline-none"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : null;
          })}
        </div>
      )}

      {/* Add Tag Dropdown */}
      <div className="relative" ref={tagDropdownRef}>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowTagDropdown(!showTagDropdown)}
          className="w-full justify-start gap-2 h-9"
          disabled={tagsLoading}
        >
          <Plus className="w-4 h-4" />
          {tagsLoading ? "Đang tải..." : "Thêm tag"}
        </Button>

        {showTagDropdown && (
          <div className="absolute z-50 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-64 overflow-auto">
            <div className="p-2 border-b sticky top-0 bg-white">
              <Input
                placeholder="Tìm hoặc tạo tag..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tagSearch.trim() && !hasExactMatch) {
                    e.preventDefault();
                    createNewTag();
                  }
                }}
              />
            </div>
            <div className="p-2">
              {/* Create New Tag */}
              {tagSearch.trim() && !hasExactMatch && (
                <div
                  onClick={createNewTag}
                  className="px-3 py-2 rounded cursor-pointer hover:bg-green-50 border-b mb-2 bg-green-50/50"
                >
                  <span className="text-sm font-medium text-green-700 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Tạo: "{tagSearch.trim()}"
                  </span>
                </div>
              )}

              {/* Tag List */}
              {filteredTags.length === 0 && !tagSearch.trim() ? (
                <p className="text-sm text-gray-500 text-center py-4">Không có tag</p>
              ) : (
                filteredTags.map(tag => (
                  <div
                    key={tag._id}
                    onClick={() => toggleTag(tag._id)}
                    className={`px-3 py-2 rounded cursor-pointer flex items-center justify-between hover:bg-slate-100 text-sm ${
                      selectedTags.includes(tag._id) ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <span>{tag.name}</span>
                    {selectedTags.includes(tag._id) && (
                      <Badge className="text-xs bg-blue-600 text-white">✓</Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function LoadingCard() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-96 shadow-lg">
        <CardContent className="p-8 flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-lg font-medium text-slate-600">Đang tải tin tức...</p>
        </CardContent>
      </Card>
    </div>
  );
}

function NotFoundCard() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-96 shadow-lg">
        <CardContent className="p-8 flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-lg font-medium">Không tìm thấy tin tức</p>
          <Button onClick={() => router.push("/dashboard/news")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay về
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}