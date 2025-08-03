"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { generateContent, sendWhatsAppMessage } from "@/lib/ai-services"

interface Client {
  id: string
  name: string
  whatsapp_number: string
}

export function WhatsAppGenerator() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState("")
  const [messageType, setMessageType] = useState("welcome")
  const [customPrompt, setCustomPrompt] = useState("")
  const [generatedMessage, setGeneratedMessage] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, whatsapp_number")
        .eq("role", "client")
        .not("whatsapp_number", "is", null)

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const messageTemplates = {
    welcome: "اكتب رسالة ترحيب احترافية للعميل الجديد",
    campaign_start: "اكتب رسالة إعلام ببدء حملة إعلانية جديدة",
    campaign_end: "اكتب رسالة تقرير نهاية الحملة الإعلانية",
    payment_reminder: "اكتب رسالة تذكير بالدفع بطريقة مهذبة",
    service_offer: "اكتب رسالة عرض خدمة جديدة",
    follow_up: "اكتب رسالة متابعة مع العميل",
  }

  const generateMessage = async () => {
    setIsGenerating(true)
    try {
      const selectedClientData = clients.find((c) => c.id === selectedClient)
      const clientName = selectedClientData?.name || "العميل الكريم"

      let prompt = messageTemplates[messageType as keyof typeof messageTemplates]
      if (messageType === "custom") {
        prompt = customPrompt
      }

      prompt += ` للعميل ${clientName}. اجعل الرسالة شخصية ومهنية.`

      const message = await generateContent(prompt, "message")
      setGeneratedMessage(message)
    } catch (error) {
      console.error("Error generating message:", error)
      setGeneratedMessage("حدث خطأ أثناء توليد الرسالة")
    } finally {
      setIsGenerating(false)
    }
  }

  const sendMessage = async () => {
    if (!selectedClient || !generatedMessage) return

    setIsSending(true)
    try {
      const selectedClientData = clients.find((c) => c.id === selectedClient)
      if (!selectedClientData?.whatsapp_number) {
        alert("رقم الواتساب غير متوفر لهذا العميل")
        return
      }

      const result = await sendWhatsAppMessage(selectedClientData.whatsapp_number, generatedMessage)
      if (result) {
        alert("تم إرسال الرسالة بنجاح!")
      } else {
        alert("فشل في إرسال الرسالة")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("حدث خطأ أثناء إرسال الرسالة")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Message Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            مولد رسائل الواتساب
            <Badge variant="secondary">AI</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">اختر العميل</label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="اختر عميل" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} - {client.whatsapp_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">نوع الرسالة</label>
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="welcome">رسالة ترحيب</SelectItem>
                <SelectItem value="campaign_start">بداية حملة</SelectItem>
                <SelectItem value="campaign_end">نهاية حملة</SelectItem>
                <SelectItem value="payment_reminder">تذكير بالدفع</SelectItem>
                <SelectItem value="service_offer">عرض خدمة</SelectItem>
                <SelectItem value="follow_up">متابعة</SelectItem>
                <SelectItem value="custom">رسالة مخصصة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {messageType === "custom" && (
            <div>
              <label className="text-sm font-medium mb-2 block">وصف الرسالة المطلوبة</label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="اكتب وصفاً للرسالة التي تريد توليدها..."
                rows={3}
                className="text-right"
              />
            </div>
          )}

          <Button onClick={generateMessage} disabled={isGenerating || !selectedClient} className="w-full">
            {isGenerating ? "جاري التوليد..." : "توليد الرسالة"}
          </Button>
        </CardContent>
      </Card>

      {/* Message Preview & Send */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>معاينة الرسالة</span>
            {generatedMessage && (
              <Button onClick={sendMessage} disabled={isSending || !selectedClient} size="sm">
                <Send className="h-4 w-4 ml-2" />
                {isSending ? "جاري الإرسال..." : "إرسال"}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatedMessage ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">EhabGM Platform</span>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-right whitespace-pre-wrap">{generatedMessage}</p>
                </div>
              </div>

              <Textarea
                value={generatedMessage}
                onChange={(e) => setGeneratedMessage(e.target.value)}
                rows={6}
                className="text-right"
                placeholder="يمكنك تعديل الرسالة هنا قبل الإرسال..."
              />
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>ستظهر الرسالة المولدة هنا</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
