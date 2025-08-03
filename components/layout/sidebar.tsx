"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Megaphone,
  Settings,
  MessageSquare,
  BarChart3,
  Calendar,
  Folder,
  Bell,
  Bot,
  DollarSign,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
  { name: "العملاء", href: "/clients", icon: Users },
  { name: "الطلبات", href: "/orders", icon: ShoppingCart },
  { name: "الحملات", href: "/campaigns", icon: Megaphone },
  { name: "الفواتير", href: "/invoices", icon: DollarSign },
  { name: "المهام", href: "/tasks", icon: Calendar },
  { name: "الملفات", href: "/files", icon: Folder },
  { name: "التقارير", href: "/reports", icon: BarChart3 },
  { name: "الإشعارات", href: "/notifications", icon: Bell },
  { name: "المعامل الذكية", href: "/labs", icon: Bot },
  { name: "الرسائل", href: "/messages", icon: MessageSquare },
  { name: "الإعدادات", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-40 w-64 bg-white border-l border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">EhabGM Platform</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="ml-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">إ</span>
                </div>
              </div>
              <div className="mr-3">
                <p className="text-sm font-medium text-gray-900">إيهاب محمد</p>
                <p className="text-xs text-gray-500">مدير النظام</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
