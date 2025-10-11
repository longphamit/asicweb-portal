"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RefreshCcw } from "lucide-react" // 📌 icon nút tạo lại

// 🌀 Hàm tạo slug chuẩn SEO
const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

export default function NewCoursePage() {
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("")
  const [instructor, setInstructor] = useState("")
  const [startDate, setStartDate] = useState("")
  const [status, setStatus] = useState("Sắp khai giảng")

  const router = useRouter()
  const userEditedSlug = useRef(false)

  useEffect(() => {
    if (!userEditedSlug.current) {
      setSlug(slugify(title))
    }
  }, [title])

  const handleSlugChange = (e) => {
    userEditedSlug.current = true
    setSlug(slugify(e.target.value))
  }

  const regenerateSlug = () => {
    const newSlug = slugify(title)
    setSlug(newSlug)
    userEditedSlug.current = false // ✅ bật lại chế độ auto nếu muốn tiếp tục cập nhật theo title
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const newCourse = {
      id: Date.now().toString(),
      title,
      slug,
      description,
      duration: Number(duration),
      instructor,
      startDate,
      status,
      createdAt: new Date().toISOString().split("T")[0],
    }

    console.log("📦 Khóa học mới:", newCourse)
    router.push("/dashboard/courses")
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">➕ Thêm khóa học mới</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Tên khóa học</Label>
              <Input
                placeholder="Nhập tên khóa học..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (e.target.value === "") {
                    userEditedSlug.current = false
                  }
                }}
                required
              />
            </div>

            {/* 📌 Slug có nút tạo lại */}
            <div className="space-y-2">
              <Label>Slug (tự sinh, có thể chỉnh sửa)</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="slug-tu-dong"
                  value={slug}
                  onChange={handleSlugChange}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Tạo lại slug từ tên"
                  onClick={regenerateSlug}
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                💡 Slug sẽ xuất hiện trong URL: <code>/courses/{slug}</code>
              </p>
            </div>

            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                rows={4}
                placeholder="Nhập mô tả chi tiết về khóa học..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Thời lượng (giờ)</Label>
                <Input
                  type="number"
                  placeholder="VD: 40"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Giảng viên</Label>
                <Input
                  placeholder="Tên giảng viên..."
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày bắt đầu học</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sắp khai giảng">Sắp khai giảng</SelectItem>
                    <SelectItem value="Đang mở">Đang mở</SelectItem>
                    <SelectItem value="Đã kết thúc">Đã kết thúc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="w-full md:w-auto">
                💾 Lưu khóa học
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full md:w-auto"
                onClick={() => router.push("/dashboard/courses")}
              >
                ← Quay lại
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
