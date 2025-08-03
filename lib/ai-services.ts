import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

const OPENAI_API_KEY =
  process.env.OPENAI_API_KEY ||
  "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"
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAK3LA-F1e7u0dxCZkVKTzfSR0AdO2ZHCU"

// OpenAI service for text generation
export async function generateContent(prompt: string, type: "message" | "campaign" | "report" = "message") {
  try {
    const systemPrompts = {
      message: "أنت مساعد ذكي لكتابة الرسائل التسويقية باللغة العربية. اكتب رسائل احترافية ومؤثرة.",
      campaign: "أنت خبير في إنشاء الحملات الإعلانية. قم بإنشاء محتوى إعلاني جذاب وفعال باللغة العربية.",
      report: "أنت محلل بيانات خبير. قم بتحليل البيانات وإنشاء تقارير مفصلة باللغة العربية.",
    }

    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      system: systemPrompts[type],
      prompt: prompt,
    })

    return text
  } catch (error) {
    console.error("Error generating content:", error)
    return "عذراً، حدث خطأ في توليد المحتوى"
  }
}

// Gemini service for image analysis and advanced content
export async function analyzeWithGemini(prompt: string, imageUrl?: string) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                ...(imageUrl ? [{ inline_data: { mime_type: "image/jpeg", data: imageUrl } }] : []),
              ],
            },
          ],
        }),
      },
    )

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "لا يمكن تحليل المحتوى"
  } catch (error) {
    console.error("Error with Gemini:", error)
    return "عذراً، حدث خطأ في التحليل"
  }
}

// WhatsApp message service
export async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  const GREENAPI_INSTANCE_ID = process.env.GREENAPI_INSTANCE_ID || "7103121490"
  const GREENAPI_API_TOKEN = process.env.GREENAPI_API_TOKEN || "5302bc690deb405c9bd36048a27167e4c0baaa81616449d0d"

  try {
    const response = await fetch(
      `https://api.green-api.com/waInstance${GREENAPI_INSTANCE_ID}/sendMessage/${GREENAPI_API_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: `${phoneNumber}@c.us`,
          message: message,
        }),
      },
    )

    return await response.json()
  } catch (error) {
    console.error("Error sending WhatsApp message:", error)
    return null
  }
}
