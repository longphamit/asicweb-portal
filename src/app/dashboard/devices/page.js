"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { 
  MoreHorizontal, Plus, Loader2, CheckCircle2, 
  AlertCircle, ChevronLeft, ChevronRight, 
  Search, Monitor, Box, Calendar, Image as ImageIcon
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function DevicesPage() {
  const [devices, setDevices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [notification, setNotification] = useState({ message: "", type: "" })
  
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const limit = 10

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  };

  useEffect(() => {
    fetchDevices()
  }, [currentPage])

  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/devices?page=${currentPage}&limit=${limit}&search=${searchTerm}`);
      if (!res.ok) throw new Error("Không thể tải danh sách thiết bị");
      const data = await res.json();
      const devicesArray = Array.isArray(data) ? data : data.data || data.devices || [];
      setDevices(devicesArray);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      setNotification({ message: error.message || "Lỗi tải dữ liệu", type: "error" });
      setTimeout(() => setNotification({ message: "", type: "" }), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xác nhận xóa thiết bị này khỏi hệ thống?")) return;
    try {
      const res = await fetch(`/api/devices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Không thể xóa thiết bị");
      setNotification({ message: "Đã xóa thiết bị thành công!", type: "success" });
      setTimeout(() => setNotification({ message: "", type: "" }), 3000);
      fetchDevices();
    } catch (error) {
      setNotification({ message: error.message, type: "error" });
    }
  };

  const stats = useMemo(() => {
    const s = { available: 0, "in-use": 0, broken: 0 }
    if (Array.isArray(devices)) {
      devices.forEach(d => { if (d.status && s[d.status] !== undefined) s[d.status]++ })
    }
    return s
  }, [devices])

  const renderStatus = (status) => {
    const configs = {
      available: { label: "Sẵn sàng", class: "bg-emerald-50 text-emerald-600 border-emerald-100" },
      "in-use": { label: "Đang dùng", class: "bg-blue-50 text-blue-600 border-blue-100" },
      broken: { label: "Hỏng / Lỗi", class: "bg-red-50 text-red-600 border-red-100" }
    }
    const config = configs[status] || { label: status, class: "bg-gray-50 text-gray-500 border-gray-100" }
    return (
      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider border ${config.class}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 relative text-black font-sans">
      
      {notification.message && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top-4 
          ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="font-semibold text-sm tracking-tight">{notification.message}</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-black tracking-tight">🛠️ Lab Devices</h1>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.1em] mt-1">Quản lý hạ tầng & Thiết bị</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Tìm S/N hoặc tên..." 
                className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48 md:w-64 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && fetchDevices()}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link href="/dashboard/devices/create">
              <Button className="font-bold uppercase tracking-wider text-[11px] h-10 px-5 rounded-xl shadow-sm hover:shadow-md transition-all">
                <Plus className="w-4 h-4 mr-2" /> Thêm mới
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard label="Sẵn sàng" value={stats.available} color="text-emerald-600" bg="bg-emerald-50" icon={<Box size={20}/>} />
          <StatCard label="Đang sử dụng" value={stats["in-use"]} color="text-blue-600" bg="bg-blue-50" icon={<Monitor size={20}/>} />
          <StatCard label="Lỗi / Hỏng" value={stats.broken} color="text-red-600" bg="bg-red-50" icon={<AlertCircle size={20}/>} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
            </div>
          ) : devices.length === 0 ? (
            <div className="py-24 text-center text-gray-500 font-medium">
              Không tìm thấy thiết bị nào
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="font-bold uppercase text-[11px] px-6 py-4 w-[100px]">Ảnh</TableHead>
                    <TableHead className="font-bold uppercase text-[11px] px-6 py-4">Thiết bị & Model</TableHead>
                    <TableHead className="font-bold uppercase text-[11px] px-6 py-4">Serial Number</TableHead>
                    <TableHead className="font-bold uppercase text-[11px] px-6 py-4">Người phụ trách</TableHead>
                    <TableHead className="font-bold uppercase text-[11px] px-6 py-4">Trạng thái & Kiểm định</TableHead>
                    <TableHead className="w-[80px] px-6 py-4"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map(device => (
                    <TableRow key={device._id || device.id} className="group hover:bg-gray-50/80 border-b border-gray-100 last:border-0 transition-colors">
                      {/* Cột Thumbnail mới */}
                      <TableCell className="px-6 py-4">
                        <Link href={`/dashboard/devices/${device._id || device.id}/edit`}>
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center group-hover:border-blue-300 transition-all">
                            {device.thumbnail ? (
                              <img 
                                src={device.thumbnail} 
                                alt={device.deviceName} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <ImageIcon className="text-gray-300 w-6 h-6" />
                            )}
                          </div>
                        </Link>
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <Link 
                          href={`/dashboard/devices/${device._id || device.id}/edit`}
                          className="block group/item"
                        >
                          <div className="text-sm font-bold text-black group-hover/item:text-blue-600 transition-colors">
                            {device.deviceName}
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5 group-hover/item:text-blue-400 transition-colors">
                            {device.model || "Standard Version"}
                          </div>
                        </Link>
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <code className="text-[10px] bg-gray-100 px-2 py-1 rounded font-mono text-gray-600 border border-gray-200">
                          {device.serialNumber || "N/A"}
                        </code>
                      </TableCell>

                      <TableCell className="px-6 py-4 text-sm text-gray-600">
                        {device.assignedTo ? (
                           <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                               {device.assignedTo.charAt(0)}
                             </div>
                             {device.assignedTo}
                           </div>
                        ) : (
                          <span className="text-gray-300 italic text-xs tracking-tight">Chưa bàn giao</span>
                        )}
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          {renderStatus(device.status)}
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">
                             <Calendar size={12} className="opacity-70" />
                             {device.lastMaintenance ? (
                               <span>KĐ: {formatDate(device.lastMaintenance)}</span>
                             ) : (
                               <span className="opacity-50">Chưa kiểm định</span>
                             )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white shadow-none">
                              <MoreHorizontal className="h-4 w-4 text-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-xl border-gray-100">
                            <DropdownMenuItem asChild className="cursor-pointer text-sm font-medium py-2">
                              <Link href={`/dashboard/devices/${device._id || device.id}/edit`}>Chỉnh sửa</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(device._id || device.id)} 
                              className="text-red-600 focus:text-red-600 cursor-pointer text-sm font-medium py-2"
                            >
                              Xóa bản ghi
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between px-6 py-4 bg-gray-50/30 border-t border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Trang {currentPage} / {totalPages}</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg border-gray-200"
                    onClick={() => setCurrentPage(p => Math.max(p-1, 1))} 
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16}/>
                  </Button>
                  <Button 
                    variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg border-gray-200"
                    onClick={() => setCurrentPage(p => Math.min(p+1, totalPages))} 
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={16}/>
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

function StatCard({ label, value, color, bg, icon }) {
  return (
    <Card className={`rounded-2xl border-none ${bg} shadow-sm overflow-hidden transition-transform hover:scale-[1.02]`}>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${color} opacity-70 mb-1`}>{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`${color} opacity-30 p-3 bg-white/50 rounded-xl`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}