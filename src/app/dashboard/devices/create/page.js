"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Save, Loader2, Hash, User, 
  Settings, ShieldCheck, Tag, Upload, X, Info, FileText 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import RichTextEditor from "@/components/rich-text-editor"; // Import component vừa tạo

export default function NewDevicePage() {
  const router = useRouter();
  const editorRef = useRef(null); // Ref để lấy content từ Editor
  const fileInputRef = useRef(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    deviceName: "",
    model: "",
    serialNumber: "",
    status: "available",
    assignedTo: "",
    description: "",
    thumbnail: "",
    lastMaintenance: new Date().toISOString().split('T')[0]
  });

  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh đại diện quá lớn (Max 5MB)");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(reader.result);
    reader.readAsDataURL(file);
    setFormData(prev => ({ ...prev, thumbnailFile: file }));
  };

  const removeThumbnail = () => {
    setThumbnailPreview("");
    setFormData(prev => ({ ...prev, thumbnailFile: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.deviceName.trim()) {
      toast.error("Vui lòng nhập tên thiết bị");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Lấy content đã được xử lý ảnh Base64 từ RichTextEditor
      const cleanDescription = await editorRef.current.getCleanContent();

      // 2. Upload Thumbnail (nếu có)
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

      // 3. Gửi lên API lưu Device
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          description: cleanDescription,
          thumbnail: currentThumbnailUrl 
        }),
      });

      if (!res.ok) throw new Error("Không thể lưu thiết bị");

      toast.success("Đã thêm thiết bị thành công!");
      router.push("/dashboard/devices");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6 md:p-10 text-black">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <button onClick={() => router.push("/dashboard/devices")} className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors mb-2 font-bold text-[10px] uppercase tracking-widest">
              <ArrowLeft size={14} /> Quay lại danh sách
            </button>
            <h1 className="text-3xl font-bold tracking-tight">Thêm thiết bị mới</h1>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
             <Button variant="outline" onClick={() => router.push("/dashboard/devices")} className="flex-1 md:flex-none rounded-xl h-11 px-6 font-bold text-[11px] uppercase tracking-wider">Hủy bỏ</Button>
             <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 md:flex-none rounded-xl bg-black hover:bg-gray-800 text-white h-11 px-8 font-bold text-[11px] uppercase tracking-wider shadow-lg">
                {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                {isSubmitting ? "Đang xử lý dữ liệu..." : "Lưu thiết bị"}
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-50">
                <Info size={18} className="text-blue-500" />
                <h2 className="font-bold text-sm uppercase tracking-wider">Cấu hình chi tiết</h2>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Tên thiết bị *</label>
                <input name="deviceName" value={formData.deviceName} onChange={handleChange} placeholder="Nhập tên thiết bị..." className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-semibold transition-all" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Model</label>
                  <div className="relative">
                    <Settings className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                    <input name="model" value={formData.model} onChange={handleChange} className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-semibold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Serial Number</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                    <input name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold" />
                  </div>
                </div>
              </div>

              {/* SỬ DỤNG RICH TEXT EDITOR MỚI */}
              <div className="space-y-2 pt-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <FileText size={12} /> Thông số kỹ thuật chi tiết
                </label>
                <RichTextEditor ref={editorRef} initialContent={formData.description} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Ảnh thiết bị</label>
              {thumbnailPreview ? (
                <div className="relative group rounded-xl overflow-hidden aspect-video border border-gray-100">
                  <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="destructive" size="sm" onClick={removeThumbnail} className="h-8 rounded-lg"><X size={14} /></Button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all">
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} ref={fileInputRef} />
                  <Upload size={24} className="text-gray-300 mb-2" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tải ảnh lên</span>
                </label>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
               <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Người phụ trách</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                  <input name="assignedTo" value={formData.assignedTo} onChange={handleChange} className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Ngày kiểm định</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                  <input name="lastMaintenance" type="date" value={formData.lastMaintenance} onChange={handleChange} className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-sm" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Trạng thái</label>
                <div className="flex flex-col gap-2">
                  {["available", "in-use", "broken"].map((val) => (
                    <label key={val} className="cursor-pointer">
                      <input type="radio" name="status" value={val} checked={formData.status === val} onChange={handleChange} className="peer hidden" />
                      <div className="px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 text-gray-400 font-bold text-[10px] uppercase tracking-widest transition-all peer-checked:border-black peer-checked:text-black peer-checked:bg-white text-center">
                        {val === "available" ? "Sẵn sàng" : val === "in-use" ? "Đang dùng" : "Hỏng / Lỗi"}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}