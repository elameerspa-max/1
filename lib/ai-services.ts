import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { google } from "@ai-sdk/google"

// خدمة OpenAI للذكاء الاصطناعي
export const generateContent = async (
  prompt: string,
  type: "social" | "email" | "blog" | "ad" | "campaign" | "report" | "message" = "social",
) => {
  try {
    const systemPrompts = {
      social: `أنت خبير في كتابة المحتوى لوسائل التواصل الاجتماعي باللغة العربية. 
               اكتب محتوى جذاب ومناسب للجمهور المصري والعربي.
               استخدم الرموز التعبيرية المناسبة والهاشتاجات الفعالة.`,

      email: `أنت خبير في كتابة رسائل البريد الإلكتروني التسويقية باللغة العربية.
              اكتب رسائل احترافية ومقنعة تحفز على اتخاذ إجراء.
              استخدم أسلوب مهذب ومحترم يناسب الثقافة العربية.`,

      blog: `أنت كاتب محتوى محترف باللغة العربية.
             اكتب مقالات مفيدة وشيقة للقراء العرب.
             استخدم أسلوب سهل ومفهوم مع معلومات قيمة.`,

      ad: `أنت خبير في كتابة الإعلانات باللغة العربية.
           اكتب إعلانات جذابة ومقنعة تحفز على الشراء.
           استخدم كلمات قوية ودعوات واضحة للعمل.`,

      campaign: `أنت خبير في إنشاء الحملات الإعلانية باللغة العربية.
                 قم بإنشاء محتوى إعلاني شامل وفعال.
                 اقترح استراتيجيات واستهداف مناسب للسوق المصري.`,

      report: `أنت محلل بيانات وخبير تقارير باللغة العربية.
               قم بتحليل البيانات وإنشاء تقارير مفصلة ومفيدة.
               استخدم أرقام وإحصائيات واضحة مع توصيات عملية.`,

      message: `أنت مساعد ذكي لكتابة الرسائل التسويقية باللغة العربية.
                اكتب رسائل احترافية ومؤثرة تناسب الثقافة المصرية.
                استخدم أسلوب ودود ومحترم.`,
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompts[type],
      prompt: prompt,
      maxTokens: 1500,
      temperature: 0.7,
    })

    return { success: true, content: text }
  } catch (error) {
    console.error("خطأ في توليد المحتوى:", error)
    return {
      success: false,
      error: "عذراً، حدث خطأ في توليد المحتوى. يرجى المحاولة مرة أخرى.",
    }
  }
}

// خدمة Gemini للتحليل المتقدم
export const generateWithGemini = async (prompt: string) => {
  try {
    const { text } = await generateText({
      model: google("gemini-1.5-pro"),
      system: "أنت مساعد ذكي متخصص في التحليل والاستشارات التسويقية باللغة العربية.",
      prompt: prompt,
      maxTokens: 1500,
      temperature: 0.5,
    })

    return { success: true, content: text }
  } catch (error) {
    console.error("خطأ في Gemini:", error)
    return {
      success: false,
      error: "عذراً، حدث خطأ في الاتصال بخدمة التحليل المتقدم.",
    }
  }
}

// مولد رسائل الواتساب الذكي
export const generateWhatsAppMessage = async (
  businessType: string,
  occasion: string,
  tone: "formal" | "friendly" | "promotional" = "friendly",
  clientName?: string,
) => {
  const tonePrompts = {
    formal: "استخدم أسلوب رسمي ومهني مناسب للأعمال",
    friendly: "استخدم أسلوب ودود ومرح يناسب العلاقات الشخصية",
    promotional: "استخدم أسلوب تسويقي جذاب مع عروض مغرية",
  }

  const prompt = `
    اكتب رسالة واتساب احترافية ${tonePrompts[tone]} لنشاط تجاري من نوع: ${businessType}
    المناسبة أو الهدف: ${occasion}
    ${clientName ? `اسم العميل: ${clientName}` : ""}
    
    متطلبات الرسالة:
    - قصيرة ومباشرة (لا تزيد عن 200 كلمة)
    - تحتوي على دعوة واضحة للعمل
    - مناسبة للثقافة المصرية والعربية
    - تتضمن رموز تعبيرية مناسبة
    - تبدأ بتحية مناسبة
    - تنتهي بتوقيع احترافي
    
    اكتب الرسالة باللغة العربية فقط.
  `

  return await generateContent(prompt, "message")
}

