'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save, X, Loader2 } from "lucide-react";
import YearPicker from "@/components/year-picker";

export default function EditPublicationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id; // Lấy ID từ URL động [id]

  // State quản lý dữ liệu form dưới dạng Object
  const [formData, setFormData] = useState({
    year: "",
    title: "",
    members: "",
    type: "journal",
    venueName: "",
    abstract: "",
    doi: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Lấy dữ liệu cũ từ API khi trang vừa load
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/publications/${id}`);
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Không tìm thấy dữ liệu");
        }
        
        const data = await res.json();
        
        // Cập nhật state với dữ liệu nhận được
        setFormData({
          year: data.year || "",
          title: data.title || "",
          members: data.members || "",
          type: data.type || "journal",
          venueName: data.venueName || "",
          abstract: data.abstract || "",
          doi: data.doi || "",
        });
      } catch (err) {
        toast.error("Lỗi", { description: err.message });
        router.push("/dashboard/publications");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id, router]);

  // Hàm cập nhật giá trị input chung
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 2. Gửi yêu cầu cập nhật (PUT)
  const handleUpdate = async () => {
    // Kiểm tra các trường bắt buộc
    const { year, title, members, type, venueName, abstract } = formData;
    if (!year || !title || !members || !type || !venueName || !abstract) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/publications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error(await res.text());
      
      toast.success("Cập nhật thành công!");
      router.push("/dashboard/publications");
      router.refresh(); 
    } catch (err) {
      toast.error("Lỗi khi cập nhật", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Hiển thị trạng thái đang tải dữ liệu
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="mt-2 text-gray-500">Đang tải thông tin công bố...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-t-4 border-t-blue-600">
          <CardHeader className="flex flex-row justify-between items-center border-b pb-4">
            <CardTitle className="text-xl font-bold text-slate-800">
              Chỉnh sửa công bố khoa học
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push("/dashboard/publications")}
              className="text-gray-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay về
            </Button>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6">
              {/* Năm xuất bản */}
              <div className="grid gap-2">
                <Label htmlFor="year">Năm</Label>
                <YearPicker 
                  value={formData.year} 
                  onChange={(val) => handleChange('year', val)} 
                />
              </div>
              
              {/* Tên công bố */}
              <div className="grid gap-2">
                <Label htmlFor="title">Tên công bố</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Ví dụ: Nghiên cứu về AI trong y tế..."
                />
              </div>

              {/* Thành viên */}
              <div className="grid gap-2">
                <Label htmlFor="members">Thành viên công bố</Label>
                <Textarea
                  id="members"
                  value={formData.members}
                  onChange={(e) => handleChange('members', e.target.value)}
                  rows={2}
                  placeholder="Các tác giả, cách nhau bằng dấu phẩy"
                />
              </div>

              {/* Loại hình */}
              <div className="grid gap-2">
                <Label>Loại công bố</Label>
                <div className="flex items-center gap-6 p-2 bg-slate-100 rounded-md">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      className="w-4 h-4 accent-blue-600"
                      checked={formData.type === "journal"}
                      onChange={() => handleChange('type', "journal")}
                    />
                    Tạp chí
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      className="w-4 h-4 accent-blue-600"
                      checked={formData.type === "conference"}
                      onChange={() => handleChange('type', "conference")}
                    />
                    Hội nghị
                  </label>
                </div>
              </div>

              {/* Tên nơi đăng */}
              <div className="grid gap-2">
                <Label htmlFor="venueName">
                  {formData.type === "journal" ? "Tên tạp chí" : "Tên hội nghị"}
                </Label>
                <Input
                  id="venueName"
                  value={formData.venueName}
                  onChange={(e) => handleChange('venueName', e.target.value)}
                  placeholder="Nhập tên đơn vị xuất bản"
                />
              </div>

              {/* Abstract */}
              <div className="grid gap-2">
                <Label htmlFor="abstract">Abstract (Tóm tắt)</Label>
                <Textarea
                  id="abstract"
                  value={formData.abstract}
                  onChange={(e) => handleChange('abstract', e.target.value)}
                  rows={4}
                  placeholder="Nội dung tóm tắt của công bố"
                />
              </div>

              {/* DOI */}
              <div className="grid gap-2">
                <Label htmlFor="doi">Link DOI / URL</Label>
                <Input
                  id="doi"
                  value={formData.doi}
                  onChange={(e) => handleChange('doi', e.target.value)}
                  placeholder="https://doi.org/..."
                />
              </div>
            </div>

            {/* Nhóm nút điều khiển */}
            <div className="flex justify-end gap-3 pt-6 border-t mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/dashboard/publications")} 
                disabled={saving}
              >
                <X className="w-4 h-4 mr-2" /> Hủy
              </Button>
              <Button
                type="button"
                onClick={handleUpdate}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}