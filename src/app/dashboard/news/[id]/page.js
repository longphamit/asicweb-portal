"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Clock, User, Edit2, X } from "lucide-react";

export default function NewsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [news, setNews] = useState(null);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/news/${id}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setNews(data);

      // Fetch tags associated with this news
      if (data.tags && data.tags.length > 0) {
        const tagPromises = data.tags.map(async (tagId) => {
          const tagRes = await fetch(`/api/tags?id=${tagId}`);
          if (tagRes.ok) {
            return await tagRes.json();
          }
          return null;
        });
        const fetchedTags = (await Promise.all(tagPromises)).filter((tag) => tag !== null);
        setTags(fetchedTags);
      }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <HeaderSection id={id} news={news} />
        <ArticleView news={news} tags={tags} />
      </div>
    </div>
  );
}

/* Header */
function HeaderSection({ id, news }) {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);

  const handleTogglePublish = async () => {
    try {
      setPublishing(true);
      const res = await fetch(`/api/news/${id}/update-publish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !news.published }),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success(
        news.published ? "Đã hủy xuất bản tin tức" : "Đã xuất bản tin tức thành công!"
      );
      window.location.reload();
    } catch (err) {
      toast.error("Lỗi khi cập nhật trạng thái", { description: err.message });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/news")}
          className="hover:bg-slate-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay về
        </Button>
        <Separator orientation="vertical" className="h-6 bg-slate-300" />
        <Badge variant="secondary" className="text-sm bg-slate-200 text-slate-700">
          Tin tức #{id}
        </Badge>
        {news?.published ? (
          <>
            <Badge variant="success" className="ml-2 bg-green-100 text-green-700">
              ✅ Xuất bản
            </Badge>
            {news.publishedAt && (
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-600 border-green-200">
                📅 {new Date(news.publishedAt).toLocaleDateString("vi-VN")}
              </Badge>
            )}
          </>
        ) : (
          <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200">
            ⏳ Chưa xuất bản
          </Badge>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant={news?.published ? "outline" : "default"}
          size="sm"
          onClick={handleTogglePublish}
          disabled={publishing}
          className={news?.published ? "border-slate-300" : "bg-green-600 hover:bg-green-700"}
        >
          {publishing ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent mr-2"></div>
              Đang xử lý...
            </>
          ) : news?.published ? (
            <>Hủy xuất bản</>
          ) : (
            <>📢 Xuất bản</>
          )}
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => router.push(`/dashboard/news/${id}/update`)}
          className="bg-blue-600 hover:bg-blue-700"
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
          <Button
            onClick={() => router.push("/dashboard/news")}
            variant="outline"
            className="border-slate-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay về danh sách
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* View Mode Card */
function ArticleView({ news, tags }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 sm:p-8">
        {/* Left Column: Thumbnail */}
        {news.thumbnail && !imageError ? (
          <div className="relative h-[200px] sm:h-[300px] bg-slate-100 rounded-lg overflow-hidden">
            <img
              src={news.thumbnail}
              alt={news.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
        ) : (
          <div className="h-[200px] sm:h-[300px] bg-slate-100 rounded-lg flex items-center justify-center">
            <p className="text-slate-500 text-sm">Không có ảnh</p>
          </div>
        )}

        {/* Right Column: Title, Meta, Tags, Short Description */}
        <div className="space-y-4">
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
            {news.title}
          </CardTitle>

          {/* Meta and Tags */}
          <div className="flex flex-col gap-3 text-sm text-slate-500">
            <div className="flex flex-wrap gap-4">
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
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag._id}
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/news?tag=${tag._id}`}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Short Description */}
          <div className="bg-slate-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <p className="text-base leading-relaxed text-slate-700 font-medium">
              {news.shortDescription}
            </p>
          </div>
        </div>
      </div>

      <CardContent className="p-6 sm:p-8 space-y-6">
        <Separator className="bg-slate-200" />
        {/* Content */}
        <div className="prose prose-slate max-w-none">
          <div
            className="leading-relaxed text-slate-700
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4
              [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-3
              [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mt-4 [&_h3]:mb-2
              [&_p]:mb-4
              [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:text-slate-600 [&_blockquote]:italic
              [&_a]:text-blue-600 [&_a]:hover:text-blue-800 [&_a]:transition-colors
              [&_img]:max-w-full [&_img]:h-auto [&_img]:my-4 [&_img]:rounded-md [&_img]:shadow-sm
              [&_video]:max-w-full [&_video]:h-auto [&_video]:my-4 [&_video]:rounded-md"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </div>
      </CardContent>
    </Card>
  );
}