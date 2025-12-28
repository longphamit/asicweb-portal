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
  CheckCircle2
} from "lucide-react";

/**
 * THÔNG BÁO TÙY CHỈNH: Component hiển thị thông báo.
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
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userEditedSlug = useRef(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    instructor: "",
    startDate: "",
    status: "Sắp khai giảng",
    skills: ""
  });

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

  // Tự động sinh slug khi tiêu đề thay đổi
  useEffect(() => {
    if (!userEditedSlug.current) {
      setFormData(prev => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [formData.title]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === "slug") userEditedSlug.current = true;
    if (name === "title" && value === "") userEditedSlug.current = false;
  };

  const regenerateSlug = () => {
    setFormData(prev => ({ ...prev, slug: slugify(prev.title) }));
    userEditedSlug.current = false;
    setNotification({ message: "Đã tạo lại đường dẫn từ tiêu đề", type: "success" });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Gọi API POST tạo khóa học
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Không thể tạo khóa học");
      }

      // 1. Hiển thị thông báo thành công
      setNotification({ message: "Khóa học đã được tạo thành công! Đang chuyển hướng...", type: "success" });
      
      // 2. Chuyển hướng sau khi người dùng kịp đọc thông báo
      setTimeout(() => {
        // Sử dụng router.push cho dự án thật
        router.push("/dashboard/courses");
        if (router.refresh) router.refresh();
        
        // Dự phòng cho môi trường Preview của Canvas
        if (typeof window !== "undefined") {
          window.location.href = "/dashboard/courses";
        }
      }, 1000);

    } catch (error) {
      setNotification({ message: error.message || "Đã xảy ra lỗi khi lưu", type: "error" });
      setTimeout(() => setNotification({ message: "", type: "" }), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans transition-colors relative">
      
      {/* Hệ thống thông báo */}
      <ToastNotification message={notification.message} type={notification.type} />

      <div className="max-w-3xl mx-auto">
        
        {/* Điều hướng & Tiêu đề */}
        <button 
          onClick={() => {
            router.push("/dashboard/courses");
            window.location.href = "/dashboard/courses";
          }}
          className="flex items-center gap-2 text-slate-500 hover:text-[#047857] transition-colors mb-6 font-bold text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Tạo khóa học mới
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Thêm một chương trình đào tạo mới vào hệ thống của bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 space-y-8">
            
            {/* Phần 1: Thông tin cơ bản */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-[#047857] mb-2">
                <BookOpen size={20} />
                <h2 className="font-black uppercase tracking-widest text-xs">Thông tin chung</h2>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Tiêu đề khóa học</label>
                <input
                  name="title"
                  placeholder="VD: Thiết kế Vi mạch số cơ bản"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#047857] transition-all outline-none text-slate-900 dark:text-white font-medium shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Đường dẫn (Slug)</label>
                <div className="flex gap-2">
                  <input
                    name="slug"
                    placeholder="ten-khoa-hoc-url"
                    value={formData.slug}
                    onChange={handleChange}
                    className="flex-grow px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#047857] transition-all outline-none text-slate-500 dark:text-slate-400 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={regenerateSlug}
                    className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-[#047857] transition-all"
                    title="Tạo lại đường dẫn"
                  >
                    <RefreshCcw size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Kỹ năng đạt được</label>
                <input
                  name="skills"
                  placeholder="Verilog, RTL, SoC, Synthesis..."
                  value={formData.skills}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#047857] transition-all outline-none text-slate-900 dark:text-white font-medium shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Mô tả chi tiết</label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Nhập nội dung tổng quan về khóa học..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#047857] transition-all outline-none text-slate-900 dark:text-white font-medium resize-none shadow-sm"
                />
              </div>
            </div>

            {/* Phần 2: Nhân sự & Lịch trình */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50 dark:border-slate-800">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-[#047857]">
                  <User size={18} />
                  <h2 className="font-black uppercase tracking-widest text-xs">Giảng viên</h2>
                </div>
                <input
                  name="instructor"
                  placeholder="Họ tên giảng viên"
                  value={formData.instructor}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#047857] transition-all outline-none text-slate-900 dark:text-white font-medium shadow-sm"
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-[#047857]">
                  <Calendar size={18} />
                  <h2 className="font-black uppercase tracking-widest text-xs">Ngày khai giảng</h2>
                </div>
                <input
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#047857] transition-all outline-none text-slate-900 dark:text-white font-medium shadow-sm"
                />
              </div>
            </div>

            {/* Phần 3: Trạng thái */}
            <div className="pt-4 space-y-4">
              <div className="flex items-center gap-3 text-[#047857]">
                <span className="text-lg">⚡</span>
                <h2 className="font-black uppercase tracking-widest text-xs">Trạng thái khóa học</h2>
              </div>
              
              <div className="flex flex-wrap gap-6 pl-1">
                {[
                  { id: "upcoming", value: "upcoming", label: "Sắp khai giảng" },
                  { id: "ongoing", value: "opening", label: "Đang mở" },
                  { id: "finished", value: "closed", label: "Đã kết thúc" },
                ].map((option) => (
                  <label 
                    key={option.id} 
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={formData.status === option.value}
                        onChange={handleChange}
                        className="peer appearance-none w-6 h-6 border-2 border-slate-200 dark:border-slate-700 rounded-full checked:border-[#047857] transition-all cursor-pointer"
                      />
                      <div className="absolute w-3 h-3 bg-[#047857] rounded-full scale-0 peer-checked:scale-100 transition-transform duration-200"></div>
                    </div>
                    <span className={`text-sm font-bold transition-colors ${
                      formData.status === option.value 
                        ? 'text-[#047857]' 
                        : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700'
                    }`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Các nút hành động */}
            <div className="pt-10 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-grow flex items-center justify-center gap-2 bg-[#047857] hover:bg-[#035d43] text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl transition-all shadow-lg shadow-emerald-700/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Lưu khóa học
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push("/dashboard/courses");
                  window.location.href = "/dashboard/courses";
                }}
                className="px-10 py-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}