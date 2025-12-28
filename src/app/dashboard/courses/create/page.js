"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  RefreshCcw, 
  ArrowLeft, 
  Save, 
  Loader2,
  BookOpen,
  Calendar,
  User,
  CheckCircle2,
  Upload,
  X,
  FileText,
  Tags,
  AlignLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import RichTextEditor from "@/components/rich-text-editor";

/**
 * THÔNG BÁO TÙY CHỈNH
 */
const ToastNotification = ({ message, type }) => {
  if (!message) return null;
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border transition-all animate-in slide-in-from-top-4 
      ${type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
      {type === 'success' ? <CheckCircle2 size={20} className="text-emerald-600" /> : <span className="text-xl">⚠️</span>}
      <p className="font-bold text-sm tracking-tight">{message}</p>
    </div>
  );
};

export default function NewCoursePage() {
  const router = useRouter();
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const userEditedSlug = useRef(false);

  const [notification, setNotification] = useState({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "", // Mô tả ngắn (Text thuần)
    content: "",     // Nội dung chi tiết (Rich Text)
    instructor: "",
    startDate: "",
    status: "upcoming",
    skills: "",
    thumbnail: ""
  });

  const [thumbnailPreview, setThumbnailPreview] = useState("");

  // --- Helpers: Slugify ---
  const slugify = (text) =>
    text
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  useEffect(() => {
    if (!userEditedSlug.current) {
      setFormData(prev => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [formData.title]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "slug") userEditedSlug.current = true;
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh quá lớn (Max 5MB)");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(reader.result);
    reader.readAsDataURL(file);
    setFormData(prev => ({ ...prev, thumbnailFile: file }));
  };

  const removeThumbnail = () => {
    setThumbnailPreview("");
    setFormData(prev => ({ ...prev, thumbnail: "", thumbnailFile: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề khóa học");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Xử lý Rich Text và Upload ảnh trong nội dung chi tiết
      setUploading(true);
      const cleanContent = await editorRef.current.getCleanContent();
      
      // 2. Upload Thumbnail chính
      let currentThumbnailUrl = "";
      if (formData.thumbnailFile) {
        const fileData = new FormData();
        fileData.append("file", formData.thumbnailFile);
        const uploadRes = await fetch("/api/files", { method: "POST", body: fileData });
        if (uploadRes.ok) {
          const uploadResult = await uploadRes.json();
          currentThumbnailUrl = `/api/files/${uploadResult.fileId}`;
        }
      }
      setUploading(false);

      // 3. Gửi API tạo khóa học
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          content: cleanContent, // Lưu vào trường content
          thumbnail: currentThumbnailUrl 
        }),
      });

      if (!res.ok) throw new Error("Không thể tạo khóa học");

      setNotification({ message: "Khóa học đã được tạo thành công!", type: "success" });
      setTimeout(() => router.push("/dashboard/courses"), 1000);

    } catch (error) {
      setNotification({ message: error.message, type: "error" });
      setTimeout(() => setNotification({ message: "", type: "" }), 5000);
    } finally {
      setIsSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-4 md:p-8 relative transition-colors">
      <ToastNotification message={notification.message} type={notification.type} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <button 
              onClick={() => router.push("/dashboard/courses")}
              className="flex items-center gap-2 text-slate-400 hover:text-black transition-colors mb-2 font-bold text-[10px] uppercase tracking-widest"
            >
              <ArrowLeft size={14} /> Danh sách khóa học
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tạo khóa học mới</h1>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
             <Button variant="outline" onClick={() => router.push("/dashboard/courses")} className="flex-1 md:flex-none rounded-xl h-11 px-6 font-bold text-[11px] uppercase tracking-wider">Hủy bỏ</Button>
             <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || uploading}
                className="flex-1 md:flex-none rounded-xl bg-[#047857] hover:bg-[#065f46] text-white h-11 px-8 font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-emerald-900/10"
             >
                {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                {uploading ? "Đang xử lý ảnh..." : "Lưu khóa học"}
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI: THÔNG TIN CHÍNH */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200 space-y-8">
              
              {/* TRẠNG THÁI GỌN GÀNG Ở ĐẦU TRANG */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-50">
                <div className="flex items-center gap-3 text-[#047857]">
                  <BookOpen size={20} />
                  <h2 className="font-black uppercase tracking-widest text-xs">Thông tin chương trình</h2>
                </div>
                
                {/* Radio Trạng thái nằm ngang */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {[
                    { val: "upcoming", label: "Sắp mở" },
                    { val: "opening", label: "Đang mở" },
                    { val: "closed", label: "Đã đóng" }
                  ].map((item) => (
                    <label key={item.val} className="relative flex-1 sm:flex-none">
                      <input type="radio" name="status" value={item.val} checked={formData.status === item.val} onChange={handleChange} className="peer hidden" />
                      <div className="px-4 py-2 rounded-lg cursor-pointer text-[10px] font-black uppercase tracking-wider text-slate-400 transition-all peer-checked:bg-white peer-checked:text-[#047857] peer-checked:shadow-sm text-center whitespace-nowrap">
                        {item.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Tiêu đề khóa học *</label>
                <input
                  name="title"
                  placeholder="VD: Thiết kế Vi mạch số cơ bản"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-[#047857] transition-all outline-none text-slate-900 font-bold text-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Đường dẫn (Slug)</label>
                  <div className="flex gap-2">
                    <input
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-[#047857] outline-none font-mono text-sm text-slate-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-2">
                    <Tags size={14} /> Kỹ năng đạt được
                  </label>
                  <input
                    name="skills"
                    placeholder="Verilog, RTL, SoC..."
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-[#047857] outline-none font-semibold text-sm text-slate-700"
                  />
                </div>
              </div>

              {/* MÔ TẢ NGẮN (THÊM MỚI) */}
              <div className="space-y-2 pt-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-2">
                  <AlignLeft size={14} /> Mô tả ngắn (Tóm tắt hiển thị ở danh sách)
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Nhập đoạn mô tả ngắn gọn về khóa học..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-[#047857] transition-all outline-none text-slate-900 font-medium resize-none shadow-sm"
                />
              </div>

              {/* RICH TEXT EDITOR CHO NỘI DUNG CHI TIẾT */}
              <div className="space-y-4 pt-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-2">
                  <FileText size={14} /> Nội dung chi tiết & Lộ trình học
                </label>
                <RichTextEditor ref={editorRef} initialContent={formData.content} />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: SIDEBAR */}
          <div className="space-y-6">
            {/* THUMBNAIL */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Upload size={14} /> Ảnh đại diện khóa học
              </label>
              
              {thumbnailPreview ? (
                <div className="relative group rounded-2xl overflow-hidden aspect-video border border-slate-100">
                  <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="destructive" size="sm" onClick={removeThumbnail} className="h-8 rounded-lg">
                      <X size={14} className="mr-1" /> Xóa ảnh
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-video rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200 cursor-pointer transition-all text-center p-4">
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} ref={fileInputRef} />
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                    <Upload size={20} className="text-slate-400" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tải ảnh lên</span>
                  <span className="text-[9px] text-slate-400 mt-1">Khuyên dùng: 1280x720 (Max 5MB)</span>
                </label>
              )}
            </div>

            {/* QUẢN TRỊ */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 space-y-8">
               <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <User size={14} /> Giảng viên phụ trách
                </label>
                <input
                  name="instructor"
                  placeholder="VD: TS. Nguyễn Văn A"
                  value={formData.instructor}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-[#047857] outline-none font-bold text-sm"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Calendar size={14} /> Ngày khai giảng
                </label>
                <input
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-[#047857] outline-none font-bold text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}