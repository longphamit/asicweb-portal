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
  Settings, Hash, User, ShieldCheck, Tag, Loader2, Info, FileText 
} from "lucide-react";

// Import RichTextEditor mới (Wrapper đã chứa logic xử lý ảnh)
import RichTextEditor from "@/components/rich-text-editor";

export default function DeviceUpdatePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const editorRef = useRef(null); // Ref để điều khiển RichTextEditor

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    deviceName: "",
    model: "",
    serialNumber: "",
    status: "available",
    assignedTo: "",
    description: "",
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
          serialNumber: data.serialNumber || "",
          status: data.status || "available",
          assignedTo: data.assignedTo || "",
          description: data.description || "",
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
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh quá lớn (Max 5MB)");
      return;
    }

    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(formData.thumbnail); // Quay lại ảnh cũ nếu có
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpdate = async () => {
    if (!formData.deviceName.trim()) {
      toast.error("Vui lòng nhập tên thiết bị");
      return;
    }

    try {
      setSaving(true);

      // 1. Xử lý ảnh trong nội dung Quill (Base64 -> Server URL) qua Wrapper
      setUploading(true);
      const cleanDescription = await editorRef.current.getCleanContent();
      setUploading(false);

      // 2. Upload ảnh Thumbnail mới nếu có thay đổi
      let currentThumbnailUrl = formData.thumbnail;
      if (thumbnailFile) {
        setUploading(true);
        const fileData = new FormData();
        fileData.append("file", thumbnailFile);
        const uploadRes = await fetch("/api/files", { method: "POST", body: fileData });
        if (!uploadRes.ok) throw new Error("Lỗi khi upload ảnh");
        const uploadResult = await uploadRes.json();
        currentThumbnailUrl = `/api/files/${uploadResult.fileId}`;
        setUploading(false);
      }

      // 3. Gửi request cập nhật
      const res = await fetch(`/api/devices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          description: cleanDescription, // Gửi content đã làm sạch
          thumbnail: currentThumbnailUrl 
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success("Cập nhật thiết bị thành công!");
      router.push("/dashboard/devices");
    } catch (err) {
      toast.error("Lỗi khi cập nhật", { description: err.message });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6 md:p-10 text-black font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/devices")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Badge variant="secondary" className="font-mono text-[10px]">ID: {id}</Badge>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={() => router.push("/dashboard/devices")} className="rounded-xl h-10 px-6 font-bold text-[11px] uppercase tracking-widest">
              Hủy
            </Button>
            <Button onClick={handleUpdate} disabled={saving || uploading} className="bg-black hover:bg-gray-800 text-white rounded-xl h-10 px-8 font-bold text-[11px] uppercase tracking-widest shadow-lg transition-all active:scale-95">
              {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
              {uploading ? "Đang xử lý ảnh..." : "Lưu thay đổi"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI - THÔNG TIN CHÍNH */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border-none rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-50 py-4">
                <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <Info size={16} className="text-blue-500" /> Cấu hình thiết bị
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 ml-1">Tên thiết bị <span className="text-red-500">*</span></Label>
                  <Input
                    name="deviceName"
                    value={formData.deviceName}
                    onChange={handleChange}
                    className="h-12 rounded-xl bg-gray-50 border-none font-semibold focus-visible:ring-2 focus-visible:ring-blue-500 shadow-none"
                    placeholder="Nhập tên thiết bị..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 ml-1">Model</Label>
                    <div className="relative">
                      <Settings className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input name="model" value={formData.model} onChange={handleChange} className="pl-11 h-12 rounded-xl bg-gray-50 border-none font-semibold shadow-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 ml-1">Serial Number</Label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="pl-11 h-12 rounded-xl bg-gray-50 border-none font-mono font-bold shadow-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 ml-1 flex items-center gap-2"><FileText size={14} /> Mô tả & Thông số chi tiết</Label>
                  {/* SỬ DỤNG RICHTEXTEDITOR CÓ REF ĐỂ XỬ LÝ ẢNH */}
                  <RichTextEditor 
                    ref={editorRef} 
                    initialContent={formData.description} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CỘT PHẢI - SIDEBAR */}
          <div className="space-y-6">
            {/* THUMBNAIL */}
            <Card className="shadow-sm border-none rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-50 py-4">
                <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Upload size={14} /> Hình ảnh thiết bị
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {thumbnailPreview ? (
                  <div className="relative group aspect-video rounded-xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       <label className="cursor-pointer">
                          <Button variant="secondary" size="sm" asChild>
                             <span>Thay đổi</span>
                          </Button>
                          <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailChange} />
                       </label>
                       <Button variant="destructive" size="sm" onClick={removeThumbnail} className="h-8">
                          <X size={14} />
                       </Button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all">
                    <Upload className="w-8 h-8 text-gray-300 mb-2" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tải ảnh lên</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailChange} />
                  </label>
                )}
              </CardContent>
            </Card>

            {/* QUẢN TRỊ */}
            <Card className="shadow-sm border-none rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-50 py-4">
                <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                   Trạng thái & Quản lý
                </CardTitle>
              </CardHeader>
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

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tình trạng hiện tại</Label>
                  <div className="flex flex-col gap-2">
                    {[
                      { value: "available", label: "Sẵn sàng", class: "peer-checked:border-emerald-500 peer-checked:text-emerald-600 peer-checked:bg-emerald-50/50" },
                      { value: "in-use", label: "Đang dùng", class: "peer-checked:border-blue-500 peer-checked:text-blue-600 peer-checked:bg-blue-50/50" },
                      { value: "broken", label: "Hỏng / Lỗi", class: "peer-checked:border-red-500 peer-checked:text-red-600 peer-checked:bg-red-50/50" },
                    ].map((opt) => (
                      <label key={opt.value} className="relative cursor-pointer">
                        <input type="radio" name="status" value={opt.value} checked={formData.status === opt.value} onChange={handleChange} className="peer hidden" />
                        <div className={`px-4 py-3 rounded-xl border-2 border-transparent bg-gray-50 text-gray-400 font-bold text-[10px] uppercase tracking-[0.15em] transition-all text-center ${opt.class}`}>
                          {opt.label}
                        </div>
                      </label>
                    ))}
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
        <p className="font-bold text-xs uppercase tracking-[0.2em] text-gray-400">Đang tải dữ liệu thiết bị...</p>
      </div>
    </div>
  );
}