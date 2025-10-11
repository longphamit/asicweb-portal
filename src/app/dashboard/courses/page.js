"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function CoursesPage() {
  const [courses, setCourses] = useState([
    {
      id: "1",
      title: "Lập trình Web cơ bản",
      skills: "HTML, CSS, JS",
      duration: 40,
      instructor: "Nguyễn Văn A",
      startDate: "2025-10-01",
      status: "Sắp khai giảng",
      createdAt: "2025-09-01"
    },
    {
      id: "2",
      title: "React nâng cao",
      skills: "Hooks, Context, Next.js",
      duration: 60,
      instructor: "Trần Thị B",
      startDate: "2025-09-05",
      status: "Đang mở",
      createdAt: "2025-09-10"
    },
    {
      id: "3",
      title: "Cơ sở dữ liệu",
      skills: "SQL, MongoDB",
      duration: 50,
      instructor: "Lê Văn C",
      startDate: "2025-07-01",
      status: "Đã kết thúc",
      createdAt: "2025-06-01"
    },
  ])

  const handleDelete = (id) => {
    setCourses(courses.filter(c => c.id !== id))
  }

  // 🧠 Thống kê số lượng khóa học theo trạng thái
  const stats = useMemo(() => {
    const s = { "Sắp khai giảng": 0, "Đang mở": 0, "Đã kết thúc": 0 }
    courses.forEach(c => { if (s[c.status] !== undefined) s[c.status]++ })
    return s
  }, [courses])

  // Hàm format ngày dd/mm/yy
  const formatDateShort = (dateStr) => {
    const date = new Date(dateStr)
    const pad = (n) => n.toString().padStart(2, "0")
    const day = pad(date.getDate())
    const month = pad(date.getMonth() + 1)
    const year = date.getFullYear().toString().slice(-2)
    return `${day}/${month}/${year}`
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📚 Quản lý khóa học</h1>
        <Link href="/dashboard/courses/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tạo
          </Button>
        </Link>
      </div>

      {/* 📊 Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
        <Card>
          <CardHeader><CardTitle>Sắp khai giảng</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-blue-600">{stats["Sắp khai giảng"]}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Đang mở</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-green-600">{stats["Đang mở"]}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Đã kết thúc</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-gray-500">{stats["Đã kết thúc"]}</CardContent>
        </Card>
      </div>

      {/* 📋 Danh sách khóa học */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên khóa học</TableHead>
            <TableHead>Kỹ năng</TableHead>
            <TableHead>Thời lượng (giờ)</TableHead>
            <TableHead>Giảng viên</TableHead>
            <TableHead>Ngày bắt đầu</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>

          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map(course => (
            <TableRow key={course.id}>
              <TableCell>
                <Link
                  href={`/dashboard/courses/${course.id}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {course.title}
                </Link>
              </TableCell>
              <TableCell>{course.skills}</TableCell>
              <TableCell>{course.duration}</TableCell>
              <TableCell>{course.instructor}</TableCell>
              <TableCell>{formatDateShort(course.startDate)}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full font-medium text-sm ${course.status === "Sắp khai giảng"
                      ? "bg-blue-100 text-blue-800"
                      : course.status === "Đang mở"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-200 text-gray-600"
                    }`}
                >
                  {course.status}
                </span>
              </TableCell>

              <TableCell>{formatDateShort(course.createdAt)}</TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
