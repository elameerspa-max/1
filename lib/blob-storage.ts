import { put, del, list } from "@vercel/blob"

// رفع ملف إلى Vercel Blob
export const uploadFile = async (
  file: File,
  folder = "general",
): Promise<{
  success: boolean
  url?: string
  error?: string
}> => {
  try {
    // التحقق من نوع الملف
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "text/csv",
    ]

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "نوع الملف غير مدعوم. يرجى رفع ملف صورة أو مستند.",
      }
    }

    // التحقق من حجم الملف (10MB كحد أقصى)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت.",
      }
    }

    // إنشاء اسم ملف فريد
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileExtension = file.name.split(".").pop()
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`

    // رفع الملف
    const blob = await put(fileName, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
    })

    return {
      success: true,
      url: blob.url,
    }
  } catch (error) {
    console.error("خطأ في رفع الملف:", error)
    return {
      success: false,
      error: "حدث خطأ أثناء رفع الملف. يرجى المحاولة مرة أخرى.",
    }
  }
}

// حذف ملف من Vercel Blob
export const deleteFile = async (
  url: string,
): Promise<{
  success: boolean
  error?: string
}> => {
  try {
    await del(url)
    return { success: true }
  } catch (error) {
    console.error("خطأ في حذف الملف:", error)
    return {
      success: false,
      error: "حدث خطأ أثناء حذف الملف.",
    }
  }
}

// الحصول على قائمة الملفات
export const listFiles = async (
  folder?: string,
): Promise<{
  success: boolean
  files?: Array<{
    url: string
    pathname: string
    size: number
    uploadedAt: Date
  }>
  error?: string
}> => {
  try {
    const { blobs } = await list({
      prefix: folder,
      limit: 100,
    })

    return {
      success: true,
      files: blobs.map((blob) => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
      })),
    }
  } catch (error) {
    console.error("خطأ في جلب قائمة الملفات:", error)
    return {
      success: false,
      error: "حدث خطأ أثناء جلب قائمة الملفات.",
    }
  }
}

// تحويل حجم الملف إلى نص قابل للقراءة
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 بايت"

  const k = 1024
  const sizes = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// الحصول على نوع الملف من الامتداد
export const getFileType = (filename: string): string => {
  const extension = filename.split(".").pop()?.toLowerCase()

  const imageTypes = ["jpg", "jpeg", "png", "gif", "webp", "svg"]
  const documentTypes = ["pdf", "doc", "docx", "txt"]
  const spreadsheetTypes = ["xls", "xlsx", "csv"]
  const videoTypes = ["mp4", "avi", "mov", "wmv"]
  const audioTypes = ["mp3", "wav", "ogg"]

  if (imageTypes.includes(extension || "")) return "image"
  if (documentTypes.includes(extension || "")) return "document"
  if (spreadsheetTypes.includes(extension || "")) return "spreadsheet"
  if (videoTypes.includes(extension || "")) return "video"
  if (audioTypes.includes(extension || "")) return "audio"

  return "other"
}

// إنشاء رابط معاينة للملف
export const getPreviewUrl = (url: string, type: string): string => {
  if (type === "image") {
    return url
  } else if (type === "document") {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
  }
  return url
}
