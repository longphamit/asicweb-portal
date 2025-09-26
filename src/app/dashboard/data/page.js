'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export default function DataListPage() {
    const router = useRouter();
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/data");
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setDataList(data);
        } catch (err) {
            toast.error("Lỗi khi tải danh sách dữ liệu", { description: err.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm("Bạn có chắc muốn xóa dữ liệu này không?")) return;
        try {
            const res = await fetch(`/api/data/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(await res.text());
            toast.success("Xóa dữ liệu thành công!");
            fetchData();
        } catch (err) {
            toast.error("Lỗi khi xóa dữ liệu", { description: err.message });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container mx-auto px-4">
                <Card className="shadow-lg">
                    <CardHeader className="flex justify-between items-center border-b">
                        <CardTitle className="text-xl font-bold">Danh sách Data</CardTitle>
                        <Button variant="default" size="sm" onClick={() => router.push("/dashboard/data/create")}>
                            <Plus className="w-4 h-4 mr-2" /> Tạo Data
                        </Button>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        {loading ? (
                            <div className="p-6 text-center text-gray-500">Đang tải danh sách...</div>
                        ) : dataList.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">Chưa có dữ liệu nào</div>
                        ) : (
                            <Table className="min-w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tên file</TableHead>
                                        <TableHead>Số cột</TableHead>
                                        <TableHead>Số hàng</TableHead>
                                        <TableHead className="text-right">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dataList.map((data) => (
                                        <TableRow key={data._id}>
                                            {/* Click vào tên file để đi trang chi tiết */}
                                            <TableCell>
                                                <button
                                                    className="text-blue-600 hover:underline"
                                                    onClick={() => router.push(`/dashboard/data/${data._id}`)}
                                                >
                                                    {data.filename}
                                                </button>
                                            </TableCell>
                                            <TableCell>{data.headers.length}</TableCell>
                                            <TableCell>{data.rows.length}</TableCell>
                                            <TableCell className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(data._id)}
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
                </Card>
            </div>
        </div>
    );
}
