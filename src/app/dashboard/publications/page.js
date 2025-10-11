'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Edit2, Plus, Save } from "lucide-react";

export default function PublicationsListPage() {
  const router = useRouter();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchPublications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/publications");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setPublications(data);
    } catch (err) {
      toast.error("Lỗi khi tải danh sách công bố", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa công bố này không?")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/publications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Xóa công bố thành công!");
      fetchPublications();
    } catch (err) {
      toast.error("Lỗi khi xóa công bố", { description: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="w-full max-w-6xl">
        <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">Danh sách công bố khoa học</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push("/dashboard/publications/create")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push("/dashboard/publications/import")}
              >
                <Save className="w-4 h-4 mr-2" />
                Import Excel
              </Button>
            </div>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Đang tải danh sách...</div>
            ) : publications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Chưa có công bố nào</div>
            ) : (
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên công bố / Năm / Thành viên</TableHead>
                    <TableHead>Loại</TableHead>
                    
                    <TableHead>DOI</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publications.map((pub) => (
                    <TableRow key={pub._id}>
                      <TableCell>
                        <div className="font-medium">{pub.title}</div>
                        <div className="text-sm text-gray-500">
                          {pub.year} · {pub.members}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{pub.type}</TableCell>
                     
                      <TableCell>
                        {pub.doi ? (
                          <a
                            href={pub.doi}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline text-sm"
                          >
                            Link
                          </a>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/dashboard/publications/${pub._id}/edit`)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(pub._id)}
                          disabled={deletingId === pub._id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
      </div>
    </div>
  );
}
