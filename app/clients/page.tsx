"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageSquare,
  Edit,
  Trash2,
  Eye,
  Download,
  UserPlus,
  Star,
  Calendar,
  DollarSign,
} from "lucide-react"
import { supabase, type User } from "@/lib/supabase"

interface ClientWithStats extends User {
  orders_count?: number
  total_spent?: number
  last_order_date?: string
  satisfaction_rating?: number
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientWithStats | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone_number: "",
    whatsapp_number: "",
    role: "client" as const,
    is_active: true,
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(`
          *,
          orders!inner(
            id,
            created_at,
            invoices(amount)
          )
        `)
        .eq("role", "client")
        .order("created_at", { ascending: false })

      if (error) throw error

      // Process client data with stats
      const clientsWithStats =
        data?.map((client) => {
          const orders = client.orders || []
          const totalSpent = orders.reduce((sum: number, order: any) => {
            const invoiceAmount =
              order.invoices?.reduce((invSum: number, inv: any) => invSum + (inv.amount || 0), 0) || 0
            return sum + invoiceAmount
          }, 0)

          const lastOrderDate =
            orders.length > 0 ? new Date(Math.max(...orders.map((o: any) => new Date(o.created_at).getTime()))) : null

          return {
            ...client,
            orders_count: orders.length,
            total_spent: totalSpent,
            last_order_date: lastOrderDate?.toISOString(),
            satisfaction_rating: Math.random() * 2 + 3, // Mock rating between 3-5
          }
        }) || []

