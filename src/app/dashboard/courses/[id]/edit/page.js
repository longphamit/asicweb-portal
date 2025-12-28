"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  RefreshCcw, 
  ArrowLeft, 
  Save, 
  Loader2,
  BookOpen,
  Calendar,
  User,
  CheckCircle2
} from "lucide-react";

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
  const params = useParams(); // Lấy ID từ URL
  const courseId = params.id;

  const [notification, setNotification] = useState({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const userEditedSlug = useRef(true); // Mặc định là true để không tự ghi đè slug cũ khi vừa load dữ liệu

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    instructor: "",
    startDate: "",
    status: "upcoming",
    skills: ""
  });

  // --- 1. Fetch dữ liệu khóa học hiện tại ---
  useEffect(() => {
    if (courseId) {
      fetchCourseDetail();
    }
  }, [courseId]);

  const fetchCourseDetail = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) throw new Error("Không thể tải thông tin khóa học");
      const data = await res.json();
      
      // Xử lý định dạng ngày YYYY-MM-DD để input type="date" hiểu được
      const formattedDate = data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : "";
      
      setFormData({
        title: data.title || "",
        slug: data.slug || "",
        description: data.description || "",
        instructor: data.instructor || "",
        startDate: formattedDate,
        status: data.status || "upcoming",
        skills: data.skills || ""
      });
    } catch (error) {
      setNotification({ message: error.message, type: "error" });
    } finally {
      setIsFetching(false);
    }
  };

  // --- 2. Helpers: Slugify ---
  const slugify = (text) =>
    text.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

  // Tự động sinh slug nếu người dùng xóa trắng hoặc muốn theo tiêu đề mới
  useEffect(() => {
    if (!userEditedSlug.current && formData.title) {
      setFormData(prev => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [formData.title]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "slug") userEditedSlug.current = true;
  };

  const regenerateSlug = () => {
    setFormData(prev => ({ ...prev, slug: slugify(prev.title) }));
    userEditedSlug.current = false;
    setNotification({ message: "Đã tạo lại đường dẫn", type: "success" });
    setTimeout(() => setNotification({ message: "", type: "" }), 2000);
  };

  // --- 3. Submit Cập nhật ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT", // Hoặc PATCH tùy API của bạn
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Không thể cập nhật khóa học");
      }

      setNotification({ message: "Cập nhật thành công! Đang chuyển hướng...", type: "success" });
      
      setTimeout(() => {
        router.push("/dashboard/courses");
      }, 1000);

    } catch (error) {
      setNotification({ message: error.message, type: "error" });
      setTimeout(() => setNotification({ message: "", type: "" }), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 size={40} className="animate-spin text-[#047857] mb-4" />
        <p className="font-bold text-slate-500 animate-pulse">Đang tải dữ liệu khóa học...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors relative">
      <ToastNotification message={notification.message} type={notification.type} />

      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => router.push("/dashboard/courses")}
          className="flex items-center gap-2 text-slate-500 hover:text-[#047857] transition-colors mb-6 font-bold text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Chỉnh sửa khóa học</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Cập nhật thông tin chi tiết của chương trình đào tạo.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 space-y-8">
            
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-[#047857] mb-2">
                <BookOpen size={20} />
                <h2 className="font-black uppercase tracking-widest text-xs">Thông tin chung</h2>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Tiêu đề khóa học</label>
                <input name="title" value={formData.title} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#047857] outline-none text-slate-900 dark:text-white font-medium" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Đường dẫn (Slug)</label>
                <div className="flex gap-2">
                  <input name="slug" value={formData.slug} onChange={handleChange} className="flex-grow px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#047857] outline-none text-slate-500 font-mono text-sm" />
                  <button type="button" onClick={regenerateSlug} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-[#047857]"><RefreshCcw size={20} /></button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Kỹ năng đạt được</label>
                <input name="skills" value={formData.skills} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#047857] outline-none text-slate-900 dark:text-white font-medium" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Mô tả chi tiết</label>
                <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#047857] outline-none text-slate-900 dark:text-white font-medium resize-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50 dark:border-slate-800">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-[#047857]"><User size={18} /><h2 className="font-black uppercase tracking-widest text-xs">Giảng viên</h2></div>
                <input name="instructor" value={formData.instructor} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#047857] outline-none text-slate-900 dark:text-white font-medium" />
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-[#047857]"><Calendar size={18} /><h2 className="font-black uppercase tracking-widest text-xs">Ngày khai giảng</h2></div>
                <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#047857] outline-none text-slate-900 dark:text-white font-medium" />
              </div>
            </div>

            {/* Trạng thái sử dụng key: upcoming, opening, closed */}
            <div className="pt-4 space-y-4">
              <div className="flex items-center gap-3 text-[#047857]"><span className="text-lg">⚡</span><h2 className="font-black uppercase tracking-widest text-xs">Trạng thái khóa học</h2></div>
              <div className="flex flex-wrap gap-6 pl-1">
                {[
                  { id: "up", value: "upcoming", label: "Sắp khai giảng" },
                  { id: "op", value: "opening", label: "Đang mở" },
                  { id: "cl", value: "closed", label: "Đã kết thúc" },
                ].map((option) => (
                  <label key={option.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input type="radio" name="status" value={option.value} checked={formData.status === option.value} onChange={handleChange} className="peer appearance-none w-6 h-6 border-2 border-slate-200 dark:border-slate-700 rounded-full checked:border-[#047857] cursor-pointer" />
                      <div className="absolute w-3 h-3 bg-[#047857] rounded-full scale-0 peer-checked:scale-100 transition-transform duration-200"></div>
                    </div>
                    <span className={`text-sm font-bold ${formData.status === option.value ? 'text-[#047857]' : 'text-slate-500'}`}>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-10 flex flex-col sm:flex-row gap-4">
              <button type="submit" disabled={isSubmitting} className="flex-grow flex items-center justify-center gap-2 bg-[#047857] hover:bg-[#035d43] text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-lg disabled:opacity-70">
                {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Đang cập nhật...</> : <><Save size={18} /> Cập nhật khóa học</>}
              </button>
              <button type="button" onClick={() => router.push("/dashboard/courses")} className="px-10 py-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Hủy bỏ</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}