'use client'

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Edit2, Save, X, Calendar, Clock, User } from "lucide-react";

import Editor from "@/components/tiptap-editor";

export default function NewsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/news/${id}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setNews(data);
      setTitle(data.title);
      setShortDescription(data.shortDescription);
      setContent(data.content);
    } catch (err) {
      toast.error("Lỗi khi tải tin tức", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [id]);

  const handleEditorUpdate = (html) => setContent(html);

  const handleUpdate = async () => {
    if (!title || !shortDescription || !content) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề, mô tả và nội dung");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`/api/news/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, shortDescription, content }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Cập nhật tin tức thành công!");
      setEditing(false);
      await fetchNews();
    } catch (err) {
      toast.error("Lỗi khi cập nhật tin tức", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (news) {
      setTitle(news.title);
      setShortDescription(news.shortDescription);
      setContent(news.content);
    }
  };

  if (loading) return <LoadingCard />;
  if (!news) return <NotFoundCard />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8">
        <HeaderSection editing={editing} handleCancel={handleCancel} setEditing={setEditing} id={id} />
        <div className="max-w-4xl mx-auto space-y-6">
          {editing ? (
            <EditCard
              title={title}
              setTitle={setTitle}
              shortDescription={shortDescription}
              setShortDescription={setShortDescription}
              content={content}
              handleEditorUpdate={handleEditorUpdate}
              handleUpdate={handleUpdate}
              handleCancel={handleCancel}
              saving={saving}
            />
          ) : (
            <ArticleView news={news} />
          )}
        </div>
      </div>
    </div>
  );
}

/* Header */
function HeaderSection({ editing, handleCancel, setEditing, id }) {
  const router = useRouter();
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/news")}
          className="hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay về
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Badge variant="secondary" className="text-sm">
          Tin tức #{id}
        </Badge>
      </div>
      <div className="flex gap-2">
        <Button
          variant={editing ? "outline" : "default"}
          size="sm"
          onClick={() => editing ? handleCancel() : setEditing(true)}
        >
          {editing ? (
            <>
              <X className="w-4 h-4 mr-2" /> Hủy
            </>
          ) : (
            <>
              <Edit2 className="w-4 h-4 mr-2" /> Chỉnh sửa
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/* Loading Card */
function LoadingCard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="w-96 shadow-lg">
        <CardContent className="p-8 flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-lg font-medium text-slate-600">Đang tải tin tức...</p>
        </CardContent>
      </Card>
    </div>
  );
}

/* Not Found Card */
function NotFoundCard() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="w-96 shadow-lg">
        <CardContent className="p-8 flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-lg font-medium text-slate-600">Không tìm thấy tin tức</p>
          <Button onClick={() => router.push("/dashboard/news")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay về danh sách
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* Edit Mode Card */
function EditCard({ title, setTitle, shortDescription, setShortDescription, content, handleEditorUpdate, handleUpdate, handleCancel, saving }) {
  return (
    <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Edit2 className="w-5 h-5" /> Chỉnh sửa tin tức
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex flex-col gap-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-slate-700">Tiêu đề</Label>
          <Input id="title" value={title} onChange={e => setTitle(e.target.value)} className="text-lg font-medium" placeholder="Nhập tiêu đề tin tức..." />
        </div>
        {/* Short Description */}
        <div className="space-y-2">
          <Label htmlFor="shortDescription" className="text-sm font-medium text-slate-700">Mô tả ngắn</Label>
          <Textarea id="shortDescription" value={shortDescription} onChange={e => setShortDescription(e.target.value)} rows={4} className="resize-none" placeholder="Nhập mô tả ngắn..." />
        </div>
        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content" className="text-sm font-medium text-slate-700">Nội dung</Label>
          <div className="border rounded-lg bg-white min-h-[300px]">
            <Editor initialContent={content} onUpdate={handleEditorUpdate} />
          </div>
        </div>
        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={handleCancel} size="lg"><X className="w-4 h-4 mr-2" /> Hủy</Button>
          <Button onClick={handleUpdate} disabled={saving} size="lg" >
            {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div> : <Save className="w-4 h-4 mr-2" />} Lưu thay đổi
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* View Mode Card */
function ArticleView({ news }) {
  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b p-8">
        <div className="space-y-4">
          <CardTitle className="text-3xl lg:text-4xl font-bold text-slate-800 leading-tight">{news.title}</CardTitle>
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            {news.createdAt && <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(news.createdAt).toLocaleDateString('vi-VN')}</div>}
            {news.updatedAt && <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> Cập nhật: {new Date(news.updatedAt).toLocaleDateString('vi-VN')}</div>}
            {news.author && <div className="flex items-center gap-1"><User className="w-4 h-4" /> {news.author}</div>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        {/* Short Description */}
        <div className="bg-gradient-to-r ">
          <p className="text-lg leading-relaxed text-slate-700 whitespace-pre-line font-medium">{news.shortDescription}</p>
        </div>
        <Separator />
        {/* Content */}
        <div className="prose prose-slate max-w-none lg:prose-lg">
          <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: news.content }} />
        </div>
      </CardContent>
    </Card>
  );
}