      setClients(clientsWithStats)
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setLoading(false)
    }
  }

  const addClient = async () => {
    try {
      const { data, error } = await supabase.from("users").insert([newClient]).select()

      if (error) throw error

      await fetchClients()
      setNewClient({
        name: "",
        email: "",
        phone_number: "",
        whatsapp_number: "",
        role: "client",
        is_active: true,
      })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error adding client:", error)
      alert("حدث خطأ أثناء إضافة العميل")
    }
  }

  const deleteClient = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العميل؟")) return

    try {
      const { error } = await supabase.from("users").delete().eq("id", id)

      if (error) throw error

      setClients(clients.filter((client) => client.id !== id))
    } catch (error) {
      console.error("Error deleting client:", error)
      alert("حدث خطأ أثناء حذف العميل")
    }
  }

  const toggleClientStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("users").update({ is_active: !currentStatus }).eq("id", id)

      if (error) throw error

      setClients(clients.map((client) => (client.id === id ? { ...client, is_active: !currentStatus } : client)))
    } catch (error) {
      console.error("Error updating client status:", error)
      alert("حدث خطأ أثناء تحديث حالة العميل")
    }
  }

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone_number?.includes(searchTerm)

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && client.is_active) ||
      (statusFilter === "inactive" && !client.is_active)

    return matchesSearch && matchesStatus
  })

  const clientStats = {
    total: clients.length,
    active: clients.filter((c) => c.is_active).length,
    inactive: clients.filter((c) => !c.is_active).length,
    totalRevenue: clients.reduce((sum, c) => sum + (c.total_spent || 0), 0),
  }

  const getInitials = (name?: string) => {
    if (!name) return "؟"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  const getRatingStars = (rating?: number) => {
    if (!rating) return "غير مقيم"
    return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating))
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 md:mr-64 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة العملاء</h1>
              <p className="text-gray-600">إدارة شاملة لقاعدة العملاء وتتبع أنشطتهم</p>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة عميل جديد
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة عميل جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <Input
                      id="name"
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      placeholder="أدخل اسم العميل"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      placeholder="example@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      value={newClient.phone_number}
                      onChange={(e) => setNewClient({ ...newClient, phone_number: e.target.value })}
                      placeholder="+20 123 456 7890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">رقم الواتساب</Label>
                    <Input
                      id="whatsapp"
                      value={newClient.whatsapp_number}
                      onChange={(e) => setNewClient({ ...newClient, whatsapp_number: e.target.value })}
                      placeholder="+20 123 456 7890"
                    />
                  </div>
                  <Button onClick={addClient} className="w-full" disabled={!newClient.name}>
                    إضافة العميل
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">إجمالي العملاء</p>
                    <p className="text-2xl font-bold">{clientStats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">العملاء النشطين</p>
                    <p className="text-2xl font-bold text-green-600">{clientStats.active}</p>
                  </div>
                  <UserPlus className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">العملاء غير النشطين</p>
                    <p className="text-2xl font-bold text-red-600">{clientStats.inactive}</p>
                  </div>
                  <Users className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                    <p className="text-2xl font-bold">{clientStats.totalRevenue.toLocaleString()} ج.م</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-500" />
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
                    placeholder="البحث في العملاء..."
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
                    <SelectItem value="all">جميع العملاء</SelectItem>
                    <SelectItem value="active">العملاء النشطين</SelectItem>
                    <SelectItem value="inactive">العملاء غير النشطين</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 ml-2" />
                  تصدير
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Clients List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client) => (
                <Card key={client.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                            {getInitials(client.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">{client.name || "بدون اسم"}</h3>
                          <p className="text-sm text-gray-500">{client.email}</p>
                        </div>
                      </div>
                      <Badge variant={client.is_active ? "default" : "secondary"}>
                        {client.is_active ? "نشط" : "غير نشط"}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      {client.phone_number && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{client.phone_number}</span>
                        </div>
                      )}
                      {client.whatsapp_number && (
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>{client.whatsapp_number}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-lg font-bold text-blue-600">{client.orders_count || 0}</p>
                        <p className="text-xs text-gray-600">طلب</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-lg font-bold text-green-600">{(client.total_spent || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-600">ج.م</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>التقييم: {getRatingStars(client.satisfaction_rating)}</span>
                      {client.last_order_date && (
                        <span>آخر طلب: {new Date(client.last_order_date).toLocaleDateString("ar-EG")}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedClient(client)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleClientStatus(client.id, client.is_active)}
                        >
                          {client.is_active ? "إلغاء التفعيل" : "تفعيل"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteClient(client.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredClients.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد عملاء</h3>
                <p className="text-gray-500">ابدأ بإضافة عميل جديد</p>
              </CardContent>
            </Card>
          )}

          {/* Client Details Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>تفاصيل العميل</DialogTitle>
              </DialogHeader>
              {selectedClient && (
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="info">المعلومات الأساسية</TabsTrigger>
                    <TabsTrigger value="orders">الطلبات</TabsTrigger>
                    <TabsTrigger value="activity">النشاط</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-4">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-medium text-lg">
                          {getInitials(selectedClient.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{selectedClient.name}</h3>
                        <p className="text-gray-500">{selectedClient.email}</p>
                        <Badge variant={selectedClient.is_active ? "default" : "secondary"}>
                          {selectedClient.is_active ? "نشط" : "غير نشط"}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>رقم الهاتف</Label>
                        <p className="text-sm text-gray-600">{selectedClient.phone_number || "غير محدد"}</p>
                      </div>
                      <div>
                        <Label>رقم الواتساب</Label>
                        <p className="text-sm text-gray-600">{selectedClient.whatsapp_number || "غير محدد"}</p>
                      </div>
                      <div>
                        <Label>تاريخ التسجيل</Label>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedClient.created_at).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                      <div>
                        <Label>آخر تحديث</Label>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedClient.updated_at).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{selectedClient.orders_count || 0}</p>
                        <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {(selectedClient.total_spent || 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">إجمالي الإنفاق (ج.م)</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                          {selectedClient.satisfaction_rating?.toFixed(1) || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">تقييم الرضا</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="orders">
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>سيتم عرض طلبات العميل هنا</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="activity">
                    <div className="text-center py-8 text-gray-500">
                      <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>سيتم عرض نشاط العميل هنا</p>
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
