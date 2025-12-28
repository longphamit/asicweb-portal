"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { 
  MoreHorizontal, Plus, Loader2, CheckCircle2, 
  Calendar, BookOpen, Clock, CheckCircle,
  ChevronLeft, ChevronRight, ImageIcon
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [notification, setNotification] = useState({ message: "", type: "" })
  
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 100 

  useEffect(() => {
    fetchCourses()
  }, [currentPage])

  const fetchCourses = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/courses?page=${currentPage}&limit=${limit}`)
      if (!res.ok) throw new Error("Không thể tải danh sách khóa học")
      const data = await res.json()
      
      const coursesArray = Array.isArray(data) ? data : data.data || data.courses || []
      setCourses(coursesArray)
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      setNotification({ message: error.message || "Đã xảy ra lỗi khi tải dữ liệu", type: "error" })
      setTimeout(() => setNotification({ message: "", type: "" }), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa khóa học này?")) return
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Không thể xóa khóa học")
      setNotification({ message: "Khóa học đã được xóa thành công!", type: "success" })
      setTimeout(() => setNotification({ message: "", type: "" }), 3000)
      fetchCourses()
    } catch (error) {
      setNotification({ message: error.message, type: "error" })
    }
  }

  const stats = useMemo(() => {
    const s = { upcoming: 0, opening: 0, closed: 0 }
    if (Array.isArray(courses)) {
      courses.forEach(c => { if (c.status && s[c.status] !== undefined) s[c.status]++ })
    }
    return s
  }, [courses])

  const formatDateShort = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'N/A'
    const pad = (n) => n.toString().padStart(2, "0")
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear().toString().slice(-2)}`
  }

  const renderStatus = (course) => {
    const status = course?.status || ""
    switch (status) {
      case "upcoming":
        return (
          <div className="flex flex-col gap-1">
            <span className="w-fit px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">Sắp khai giảng</span>
            {course.startDate && <div className="flex items-center gap-1 text-blue-500 font-bold text-[10px] ml-1"><Calendar size={10} /> {formatDateShort(course.startDate)}</div>}
          </div>
        )
      case "opening":
        return <span className="w-fit px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">Đang mở</span>
      case "closed":
        return <span className="w-fit px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200">Đã kết thúc</span>
      default:
        return <span className="text-[10px] text-gray-400 italic">N/A</span>
    }
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 relative text-black">
      {notification.message && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border transition-all animate-in slide-in-from-top-4 ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-600" /> : <span className="text-xl">⚠️</span>}
          <p className="font-bold text-sm tracking-tight">{notification.message}</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">📚 Khóa học</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Hệ thống quản lý đào tạo</p>
          </div>
          <Link href="/dashboard/courses/create">
            <Button className="bg-black hover:bg-gray-800 text-white font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-xl shadow-lg transition-all active:scale-95">
              <Plus className="w-4 h-4 mr-2" /> Tạo mới
            </Button>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="rounded-2xl border-none bg-blue-50/40 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div><p className="text-[10px] font-black uppercase tracking-widest text-blue-600/70">Sắp tới</p><p className="text-2xl font-black text-blue-700">{stats.upcoming}</p></div>
              <div className="bg-blue-100/50 p-2 rounded-xl text-blue-600"><Clock size={20} /></div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-none bg-emerald-50/40 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div><p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70">Đang mở</p><p className="text-2xl font-black text-emerald-700">{stats.opening}</p></div>
              <div className="bg-emerald-100/50 p-2 rounded-xl text-emerald-600"><BookOpen size={20} /></div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-none bg-gray-50 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div><p className="text-[10px] font-black uppercase tracking-widest text-gray-500/70">Đã xong</p><p className="text-2xl font-black text-gray-600">{stats.closed}</p></div>
              <div className="bg-gray-200/50 p-2 rounded-xl text-gray-500"><CheckCircle size={20} /></div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-200" /></div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-gray-50/30">
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="font-black uppercase tracking-widest text-[10px] px-6 py-4 w-[100px]">Thumbnail</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px] px-6 py-4">Khóa học</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px] px-6 py-4">Kỹ năng</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px] px-6 py-4">Giảng viên</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px] px-6 py-4">Trạng thái</TableHead>
                    <TableHead className="w-[80px] px-6 py-4"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map(course => (
                    <TableRow key={course._id || course.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50/80">
                      <TableCell className="px-6 py-4">
                        <div className="w-16 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 flex items-center justify-center relative">
                          {course.thumbnail ? (
                            <img 
                              src={course.thumbnail} 
                              alt={course.title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-gray-300" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Link href={`/dashboard/courses/${course._id || course.id}/edit`} className="text-sm font-bold hover:text-blue-600 transition-colors block leading-tight">{course.title || "Chưa đặt tên"}</Link>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">ID: {(course.id || course._id || "").toString().slice(-6)} • {formatDateShort(course.createdAt)}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-xs font-medium text-gray-500">{course.skills || "---"}</TableCell>
                      <TableCell className="px-6 py-4 text-xs text-gray-500 font-medium">{course.instructor}</TableCell>
                      <TableCell className="px-6 py-4">{renderStatus(course)}</TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-100 w-36">
                            <DropdownMenuItem asChild><Link href={`/dashboard/courses/${course._id || course.id}/edit`} className="text-xs font-bold cursor-pointer">Chỉnh sửa</Link></DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(course._id || course.id)} className="text-xs text-red-600 font-bold cursor-pointer">Xóa</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50/30 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trang {currentPage} / {totalPages}</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-lg border-gray-200" 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-lg border-gray-200" 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}