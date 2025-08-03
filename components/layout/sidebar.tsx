"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, Users, ShoppingCart, FileText, CheckSquare, Megaphone, FolderOpen, BarChart3, Bell, MessageSquare, Settings, Menu, X, Sparkles, Bot, Zap, TrendingUp, DollarSign, Calendar, Target, Briefcase, Phone, Mail, Globe, Star } from 'lucide-react'

const menuItems = [
  {
    title: "لوحة التحكم",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "نظرة شاملة على أداء أعمالك",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "العملاء",
    href: "/clients",
    icon: Users,
    description: "إدارة قاعدة عملائك بذكاء",
    color: "text-green-600",
    bgColor: "bg-green-50",
    badge: "جديد",
  },
  {
    title: "الطلبات",
    href: "/orders",
    icon: ShoppingCart,
    description: "متابعة وإدارة جميع الطلبات",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "الفواتير",
    href: "/invoices",
    icon: FileText,
    description: "إنشاء ومتابعة الفواتير والمدفوعات",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "المهام",
    href: "/tasks",
    icon: CheckSquare,
    description: "تنظيم المهام بنظام كانبان",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    title: "الحملات",
    href: "/campaigns",
    icon: Megaphone,
    description: "إدارة الحملات الإعلانية",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    title: "الملفات",
    href: "/files",
    icon: FolderOpen,
    description: "تنظيم ملفات المشاريع",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
  {
    title: "التقارير",
    href: "/reports",
    icon: BarChart3,
    description: "تحليلات مفصلة وتقارير ذكية",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    badge: "AI",
  },
  {
    title: "الإشعارات",
    href: "/notifications",
    icon: Bell,
    description: "تنبيهات فورية ومتابعة",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    title: "الرسائل",
    href: "/messages",
    icon: MessageSquare,
    description: "تواصل مع العملاء والفريق",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "مختبر الذكاء الاصطناعي",
    href: "/labs",
    icon: Bot,
    description: "أدوات AI متقدمة لتطوير أعمالك",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    badge: "AI",
  },
  {
    title: "الإعدادات",
    href: "/settings",
    icon: Settings,
    description: "تخصيص المنصة حسب احتياجاتك",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
]

const quickStats = [
  { label: "العملاء النشطون", value: "127", icon: Users, color: "text-green-600" },
  { label: "الطلبات الجديدة", value: "23", icon: ShoppingCart, color: "text-blue-600" },
  { label: "الإيرادات الشهرية", value: "45,230 ج.م", icon: DollarSign, color: "text-emerald-600" },
  { label: "معدل النمو", value: "+12.5%", icon: TrendingUp, color: "text-purple-600" },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 right-4 z-50 md:hidden bg-white shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">إيهاب جي إم</h1>
              <p className="text-sm text-gray-500">منصة الأعمال الذكية</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              إحصائيات سريعة
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {quickStats.map((stat, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    <span className="text-xs text-gray-600">{stat.label}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Target className="h-4 w-4" />
              القائمة الرئيسية
            </h3>
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "group flex items-start gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-gray-50",
                    isActive && "bg-blue-50 border border-blue-200"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    isActive ? "bg-blue-100" : item.bgColor
                  )}>
                    <item.icon className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-blue-600" : item.color
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "text-sm font-medium transition-colors",
                        isActive ? "text-blue-900" : "text-gray-900"
                      )}>
                        {item.title}
                      </span>
                      {item.badge && (
                        <Badge 
                          variant={item.badge === "AI" ? "default" : "secondary"} 
                          className={cn(
                            "text-xs px-2 py-0.5",
                            item.badge === "AI" && "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Contact Info */}
          <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              تواصل معنا
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <span>01022679250</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span>ehabgm200@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-3 w-3" />
                <span>EhabGM Online Services</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-xs text-gray-500">منصة موثوقة من آلاف العملاء</p>
          </div>
        </div>
      </aside>
    </>
  )
}
