'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Save, X } from "lucide-react";
import * as XLSX from "xlsx";

export default function CreateDataPage() {
  const router = useRouter();
  const [datasource, setDatasource] = useState("excel");
  const [file, setFile] = useState(null);
  const [dataPreview, setDataPreview] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [saving, setSaving] = useState(false);

  // đọc file Excel và tạo preview
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (!selectedFile) return;

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (jsonData.length === 0) {
        toast.error("File Excel rỗng!");
        return;
      }

      // Chuẩn hóa key: chuyển tất cả key thành chữ thường
      const normalizedData = jsonData.map(row => {
        const newRow = {};
        Object.keys(row).forEach(k => {
          newRow[k.toLowerCase()] = row[k];
        });
        return newRow;
      });

      setHeaders(Object.keys(normalizedData[0]));
      setDataPreview(normalizedData);
    } catch (err) {
      toast.error("Lỗi đọc file Excel", { description: err.message });
    }
  };

  // lưu data lên API
  const handleSave = async () => {
    if (!dataPreview.length) {
      toast.error("Không có dữ liệu để lưu!");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file?.name || "data.xlsx",
          headers,
          rows: dataPreview,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success("Tạo data thành công!");
      router.push("/dashboard/data");
    } catch (err) {
      toast.error("Lỗi khi tạo data", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6 bg-white p-6 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">Tạo Data mới</h1>
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/data")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay về
            </Button>
          </div>

          {/* Chọn datasource */}
          <div className="mb-4">
            <Label>Datasource</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="datasource"
                  value="excel"
                  checked={datasource === "excel"}
                  onChange={() => setDatasource("excel")}
                />
                Excel
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="datasource"
                  value="query"
                  checked={datasource === "query"}
                  onChange={() => setDatasource("query")}
                  disabled
                />
                Query (coming soon)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="datasource"
                  value="api"
                  checked={datasource === "api"}
                  onChange={() => setDatasource("api")}
                  disabled
                />
                API (coming soon)
              </label>
            </div>
          </div>

          {/* Upload file nếu là Excel */}
          {datasource === "excel" && (
            <div className="mb-4">
              <Label>File Excel</Label>
              <Input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
            </div>
          )}

          {/* Preview dữ liệu */}
          {dataPreview.length > 0 && (
            <div className="mb-4">
              <div className="overflow-auto border rounded p-2 max-h-96 mb-4">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      {headers.map((h) => (
                        <th key={h} className="border px-2 py-1 text-left bg-gray-100">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataPreview.map((row, idx) => (
                      <tr key={idx}>
                        {headers.map((h) => (
                          <td key={h} className="border px-2 py-1">{row[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* JSON preview */}
              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="font-semibold mb-2">JSON preview</h3>
                <pre className="text-sm overflow-auto">
{JSON.stringify(
  {
    filename: file?.name || "data.xlsx",
    headers,
    rows: dataPreview,
  },
  null,
  2
)}
                </pre>
              </div>
            </div>
          )}

          {/* Nút lưu/hủy */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/data")} disabled={saving}>
              <X className="w-4 h-4 mr-2" /> Hủy
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving || dataPreview.length === 0} className="bg-blue-600 text-white hover:bg-blue-700">
              {saving ? "Đang lưu..." : <Save className="w-4 h-4 mr-2 inline-block" />} Lưu Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
