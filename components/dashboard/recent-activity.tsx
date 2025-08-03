"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, User, ShoppingCart, FileText, CheckCircle, AlertCircle, Eye, ArrowLeft, Calendar, DollarSign, MessageSquare, Bell } from 'lucide-react'
import { supabase, formatCurrency, getRelativeTime } from "@/lib/supabase"

interface ActivityItem {
  id: string
  type: "order" | "invoice" | "task" | "message"
  title: string
  description: string
  user_name?: string
  amount?: number
  status?: string
  created_at: string
  action_url?: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  async function fetchRecentActivity() {
    try {
      const activities: ActivityItem[] = []

      // جلب الطلبات الحديثة
      const { data: orders } = await supabase
        .from("orders")
        .select(`
          id,
          status,
          total_amount,
          created_at,
          users!inner(name),
          services!inner(service_name)
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      orders?.forEach(order => {
        activities.push({
          id: order.id,
          type: "order",
          title: `طلب جديد: ${order.services?.service_name}`,
          description: `من العميل ${order.users?.name}`,
          user_name: order.users?.name,
          amount: order.total_amount,
          status: order.status,
          created_at: order.created_at,
          action_url: `/orders`
        })
      })

      // جلب الفواتير الحديثة
      const { data: invoices } = await supabase
        .from("invoices")
        .select(`
          id,
          invoice_number,
          total_amount,
          status,
          created_at,
          orders!inner(
            users!inner(name)
          )
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      invoices?.forEach(invoice => {
        activities.push({
          id: invoice.id,
          type: "invoice",
          title: `فاتورة جديدة: ${invoice.invoice_number}`,
          description: `للعميل ${invoice.orders?.users?.name}`,
          user_name: invoice.orders?.users?.name,
          amount: invoice.total_amount,
          status: invoice.status,
          created_at: invoice.created_at,
          action_url: `/invoices`
        })
      })

      // جلب المهام الحديثة
      const { data: tasks } = await supabase
        .from("tasks")
        .select(`
          id,
          title,
          status,
          created_at,
          orders!inner(
            users!inner(name)
          )
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      tasks?.forEach(task => {
        activities.push({
          id: task.id,
          type: "task",
          title: `مهمة جديدة: ${task.title}`,
          description: `للعميل ${task.orders?.users?.name}`,
          user_name: task.orders?.users?.name,
          status: task.status,
          created_at: task.created_at,
          action_url: `/tasks`
        })
      })

      // ترتيب الأنشطة حسب التاريخ
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setActivities(activities.slice(0, 10))

    } catch (error) {
      console.error("Error fetching recent activity:", error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-4 w-4" />
      case "invoice":
        return <FileText className="h-4 w-4" />
      case "task":
        return <CheckCircle className="h-4 w-4" />
      case "message":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "order":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "invoice":
        return "text-green-600 bg-green-50 border-green-200"
      case "task":
        return "text-purple-600 bg-purple-50 border-purple-200"
      case "message":
        return "text-orange-600 bg-orange-50 border-orange-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusBadge = (status?: string, type?: string) => {
    if (!status) return null

    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: "في الانتظار", color: "bg-yellow-100 text-yellow-800" },
      in_progress: { label: "قيد التنفيذ", color: "bg-blue-100 text-blue-800" },
      completed: { label: "مكتمل", color: "bg-green-100 text-green-800" },
      cancelled: { label: "ملغي", color: "bg-red-100 text-red-800" },
      draft: { label: "مسودة", color: "bg-gray-100 text-gray-800" },
      sent: { label: "مرسلة", color: "bg-blue-100 text-blue-800" },
      paid: { label: "مدفوعة", color: "bg-green-100 text-green-800" },
      overdue: { label: "متأخرة", color: "bg-red-100 text-red-800" },
      todo: { label: "للقيام", color: "bg-yellow-100 text-yellow-800" },
      review: { label: "مراجعة", color: "bg-purple-100 text-purple-800" },
      done: { label: "منجز", color: "bg-green-100 text-green-800" },
    }

    const statusInfo = statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800" }

    return (
      <Badge className={`text-xs ${statusInfo.color}`}>
        {statusInfo.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            النشاط الحديث
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-gray-900">النشاط الحديث</span>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {activities.length} عنصر
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد نشاط حديث</h3>
            <p className="text-gray-500">ستظهر الأنشطة الجديدة هنا</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activities.map((activity, index) => (
              <div key={`${activity.type}-${activity.id}-${index}`} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg border ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {activity.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {activity.description}
                        </p>
                      </div>
                      {activity.status && getStatusBadge(activity.status, activity.type)}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {activity.user_name && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{activity.user_name}</span>
                          </div>
                        )}
                        {activity.amount && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{formatCurrency(activity.amount)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{getRelativeTime(activity.created_at)}</span>
                        </div>
                      </div>

                      {activity.action_url && (
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          <Eye className="h-3 w-3 ml-1" />
                          عرض
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activities.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <Button variant="ghost" className="w-full text-sm text-gray-600 hover:text-gray-900">
              عرض جميع الأنشطة
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
