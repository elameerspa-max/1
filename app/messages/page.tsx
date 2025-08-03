"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Search, Send, Phone, Users, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { sendWhatsAppMessage, generateContent } from "@/lib/ai-services"

interface Client {
  id: string
  name: string
  email?: string
  whatsapp_number?: string
}

interface MessageTemplate {
  id: string
  name: string
  content: string
  category: string
}

export default function MessagesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [messageContent, setMessageContent] = useState("")
  const [messageType, setMessageType] = useState("custom")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const [messageTemplates] = useState<MessageTemplate[]>([
    {
      id: "welcome",
      name: "رسالة ترحيب",
      content: "مرحباً {name}! نرحب بك في منصة EhabGM. نحن سعداء لخدمتك وتقديم أفضل الحلول التسويقية لك.",
      category: "welcome",
    },
    {
      id: "campaign_start",
      name: "بداية حملة",
      content: "عزيزي {name}، تم إطلاق حملتك الإعلانية بنجاح! سنقوم بمتابعة الأداء وإرسال التقارير دورياً.",
      category: "campaign",
    },
    {
      id: "payment_reminder",
      name: "تذكير بالدفع",
      content: "تحية طيبة {name}، نذكرك بوجود فاتورة مستحقة. يرجى المراجعة والدفع في أقرب وقت ممكن.",
      category: "payment",
    },
    {
      id: "service_offer",
      name: "عرض خدمة",
      content: "مرحباً {name}! لدينا عرض خاص على خدماتنا التسويقية. تواصل معنا للحصول على خصم 20%!",
      category: "offer",
    },
  ])

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, whatsapp_number")
        .eq("role", "client")

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateMessage = async () => {
    if (!messageType || messageType === "custom") return

    setIsGenerating(true)
    try {
      const template = messageTemplates.find((t) => t.id === messageType)
      if (!template) return

      const prompt = `
        قم بتحسين وتطوير هذه الرسالة التسويقية:
        "${template.content}"
        
        اجعلها أكثر تأثيراً وإقناعاً مع الحفاظ على الطابع المهني والودود.
        استخدم {name} كمتغير لاسم العميل.
      `

      const enhancedMessage = await generateContent(prompt, "message")
      setMessageContent(enhancedMessage)
    } catch (error) {
      console.error("Error generating message:", error)
      const template = messageTemplates.find((t) => t.id === messageType)
      if (template) {
        setMessageContent(template.content)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const sendMessages = async () => {
    if (!messageContent.trim() || selectedClients.length === 0) {
      alert("يرجى اختيار العملاء وكتابة الرسالة")
      return
    }

    setSending(true)
    const results = []

    try {
      for (const clientId of selectedClients) {
        const client = clients.find((c) => c.id === clientId)
        if (!client || !client.whatsapp_number) continue

        // Replace {name} placeholder with actual client name
        const personalizedMessage = messageContent.replace(/{name}/g, client.name || "العميل الكريم")

        const result = await sendWhatsAppMessage(client.whatsapp_number, personalizedMessage)
        results.push({
          client: client.name,
          success: !!result,
          error: result ? null : "فشل في الإرسال",
        })

        // Add delay between messages to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      // Show results
      const successCount = results.filter((r) => r.success).length
      const failCount = results.length - successCount

      alert(`تم إرسال ${successCount} رسالة بنجاح${failCount > 0 ? ` وفشل ${failCount} رسالة` : ""}`)

      // Reset form
      setSelectedClients([])
      setMessageContent("")
      setMessageType("custom")
    } catch (error) {
      console.error("Error sending messages:", error)
      alert("حدث خطأ أثناء إرسال الرسائل")
    } finally {
      setSending(false)
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.whatsapp_number?.includes(searchTerm),
  )

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients((prev) => (prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]))
  }

  const selectAllClients = () => {
    const clientsWithWhatsApp = filteredClients.filter((c) => c.whatsapp_number)
    setSelectedClients(clientsWithWhatsApp.map((c) => c.id))
  }

  const clearSelection = () => {
    setSelectedClients([])
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 md:mr-64 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الرسائل</h1>
              <p className="text-gray-600">إرسال رسائل جماعية ومخصصة للعملاء</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Client Selection */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      اختيار العملاء
                    </span>
                    <Badge variant="outline">{selectedClients.length} محدد</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="البحث في العملاء..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                  </div>

                  {/* Selection Controls */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllClients}>
                      تحديد الكل
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      إلغاء التحديد
                    </Button>
                  </div>

                  {/* Client List */}
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {loading ? (
                      <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-12 bg-gray-200 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      filteredClients.map((client) => (
                        <div
                          key={client.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedClients.includes(client.id)
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          } ${!client.whatsapp_number ? "opacity-50" : ""}`}
                          onClick={() => client.whatsapp_number && toggleClientSelection(client.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{client.name}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                {client.whatsapp_number ? (
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {client.whatsapp_number}
                                  </span>
                                ) : (
                                  <span className="text-red-500">لا يوجد واتساب</span>
                                )}
                              </div>
                            </div>
                            {selectedClients.includes(client.id) && <CheckCircle className="h-4 w-4 text-blue-500" />}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Message Composition */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    تأليف الرسالة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Message Type Selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">نوع الرسالة</label>
                    <div className="flex gap-2">
                      <Select value={messageType} onValueChange={setMessageType}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">رسالة مخصصة</SelectItem>
                          {messageTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {messageType !== "custom" && (
                        <Button variant="outline" onClick={generateMessage} disabled={isGenerating}>
                          {isGenerating ? "جاري التوليد..." : "🤖 تحسين بالذكاء الاصطناعي"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">محتوى الرسالة</label>
                    <Textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="اكتب رسالتك هنا... يمكنك استخدام {name} لإدراج اسم العميل"
                      rows={8}
                      className="text-right"
                    />
                    <p className="text-xs text-gray-500 mt-1">استخدم {"{name}"} لإدراج اسم العميل تلقائياً</p>
                  </div>

                  {/* Preview */}
                  {messageContent && selectedClients.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">معاينة الرسالة</label>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <MessageSquare className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-medium">EhabGM Platform</span>
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <p className="text-right whitespace-pre-wrap">
                            {messageContent.replace(
                              /{name}/g,
                              clients.find((c) => c.id === selectedClients[0])?.name || "العميل الكريم",
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Send Button */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">سيتم إرسال الرسالة إلى {selectedClients.length} عميل</div>
                    <Button
                      onClick={sendMessages}
                      disabled={sending || !messageContent.trim() || selectedClients.length === 0}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {sending ? "جاري الإرسال..." : "إرسال الرسائل"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Message Templates */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>قوالب الرسائل المحفوظة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {messageTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="p-4 border rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                        onClick={() => {
                          setMessageType(template.id)
                          setMessageContent(template.content)
                        }}
                      >
                        <h4 className="font-medium mb-2">{template.name}</h4>
                        <p className="text-sm text-gray-600 line-clamp-3">{template.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
