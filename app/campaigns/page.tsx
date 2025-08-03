"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Megaphone, Plus, Search, Eye, Edit, Play, Pause, BarChart3, DollarSign, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { generateContent } from "@/lib/ai-services"

interface CampaignWithDetails {
  id: string
  platform?: string
  budget?: number
  start_date?: string
  end_date?: string
  status: string
  goals?: string
  audience?: any
  created_at: string
  orders: {
    users: { name: string; email: string } | null
    services: { service_name: string } | null
  } | null
}

interface Client {
  id: string
  name: string
  email: string
}

interface Service {
  id: string
  service_name: string
  base_price: number
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignWithDetails[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const [newCampaign, setNewCampaign] = useState({
    client_id: "",
    service_id: "",
    platform: "",
    budget: "",
    goals: "",
    audience_description: "",
    start_date: "",
    end_date: "",
  })

  useEffect(() => {
    fetchCampaigns()
    fetchClients()
    fetchServices()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select(`
          id,
          platform,
          budget,
          start_date,
          end_date,
          status,
          goals,
          audience,
          created_at,
          orders!inner(
            users!inner(name, email),
            services!inner(service_name)
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setCampaigns(data || [])
    } catch (error) {
      console.error("Error fetching campaigns:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase.from("users").select("id, name, email").eq("role", "client")

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("id, service_name, base_price")
        .eq("is_active", true)

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  const generateCampaignContent = async () => {
    if (!newCampaign.goals || !newCampaign.platform) return

    setIsGenerating(true)
    try {
      const prompt = `
        أنشئ محتوى حملة إعلانية احترافية للمنصة ${newCampaign.platform}
        الهدف: ${newCampaign.goals}
        الجمهور المستهدف: ${newCampaign.audience_description}
        
        يرجى تقديم:
        1. عنوان جذاب للحملة
        2. نص إعلاني مؤثر
        3. اقتراحات للاستهداف
        4. نصائح لتحسين الأداء
      `

      const content = await generateContent(prompt, "campaign")

      // Update the goals field with AI-generated content
      setNewCampaign((prev) => ({
        ...prev,
        goals: content,
      }))
    } catch (error) {
      console.error("Error generating campaign content:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const createCampaign = async () => {
    try {
      // First create an order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: newCampaign.client_id,
            service_id: newCampaign.service_id,
            status: "pending",
            notes: `حملة إعلانية على ${newCampaign.platform}`,
          },
        ])
        .select()

      if (orderError) throw orderError

      // Then create the campaign
      const { data: campaignData, error: campaignError } = await supabase
        .from("campaigns")
        .insert([
          {
            order_id: orderData[0].id,
            platform: newCampaign.platform,
            budget: Number.parseFloat(newCampaign.budget) || null,
            start_date: newCampaign.start_date || null,
            end_date: newCampaign.end_date || null,
            goals: newCampaign.goals,
            audience: { description: newCampaign.audience_description },
            status: "draft",
          },
        ])
        .select()

      if (campaignError) throw campaignError

      await fetchCampaigns()
      setNewCampaign({
        client_id: "",
        service_id: "",
        platform: "",
        budget: "",
        goals: "",
        audience_description: "",
        start_date: "",
        end_date: "",
      })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error creating campaign:", error)
      alert("حدث خطأ أثناء إنشاء الحملة")
    }
  }

  const updateCampaignStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("campaigns").update({ status }).eq("id", id)

      if (error) throw error

      setCampaigns(campaigns.map((campaign) => (campaign.id === id ? { ...campaign, status } : campaign)))
    } catch (error) {
      console.error("Error updating campaign status:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { label: "مسودة", variant: "outline" as const },
      active: { label: "نشط", variant: "default" as const },
      paused: { label: "متوقف", variant: "secondary" as const },
      completed: { label: "مكتمل", variant: "default" as const },
    }

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: "outline" as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case "facebook":
        return "📘"
      case "instagram":
        return "📷"
      case "twitter":
        return "🐦"
      case "linkedin":
        return "💼"
      case "tiktok":
        return "🎵"
      case "youtube":
        return "📺"
      default:
        return "📱"
    }
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.orders?.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.platform?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.goals?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 md:mr-64 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الحملات الإعلانية</h1>
              <p className="text-gray-600">إنشاء وإدارة الحملات الإعلانية الذكية</p>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  حملة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إنشاء حملة إعلانية جديدة</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="basic" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">المعلومات الأساسية</TabsTrigger>
                    <TabsTrigger value="content">المحتوى والاستهداف</TabsTrigger>
                    <TabsTrigger value="schedule">الجدولة والميزانية</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="client">العميل</Label>
                        <Select
                          value={newCampaign.client_id}
                          onValueChange={(value) => setNewCampaign({ ...newCampaign, client_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر العميل" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name} - {client.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="service">الخدمة</Label>
                        <Select
                          value={newCampaign.service_id}
                          onValueChange={(value) => setNewCampaign({ ...newCampaign, service_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الخدمة" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.service_name} - {service.base_price} ج.م
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="platform">المنصة الإعلانية</Label>
                      <Select
                        value={newCampaign.platform}
                        onValueChange={(value) => setNewCampaign({ ...newCampaign, platform: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المنصة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facebook">📘 فيسبوك</SelectItem>
                          <SelectItem value="instagram">📷 انستجرام</SelectItem>
                          <SelectItem value="twitter">🐦 تويتر</SelectItem>
                          <SelectItem value="linkedin">💼 لينكد إن</SelectItem>
                          <SelectItem value="tiktok">🎵 تيك توك</SelectItem>
                          <SelectItem value="youtube">📺 يوتيوب</SelectItem>
                          <SelectItem value="google">🔍 جوجل أدز</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4">
                    <div>
                      <Label htmlFor="audience">وصف الجمهور المستهدف</Label>
                      <Textarea
                        value={newCampaign.audience_description}
                        onChange={(e) => setNewCampaign({ ...newCampaign, audience_description: e.target.value })}
                        placeholder="اكتب وصفاً للجمهور المستهدف (العمر، الاهتمامات، الموقع...)"
                        rows={3}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="goals">أهداف الحملة والمحتوى</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={generateCampaignContent}
                          disabled={isGenerating || !newCampaign.platform || !newCampaign.audience_description}
                        >
                          {isGenerating ? "جاري التوليد..." : "🤖 توليد بالذكاء الاصطناعي"}
                        </Button>
                      </div>
                      <Textarea
                        value={newCampaign.goals}
                        onChange={(e) => setNewCampaign({ ...newCampaign, goals: e.target.value })}
                        placeholder="اكتب أهداف الحملة والمحتوى المطلوب..."
                        rows={8}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="schedule" className="space-y-4">
                    <div>
                      <Label htmlFor="budget">الميزانية (ج.م)</Label>
                      <Input
                        type="number"
                        value={newCampaign.budget}
                        onChange={(e) => setNewCampaign({ ...newCampaign, budget: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_date">تاريخ البداية</Label>
                        <Input
                          type="date"
                          value={newCampaign.start_date}
                          onChange={(e) => setNewCampaign({ ...newCampaign, start_date: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="end_date">تاريخ النهاية</Label>
                        <Input
                          type="date"
                          value={newCampaign.end_date}
                          onChange={(e) => setNewCampaign({ ...newCampaign, end_date: e.target.value })}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={createCampaign}
                      className="w-full"
                      disabled={!newCampaign.client_id || !newCampaign.service_id || !newCampaign.platform}
                    >
                      إنشاء الحملة
                    </Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في الحملات..."
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
                    <SelectItem value="all">جميع الحملات</SelectItem>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="paused">متوقف</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Campaigns Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getPlatformIcon(campaign.platform || "")}</span>
                        <div>
                          <CardTitle className="text-lg">{campaign.platform || "منصة غير محددة"}</CardTitle>
                          <p className="text-sm text-gray-600">{campaign.orders?.users?.name || "عميل غير محدد"}</p>
                        </div>
                      </div>
                      {getStatusBadge(campaign.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span>{campaign.budget ? `${campaign.budget} ج.م` : "غير محدد"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span>
                          {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString("ar-EG") : "غير محدد"}
                        </span>
                      </div>
                    </div>

                    {campaign.goals && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 line-clamp-3">{campaign.goals}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        {campaign.status === "draft" && (
                          <Button size="sm" onClick={() => updateCampaignStatus(campaign.id, "active")}>
                            <Play className="h-4 w-4 ml-1" />
                            تشغيل
                          </Button>
                        )}
                        {campaign.status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCampaignStatus(campaign.id, "paused")}
                          >
                            <Pause className="h-4 w-4 ml-1" />
                            إيقاف
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredCampaigns.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حملات</h3>
                <p className="text-gray-500">ابدأ بإنشاء حملة إعلانية جديدة</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
