"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

// Hàm format ngày theo HH:mm dd/MM/yyyy
function formatDate(dateStr) {
   const date = new Date(dateStr);
  const pad = (n) => n.toString().padStart(2, "0");
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear().toString().slice(-2); // lấy 2 chữ số cuối
  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

export default function NewsPage() {
  const [newsList, setNewsList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const limit = 50;

  const fetchNews = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/news?page=${pageNumber}&limit=${limit}`);
      if (!res.ok) throw new Error("Không tải được danh sách tin tức");
      const data = await res.json();

      setNewsList(data.data || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error(err.message);
      setNewsList([]);
      setPage(1);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(page);
  }, [page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="w-full max-w-6xl">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Danh sách tin tức</CardTitle>
          <Button onClick={() => router.push("/dashboard/news/create")}>
            <Plus className="w-4 h-4 mr-2" /> Tạo
          </Button>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Đang tải tin tức...</p>
          ) : newsList.length === 0 ? (
            <p className="text-center text-muted-foreground">Chưa có tin tức nào.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Tác giả</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày xuất bản</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newsList.map((news) => (
                    <TableRow
                      key={news._id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push(`/dashboard/news/${news._id}`)}
                    >
                      <TableCell className="text-blue-600 hover:underline">
                        {news.title}
                      </TableCell>
                      <TableCell>{news.author || "—"}</TableCell>
                      <TableCell>
                        {news.published ? (
                          <span className="text-green-600 font-medium">✅ Xuất bản</span>
                        ) : (
                          <span className="text-yellow-600 font-medium">⏳ Chưa xuất bản</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {news.publishedAt ? formatDate(news.publishedAt) : "—"}
                      </TableCell>
                      <TableCell>{formatDate(news.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination chuẩn shadcn */}
              <div className="flex justify-center mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={() => handlePageChange(page - 1)}
                        className={page === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                      .map((p) => (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href="#"
                            isActive={p === page}
                            onClick={() => handlePageChange(p)}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                    {totalPages > 5 && page < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={() => handlePageChange(page + 1)}
                        className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </div>
    </div>
  );
}
