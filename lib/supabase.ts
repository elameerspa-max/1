import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// أنواع البيانات
export interface User {
  id: string
  name: string
  email: string
  phone?: string
  whatsapp_number?: string
  company?: string
  address?: string
  role: "admin" | "client" | "employee"
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  service_name: string
  description?: string
  base_price: number
  category?: string
  duration_days?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  service_id: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  total_amount: number
  notes?: string
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
  users?: User
  services?: Service
}

export interface Invoice {
  id: string
  order_id: string
  invoice_number: string
  amount: number
  tax_amount: number
  total_amount: number
  status: "draft" | "sent" | "paid" | "overdue"
  due_date?: string
  paid_date?: string
  payment_method?: string
  notes?: string
  created_at: string
  updated_at: string
  orders?: {
    users?: User
    services?: Service
  }
}

export interface Task {
  id: string
  order_id: string
  assigned_to?: string
  title: string
  description?: string
  status: "todo" | "in_progress" | "review" | "done"
  priority: "low" | "medium" | "high" | "urgent"
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
  orders?: Order
  assignee?: User
}

export interface Campaign {
  id: string
  order_id: string
  platform?: string
  budget?: number
  start_date?: string
  end_date?: string
  status: "draft" | "active" | "paused" | "completed"
  goals?: string
  audience?: any
  metrics?: any
  created_at: string
  updated_at: string
  orders?: Order
}

export interface FileRecord {
  id: string
  order_id: string
  uploaded_by?: string
  file_name: string
  file_size?: number
  file_type?: string
  file_url: string
  folder: string
  is_public: boolean
  created_at: string
  updated_at: string
  orders?: Order
  uploader?: User
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  is_read: boolean
  action_url?: string
  created_at: string
  users?: User
}

export interface Message {
  id: string
  sender_id: string
  recipient_id: string
  subject?: string
  content: string
  message_type: "text" | "whatsapp" | "email"
  is_read: boolean
  created_at: string
  sender?: User
  recipient?: User
}

// دوال مساعدة
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 2,
  }).format(amount)
}

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const getRelativeTime = (date: string): string => {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "منذ لحظات"
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `منذ ${minutes} دقيقة`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `منذ ${hours} ساعة`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `منذ ${days} يوم`
  } else {
    return formatDate(date)
  }
}
