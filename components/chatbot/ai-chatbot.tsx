"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bot, User, Send, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { generateContent } from "@/lib/ai-services"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  action?: string
}

export function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "مرحباً! أنا المساعد الذكي لمنصة EhabGM. يمكنني مساعدتك في إدارة العملاء، الطلبات، الحملات، والمزيد. كيف يمكنني مساعدتك اليوم؟",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Analyze user intent and execute database operations
      const response = await processUserCommand(input)

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: "bot",
        timestamp: new Date(),
        action: response.action,
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const processUserCommand = async (command: string): Promise<{ message: string; action?: string }> => {
    // Use AI to understand the command
    const analysisPrompt = `
    حلل هذا الأمر وحدد نوع العملية المطلوبة:
    "${command}"
    
    الأوامر المتاحة:
    - إضافة عميل جديد
    - عرض العملاء
    - إضافة طلب جديد
    - عرض الطلبات
    - إنشاء حملة إعلانية
    - عرض الحملات
    - إنشاء فاتورة
    - عرض الفواتير
    - إضافة مهمة
    - عرض المهام
    
    أجب بتنسيق JSON:
    {
      "action": "نوع العملية",
      "parameters": "المعاملات المستخرجة",
      "confidence": "مستوى الثقة من 0 إلى 1"
    }
    `

    try {
      const analysis = await generateContent(analysisPrompt, "report")

      // Try to parse the AI response
      let parsedAnalysis
      try {
        parsedAnalysis = JSON.parse(analysis)
      } catch {
        // If parsing fails, handle common commands manually
        return await handleCommonCommands(command)
      }

      // Execute the identified action
      switch (parsedAnalysis.action) {
        case "إضافة عميل جديد":
          return await addNewClient(parsedAnalysis.parameters)
        case "عرض العملاء":
          return await showClients()
        case "إضافة طلب جديد":
          return await addNewOrder(parsedAnalysis.parameters)
        case "عرض الطلبات":
          return await showOrders()
        case "إنشاء حملة إعلانية":
          return await createCampaign(parsedAnalysis.parameters)
        case "عرض الحملات":
          return await showCampaigns()
        case "إنشاء فاتورة":
          return await createInvoice(parsedAnalysis.parameters)
        case "عرض الفواتير":
          return await showInvoices()
        default:
          return { message: 'لم أتمكن من فهم طلبك. يمكنك تجربة أوامر مثل "أضف عميل جديد" أو "اعرض العملاء"' }
      }
    } catch (error) {
      return await handleCommonCommands(command)
    }
  }

  const handleCommonCommands = async (command: string): Promise<{ message: string; action?: string }> => {
    const lowerCommand = command.toLowerCase()

    if (lowerCommand.includes("عميل") && lowerCommand.includes("جديد")) {
      return {
        message:
          'لإضافة عميل جديد، أحتاج إلى الاسم ورقم الهاتف والبريد الإلكتروني. مثال: "أضف عميل جديد: أحمد محمد، 01234567890، ahmed@example.com"',
      }
    }

    if (lowerCommand.includes("عرض") && lowerCommand.includes("عملاء")) {
      return await showClients()
    }

    if (lowerCommand.includes("طلب") && lowerCommand.includes("جديد")) {
      return {
        message:
          'لإضافة طلب جديد، أحتاج إلى معرف العميل ومعرف الخدمة. مثال: "أضف طلب جديد للعميل [معرف العميل] للخدمة [معرف الخدمة]"',
      }
    }

    if (lowerCommand.includes("عرض") && lowerCommand.includes("طلبات")) {
      return await showOrders()
    }

    return {
      message:
        "يمكنني مساعدتك في:\n• إدارة العملاء (إضافة، عرض، تعديل)\n• إدارة الطلبات\n• إنشاء الحملات الإعلانية\n• إدارة الفواتير\n• متابعة المهام\n\nما الذي تريد القيام به؟",
    }
  }

  const addNewClient = async (parameters: string): Promise<{ message: string; action?: string }> => {
    // Extract client info from parameters
    const parts = parameters.split(",").map((p) => p.trim())
    if (parts.length < 2) {
      return { message: "يرجى تقديم بيانات العميل بالتنسيق: الاسم، رقم الهاتف، البريد الإلكتروني" }
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            name: parts[0],
            phone_number: parts[1],
            email: parts[2] || null,
            role: "client",
          },
        ])
        .select()

      if (error) throw error

      return {
        message: `تم إضافة العميل "${parts[0]}" بنجاح! معرف العميل: ${data[0].id}`,
        action: "client_added",
      }
    } catch (error) {
      return { message: "حدث خطأ أثناء إضافة العميل. يرجى التأكد من صحة البيانات." }
    }
  }

  const showClients = async (): Promise<{ message: string; action?: string }> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, phone_number, email, created_at")
        .eq("role", "client")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error

      if (!data || data.length === 0) {
        return { message: "لا توجد عملاء مسجلين حالياً." }
      }

      let message = "آخر 10 عملاء:\n\n"
      data.forEach((client, index) => {
        message += `${index + 1}. ${client.name || "غير محدد"}\n`
        message += `   📱 ${client.phone_number || "غير محدد"}\n`
        message += `   📧 ${client.email || "غير محدد"}\n`
        message += `   🆔 ${client.id}\n\n`
      })

      return { message, action: "clients_listed" }
    } catch (error) {
      return { message: "حدث خطأ أثناء جلب بيانات العملاء." }
    }
  }

  const addNewOrder = async (parameters: string): Promise<{ message: string; action?: string }> => {
    return { message: "ميزة إضافة الطلبات قيد التطوير. يرجى استخدام واجهة الطلبات مباشرة." }
  }

  const showOrders = async (): Promise<{ message: string; action?: string }> => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          status,
          created_at,
          users!inner(name),
          services!inner(service_name)
        `)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error

      if (!data || data.length === 0) {
        return { message: "لا توجد طلبات حالياً." }
      }

      let message = "آخر 10 طلبات:\n\n"
      data.forEach((order, index) => {
        message += `${index + 1}. ${order.services?.service_name || "خدمة غير محددة"}\n`
        message += `   👤 العميل: ${order.users?.name || "غير محدد"}\n`
        message += `   📊 الحالة: ${getStatusInArabic(order.status)}\n`
        message += `   🆔 ${order.id}\n\n`
      })

      return { message, action: "orders_listed" }
    } catch (error) {
      return { message: "حدث خطأ أثناء جلب بيانات الطلبات." }
    }
  }

  const createCampaign = async (parameters: string): Promise<{ message: string; action?: string }> => {
    return { message: "ميزة إنشاء الحملات قيد التطوير. يرجى استخدام واجهة الحملات مباشرة." }
  }

  const showCampaigns = async (): Promise<{ message: string; action?: string }> => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select(`
          id,
          platform,
          budget,
          status,
          created_at,
          orders!inner(users!inner(name))
        `)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error

      if (!data || data.length === 0) {
        return { message: "لا توجد حملات إعلانية حالياً." }
      }

      let message = "آخر 10 حملات إعلانية:\n\n"
      data.forEach((campaign, index) => {
        message += `${index + 1}. ${campaign.platform || "منصة غير محددة"}\n`
        message += `   👤 العميل: ${campaign.orders?.users?.name || "غير محدد"}\n`
        message += `   💰 الميزانية: ${campaign.budget || "غير محددة"} ج.م\n`
        message += `   📊 الحالة: ${getStatusInArabic(campaign.status)}\n`
        message += `   🆔 ${campaign.id}\n\n`
      })

      return { message, action: "campaigns_listed" }
    } catch (error) {
      return { message: "حدث خطأ أثناء جلب بيانات الحملات." }
    }
  }

  const createInvoice = async (parameters: string): Promise<{ message: string; action?: string }> => {
    return { message: "ميزة إنشاء الفواتير قيد التطوير. يرجى استخدام واجهة الفواتير مباشرة." }
  }

  const showInvoices = async (): Promise<{ message: string; action?: string }> => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          id,
          amount,
          status,
          issue_date,
          users!inner(name)
        `)
        .order("issue_date", { ascending: false })
        .limit(10)

      if (error) throw error

      if (!data || data.length === 0) {
        return { message: "لا توجد فواتير حالياً." }
      }

      let message = "آخر 10 فواتير:\n\n"
      data.forEach((invoice, index) => {
        message += `${index + 1}. فاتورة بقيمة ${invoice.amount} ج.م\n`
        message += `   👤 العميل: ${invoice.users?.name || "غير محدد"}\n`
        message += `   📊 الحالة: ${getStatusInArabic(invoice.status)}\n`
        message += `   🆔 ${invoice.id}\n\n`
      })

      return { message, action: "invoices_listed" }
    } catch (error) {
      return { message: "حدث خطأ أثناء جلب بيانات الفواتير." }
    }
  }

  const getStatusInArabic = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      pending: "قيد الانتظار",
      in_progress: "قيد التنفيذ",
      completed: "مكتمل",
      cancelled: "ملغي",
      draft: "مسودة",
      active: "نشط",
      paused: "متوقف",
      paid: "مدفوع",
      unpaid: "غير مدفوع",
      overdue: "متأخر",
    }
    return statusMap[status] || status
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          المساعد الذكي
          <Badge variant="secondary">AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`p-2 rounded-full ${
                    message.sender === "user" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {message.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`flex-1 ${message.sender === "user" ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block p-3 rounded-lg max-w-[80%] ${
                      message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{message.timestamp.toLocaleTimeString("ar-EG")}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gray-100 text-gray-600">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جاري المعالجة...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
              className="text-right"
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
