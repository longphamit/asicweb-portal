"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  LayoutGrid, Plus, Search, Edit2, ArrowRight, ArrowLeft,
  CheckCircle2, X, Upload, Save, Loader2, Star, Camera,
  Layers, Type, FileText, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function LabActivities() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);

  const [galleryItems, setGalleryItems] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    category: "research",
    description: "",
    image: "",
    isPinned: false
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/activities");
      if (!res.ok) throw new Error("Lỗi tải dữ liệu");
      const data = await res.json();
      setGalleryItems(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return toast.error("Ảnh tối đa 10MB");

    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(reader.result);
    reader.readAsDataURL(file);
    setFormData(prev => ({ ...prev, imageFile: file }));
  };

  const removeImage = (e) => {
    if (e) e.stopPropagation();
    setThumbnailPreview("");
    setFormData(prev => ({ ...prev, imageFile: null, image: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Vui lòng nhập tiêu đề");
    if (!thumbnailPreview) return toast.error("Vui lòng tải ảnh lên");

    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.image;
      if (formData.imageFile) {
        const fileData = new FormData();
        fileData.append("file", formData.imageFile);
        const uploadRes = await fetch("/api/files", { method: "POST", body: fileData });
        if (uploadRes.ok) {
          const uploadResult = await uploadRes.json();
          finalImageUrl = `/api/files/${uploadResult.fileId}`;
        } else {
          throw new Error("Lỗi tải ảnh");
        }
      }

      const method = formData.id ? "PUT" : "POST";
      const url = formData.id ? `/api/activities/${formData.id}` : "/api/activities";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, image: finalImageUrl }),
      });

      if (!res.ok) throw new Error("Lỗi lưu dữ liệu");

      toast.success(formData.id ? "Đã cập nhật" : "Đã thêm mới");
      setIsEditing(false);
      fetchActivities(); 
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm("Xác nhận xóa vĩnh viễn khoảnh khắc này?")) return;
    try {
      const res = await fetch(`/api/activities/${item._id || item.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Đã xóa thành công");
        fetchActivities();
      }
    } catch (error) {
      toast.error("Lỗi khi xóa");
    }
  };

  const togglePin = async (item) => {
    try {
      const newStatus = !item.isPinned;
      const res = await fetch(`/api/activities/${item._id || item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, isPinned: newStatus }),
      });
      if (res.ok) {
        toast.success(newStatus ? "Đã đẩy lên trang chủ" : "Đã gỡ khỏi trang chủ");
        fetchActivities();
      }
    } catch (error) {
      toast.error("Lỗi thao tác");
    }
  };

  const allItemsAdmin = useMemo(() => {
    return galleryItems.filter(item => 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [galleryItems, searchTerm]);

  const pinnedItemsAdmin = useMemo(() => galleryItems.filter(item => item.isPinned), [galleryItems]);

  return (
    <div className="p-6 md:p-10 bg-[#F8F9FB] min-h-screen text-black font-sans">
      
      {/* Header */}
      <div className="max-w-[1400px] mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý hoạt động</h1>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1">
              Điều chỉnh hình ảnh & sự kiện của phòng Lab
            </p>
          </div>
          <Button 
            onClick={() => {
              setFormData({ id: null, title: "", category: "research", description: "", image: "", isPinned: false });
              setThumbnailPreview("");
              setIsEditing(true);
            }}
            className="rounded-2xl bg-black hover:bg-gray-800 text-white h-12 px-8 font-bold text-[11px] uppercase tracking-wider shadow-lg transition-all active:scale-95"
          >
            <Plus className="mr-2" size={18} /> Thêm hoạt động mới
          </Button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* CỘT TRÁI: KHO LƯU TRỮ TỔNG */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <LayoutGrid size={16} /> Kho lưu trữ tổng ({galleryItems.length})
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" placeholder="Tìm kiếm tên..." value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none w-48 transition-all font-medium" 
              />
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-gray-200" size={40}/></div>
            ) : (
              <div className="max-h-[70vh] overflow-y-auto p-4 space-y-2">
                {allItemsAdmin.map((item) => (
                  <div key={item._id || item.id} className="flex items-center gap-4 p-4 border-b border-gray-50 hover:bg-gray-50 transition-all rounded-3xl group">
                    <img src={item.image} className="w-16 h-16 rounded-2xl object-cover bg-gray-100 border border-gray-50" alt="" />
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="font-bold text-slate-900 truncate text-sm">{item.title}</h4>
                      <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => {
                        setFormData({ ...item, id: item._id || item.id });
                        setThumbnailPreview(item.image);
                        setIsEditing(true);
                      }} className="p-2 text-gray-300 hover:text-blue-600 transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(item)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      {!item.isPinned && (
                        <button onClick={() => togglePin(item)} className="ml-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1">
                          ĐẨY LÊN TRANG CHỦ <ArrowRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: HIỂN THỊ TRANG CHỦ */}
        <div className="space-y-4">
          <h3 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em] px-4 flex items-center gap-2">
            <CheckCircle2 size={16} /> Hiển thị trên trang chủ ({pinnedItemsAdmin.length})
          </h3>
          <div className="bg-blue-50/30 rounded-[2.5rem] border-2 border-dashed border-blue-100 min-h-[500px] p-4 space-y-3">
            {pinnedItemsAdmin.map((item) => (
              <div key={item._id || item.id} className="flex items-center gap-4 p-3 bg-white border border-blue-100 rounded-2xl shadow-sm animate-in slide-in-from-right-4 transition-all hover:shadow-md">
                <img src={item.image} className="w-14 h-14 rounded-xl object-cover" alt="" />
                <div className="flex-1 font-bold text-slate-900 text-sm truncate text-left">{item.title}</div>
                <button onClick={() => togglePin(item)} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-[10px] font-bold hover:bg-red-500 hover:text-white flex items-center gap-1 transition-all">
                  <ArrowLeft size={12} /> GỠ KHỎI TRANG CHỦ
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL POPUP */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col md:flex-row max-h-[95vh]">
            
            {/* Upload */}
            <div className="md:w-1/2 bg-gray-50 p-8 md:p-12 flex flex-col items-center justify-center border-r border-gray-100">
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              {thumbnailPreview ? (
                <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden shadow-xl border-4 border-white">
                  <img src={thumbnailPreview} className="w-full h-full object-cover" alt="Preview" />
                  <button type="button" onClick={removeImage} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"><X size={16}/></button>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current.click()} className="w-full aspect-square rounded-[2rem] border-4 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-blue-500 shadow-sm transition-all scale-100 group-hover:scale-110"><Upload size={32} /></div>
                  <div className="text-center font-bold text-gray-900 uppercase tracking-widest text-[11px]">Tải ảnh hoạt động</div>
                </div>
              )}
            </div>

            {/* Content */}
            <form onSubmit={handleSave} className="md:w-1/2 p-8 md:p-12 space-y-6 flex flex-col bg-white text-left">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">{formData.id ? 'Cập nhật khoảnh khắc' : 'Thêm khoảnh khắc'}</h2>
                <button type="button" onClick={() => setIsEditing(false)} className="text-gray-300 hover:text-red-500 transition-colors"><X size={24}/></button>
              </div>

              <div className="space-y-5 flex-1">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Type size={14}/> Tiêu đề</label>
                  <input required placeholder="Nhập tiêu đề..." value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold outline-none transition-all" />
                </div>
                
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Layers size={14}/> Danh mục</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none cursor-pointer appearance-none">
                    <option value="research">Nghiên cứu khoa học</option>
                    <option value="events">Sự kiện Lab</option>
                    <option value="life">Đời sống thành viên</option>
                  </select>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2"><FileText size={14}/> Mô tả chi tiết</label>
                  <textarea rows="4" placeholder="Mô tả ngắn gọn về hoạt động..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-medium outline-none resize-none transition-all" />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full py-8 bg-black hover:bg-gray-800 text-white rounded-2xl font-bold uppercase tracking-[0.1em] text-[11px] shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isSubmitting ? "Đang lưu..." : "LƯU HOẠT ĐỘNG"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}