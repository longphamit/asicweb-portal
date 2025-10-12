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
import { Plus, ImageIcon } from "lucide-react";

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
  const year = date.getFullYear().toString().slice(-2);
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
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6">
      <div className="w-full max-w-7xl">
        <div className="flex flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Danh sách tin tức</h1>
          <Button 
            onClick={() => router.push("/dashboard/news/create")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Tạo tin tức mới
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-slate-200">
          {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                <p className="text-center text-slate-600">Đang tải tin tức...</p>
              </div>
            ) : newsList.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">Chưa có tin tức nào.</p>
                <p className="text-sm text-slate-500 mt-2">Bắt đầu bằng cách tạo tin tức đầu tiên</p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="w-20">Ảnh</TableHead>
                        <TableHead className="font-semibold">Tiêu đề</TableHead>
                        <TableHead className="font-semibold">Tác giả</TableHead>
                        <TableHead className="font-semibold">Trạng thái</TableHead>
                        <TableHead className="font-semibold">Ngày xuất bản</TableHead>
                        <TableHead className="font-semibold">Ngày tạo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newsList.map((news) => (
                        <TableRow
                          key={news._id}
                          className="cursor-pointer hover:bg-slate-50 transition-colors"
                          onClick={() => router.push(`/dashboard/news/${news._id}`)}
                        >
                          {/* Thumbnail Column */}
                          <TableCell className="p-2">
                            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                              {news.thumbnail ? (
                                <img
                                  src={news.thumbnail}
                                  alt={news.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div 
                                className={`absolute inset-0 flex items-center justify-center ${news.thumbnail ? 'hidden' : 'flex'}`}
                                style={{ display: news.thumbnail ? 'none' : 'flex' }}
                              >
                                <ImageIcon className="w-6 h-6 text-slate-300" />
                              </div>
                            </div>
                          </TableCell>

                          {/* Title Column */}
                          <TableCell className="max-w-md">
                            <span className="text-blue-600 hover:underline font-medium line-clamp-1">
                              {news.title}
                            </span>
                          </TableCell>

                          {/* Author Column */}
                          <TableCell className="text-slate-600">
                            {news.author || "—"}
                          </TableCell>

                          {/* Status Column */}
                          <TableCell>
                            {news.published ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                Xuất bản
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
                                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                                Nháp
                              </div>
                            )}
                          </TableCell>

                          {/* Published Date Column */}
                          <TableCell className="text-slate-600 text-sm">
                            {news.publishedAt ? formatDate(news.publishedAt) : "—"}
                          </TableCell>

                          {/* Created Date Column */}
                          <TableCell className="text-slate-600 text-sm">
                            {formatDate(news.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-8">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page - 1);
                          }}
                          className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-slate-100"}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                        .map((p) => (
                          <PaginationItem key={p}>
                            <PaginationLink
                              href="#"
                              isActive={p === page}
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(p);
                              }}
                              className="cursor-pointer"
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
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page + 1);
                          }}
                          className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-slate-100"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>

                {/* Summary */}
                <div className="text-center mt-4 text-sm text-slate-500">
                  Hiển thị trang {page} / {totalPages} • Tổng {newsList.length} tin tức
                </div>
              </>
            )}
          </div>
        </div>
      </div>
  
  );
}