// تحليل المحتوى والتحسين
export const analyzeContent = async (content: string, contentType = "عام") => {
  try {
    const prompt = `
      قم بتحليل هذا المحتوى من نوع "${contentType}" وقدم تقييماً شاملاً:
      
      المحتوى:
      "${content}"
      
      يرجى تقديم:
      1. تقييم عام للمحتوى (من 1 إلى 10)
      2. نقاط القوة في المحتوى
      3. نقاط الضعف والمشاكل
      4. اقتراحات محددة للتحسين
      5. كلمات مفتاحية مقترحة
      6. تحسينات لمحركات البحث (SEO)
      7. مدى مناسبة المحتوى للجمهور المصري
      
      قدم التحليل باللغة العربية بشكل مفصل ومفيد.
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: "أنت خبير تحليل محتوى ومتخصص في التسويق الرقمي باللغة العربية.",
      prompt: prompt,
      maxTokens: 1000,
      temperature: 0.3,
    })

    return { success: true, analysis: text }
  } catch (error) {
    console.error("خطأ في تحليل المحتوى:", error)
    return {
      success: false,
      error: "عذراً، حدث خطأ في تحليل المحتوى.",
    }
  }
}

// مولد استراتيجيات التسويق
export const generateMarketingStrategy = async (businessInfo: {
  type: string
  target: string
  budget: number
  goals: string
  timeline: string
}) => {
  const prompt = `
    قم بإنشاء استراتيجية تسويقية شاملة لنشاط تجاري بالمعلومات التالية:
    
    نوع النشاط: ${businessInfo.type}
    الجمهور المستهدف: ${businessInfo.target}
    الميزانية المتاحة: ${businessInfo.budget} جنيه مصري
    الأهداف: ${businessInfo.goals}
    الإطار الزمني: ${businessInfo.timeline}
    
    يرجى تقديم:
    1. تحليل السوق والمنافسين
    2. استراتيجية المحتوى
    3. خطة وسائل التواصل الاجتماعي
    4. اقتراحات للإعلانات المدفوعة
    5. توزيع الميزانية المقترح
    6. مؤشرات الأداء الرئيسية (KPIs)
    7. جدول زمني للتنفيذ
    8. نصائح خاصة بالسوق المصري
    
    اكتب الاستراتيجية باللغة العربية بشكل مفصل وعملي.
  `

  return await generateContent(prompt, "campaign")
}

// خدمة إرسال رسائل الواتساب
export const sendWhatsAppMessage = async (phoneNumber: string, message: string) => {
  const GREENAPI_INSTANCE_ID = process.env.GREENAPI_INSTANCE_ID || "7103121490"
  const GREENAPI_API_TOKEN = process.env.GREENAPI_API_TOKEN || "5302bc690deb405c9bd36048a27167e4c0baaa81616449d0d"

  try {
    // تنسيق رقم الهاتف
    const formattedPhone = phoneNumber.startsWith("20") ? phoneNumber : `20${phoneNumber.replace(/^0/, "")}`

    const response = await fetch(
      `https://api.green-api.com/waInstance${GREENAPI_INSTANCE_ID}/sendMessage/${GREENAPI_API_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: `${formattedPhone}@c.us`,
          message: message,
        }),
      },
    )

    const result = await response.json()

    if (response.ok && result.idMessage) {
      return { success: true, messageId: result.idMessage }
    } else {
      throw new Error(result.error || "فشل في إرسال الرسالة")
    }
  } catch (error) {
    console.error("خطأ في إرسال رسالة الواتساب:", error)
    return {
      success: false,
      error: "فشل في إرسال الرسالة. يرجى التحقق من رقم الهاتف والمحاولة مرة أخرى.",
    }
  }
}

// إرسال رسائل جماعية
export const sendBulkWhatsAppMessages = async (
  recipients: Array<{ phone: string; message: string; name?: string }>,
) => {
  const results = []
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  for (const recipient of recipients) {
    try {
      const result = await sendWhatsAppMessage(recipient.phone, recipient.message)
      results.push({
        phone: recipient.phone,
        name: recipient.name,
        success: result.success,
        messageId: result.success ? result.messageId : null,
        error: result.success ? null : result.error,
      })

      // تأخير بين الرسائل لتجنب الحظر
      await delay(2000)
    } catch (error) {
      results.push({
        phone: recipient.phone,
        name: recipient.name,
        success: false,
        error: "خطأ في الإرسال",
      })
    }
  }

  return {
    total: recipients.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results: results,
  }
}
