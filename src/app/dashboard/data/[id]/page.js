'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function DataDetailPage() {
  const { id } = useParams(); // id của dataset từ route
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/data/${id}`);
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;
  if (!data) return <div className="p-6 text-red-500">Không tìm thấy dữ liệu</div>;

  const { filename, headers, rows } = data;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Chi tiết Dataset: {filename}</h1>
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/data")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay về
          </Button>
        </div>

        {/* Bảng dữ liệu */}
        <div className="overflow-auto border rounded p-2 max-h-96">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                {headers.map((h) => (
                  <th key={h} className="border px-2 py-1 text-left bg-gray-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  {headers.map((h) => (
                    <td key={h} className="border px-2 py-1">{row[h]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* JSON chi tiết */}
        <div className="bg-gray-50 p-4 rounded border">
          <h3 className="font-semibold mb-2">JSON chi tiết</h3>
          <pre className="text-sm overflow-auto">{JSON.stringify(data, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
