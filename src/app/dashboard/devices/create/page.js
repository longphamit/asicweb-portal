"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Save, Loader2, Hash, User, 
  Settings, ShieldCheck, Tag, Upload, X, Info, FileText, Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import RichTextEditor from "@/components/rich-text-editor";

export default function NewDevicePage() {
  const router = useRouter();
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    deviceName: "",
    model: "",
    brand: "",
    serialNumber: "",
    status: "available",
    assignedTo: "",
    description: "",
    content: "",
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
      setUploading(true);
      const cleanContent = await editorRef.current.getCleanContent();

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

      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          content: cleanContent, 
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
      setUploading(false);
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
            <h1 className="text-3xl font-black tracking-tight">Thêm thiết bị mới</h1>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
             <Button variant="outline" onClick={() => router.push("/dashboard/devices")} className="flex-1 md:flex-none rounded-xl h-11 px-6 font-bold text-[11px] uppercase tracking-wider">Hủy bỏ</Button>
             <Button onClick={handleSubmit} disabled={isSubmitting || uploading} className="flex-1 md:flex-none rounded-xl bg-black hover:bg-gray-800 text-white h-11 px-8 font-bold text-[11px] uppercase tracking-wider shadow-lg">
                {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                {uploading ? "Đang xử lý..." : "Lưu thiết bị"}
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100 space-y-8">
              
              {/* PHẦN TRẠNG THÁI (ĐÃ BỎ TIÊU ĐỀ) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-50">
                <div className="flex items-center gap-3 text-blue-600">
                  <Monitor size={20} />
                  {/* Chỗ này đã bỏ chữ Phân loại & Trạng thái */}
                </div>
                
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  {[
                    { val: "available", label: "Sẵn sàng" },
                    { val: "in-use", label: "Đang dùng" },
                    { val: "broken", label: "Hỏng / Lỗi" }
                  ].map((item) => (
                    <label key={item.val} className="relative flex-1 sm:flex-none">
                      <input type="radio" name="status" value={item.val} checked={formData.status === item.val} onChange={handleChange} className="peer hidden" />
                      <div className="px-4 py-2 rounded-lg cursor-pointer text-[10px] font-black uppercase tracking-wider text-slate-400 transition-all peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-sm text-center whitespace-nowrap">
                        {item.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Tên thiết bị *</label>
                <input name="deviceName" value={formData.deviceName} onChange={handleChange} placeholder="VD: Oscilloscope kỹ thuật số" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 transition-all outline-none text-black font-bold text-lg" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Thương hiệu</label>
                  <input name="brand" value={formData.brand} onChange={handleChange} placeholder="Keysight, Tektronix..." className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Model</label>
                  <input name="model" value={formData.model} onChange={handleChange} placeholder="VD: InfiniiVision" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Serial Number</label>
                  <input name="serialNumber" value={formData.serialNumber} onChange={handleChange} placeholder="S/N..." className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" />
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1 flex items-center gap-2">
                  <FileText size={14} /> Mô tả tóm tắt (Hiển thị ở trang danh sách)
                </label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows={3} 
                  placeholder="Nhập mô tả ngắn gọn..."
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-none shadow-sm"
                />
              </div>

              <div className="space-y-4 pt-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1 flex items-center gap-2">
                  <Info size={14} /> Thông số kỹ thuật chi tiết
                </label>
                <RichTextEditor ref={editorRef} initialContent={formData.content} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* THUMBNAIL */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Upload size={14} /> Ảnh thiết bị
              </label>
              
              {thumbnailPreview ? (
                <div className="relative group rounded-2xl overflow-hidden aspect-video border border-gray-50">
                  <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="destructive" size="sm" onClick={removeThumbnail} className="h-8 rounded-lg">
                      <X size={14} className="mr-1" /> Xóa ảnh
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-video rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all text-center p-4">
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} ref={fileInputRef} />
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                    <Upload size={20} className="text-gray-300" />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tải ảnh lên</span>
                </label>
              )}
            </div>

            {/* QUẢN TRỊ */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-8">
               <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <User size={14} /> Người phụ trách
                </label>
                <input
                  name="assignedTo"
                  placeholder="Tên nhân viên..."
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <ShieldCheck size={14} /> Ngày kiểm định
                </label>
                <input
                  name="lastMaintenance"
                  type="date"
                  value={formData.lastMaintenance}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}