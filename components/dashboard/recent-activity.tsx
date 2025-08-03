"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"

interface Activity {
  id: string
  type: string
  description: string
  created_at: string
  user_name?: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  async function fetchRecentActivity() {
    try {
      // Fetch recent orders with user info
      const { data: orders } = await supabase
        .from("orders")
        .select(`
          id,
          status,
          created_at,
          users!inner(name)
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      // Fetch recent campaigns
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select(`
          id,
          status,
          created_at,
          orders!inner(users!inner(name))
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      // Combine and format activities
      const formattedActivities: Activity[] = []

      orders?.forEach((order) => {
        formattedActivities.push({
          id: order.id,
          type: "order",
          description: `طلب جديد من ${order.users?.name || "عميل غير محدد"}`,
          created_at: order.created_at,
          user_name: order.users?.name,
        })
      })

      campaigns?.forEach((campaign) => {
        formattedActivities.push({
          id: campaign.id,
          type: "campaign",
          description: `حملة إعلانية جديدة لـ ${campaign.orders?.users?.name || "عميل غير محدد"}`,
          created_at: campaign.created_at,
          user_name: campaign.orders?.users?.name,
        })
      })

      // Sort by date and take latest 10
      formattedActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setActivities(formattedActivities.slice(0, 10))
    } catch (error) {
      console.error("Error fetching recent activity:", error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "order":
        return <Badge variant="default">طلب</Badge>
      case "campaign":
        return <Badge variant="secondary">حملة</Badge>
      default:
        return <Badge variant="outline">نشاط</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>النشاط الأخير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-12 h-4 bg-gray-200 rounded"></div>
                <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>النشاط الأخير</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-4">لا توجد أنشطة حديثة</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getActivityBadge(activity.type)}
                  <span className="text-sm">{activity.description}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(activity.created_at), {
                    addSuffix: true,
                    locale: ar,
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
