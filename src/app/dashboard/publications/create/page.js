'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save, X } from "lucide-react";
import YearPicker from "@/components/year-picker";

export default function CreatePublicationPage() {
  const router = useRouter();

  const [year, setYear] = useState("");
  const [title, setTitle] = useState("");
  const [members, setMembers] = useState("");
  const [type, setType] = useState("journal");
  const [venueName, setVenueName] = useState("");
  const [abstractText, setAbstractText] = useState("");
  const [doi, setDoi] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    // validate form thủ công
    if (!year || !title || !members || !type || !venueName || !abstractText) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, title, members, type, venueName, abstract: abstractText, doi }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Tạo công bố thành công!");
      router.push("/dashboard/publications");
    } catch (err) {
      toast.error("Lỗi khi tạo công bố", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="flex justify-between items-center border-b">
            <CardTitle className="text-xl font-bold">Tạo công bố khoa học mới</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/publications")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay về
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Form nhập thủ công */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="year">Năm</Label>
                <YearPicker value={year} onChange={setYear} />
              </div>
              <div>
                <Label htmlFor="title">Tên công bố</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tên công bố"
                />
              </div>
              <div>
                <Label htmlFor="members">Thành viên công bố</Label>
                <Textarea
                  id="members"
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                  rows={3}
                  placeholder="Nhập danh sách thành viên"
                />
              </div>
              <div className="space-y-2">
                <Label>Loại công bố</Label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="journal"
                      checked={type === "journal"}
                      onChange={() => setType("journal")}
                    />
                    Tạp chí
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="conference"
                      checked={type === "conference"}
                      onChange={() => setType("conference")}
                    />
                    Hội nghị
                  </label>
                </div>
              </div>
              <div>
                <Label htmlFor="venueName">{type === "journal" ? "Tên tạp chí" : "Tên hội nghị"}</Label>
                <Input
                  id="venueName"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder={`Nhập tên ${type === "journal" ? "tạp chí" : "hội nghị"}`}
                />
              </div>
              <div>
                <Label htmlFor="abstract">Abstract</Label>
                <Textarea
                  id="abstract"
                  value={abstractText}
                  onChange={(e) => setAbstractText(e.target.value)}
                  rows={5}
                  placeholder="Nhập abstract"
                />
              </div>
              <div>
                <Label htmlFor="doi">Link DOI</Label>
                <Input
                  id="doi"
                  value={doi}
                  onChange={(e) => setDoi(e.target.value)}
                  placeholder="Nhập link DOI (nếu có)"
                />
              </div>
            </div>

            {/* Nút lưu/hủy */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/publications")} disabled={saving}>
                <X className="w-4 h-4 mr-2" /> Hủy
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mx-auto"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2 inline-block" /> Lưu công bố
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
