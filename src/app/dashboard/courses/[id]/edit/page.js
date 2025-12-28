"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  RefreshCcw, ArrowLeft, Save, Loader2, BookOpen,
  Calendar, User, CheckCircle2, Upload, X, FileText, Tags, AlignLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import RichTextEditor from "@/components/rich-text-editor";

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

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const userEditedSlug = useRef(true);

  const [notification, setNotification] = useState({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
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

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  useEffect(() => {
    if (courseId) fetchCourseDetail();
  }, [courseId]);

  const fetchCourseDetail = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) throw new Error("Không thể tải thông tin khóa học");
      const data = await res.json();
      const formattedDate = data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : "";
      
      setFormData({
        title: data.title || "",
        slug: data.slug || "",
        description: data.description || "", // Tải mô tả ngắn
        content: data.content || "",         // Tải nội dung chi tiết (trước đây là description của bạn)
        instructor: data.instructor || "",
        startDate: formattedDate,
        status: data.status || "upcoming",
        skills: data.skills || "",
        thumbnail: data.thumbnail || ""
      });
      setThumbnailPreview(data.thumbnail || "");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsFetching(false);
    }
  };

  const slugify = (text) =>
    text.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "slug") userEditedSlug.current = true;
  };

  const regenerateSlug = () => {
    setFormData(prev => ({ ...prev, slug: slugify(prev.title) }));
    userEditedSlug.current = false;
    toast.success("Đã tạo lại đường dẫn");
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeThumbnail = () => {
    setThumbnailPreview(formData.thumbnail);
    setThumbnailFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      setUploading(true);
      // Lấy nội dung đã làm sạch từ Rich Text Editor (để xử lý ảnh base64 sang URL)
      const cleanContent = await editorRef.current.getCleanContent();

      let currentThumbnailUrl = formData.thumbnail;
      if (thumbnailFile) {
        const fileData = new FormData();
        fileData.append("file", thumbnailFile);
        const uploadRes = await fetch("/api/files", { method: "POST", body: fileData });
        if (uploadRes.ok) {
          const uploadResult = await uploadRes.json();
          currentThumbnailUrl = `/api/files/${uploadResult.fileId}`;
        }
      }
      setUploading(false);

      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            ...formData, 
            content: cleanContent, // Gửi nội dung chi tiết
            thumbnail: currentThumbnailUrl 
        }),
      });

      if (!res.ok) throw new Error("Không thể cập nhật khóa học");
      setNotification({ message: "Cập nhật thành công!", type: "success" });
      setTimeout(() => router.push("/dashboard/courses"), 1000);
    } catch (error) {
      setNotification({ message: error.message, type: "error" });
    } finally {
      setIsSubmitting(false);
      setUploading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FB]">
        <Loader2 size={40} className="animate-spin text-[#047857] mb-4" />
        <p className="font-bold text-slate-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-4 md:p-8 relative">
      <ToastNotification message={notification.message} type={notification.type} />

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <button onClick={() => router.push("/dashboard/courses")} className="flex items-center gap-2 text-slate-400 hover:text-black transition-colors mb-2 font-bold text-[10px] uppercase tracking-widest">
              <ArrowLeft size={14} /> Danh sách khóa học
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Chỉnh sửa khóa học</h1>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <Button variant="outline" onClick={() => router.push("/dashboard/courses")} className="rounded-xl h-11 px-6 font-bold text-[11px] uppercase">Hủy</Button>
             <Button onClick={handleSubmit} disabled={isSubmitting || uploading} className="rounded-xl bg-[#047857] hover:bg-[#065f46] text-white h-11 px-8 font-bold text-[11px] uppercase shadow-lg">
                {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                {uploading ? "Đang xử lý..." : "Lưu thay đổi"}
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200 space-y-8">
              {/* TRẠNG THÁI */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-50">
                <div className="flex items-center gap-3 text-[#047857]">
                  <BookOpen size={20} />
                  <h2 className="font-black uppercase tracking-widest text-xs">Thông tin chương trình</h2>
                </div>
                
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
                <input name="title" value={formData.title} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-[#047857] outline-none text-slate-900 font-bold text-lg" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Slug</label>
                  <div className="flex gap-2">
                    <input name="slug" value={formData.slug} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none font-mono text-sm text-slate-500" />
                    <button type="button" onClick={regenerateSlug} className="p-4 rounded-2xl bg-slate-100 text-slate-500 hover:text-[#047857] transition-all"><RefreshCcw size={20} /></button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-2"><Tags size={14} /> Kỹ năng</label>
                  <input name="skills" value={formData.skills} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none font-semibold text-sm text-slate-700" />
                </div>
              </div>

              {/* MÔ TẢ NGẮN (THÊM MỚI) */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-2">
                  <AlignLeft size={14} /> Mô tả ngắn (Tóm tắt hiển thị ở danh sách)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-[#047857] outline-none font-medium resize-none shadow-sm text-sm"
                  placeholder="Nhập đoạn mô tả ngắn gọn về khóa học..."
                />
              </div>

              {/* NỘI DUNG CHI TIẾT (Rich Text) */}
              <div className="space-y-4 pt-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-2"><FileText size={14} /> Lộ trình học chi tiết</label>
                <RichTextEditor ref={editorRef} initialContent={formData.content} />
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 px-2"><Upload size={14} /> Ảnh đại diện</label>
              {thumbnailPreview ? (
                <div className="relative group rounded-2xl overflow-hidden aspect-video border border-slate-100">
                  <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="cursor-pointer">
                      <Button variant="secondary" size="sm" asChild><span>Thay đổi</span></Button>
                      <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                    </label>
                    <Button variant="destructive" size="sm" onClick={removeThumbnail} className="h-8 rounded-lg"><X size={14} /></Button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-video rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all text-center p-4">
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                  <Upload size={24} className="text-slate-400 mb-2" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tải ảnh</span>
                </label>
              )}
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><User size={14} /> Giảng viên</label>
                <input name="instructor" value={formData.instructor} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-slate-50 border-none outline-none font-bold text-sm" />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><Calendar size={14} /> Khai giảng</label>
                <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-slate-50 border-none outline-none font-bold text-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}