"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RefreshCcw } from "lucide-react"

// 🛠️ Hàm tạo slug
const slugify = (text = "") =>
  text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "")

export default function CourseEditPage() {
  const { id } = useParams()
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("")
  const [instructor, setInstructor] = useState("")
  const [startDate, setStartDate] = useState("")
  const [status, setStatus] = useState("Sắp khai giảng")
  const [createdAt, setCreatedAt] = useState("")

  // 📍 flag để biết user có chỉnh slug thủ công không
  const [isSlugEdited, setIsSlugEdited] = useState(false)

  useEffect(() => {
    // 🧪 Giả lập fetch từ API hoặc DB
    const sampleCourses = [
      {
        id: "1",
        title: "Lập trình Web cơ bản",
        slug: "lap-trinh-web-co-ban",
        duration: 40,
        instructor: "Nguyễn Văn A",
        startDate: "2025-10-01",
        status: "Sắp khai giảng",
        createdAt: "2025-09-01",
        description: "Khóa học nền tảng giúp bạn xây dựng trang web từ con số 0."
      },
      {
        id: "2",
        title: "React nâng cao",
        slug: "react-nang-cao",
        duration: 60,
        instructor: "Trần Thị B",
        startDate: "2025-09-05",
        status: "Đang mở",
        createdAt: "2025-09-10",
        description: "Khóa học chuyên sâu về React và các công nghệ hiện đại."
      }
    ]

    const found = sampleCourses.find(c => c.id === id)
    if (found) {
      setTitle(found.title)
      setSlug(found.slug)
      setDescription(found.description)
      setDuration(String(found.duration || ""))
      setInstructor(found.instructor)
      setStartDate(found.startDate)
      setStatus(found.status)
      setCreatedAt(found.createdAt)
      setIsSlugEdited(false)
    }
  }, [id])

  // ✅ Tự update slug nếu user chưa chỉnh tay
  const handleTitleChange = (e) => {
    const newTitle = e.target.value
    setTitle(newTitle)

    if (!isSlugEdited || slug.trim() === "") {
      setSlug(slugify(newTitle))
    }
  }

  // 📌 Khi user chỉnh slug -> đánh dấu là đã chỉnh tay
  const handleSlugChange = (e) => {
    setSlug(e.target.value)
    setIsSlugEdited(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    const updatedCourse = {
      id,
      title,
      slug,
      description,
      duration: Number(duration),
      instructor,
      startDate,
      status,
      createdAt,
    }
    console.log("📦 Cập nhật khóa học:", updatedCourse)
    router.push("/dashboard/courses")
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">✏️ Chỉnh sửa khóa học</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            {/* 📌 Tên khóa học */}
            <div className="space-y-2">
              <Label>Tên khóa học</Label>
              <Input
                placeholder="Nhập tên khóa học..."
                value={title}
                onChange={handleTitleChange}
                required
              />
            </div>

            {/* 🔗 Slug */}
            <div className="space-y-2">
              <Label>Slug (đường dẫn)</Label>
              <div className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  placeholder="slug-khoa-hoc..."
                  value={slug}
                  onChange={handleSlugChange}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Tạo lại slug từ tên"
                  onClick={() => {
                    const newSlug = slugify(title)
                    setSlug(newSlug)
                    setIsSlugEdited(false) // Cho phép slug tự update theo tên sau này
                  }}
                >
                 <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                💡 Slug sẽ xuất hiện trong URL: <code>/courses/{slug}</code>
              </p>
            </div>


            {/* 📜 Mô tả */}
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                rows={4}
                placeholder="Nhập mô tả chi tiết..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* ⏱️ Thời lượng + Giảng viên */}
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

            {/* 📅 Ngày bắt đầu + Trạng thái */}
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

            {/* ⚙️ Nút hành động */}
            <div className="flex gap-4 pt-4 justify-between">
              <div className="flex gap-3">
                <Button type="submit">💾 Lưu thay đổi</Button>
                <Button variant="outline" onClick={() => router.push("/dashboard/courses")}>
                  ← Quay lại
                </Button>
              </div>

              {/* 👁️ Preview */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary">👁️ Xem trước</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>📘 Preview khóa học</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 text-sm">
                    <p><strong>📌 Tên:</strong> {title}</p>
                    <p><strong>🔗 Slug:</strong> {slug}</p>
                    <p><strong>🎓 Giảng viên:</strong> {instructor}</p>
                    <p><strong>⏱️ Thời lượng:</strong> {duration} giờ</p>
                    <p><strong>📅 Bắt đầu:</strong> {startDate}</p>
                    <p><strong>📌 Trạng thái:</strong> {status}</p>
                    <p><strong>🗓️ Ngày tạo:</strong> {createdAt}</p>
                    <div>
                      <strong>📜 Mô tả:</strong>
                      <p className="mt-1 text-gray-700">{description}</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
