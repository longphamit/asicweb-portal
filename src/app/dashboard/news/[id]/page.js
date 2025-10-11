"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Clock, User, Edit2 } from "lucide-react";

export default function NewsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/news/${id}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setNews(data);
    } catch (err) {
      toast.error("Lỗi khi tải tin tức", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [id]);

  if (loading) return <LoadingCard />;
  if (!news) return <NotFoundCard />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8">
        <HeaderSection id={id} news={news} />
        <div className="max-w-4xl mx-auto space-y-6">
          <ArticleView news={news} />
        </div>
      </div>
    </div>
  );
}

/* Header */
function HeaderSection({ id, news }) {
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
        {news?.published ? (
          <>
            <Badge variant="success" className="ml-2 bg-green-100 text-green-700">
              ✅ Xuất bản
            </Badge>
            {news.publishedAt && (
              <Badge variant="outline" className="ml-2 bg-green-100 text-green-700">
                📅 {new Date(news.publishedAt).toLocaleDateString("vi-VN")}
              </Badge>
            )}
          </>
        ) : (
          <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700">
            ⏳ Chưa xuất bản
          </Badge>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => router.push(`/dashboard/news/${id}/update`)}
        >
          <Edit2 className="w-4 h-4 mr-2" /> Chỉnh sửa
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
          <p className="text-lg font-medium text-slate-600">
            Đang tải tin tức...
          </p>
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
          <p className="text-lg font-medium text-slate-600">
            Không tìm thấy tin tức
          </p>
          <Button onClick={() => router.push("/dashboard/news")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay về danh sách
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* View Mode Card */
function ArticleView({ news }) {
  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b p-8">
        <div className="space-y-4">
          <CardTitle className="text-3xl lg:text-4xl font-bold text-slate-800 leading-tight">
            {news.title}
          </CardTitle>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            {news.createdAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Tạo: {new Date(news.createdAt).toLocaleDateString("vi-VN")}
              </div>
            )}
            {news.updatedAt && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> Cập nhật: {new Date(news.updatedAt).toLocaleDateString("vi-VN")}
              </div>
            )}
            {news.published && news.publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Xuất bản: {new Date(news.publishedAt).toLocaleDateString("vi-VN")}
              </div>
            )}
            {news.author && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" /> {news.author}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        {/* Short Description */}
        <div>
          <p className="text-lg leading-relaxed text-slate-700 whitespace-pre-line font-medium">
            {news.shortDescription}
          </p>
        </div>
        <Separator />
        {/* Content */}
        <div className="prose prose-slate max-w-none lg:prose-lg">
          <div
            className="leading-relaxed 
              [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4 [&_h1]:text-slate-800
              [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-3 [&_h2]:text-slate-700
              [&_h3]:text-xl [&_h3]:font-medium [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-slate-600
              [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:text-slate-600 [&_blockquote]:italic
              [&_a]:!text-[#0768ea] [&_a]:hover:!text-[#0557c2] [&_a]:transition-colors [&_a]:!bg-transparent
              [&_img]:max-w-full [&_img]:h-auto [&_img]:my-4 [&_img]:rounded-md
              [&_video]:max-w-full [&_video]:h-auto [&_video]:my-4 [&_video]:rounded-md"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </div>
      </CardContent>
    </Card>
  );
}