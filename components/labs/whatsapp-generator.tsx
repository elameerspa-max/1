"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, MessageSquare, Send, Sparkles } from "lucide-react"
import { generateContent, sendWhatsAppMessage } from "@/lib/ai-services"

export function WhatsAppGenerator() {
  const [prompt, setPrompt] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [generatedMessage, setGeneratedMessage] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const message = await generateContent(
        `قم بإنشاء رسالة واتساب احترافية ومؤثرة بناءً على الوصف التالي: ${prompt}. 
        يجب أن تكون الرسالة قصيرة ومباشرة ومناسبة لإرسالها عبر الواتساب.`,
        "message",
      )
      setGeneratedMessage(message)
    } catch (error) {
      console.error("Error generating message:", error)
      setGeneratedMessage("حدث خطأ أثناء توليد الرسالة. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSend = async () => {
    if (!generatedMessage.trim() || !phoneNumber.trim()) return

    setIsSending(true)
    try {
      const result = await sendWhatsAppMessage(phoneNumber, generatedMessage)
      if (result) {
        alert("تم إرسال الرسالة بنجاح!")
      } else {
        alert("فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("حدث خطأ أثناء إرسال الرسالة.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          مولد رسائل الواتساب
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <Sparkles className="h-3 w-3 ml-1" />
            AI
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">وصف الرسالة المطلوبة</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="مثال: رسالة ترحيب للعملاء الجدد، أو رسالة تذكير بموعد، أو رسالة ترويجية لخدمة معينة..."
              rows={3}
              className="resize-none"
            />
          </div>

          <Button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري التوليد...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 ml-2" />
                توليد الرسالة
              </>
            )}
          </Button>
        </div>

        {generatedMessage && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">الرسالة المولدة</label>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-green-600 mt-1" />
                  <div className="flex-1">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">{generatedMessage}</pre>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">رقم الهاتف (مع رمز الدولة)</label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="مثال: 201234567890"
                type="tel"
              />
            </div>

            <Button
              onClick={handleSend}
              disabled={!generatedMessage.trim() || !phoneNumber.trim() || isSending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 ml-2" />
                  إرسال عبر الواتساب
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
