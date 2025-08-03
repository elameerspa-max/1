import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kcnsubwxwynckntemfqx.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbnN1Ynd4d3luY2tudGVtZnF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTQyNDUsImV4cCI6MjA2OTU3MDI0NX0.RBiOLn9cJkf_JOyLs54NHRmllfPTZM1UAFBanZkBYk8"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on the schema
export interface User {
  id: string
  name?: string
  email?: string
  phone_number?: string
  whatsapp_number?: string
  role: "client" | "admin" | "manager"
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  service_id: string
  project_brief_id?: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  notes?: string
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  order_id: string
  invoice_id?: string
  platform?: string
  budget?: number
  start_date?: string
  end_date?: string
  status: "draft" | "active" | "paused" | "completed"
  goals?: string
  audience?: any
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  service_name: string
  description?: string
  base_price?: number
  is_active: boolean
  category_id?: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  user_id: string
  amount: number
  status: "unpaid" | "paid" | "overdue"
  issue_date: string
  created_at: string
  updated_at: string
}
