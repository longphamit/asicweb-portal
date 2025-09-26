"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Hàm format ngày theo HH:mm dd/MM/yyyy
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const pad = (n) => n.toString().padStart(2, "0");

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

export default function NewsPage() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/news");
      if (!res.ok) throw new Error("Không tải được danh sách tin tức");
      const data = await res.json();
      setNewsList(data);
    } catch (err) {
      toast.error(err.message);
      setNewsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <Card className="w-full max-w-6xl">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-2xl">Danh sách tin tức</CardTitle>
          <Button onClick={() => router.push("/dashboard/news/create")}>Tạo mới</Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Đang tải tin tức...</p>
          ) : newsList.length === 0 ? (
            <p className="text-center text-muted-foreground">Chưa có tin tức nào.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Tác giả</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newsList.map((news) => (
                  <TableRow key={news._id} className="cursor-pointer">
                    <TableCell
                      onClick={() => router.push(`/dashboard/news/${news._id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      {news.title}
                    </TableCell>
                    <TableCell>{formatDate(news.createdAt)}</TableCell>
                    <TableCell>{news.author || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
