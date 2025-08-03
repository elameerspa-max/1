"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ShoppingCart,
  Search,
  Plus,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Calendar,
  User,
  Package,
} from "lucide-react"
import { supabase, type Order, type User as UserType, type Service } from "@/lib/supabase"

interface OrderWithDetails extends Order {
  users?: UserType
  services?: Service
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const [newOrder, setNewOrder] = useState({
    user_id: "",
    service_id: "",
    status: "pending" as const,
    notes: "",
  })

  useEffect(() => {
    fetchOrders()
    fetchUsers()
    fetchServices()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          users!inner(id, name, email, phone_number),
          services!inner(id, service_name, description, base_price)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("role", "client").eq("is_active", true)

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase.from("services").select("*").eq("is_active", true)

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  const addOrder = async () => {
    try {
      const { data, error } = await supabase.from("orders").insert([newOrder]).select()

      if (error) throw error

      await fetchOrders()
      setNewOrder({
        user_id: "",
        service_id: "",
        status: "pending",
        notes: "",
      })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error adding order:", error)
      alert("حدث خطأ أثناء إضافة الطلب")
    }
  }

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

      setOrders(orders.map((order) => (order.id === id ? { ...order, status: status as any } : order)))
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("حدث خطأ أثناء تحديث حالة الطلب")
    }
  }

  const deleteOrder = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطلب؟")) return

    try {
      const { error } = await supabase.from("orders").delete().eq("id", id)

      if (error) throw error

      setOrders(orders.filter((order) => order.id !== id))
    } catch (error) {
      console.error("Error deleting order:", error)
      alert("حدث خطأ أثناء حذف الطلب")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "in_progress":
        return <AlertCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "في الانتظار"
      case "in_progress":
        return "قيد التنفيذ"
      case "completed":
        return "مكتمل"
      case "cancelled":
        return "ملغي"
      default:
        return "غير محدد"
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.services?.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.notes?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    inProgress: orders.filter((o) => o.status === "in_progress").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 md:mr-64 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الطلبات</h1>
              <p className="text-gray-600">تتبع ومعالجة طلبات العملاء بكفاءة</p>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة طلب جديد
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة طلب جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="client">العميل</Label>
                    <Select
                      value={newOrder.user_id}
                      onValueChange={(value) => setNewOrder({ ...newOrder, user_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر العميل" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} - {user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="service">الخدمة</Label>
                    <Select
                      value={newOrder.service_id}
                      onValueChange={(value) => setNewOrder({ ...newOrder, service_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الخدمة" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.service_name} - {service.base_price?.toLocaleString()} ج.م
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">الحالة</Label>
                    <Select
                      value={newOrder.status}
                      onValueChange={(value) => setNewOrder({ ...newOrder, status: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">في الانتظار</SelectItem>
                        <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                        <SelectItem value="completed">مكتمل</SelectItem>
                        <SelectItem value="cancelled">ملغي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">ملاحظات</Label>
                    <Textarea
                      id="notes"
                      value={newOrder.notes}
                      onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                      placeholder="أدخل أي ملاحظات إضافية..."
                      rows={3}
                    />
                  </div>

                  <Button onClick={addOrder} className="w-full" disabled={!newOrder.user_id || !newOrder.service_id}>
                    إضافة الطلب
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">إجمالي الطلبات</p>
                    <p className="text-2xl font-bold">{orderStats.total}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">في الانتظار</p>
                    <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">قيد التنفيذ</p>
                    <p className="text-2xl font-bold text-blue-600">{orderStats.inProgress}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">مكتملة</p>
                    <p className="text-2xl font-bold text-green-600">{orderStats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ملغية</p>
                    <p className="text-2xl font-bold text-red-600">{orderStats.cancelled}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
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
                    placeholder="البحث في الطلبات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="pending">في الانتظار</SelectItem>
                    <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                    <SelectItem value="completed">مكتملة</SelectItem>
                    <SelectItem value="cancelled">ملغية</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 ml-2" />
                  تصدير
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="w-12 h-12 bg-gray-200 rounded"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-48"></div>
                          <div className="h-3 bg-gray-200 rounded w-32"></div>
                        </div>
                      </div>
                      <div className="h-6 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {order.services?.service_name || "خدمة غير محددة"}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{order.users?.name || "عميل غير محدد"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(order.created_at).toLocaleDateString("ar-EG")}</span>
                            </div>
                            {order.services?.base_price && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{order.services.base_price.toLocaleString()} ج.م</span>
                              </div>
                            )}
                          </div>
                          {order.notes && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{order.notes}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </Badge>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">في الانتظار</SelectItem>
                              <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                              <SelectItem value="completed">مكتمل</SelectItem>
                              <SelectItem value="cancelled">ملغي</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button variant="ghost" size="sm" onClick={() => deleteOrder(order.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredOrders.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات</h3>
                <p className="text-gray-500">ابدأ بإضافة طلب جديد</p>
              </CardContent>
            </Card>
          )}

          {/* Order Details Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>تفاصيل الطلب</DialogTitle>
              </DialogHeader>
              {selectedOrder && (
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">التفاصيل</TabsTrigger>
                    <TabsTrigger value="files">الملفات</TabsTrigger>
                    <TabsTrigger value="history">السجل</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>رقم الطلب</Label>
                        <p className="text-sm text-gray-600">{selectedOrder.id}</p>
                      </div>
                      <div>
                        <Label>الحالة</Label>
                        <Badge className={`${getStatusColor(selectedOrder.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(selectedOrder.status)}
                          {getStatusLabel(selectedOrder.status)}
                        </Badge>
                      </div>
                      <div>
                        <Label>العميل</Label>
                        <p className="text-sm text-gray-600">{selectedOrder.users?.name}</p>
                        <p className="text-xs text-gray-500">{selectedOrder.users?.email}</p>
                      </div>
                      <div>
                        <Label>الخدمة</Label>
                        <p className="text-sm text-gray-600">{selectedOrder.services?.service_name}</p>
                        {selectedOrder.services?.base_price && (
                          <p className="text-xs text-gray-500">
                            {selectedOrder.services.base_price.toLocaleString()} ج.م
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>تاريخ الإنشاء</Label>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedOrder.created_at).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                      <div>
                        <Label>آخر تحديث</Label>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedOrder.updated_at).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                    </div>

                    {selectedOrder.notes && (
                      <div>
                        <Label>الملاحظات</Label>
                        <div className="bg-gray-50 p-3 rounded-lg mt-1">
                          <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                        </div>
                      </div>
                    )}

                    {selectedOrder.services?.description && (
                      <div>
                        <Label>وصف الخدمة</Label>
                        <div className="bg-blue-50 p-3 rounded-lg mt-1">
                          <p className="text-sm text-gray-700">{selectedOrder.services.description}</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="files">
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>سيتم عرض ملفات الطلب هنا</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="history">
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>سيتم عرض سجل تغييرات الطلب هنا</p>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}
