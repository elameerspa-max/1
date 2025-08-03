"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Plus, Filter, Eye, Edit, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface OrderWithDetails {
  id: string
  status: string
  notes?: string
  created_at: string
  updated_at: string
  users: { name: string; email: string } | null
  services: { service_name: string; base_price: number } | null
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          status,
          notes,
          created_at,
          updated_at,
          users!inner(name, email),
          services!inner(service_name, base_price)
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

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "قيد الانتظار", variant: "secondary" as const },
      in_progress: { label: "قيد التنفيذ", variant: "default" as const },
      completed: { label: "مكتمل", variant: "default" as const },
      cancelled: { label: "ملغي", variant: "destructive" as const },
    }

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: "outline" as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const filteredOrders = statusFilter === "all" ? orders : orders.filter((order) => order.status === statusFilter)

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 md:mr-64 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الطلبات</h1>
              <p className="text-gray-600">متابعة وإدارة جميع طلبات العملاء</p>
            </div>

            <Button>
              <Plus className="h-4 w-4 ml-2" />
              طلب جديد
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الطلبات</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
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
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
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
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <ShoppingCart className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{order.services?.service_name || "خدمة غير محددة"}</h3>
                          <p className="text-gray-600">العميل: {order.users?.name || "غير محدد"}</p>
                          <p className="text-sm text-gray-500">
                            تاريخ الطلب: {new Date(order.created_at).toLocaleDateString("ar-EG")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <p className="font-semibold text-lg">
                            {order.services?.base_price ? `${order.services.base_price} ج.م` : "غير محدد"}
                          </p>
                          {getStatusBadge(order.status)}
                        </div>

                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{order.notes}</p>
                      </div>
                    )}
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
                <p className="text-gray-500">لم يتم العثور على طلبات تطابق المرشحات المحددة</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
