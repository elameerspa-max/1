"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Copy, Download, Sparkles, FileText } from "lucide-react"
import { generateContent } from "@/lib/ai-services"

export function ContentGenerator() {
  const [prompt, setPrompt] = useState("")
  const [contentType, setContentType] = useState("message")
  const [generatedContent, setGeneratedContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const contentTypes = [
    { value: "message", label: "رسالة تسويقية", description: "رسائل ترويجية للعملاء" },
    { value: "campaign", label: "حملة إعلانية", description: "محتوى إعلاني للحملات" },
    { value: "report", label: "تقرير", description: "تقارير وتحليلات مفصلة" },
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const content = await generateContent(prompt, contentType as any)
      setGeneratedContent(content)
    } catch (error) {
      console.error("Error generating content:", error)
      setGeneratedContent("حدث خطأ أثناء توليد المحتوى. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent)
  }

  const handleDownload = () => {
    const element = document.createElement("a")
    const file = new Blob([generatedContent], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `content-${Date.now()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
            <FileText className="h-5 w-5 text-white" />
          </div>
          مولد المحتوى الذكي
          <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <Sparkles className="h-3 w-3 ml-1" />
            AI
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">نوع المحتوى</label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="text-right">
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">وصف المحتوى المطلوب</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="اكتب وصفاً مفصلاً للمحتوى الذي تريد إنشاءه..."
              rows={4}
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
                توليد المحتوى
              </>
            )}
          </Button>
        </div>

        {generatedContent && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">المحتوى المولد</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 ml-1" />
                  نسخ
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 ml-1" />
                  تحميل
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">{generatedContent}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
