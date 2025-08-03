"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Wand2, Copy, Download } from "lucide-react"
import { generateContent } from "@/lib/ai-services"

export function ContentGenerator() {
  const [prompt, setPrompt] = useState("")
  const [contentType, setContentType] = useState<"message" | "campaign" | "report">("message")
  const [generatedContent, setGeneratedContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    try {
      const content = await generateContent(prompt, contentType)
      setGeneratedContent(content)
    } catch (error) {
      console.error("Error generating content:", error)
      setGeneratedContent("حدث خطأ أثناء توليد المحتوى")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent)
  }

  const downloadContent = () => {
    const element = document.createElement("a")
    const file = new Blob([generatedContent], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `generated-content-${Date.now()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            مولد المحتوى الذكي
            <Badge variant="secondary">AI</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">نوع المحتوى</label>
            <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="message">رسالة تسويقية</SelectItem>
                <SelectItem value="campaign">محتوى إعلاني</SelectItem>
                <SelectItem value="report">تقرير تحليلي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">وصف المحتوى المطلوب</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="اكتب وصفاً تفصيلياً للمحتوى الذي تريد توليده..."
              rows={6}
              className="text-right"
            />
          </div>

          <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="w-full">
            {isLoading ? "جاري التوليد..." : "توليد المحتوى"}
          </Button>
        </CardContent>
      </Card>

      {/* Output Section */}
      <Card>
        <CardHeader>
          <CardTitle>المحتوى المولد</CardTitle>
          {generatedContent && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 ml-2" />
                نسخ
              </Button>
              <Button variant="outline" size="sm" onClick={downloadContent}>
                <Download className="h-4 w-4 ml-2" />
                تحميل
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {generatedContent ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-right font-sans">{generatedContent}</pre>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Wand2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>سيظهر المحتوى المولد هنا</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
