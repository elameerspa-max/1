"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { ContentGenerator } from "@/components/labs/content-generator"
import { WhatsAppGenerator } from "@/components/labs/whatsapp-generator"
import { AIChatbot } from "@/components/chatbot/ai-chatbot"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, MessageSquare, Wand2, BarChart3, Target, Palette } from "lucide-react"

export default function LabsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 md:mr-64 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">المعامل الذكية</h1>
            <p className="text-gray-600">أدوات الذكاء الاصطناعي لتوليد المحتوى وأتمتة المهام</p>
          </div>

          <Tabs defaultValue="chatbot" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="chatbot" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                المساعد الذكي
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                مولد المحتوى
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                رسائل واتساب
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                مولد الحملات
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                مولد التقارير
              </TabsTrigger>
              <TabsTrigger value="design" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                مساعد التصميم
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chatbot">
              <AIChatbot />
            </TabsContent>

            <TabsContent value="content">
              <ContentGenerator />
            </TabsContent>

            <TabsContent value="whatsapp">
              <WhatsAppGenerator />
            </TabsContent>

            <TabsContent value="campaigns">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    مولد الحملات الإعلانية الذكي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">قريباً</h3>
                    <p className="text-gray-500">مولد الحملات الإعلانية الذكي قيد التطوير</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    مولد التقارير الذكي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">قريباً</h3>
                    <p className="text-gray-500">مولد التقارير الذكي قيد التطوير</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="design">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    مساعد التصميم الذكي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Palette className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">قريباً</h3>
                    <p className="text-gray-500">مساعد التصميم الذكي قيد التطوير</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
