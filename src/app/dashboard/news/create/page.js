"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Save, RefreshCcw, Upload, X, Edit2, Tag, Plus, Loader2 } from "lucide-react";

// SỬ DỤNG RICH TEXT EDITOR WRAPPER ĐỂ XỬ LÝ ẢNH
import RichTextEditor from "@/components/rich-text-editor";

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
  const editorRef = useRef(null); // Ref để điều khiển Editor

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  
  const userEditedSlug = useRef(false);
  const fileInputRef = useRef(null);
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

  useEffect(() => {
    fetchAllTags();
  }, []);

  useEffect(() => {
    if (!userEditedSlug.current) {
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
    setThumbnailPreview("");
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

  const addTagsToNews = async (newsId) => {
    for (const tagId of selectedTags) {
      try {
        await fetch("/api/tags?action=add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tagId,
            type: "news",
            referId: newsId
          })
        });
      } catch (err) {
        console.error(`Error adding tag ${tagId}:`, err);
      }
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

      // 1. XỬ LÝ ẢNH TRONG NỘI DUNG QUA EDITOR REF
      setUploading(true);
      const cleanContent = await editorRef.current.getCleanContent();
      setUploading(false);

      // 2. Upload Thumbnail
      let thumbnailUrl = "";
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

      // 3. Gửi API
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          slug, 
          shortDescription, 
          content: cleanContent, // SỬ DỤNG CONTENT ĐÃ LÀM SẠCH
          thumbnail: thumbnailUrl,
          tags: selectedTags
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const newNews = await res.json();
      
      // Add tags
      if (selectedTags.length > 0) {
        await addTagsToNews(newNews._id);
      }

      toast.success("Tạo tin tức thành công!");
      router.push("/dashboard/news");
    } catch (err) {
      toast.error("Lỗi khi tạo tin tức", { description: err.message });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/news");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/news")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay về
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Badge variant="secondary">Tạo tin tức mới</Badge>
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
              onClick={handleSubmit} 
              disabled={saving || uploading}
              size="sm"
            >
              {(saving || uploading) ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  {uploading ? "Đang xử lý ảnh..." : "Đang lưu..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Tạo tin tức
                </>
              )}
            </Button>
          </div>
        </div>

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
                    required
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
                    required
                  />
                </div>

                {/* Content - SỬ DỤNG WRAPPER MỚI */}
                <div className="space-y-2">
                  <Label htmlFor="content">Nội dung</Label>
                  <RichTextEditor 
                    ref={editorRef} 
                    initialContent={content} 
                    onUpdate={handleEditorUpdate} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - Sidebar */}
          <div className="space-y-6">
            {/* Thumbnail Card */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r">
                <CardTitle className="text-base flex items-center">
                  <Upload className="w-4 h-4" /> Ảnh đại diện
                </CardTitle>
              </CardHeader>
              <CardContent className="">
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
              <CardContent className=" space-y-2">
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

// ... CÁC COMPONENT PHỤ GIỮ NGUYÊN ...
function ThumbnailUpload({ thumbnail, thumbnailPreview, handleThumbnailChange, removeThumbnail, fileInputRef, uploading }) {
  if (thumbnail && thumbnailPreview) {
    return (
      <div className="relative border rounded-lg overflow-hidden group">
        <img 
          src={thumbnailPreview} 
          alt="Preview" 
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button variant="destructive" size="sm" onClick={removeThumbnail}>
            <X className="w-4 h-4 mr-2" /> Xóa
          </Button>
        </div>
        {uploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-white text-center">
              <Loader2 className="animate-spin h-8 w-8 border-4 border-white border-t-transparent mx-auto mb-2" />
              <p className="text-xs">Đang xử lý...</p>
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