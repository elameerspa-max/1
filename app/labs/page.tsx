"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { ContentGenerator } from "@/components/labs/content-generator"
import { WhatsAppGenerator } from "@/components/labs/whatsapp-generator"
import { AIChatbot } from "@/components/chatbot/ai-chatbot"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Beaker, Sparkles, FileText, MessageSquare, Bot, Zap, Brain, Wand2 } from "lucide-react"

export default function LabsPage() {
  const labFeatures = [
    {
      icon: FileText,
      title: "مولد المحتوى الذكي",
      description: "إنشاء محتوى تسويقي وإعلاني احترافي بالذكاء الاصطناعي",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: MessageSquare,
      title: "مولد رسائل الواتساب",
      description: "إنشاء وإرسال رسائل واتساب مخصصة وفعالة",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      icon: Bot,
      title: "المساعد الذكي",
      description: "مساعد ذكي للإجابة على الاستفسارات وتقديم المساعدة",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 md:mr-64 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                <Beaker className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              المعامل الذكية
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white mr-3">
                <Sparkles className="h-4 w-4 ml-1" />
                AI Powered
              </Badge>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              استكشف مجموعة من الأدوات الذكية المدعومة بالذكاء الاصطناعي لتسريع وتحسين عملك
            </p>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {labFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={`p-4 rounded-full ${feature.bgColor} inline-block mb-4`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Tools Tabs */}
          <Tabs defaultValue="content" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                مولد المحتوى
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                رسائل الواتساب
              </TabsTrigger>
              <TabsTrigger value="assistant" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                المساعد الذكي
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <ContentGenerator />
            </TabsContent>

            <TabsContent value="whatsapp">
              <WhatsAppGenerator />
            </TabsContent>

            <TabsContent value="assistant">
              <AIChatbot />
            </TabsContent>
          </Tabs>

          {/* AI Capabilities Info */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center justify-center">
                <Brain className="h-6 w-6 text-purple-600" />
                قدرات الذكاء الاصطناعي المتقدمة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="p-3 bg-white rounded-full inline-block">
                    <Zap className="h-6 w-6 text-yellow-500" />
                  </div>
                  <h4 className="font-semibold text-gray-900">سرعة فائقة</h4>
                  <p className="text-sm text-gray-600">توليد المحتوى في ثوانٍ معدودة بجودة احترافية عالية</p>
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-white rounded-full inline-block">
                    <Wand2 className="h-6 w-6 text-purple-500" />
                  </div>
                  <h4 className="font-semibold text-gray-900">تخصيص ذكي</h4>
                  <p className="text-sm text-gray-600">محتوى مخصص حسب احتياجاتك ونوع عملك وجمهورك المستهدف</p>
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-white rounded-full inline-block">
                    <Sparkles className="h-6 w-6 text-pink-500" />
                  </div>
                  <h4 className="font-semibold text-gray-900">جودة احترافية</h4>
                  <p className="text-sm text-gray-600">محتوى عالي الجودة يضاهي ما ينتجه المحترفون في المجال</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
