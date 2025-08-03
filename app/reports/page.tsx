"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Download, TrendingUp, Users, DollarSign, Target } from "lucide-react"
import { supabase } from "@/lib/supabase"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import { generateContent } from "@/lib/ai-services"

interface ReportData {
  monthlyRevenue: Array<{ month: string; revenue: number; orders: number }>
  clientsGrowth: Array<{ month: string; clients: number }>
  serviceDistribution: Array<{ name: string; value: number; color: string }>
  campaignPerformance: Array<{ platform: string; campaigns: number; budget: number; roi: number }>
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    monthlyRevenue: [],
    clientsGrowth: [],
    serviceDistribution: [],
    campaignPerformance: [],
  })
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [aiInsights, setAiInsights] = useState("")
  const [generatingInsights, setGeneratingInsights] = useState(false)

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod])

  const fetchReportData = async () => {
    try {
      // Fetch monthly revenue data
      const { data: invoices } = await supabase
        .from("invoices")
        .select("amount, issue_date, status")
        .eq("status", "paid")
        .gte("issue_date", getDateRange())

      // Fetch orders data
      const { data: orders } = await supabase
        .from("orders")
        .select("created_at, services!inner(service_name)")
        .gte("created_at", getDateRange())

      // Fetch clients data
      const { data: clients } = await supabase
        .from("users")
        .select("created_at")
        .eq("role", "client")
        .gte("created_at", getDateRange())

      // Fetch campaigns data
      const { data: campaigns } = await supabase.from("campaigns").select("platform, budget, status")

      // Process data for charts
      const monthlyRevenue = processMonthlyRevenue(invoices || [], orders || [])
      const clientsGrowth = processClientsGrowth(clients || [])
      const serviceDistribution = processServiceDistribution(orders || [])
      const campaignPerformance = processCampaignPerformance(campaigns || [])

      setReportData({
        monthlyRevenue,
        clientsGrowth,
        serviceDistribution,
        campaignPerformance,
      })
    } catch (error) {
      console.error("Error fetching report data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDateRange = () => {
    const now = new Date()
    const months = selectedPeriod === "3months" ? 3 : selectedPeriod === "6months" ? 6 : 12
    const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1)
    return startDate.toISOString()
  }

  const processMonthlyRevenue = (invoices: any[], orders: any[]) => {
    const monthlyData: { [key: string]: { revenue: number; orders: number } } = {}

    // Process invoices for revenue
    invoices.forEach((invoice) => {
      const month = new Date(invoice.issue_date).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
      })
      if (!monthlyData[month]) monthlyData[month] = { revenue: 0, orders: 0 }
      monthlyData[month].revenue += invoice.amount
    })

    // Process orders for count
    orders.forEach((order) => {
      const month = new Date(order.created_at).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
      })
      if (!monthlyData[month]) monthlyData[month] = { revenue: 0, orders: 0 }
      monthlyData[month].orders += 1
    })

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      orders: data.orders,
    }))
  }

  const processClientsGrowth = (clients: any[]) => {
    const monthlyClients: { [key: string]: number } = {}

    clients.forEach((client) => {
      const month = new Date(client.created_at).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
      })
      monthlyClients[month] = (monthlyClients[month] || 0) + 1
    })

    return Object.entries(monthlyClients).map(([month, clients]) => ({
      month,
      clients,
    }))
  }

  const processServiceDistribution = (orders: any[]) => {
    const serviceCount: { [key: string]: number } = {}

    orders.forEach((order) => {
      const serviceName = order.services?.service_name || "خدمة غير محددة"
      serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1
    })

    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

    return Object.entries(serviceCount).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }))
  }

  const processCampaignPerformance = (campaigns: any[]) => {
    const platformData: { [key: string]: { campaigns: number; budget: number } } = {}

    campaigns.forEach((campaign) => {
      const platform = campaign.platform || "غير محدد"
      if (!platformData[platform]) platformData[platform] = { campaigns: 0, budget: 0 }
      platformData[platform].campaigns += 1
      platformData[platform].budget += campaign.budget || 0
    })

    return Object.entries(platformData).map(([platform, data]) => ({
      platform,
      campaigns: data.campaigns,
      budget: data.budget,
      roi: Math.random() * 200 + 50, // Mock ROI data
    }))
  }

  const generateAIInsights = async () => {
    setGeneratingInsights(true)
    try {
      const prompt = `
        قم بتحليل البيانات التالية وقدم رؤى ذكية وتوصيات:
        
        الإيرادات الشهرية: ${JSON.stringify(reportData.monthlyRevenue)}
        نمو العملاء: ${JSON.stringify(reportData.clientsGrowth)}
        توزيع الخدمات: ${JSON.stringify(reportData.serviceDistribution)}
        أداء الحملات: ${JSON.stringify(reportData.campaignPerformance)}
        
        يرجى تقديم:
        1. تحليل الاتجاهات الحالية
        2. نقاط القوة والضعف
        3. توصيات للتحسين
        4. فرص النمو المحتملة
      `

      const insights = await generateContent(prompt, "report")
      setAiInsights(insights)
    } catch (error) {
      console.error("Error generating AI insights:", error)
      setAiInsights("حدث خطأ أثناء توليد التحليل الذكي")
    } finally {
      setGeneratingInsights(false)
    }
  }

  const exportReport = () => {
    // Mock export functionality
    const reportContent = `
تقرير الأداء - ${new Date().toLocaleDateString("ar-EG")}

الإيرادات الشهرية:
${reportData.monthlyRevenue.map((item) => `${item.month}: ${item.revenue} ج.م`).join("\n")}

نمو العملاء:
${reportData.clientsGrowth.map((item) => `${item.month}: ${item.clients} عميل جديد`).join("\n")}

${aiInsights ? `\nالتحليل الذكي:\n${aiInsights}` : ""}
    `

    const element = document.createElement("a")
    const file = new Blob([reportContent], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `report-${Date.now()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 md:mr-64 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">التقارير والتحليلات</h1>
              <p className="text-gray-600">تحليلات شاملة لأداء الأعمال والعملاء</p>
            </div>

            <div className="flex items-center gap-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">آخر 3 أشهر</SelectItem>
                  <SelectItem value="6months">آخر 6 أشهر</SelectItem>
                  <SelectItem value="12months">آخر 12 شهر</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={exportReport}>
                <Download className="h-4 w-4 ml-2" />
                تصدير التقرير
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="revenue">الإيرادات</TabsTrigger>
              <TabsTrigger value="clients">العملاء</TabsTrigger>
              <TabsTrigger value="campaigns">الحملات</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                        <p className="text-2xl font-bold">
                          {reportData.monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()} ج.م
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">إجمالي الطلبات</p>
                        <p className="text-2xl font-bold">
                          {reportData.monthlyRevenue.reduce((sum, item) => sum + item.orders, 0)}
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">العملاء الجدد</p>
                        <p className="text-2xl font-bold">
                          {reportData.clientsGrowth.reduce((sum, item) => sum + item.clients, 0)}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">الحملات النشطة</p>
                        <p className="text-2xl font-bold">
                          {reportData.campaignPerformance.reduce((sum, item) => sum + item.campaigns, 0)}
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>الإيرادات الشهرية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={reportData.monthlyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>توزيع الخدمات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={reportData.serviceDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {reportData.serviceDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* AI Insights */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      التحليل الذكي والتوصيات
                      <Badge variant="secondary">AI</Badge>
                    </CardTitle>
                    <Button onClick={generateAIInsights} disabled={generatingInsights} variant="outline">
                      {generatingInsights ? "جاري التحليل..." : "🤖 توليد تحليل ذكي"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {aiInsights ? (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">{aiInsights}</pre>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>اضغط على "توليد تحليل ذكي" للحصول على رؤى مدعومة بالذكاء الاصطناعي</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>تحليل الإيرادات التفصيلي</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={reportData.monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clients" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>نمو قاعدة العملاء</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={reportData.clientsGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="clients" stroke="#8b5cf6" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>أداء الحملات حسب المنصة</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={reportData.campaignPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="platform" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="campaigns" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
