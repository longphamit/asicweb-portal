"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Save, X } from "lucide-react";

export default function ImportPublicationsPage() {
  const router = useRouter();
  const [datasets, setDatasets] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 📌 1. Gọi API lấy danh sách dataset
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/data");
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        setDatasets(json);
      } catch (err) {
        toast.error("Không tải được danh sách dữ liệu", { description: err.message });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 📌 2. Khi chọn dataset → lấy headers + rows
  const handleSelect = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    const dataset = datasets.find((d) => d._id === id);
    if (dataset) {
      setHeaders(dataset.headers || []);
      setRows(dataset.rows || []);
    } else {
      setHeaders([]);
      setRows([]);
    }
  };

  // 📌 3. Gửi dữ liệu import lên backend
  const handleImport = async () => {
    if (!rows.length) {
      toast.error("Chưa có dữ liệu để import!");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/publications/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publications: rows }),
      });

      if (!res.ok) throw new Error(await res.text());
      toast.success("Import publications thành công!");
      router.push("/dashboard/publications");
    } catch (err) {
      toast.error("Lỗi khi import", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-6 bg-white p-6 rounded shadow">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">Import Publications từ dữ liệu</h1>
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/publications")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay về
            </Button>
          </div>

          {/* 📁 B1 – chọn file */}
          <div>
            <Label>Chọn file dữ liệu</Label>
            <select
              className="mt-2 w-full border rounded p-2"
              value={selectedId}
              onChange={handleSelect}
              disabled={loading}
            >
              <option value="">-- Chọn file --</option>
              {datasets.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.filename} ({d.rows?.length || 0} bản ghi)
                </option>
              ))}
            </select>
          </div>

          {/* 📊 B2 – Preview */}
          {rows.length > 0 && (
            <>
              <div className="overflow-auto border rounded p-2 max-h-96 mb-4 mt-4">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      {headers.map((h) => (
                        <th key={h} className="border px-2 py-1 text-left bg-gray-100 capitalize">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={idx}>
                        {headers.map((h) => (
                          <td key={h} className="border px-2 py-1">
                            {row[h] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* JSON preview */}
              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="font-semibold mb-2">JSON preview</h3>
                <pre className="text-xs overflow-auto max-h-64">
                  {JSON.stringify({ publications: rows }, null, 2)}
                </pre>
              </div>
            </>
          )}

          {/* 📥 B3 – Import */}
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => router.push("/dashboard/publications")} disabled={saving}>
              <X className="w-4 h-4 mr-2" /> Hủy
            </Button>
            <Button
              onClick={handleImport}
              disabled={saving || rows.length === 0}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {saving ? "Đang lưu..." : <Save className="w-4 h-4 mr-2 inline-block" />} Lưu Import
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
