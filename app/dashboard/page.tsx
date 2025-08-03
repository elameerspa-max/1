"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { AdvancedStats } from "@/components/dashboard/advanced-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

const monthlyData = [
  { month: "يناير", revenue: 45000, orders: 12 },
  { month: "فبراير", revenue: 52000, orders: 15 },
  { month: "مارس", revenue: 48000, orders: 13 },
  { month: "أبريل", revenue: 61000, orders: 18 },
  { month: "مايو", revenue: 55000, orders: 16 },
  { month: "يونيو", revenue: 67000, orders: 20 },
]

export default function Dashboard() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 md:mr-64 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة التحكم الرئيسية</h1>
            <p className="text-gray-600">مرحباً بك في منصة EhabGM لإدارة الأعمال الذكية</p>
          </div>

          {/* Stats Cards */}
          <AdvancedStats />

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>الإيرادات الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Orders Chart */}
            <Card>
              <CardHeader>
                <CardTitle>عدد الطلبات الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </main>
    </div>
  )
}
