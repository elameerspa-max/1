"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingCart, DollarSign, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Stats {
  totalClients: number
  activeOrders: number
  totalRevenue: number
  completedCampaigns: number
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    activeOrders: 0,
    totalRevenue: 0,
    completedCampaigns: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      // Fetch total clients
      const { count: clientsCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("role", "client")

      // Fetch active orders
      const { count: ordersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "in_progress"])

      // Fetch total revenue from paid invoices
      const { data: invoices } = await supabase.from("invoices").select("amount").eq("status", "paid")

      const totalRevenue = invoices?.reduce((sum, invoice) => sum + (invoice.amount || 0), 0) || 0

      // Fetch completed campaigns
      const { count: campaignsCount } = await supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed")

      setStats({
        totalClients: clientsCount || 0,
        activeOrders: ordersCount || 0,
        totalRevenue,
        completedCampaigns: campaignsCount || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
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
    },
    {
      title: "الطلبات النشطة",
      value: stats.activeOrders,
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "إجمالي الإيرادات",
      value: `${stats.totalRevenue.toLocaleString()} ج.م`,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "الحملات المكتملة",
      value: stats.completedCampaigns,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  if (loading) {
    return (
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
    )
  }

  return (
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
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
