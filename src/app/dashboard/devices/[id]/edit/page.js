"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  ArrowLeft, Save, X, Edit2, Upload, 
  Settings, Hash, User, ShieldCheck, Tag, Loader2, Info, FileText, Monitor
} from "lucide-react";

// Import RichTextEditor wrapper (Xử lý nội dung chi tiết)
import RichTextEditor from "@/components/rich-text-editor";

export default function DeviceUpdatePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const editorRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    lastMaintenance: ""
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/devices/${id}`);
        if (!res.ok) throw new Error("Không thể tải thông tin thiết bị");
        const data = await res.json();
        
        setFormData({
          deviceName: data.deviceName || "",
          model: data.model || "",
          brand: data.brand || "",
          serialNumber: data.serialNumber || "",
          status: data.status || "available",
          assignedTo: data.assignedTo || "",
          description: data.description || "",
          content: data.content || "",
          thumbnail: data.thumbnail || "",
          lastMaintenance: data.lastMaintenance ? data.lastMaintenance.split('T')[0] : ""
        });
        setThumbnailPreview(data.thumbnail || "");
      } catch (err) {
        toast.error("Lỗi:", { description: err.message });
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDevice();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    setThumbnailFile(null);
    setThumbnailPreview(formData.thumbnail);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpdate = async () => {
    if (!formData.deviceName.trim()) {
      toast.error("Vui lòng nhập tên thiết bị");
      return;
    }

    try {
      setSaving(true);
      setUploading(true);
      const cleanContent = await editorRef.current.getCleanContent();
      setUploading(false);

      let currentThumbnailUrl = formData.thumbnail;
      if (thumbnailFile) {
        setUploading(true);
        const fileData = new FormData();
        fileData.append("file", thumbnailFile);
        const uploadRes = await fetch("/api/files", { method: "POST", body: fileData });
        if (uploadRes.ok) {
          const uploadResult = await uploadRes.json();
          currentThumbnailUrl = `/api/files/${uploadResult.fileId}`;
        }
        setUploading(false);
      }

      const res = await fetch(`/api/devices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          content: cleanContent,
          thumbnail: currentThumbnailUrl 
        }),
      });

      if (!res.ok) throw new Error("Lỗi cập nhật server");

      toast.success("Cập nhật thiết bị thành công!");
      router.push("/dashboard/devices");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6 md:p-10 text-black">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/devices")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Badge variant="secondary" className="font-mono text-[10px]">ID: {id}</Badge>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard/devices")} className="rounded-xl h-10 px-6 font-bold text-[11px] uppercase tracking-widest">Hủy</Button>
            <Button onClick={handleUpdate} disabled={saving || uploading} className="bg-black hover:bg-gray-800 text-white rounded-xl h-10 px-8 font-bold text-[11px] uppercase shadow-lg">
              {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
              {uploading ? "Đang xử lý..." : "Lưu thay đổi"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100 space-y-8">
              
              {/* TRẠNG THÁI (ĐÃ BỎ TIÊU ĐỀ CHỮ) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-50">
                <div className="flex items-center gap-3 text-blue-600">
                  <Monitor size={20} />
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

              {/* Tên & Brand */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tên thiết bị *</Label>
                  <Input name="deviceName" value={formData.deviceName} onChange={handleChange} className="h-12 rounded-xl bg-gray-50 border-none font-semibold shadow-none" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Thương hiệu (Brand)</Label>
                  <Input name="brand" value={formData.brand} onChange={handleChange} className="h-12 rounded-xl bg-gray-50 border-none font-semibold shadow-none" />
                </div>
              </div>

              {/* Model & Serial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Model</Label>
                  <Input name="model" value={formData.model} onChange={handleChange} className="h-12 rounded-xl bg-gray-50 border-none font-semibold shadow-none" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Serial Number</Label>
                  <Input name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="h-12 rounded-xl bg-gray-50 border-none font-mono font-bold shadow-none" />
                </div>
              </div>

              {/* MÔ TẢ NGẮN */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <FileText size={14} /> Mô tả ngắn (Hiển thị ở trang danh sách)
                </Label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-none text-sm"
                  placeholder="Nhập đoạn giới thiệu ngắn về thiết bị..."
                />
              </div>

              {/* NỘI DUNG CHI TIẾT */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Edit2 size={14} /> Nội dung & Thông số kỹ thuật chi tiết
                </Label>
                <RichTextEditor 
                  ref={editorRef} 
                  initialContent={formData.content} 
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* THUMBNAIL */}
            <Card className="shadow-sm border-none rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-50 py-4">
                <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"><Upload size={14} /> Ảnh thiết bị</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {thumbnailPreview ? (
                  <div className="relative group aspect-video rounded-xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       <label className="cursor-pointer bg-white text-black text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all">
                          Thay đổi
                          <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailChange} />
                       </label>
                       <Button variant="destructive" size="sm" onClick={removeThumbnail} className="h-8"><X size={14} /></Button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all">
                    <Upload className="w-8 h-8 text-gray-300 mb-2" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tải ảnh</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailChange} />
                  </label>
                )}
              </CardContent>
            </Card>

            {/* QUẢN TRỊ */}
            <Card className="shadow-sm border-none rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-50 py-4"><CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">Quản lý</CardTitle></CardHeader>
              <CardContent className="p-5 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Người phụ trách</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input name="assignedTo" value={formData.assignedTo} onChange={handleChange} className="pl-11 rounded-xl bg-gray-50 border-none font-semibold shadow-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ngày kiểm định</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input name="lastMaintenance" type="date" value={formData.lastMaintenance} onChange={handleChange} className="pl-11 rounded-xl bg-gray-50 border-none font-semibold shadow-none" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="font-bold text-xs uppercase tracking-[0.2em] text-gray-400">Đang tải...</p>
      </div>
    </div>
  );
}