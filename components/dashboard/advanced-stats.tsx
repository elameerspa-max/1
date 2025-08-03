"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Users, ShoppingCart, DollarSign, TrendingUp, Target, Clock, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface AdvancedStats {
  totalClients: number
  activeOrders: number
  totalRevenue: number
  completedCampaigns: number
  pendingTasks: number
  completionRate: number
  monthlyGrowth: number
  clientSatisfaction: number
}

export function AdvancedStats() {
  const [stats, setStats] = useState<AdvancedStats>({
    totalClients: 0,
    activeOrders: 0,
    totalRevenue: 0,
    completedCampaigns: 0,
    pendingTasks: 0,
    completionRate: 0,
    monthlyGrowth: 0,
    clientSatisfaction: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdvancedStats()
  }, [])

  async function fetchAdvancedStats() {
    try {
      // Fetch comprehensive statistics
      const [clientsResult, ordersResult, invoicesResult, campaignsResult, tasksResult, reviewsResult] =
        await Promise.all([
          supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "client"),
          supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["pending", "in_progress"]),
          supabase.from("invoices").select("amount").eq("status", "paid"),
          supabase.from("campaigns").select("*", { count: "exact", head: true }).eq("status", "completed"),
          supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "to_do"),
          supabase.from("client_reviews").select("rating"),
        ])

      const totalRevenue = invoicesResult.data?.reduce((sum, invoice) => sum + (invoice.amount || 0), 0) || 0
      const avgRating = reviewsResult.data?.length
        ? reviewsResult.data.reduce((sum, review) => sum + review.rating, 0) / reviewsResult.data.length
        : 0

      // Calculate completion rate
      const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true })

      const { count: completedOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed")

      const completionRate = totalOrders ? ((completedOrders || 0) / totalOrders) * 100 : 0

      setStats({
        totalClients: clientsResult.count || 0,
        activeOrders: ordersResult.count || 0,
        totalRevenue,
        completedCampaigns: campaignsResult.count || 0,
        pendingTasks: tasksResult.count || 0,
        completionRate,
        monthlyGrowth: 12.5, // This would be calculated from historical data
        clientSatisfaction: avgRating * 20, // Convert 5-star to percentage
      })
    } catch (error) {
      console.error("Error fetching advanced stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    {
      title: "إجمالي العملاء",
      value: stats.totalClients,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+8.2%",
      changeType: "positive" as const,
    },
    {
      title: "الطلبات النشطة",
      value: stats.activeOrders,
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+15.3%",
      changeType: "positive" as const,
    },
    {
      title: "إجمالي الإيرادات",
      value: `${stats.totalRevenue.toLocaleString()} ج.م`,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      change: `+${stats.monthlyGrowth}%`,
      changeType: "positive" as const,
    },
    {
      title: "الحملات المكتملة",
      value: stats.completedCampaigns,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "+22.1%",
      changeType: "positive" as const,
    },
  ]

  const progressCards = [
    {
      title: "معدل الإنجاز",
      value: stats.completionRate,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "رضا العملاء",
      value: stats.clientSatisfaction,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "المهام المعلقة",
      value: stats.pendingTasks,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      isCount: true,
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{card.value}</div>
              <Badge variant={card.changeType === "positive" ? "default" : "destructive"} className="text-xs">
                {card.change} من الشهر الماضي
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {progressCards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{card.isCount ? card.value : `${card.value.toFixed(1)}%`}</div>
              {!card.isCount && <Progress value={card.value} className="h-2" />}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
