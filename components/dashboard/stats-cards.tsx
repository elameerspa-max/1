"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, ShoppingCart, DollarSign, TrendingUp, Target, Clock, CheckCircle, AlertCircle, Calendar, Zap } from 'lucide-react'
import { supabase, formatCurrency } from "@/lib/supabase"

interface StatsData {
  totalClients: number
  activeOrders: number
  totalRevenue: number
  completedOrders: number
  pendingTasks: number
  completionRate: number
  monthlyGrowth: number
  clientSatisfaction: number
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsData>({
    totalClients: 0,
    activeOrders: 0,
    totalRevenue: 0,
    completedOrders: 0,
    pendingTasks: 0,
    completionRate: 0,
    monthlyGrowth: 0,
    clientSatisfaction: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      // جلب إحصائيات العملاء
      const { count: clientsCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("role", "client")
        .eq("is_active", true)

      // جلب الطلبات النشطة
      const { count: activeOrdersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "in_progress"])

      // جلب الطلبات المكتملة
      const { count: completedOrdersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed")

      // جلب إجمالي الإيرادات
      const { data: paidInvoices } = await supabase
        .from("invoices")
        .select("total_amount")
        .eq("status", "paid")

      const totalRevenue = paidInvoices?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0

      // جلب المهام المعلقة
      const { count: pendingTasksCount } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "todo")

      // حساب معدل الإنجاز
      const { count: totalOrdersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })

      const completionRate = totalOrdersCount ? ((completedOrdersCount || 0) / totalOrdersCount) * 100 : 0

      setStats({
        totalClients: clientsCount || 0,
        activeOrders: activeOrdersCount || 0,
        totalRevenue,
        completedOrders: completedOrdersCount || 0,
        pendingTasks: pendingTasksCount || 0,
        completionRate,
        monthlyGrowth: 12.5, // يمكن حسابه من البيانات التاريخية
        clientSatisfaction: 95, // يمكن حسابه من تقييمات العملاء
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const mainCards = [
    {
      title: "إجمالي العملاء",
      value: stats.totalClients,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      change: "+8.2%",
      changeType: "positive" as const,
      description: "عملاء نشطون",
    },
    {
      title: "الطلبات النشطة",
      value: stats.activeOrders,
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      change: "+15.3%",
      changeType: "positive" as const,
      description: "قيد التنفيذ",
    },
    {
      title: "إجمالي الإيرادات",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      change: `+${stats.monthlyGrowth}%`,
      changeType: "positive" as const,
      description: "هذا الشهر",
    },
    {
      title: "الطلبات المكتملة",
      value: stats.completedOrders,
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      change: "+22.1%",
      changeType: "positive" as const,
      description: "تم إنجازها",
    },
  ]

  const progressCards = [
    {
      title: "معدل الإنجاز",
      value: stats.completionRate,
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      isPercentage: true,
    },
    {
      title: "رضا العملاء",
      value: stats.clientSatisfaction,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      isPercentage: true,
    },
    {
      title: "المهام المعلقة",
      value: stats.pendingTasks,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      isCount: true,
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* البطاقات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainCards.map((card, index) => (
          <Card key={index} className={`hover:shadow-lg transition-all duration-300 border-2 ${card.borderColor} bg-gradient-to-br from-white to-gray-50`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">{card.title}</CardTitle>
              <div className={`p-3 rounded-xl ${card.bgColor} border ${card.borderColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">{card.value}</div>
              <div className="flex items-center justify-between">
                <Badge 
                  variant={card.changeType === "positive" ? "default" : "destructive"} 
                  className="text-xs bg-green-100 text-green-800 hover:bg-green-200"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {card.change}
                </Badge>
                <span className="text-xs text-gray-500">{card.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* بطاقات التقدم */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {progressCards.map((card, index) => (
          <Card key={index} className={`hover:shadow-lg transition-all duration-300 border-2 ${card.borderColor} bg-gradient-to-br from-white to-gray-50`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">{card.title}</CardTitle>
              <div className={`p-3 rounded-xl ${card.bgColor} border ${card.borderColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-3">
                {card.isCount ? card.value : `${card.value.toFixed(1)}%`}
              </div>
              {!card.isCount && (
                <div className="space-y-2">
                  <Progress 
                    value={card.value} 
                    className="h-2" 
                    style={{
                      background: `linear-gradient(to right, ${card.color.replace('text-', 'bg-').replace('-600', '-200')} 0%, ${card.color.replace('text-', 'bg-').replace('-600', '-500')} 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}
              {card.isCount && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>تحتاج متابعة</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* بطاقة إضافية للتحليلات السريعة */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Zap className="h-5 w-5" />
            تحليلات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {((stats.completedOrders / (stats.totalClients || 1)) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">معدل تحويل العملاء</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatCurrency(stats.totalRevenue / (stats.completedOrders || 1))}
              </div>
              <p className="text-sm text-gray-600">متوسط قيمة الطلب</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {Math.round((stats.totalRevenue / (stats.totalClients || 1)))}
              </div>
              <p className="text-sm text-gray-600">متوسط إيراد العميل</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
