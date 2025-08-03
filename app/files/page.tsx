"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Folder,
  Search,
  Download,
  Eye,
  Trash2,
  Upload,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  File,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ProjectFileWithDetails {
  id: string
  file_url: string
  file_name?: string
  file_type?: string
  description?: string
  uploaded_at: string
  orders: {
    users: { name: string } | null
    services: { service_name: string } | null
  } | null
}

interface Order {
  id: string
  users: { name: string } | null
  services: { service_name: string } | null
}

export default function FilesPage() {
  const [files, setFiles] = useState<ProjectFileWithDetails[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const [newFile, setNewFile] = useState({
    order_id: "",
    file_name: "",
    file_type: "",
    description: "",
    file_url: "",
  })

  useEffect(() => {
    fetchFiles()
    fetchOrders()
  }, [])

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from("project_files")
        .select(`
          id,
          file_url,
          file_name,
          file_type,
          description,
          uploaded_at,
          orders!inner(
            users!inner(name),
            services!inner(service_name)
          )
        `)
        .order("uploaded_at", { ascending: false })

      if (error) throw error
      setFiles(data || [])
    } catch (error) {
      console.error("Error fetching files:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase.from("orders").select(`
          id,
          users!inner(name),
          services!inner(service_name)
        `)

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  const uploadFile = async () => {
    try {
      const { data, error } = await supabase
        .from("project_files")
        .insert([
          {
            order_id: newFile.order_id,
            file_name: newFile.file_name,
            file_type: newFile.file_type,
            description: newFile.description,
            file_url: newFile.file_url || `https://example.com/files/${newFile.file_name}`,
          },
        ])
        .select()

      if (error) throw error

      await fetchFiles()
      setNewFile({
        order_id: "",
        file_name: "",
        file_type: "",
        description: "",
        file_url: "",
      })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("حدث خطأ أثناء رفع الملف")
    }
  }

  const deleteFile = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الملف؟")) return

    try {
      const { error } = await supabase.from("project_files").delete().eq("id", id)

      if (error) throw error

      setFiles(files.filter((file) => file.id !== id))
    } catch (error) {
      console.error("Error deleting file:", error)
      alert("حدث خطأ أثناء حذف الملف")
    }
  }

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="h-8 w-8 text-gray-500" />

    const type = fileType.toLowerCase()

    if (type.includes("image")) return <ImageIcon className="h-8 w-8 text-green-500" />
    if (type.includes("video")) return <Video className="h-8 w-8 text-red-500" />
    if (type.includes("audio")) return <Music className="h-8 w-8 text-purple-500" />
    if (type.includes("pdf") || type.includes("document")) return <FileText className="h-8 w-8 text-blue-500" />
    if (type.includes("zip") || type.includes("rar")) return <Archive className="h-8 w-8 text-orange-500" />

    return <File className="h-8 w-8 text-gray-500" />
  }

  const getFileTypeBadge = (fileType?: string) => {
    if (!fileType) return <Badge variant="outline">غير محدد</Badge>

    const type = fileType.toLowerCase()

    if (type.includes("image")) return <Badge className="bg-green-100 text-green-800">صورة</Badge>
    if (type.includes("video")) return <Badge className="bg-red-100 text-red-800">فيديو</Badge>
    if (type.includes("audio")) return <Badge className="bg-purple-100 text-purple-800">صوت</Badge>
    if (type.includes("pdf")) return <Badge className="bg-blue-100 text-blue-800">PDF</Badge>
    if (type.includes("document")) return <Badge className="bg-blue-100 text-blue-800">مستند</Badge>
    if (type.includes("zip") || type.includes("rar"))
      return <Badge className="bg-orange-100 text-orange-800">أرشيف</Badge>

    return <Badge variant="outline">{fileType}</Badge>
  }

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.orders?.users?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || file.file_type?.toLowerCase().includes(typeFilter)

    return matchesSearch && matchesType
  })

  const fileStats = {
    total: files.length,
    images: files.filter((f) => f.file_type?.includes("image")).length,
    documents: files.filter((f) => f.file_type?.includes("pdf") || f.file_type?.includes("document")).length,
    videos: files.filter((f) => f.file_type?.includes("video")).length,
    others: files.filter(
      (f) =>
        !f.file_type?.includes("image") &&
        !f.file_type?.includes("pdf") &&
        !f.file_type?.includes("document") &&
        !f.file_type?.includes("video"),
    ).length,
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 md:mr-64 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الملفات</h1>
              <p className="text-gray-600">تنظيم وإدارة ملفات المشاريع والعملاء</p>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 ml-2" />
                  رفع ملف جديد
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>رفع ملف جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="order">الطلب المرتبط</Label>
                    <Select
                      value={newFile.order_id}
                      onValueChange={(value) => setNewFile({ ...newFile, order_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الطلب" />
                      </SelectTrigger>
                      <SelectContent>
                        {orders.map((order) => (
                          <SelectItem key={order.id} value={order.id}>
                            {order.services?.service_name} - {order.users?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="file_name">اسم الملف</Label>
                    <Input
                      value={newFile.file_name}
                      onChange={(e) => setNewFile({ ...newFile, file_name: e.target.value })}
                      placeholder="اسم الملف مع الامتداد"
                    />
                  </div>

                  <div>
                    <Label htmlFor="file_type">نوع الملف</Label>
                    <Select
                      value={newFile.file_type}
                      onValueChange={(value) => setNewFile({ ...newFile, file_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الملف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image/jpeg">صورة JPEG</SelectItem>
                        <SelectItem value="image/png">صورة PNG</SelectItem>
                        <SelectItem value="application/pdf">مستند PDF</SelectItem>
                        <SelectItem value="video/mp4">فيديو MP4</SelectItem>
                        <SelectItem value="audio/mp3">صوت MP3</SelectItem>
                        <SelectItem value="application/zip">أرشيف ZIP</SelectItem>
                        <SelectItem value="text/plain">ملف نصي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="file_url">رابط الملف</Label>
                    <Input
                      value={newFile.file_url}
                      onChange={(e) => setNewFile({ ...newFile, file_url: e.target.value })}
                      placeholder="https://example.com/file.pdf"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">وصف الملف</Label>
                    <Textarea
                      value={newFile.description}
                      onChange={(e) => setNewFile({ ...newFile, description: e.target.value })}
                      placeholder="وصف مختصر للملف"
                      rows={3}
                    />
                  </div>

                  <Button onClick={uploadFile} className="w-full" disabled={!newFile.order_id || !newFile.file_name}>
                    رفع الملف
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Folder className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{fileStats.total}</p>
                <p className="text-sm text-gray-600">إجمالي الملفات</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <ImageIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{fileStats.images}</p>
                <p className="text-sm text-gray-600">الصور</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{fileStats.documents}</p>
                <p className="text-sm text-gray-600">المستندات</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Video className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{fileStats.videos}</p>
                <p className="text-sm text-gray-600">الفيديوهات</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <File className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{fileStats.others}</p>
                <p className="text-sm text-gray-600">أخرى</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في الملفات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="image">الصور</SelectItem>
                    <SelectItem value="pdf">مستندات PDF</SelectItem>
                    <SelectItem value="video">الفيديوهات</SelectItem>
                    <SelectItem value="audio">الملفات الصوتية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Files Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-32 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFiles.map((file) => (
                <Card key={file.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center mb-4">
                      {getFileIcon(file.file_type)}
                      <h3 className="font-medium text-sm mt-2 line-clamp-2">{file.file_name || "ملف بدون اسم"}</h3>
                      {getFileTypeBadge(file.file_type)}
                    </div>

                    <div className="space-y-2 text-xs text-gray-600">
                      <p>
                        <strong>العميل:</strong> {file.orders?.users?.name || "غير محدد"}
                      </p>
                      <p>
                        <strong>الخدمة:</strong> {file.orders?.services?.service_name || "غير محددة"}
                      </p>
                      <p>
                        <strong>تاريخ الرفع:</strong> {new Date(file.uploaded_at).toLocaleDateString("ar-EG")}
                      </p>

                      {file.description && (
                        <p className="line-clamp-2">
                          <strong>الوصف:</strong> {file.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteFile(file.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredFiles.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد ملفات</h3>
                <p className="text-gray-500">ابدأ برفع ملف جديد</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
