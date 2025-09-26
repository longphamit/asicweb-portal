'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Save, X } from "lucide-react";
import * as XLSX from "xlsx";

export default function ImportPublicationsPage() {
  const router = useRouter();
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

      // Chuẩn hóa key: lowercase và map ra schema publications
      const normalizedData = jsonData.map(row => ({
        year: row.Year || row.year || "",
        title: row.Title || row.title || "",
        members: row.Members || row.members || "",
        type: (row.Type || row.type || "journal").toLowerCase(),
        venueName: row.VenueName || row.venueName || "",
        abstract: row.Abstract || row.abstract || "",
        doi: row.DOI || row.doi || "",
      }));

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

      const res = await fetch("/api/publications/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publications: dataPreview }),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success("Import publications thành công!");
      router.push("/dashboard/publications");
    } catch (err) {
      toast.error("Lỗi khi import publications", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6 bg-white p-6 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">Import Publications từ Excel</h1>
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/publications")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay về
            </Button>
          </div>

          {/* Upload file */}
          <div className="mb-4">
            <Label>File Excel</Label>
            <Input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
          </div>

          {/* Preview dữ liệu */}
          {dataPreview.length > 0 && (
            <div className="mb-4">
              <div className="overflow-auto border rounded p-2 max-h-96 mb-4">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      {headers.map(h => (
                        <th key={h} className="border px-2 py-1 text-left bg-gray-100">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataPreview.map((row, idx) => (
                      <tr key={idx}>
                        {headers.map(h => (
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
                <pre className="text-sm overflow-auto">{JSON.stringify({ publications: dataPreview }, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Nút lưu/hủy */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/publications")} disabled={saving}>
              <X className="w-4 h-4 mr-2" /> Hủy
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving || dataPreview.length === 0} className="bg-blue-600 text-white hover:bg-blue-700">
              {saving ? "Đang lưu..." : <Save className="w-4 h-4 mr-2 inline-block" />} Lưu Import
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
