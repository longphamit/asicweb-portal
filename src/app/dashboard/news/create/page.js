'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

import Editor from "@/components/tiptap-editor";

export default function CreateNewsPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleEditorUpdate = (html) => setContent(html);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !shortDescription || !content) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề, mô tả và nội dung");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, shortDescription, content }),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success("Tạo tin tức thành công!");
      router.push("/dashboard/news");
    } catch (err) {
      toast.error("Lỗi khi tạo tin tức", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto shadow-xl bg-white/90 backdrop-blur-sm">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r border-b p-6 flex justify-between items-center">
            {/* Nút quay về bên trái */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/news")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay về
            </Button>

            {/* Tiêu đề */}
            <CardTitle className="text-2xl font-bold text-slate-800">
              Tạo tin tức mới
            </CardTitle>

            {/* Khoảng trống bên phải */}
            <div className="w-20" />
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tiêu đề */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                  Tiêu đề
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề tin tức"
                  className="text-lg font-medium"
                  required
                />
              </div>

              {/* Mô tả ngắn */}
              <div className="space-y-2">
                <Label htmlFor="shortDescription" className="text-sm font-medium text-slate-700">
                  Mô tả ngắn
                </Label>
                <Textarea
                  id="shortDescription"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Nhập mô tả ngắn"
                  rows={4}
                  className="resize-none p-3 font-medium whitespace-pre-line"
                  required
                />
              </div>

              {/* Nội dung chính */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium text-slate-700">
                  Nội dung
                </Label>
                <div className="border rounded-lg bg-white min-h-[300px]">
                  <Editor initialContent={content} onUpdate={handleEditorUpdate} />
                </div>
              </div>

              {/* Nút Lưu */}
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  size="lg"
                  className=" from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Lưu tin tức
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
