"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Search, Check, Trash2, AlertCircle, Info, CheckCircle, XCircle, Volume2, VolumeX } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"

interface NotificationWithUser {
  id: string
  message?: string
  is_read: boolean
  created_at: string
  users: { name: string } | null
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    fetchNotifications()

    // Set up real-time subscription
    const subscription = supabase
      .channel("notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, (payload) => {
        if (payload.eventType === "INSERT") {
          fetchNotifications()
          if (soundEnabled) {
            playNotificationSound()
          }
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [soundEnabled])

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select(`
          id,
          message,
          is_read,
          created_at,
          users!inner(name)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id)

      if (error) throw error

      setNotifications(
        notifications.map((notification) =>
          notification.id === id ? { ...notification, is_read: true } : notification,
        ),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("is_read", false)

      if (error) throw error

      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          is_read: true,
        })),
      )
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase.from("notifications").delete().eq("id", id)

      if (error) throw error

      setNotifications(notifications.filter((notification) => notification.id !== id))
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const deleteAllRead = async () => {
    if (!confirm("هل أنت متأكد من حذف جميع الإشعارات المقروءة؟")) return

    try {
      const { error } = await supabase.from("notifications").delete().eq("is_read", true)

      if (error) throw error

      setNotifications(notifications.filter((notification) => !notification.is_read))
    } catch (error) {
      console.error("Error deleting read notifications:", error)
    }
  }

  const playNotificationSound = () => {
    const audio = new Audio("/notification-sound.mp3")
    audio.play().catch((e) => console.log("Could not play notification sound:", e))
  }

  const getNotificationIcon = (message?: string) => {
    if (!message) return <Info className="h-5 w-5 text-blue-500" />

    const msg = message.toLowerCase()
    if (msg.includes("خطأ") || msg.includes("فشل")) return <XCircle className="h-5 w-5 text-red-500" />
    if (msg.includes("تم") || msg.includes("نجح")) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (msg.includes("تحذير") || msg.includes("انتباه")) return <AlertCircle className="h-5 w-5 text-yellow-500" />

    return <Info className="h-5 w-5 text-blue-500" />
  }

  const getNotificationPriority = (message?: string) => {
    if (!message) return "normal"

    const msg = message.toLowerCase()
    if (msg.includes("عاجل") || msg.includes("مهم")) return "high"
    if (msg.includes("تذكير")) return "low"

    return "normal"
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch = notification.message?.toLowerCase().includes(searchTerm.toLowerCase())

    let matchesFilter = true
    if (filterType === "unread") matchesFilter = !notification.is_read
    if (filterType === "read") matchesFilter = notification.is_read
    if (filterType === "high") matchesFilter = getNotificationPriority(notification.message) === "high"

    return matchesSearch && matchesFilter
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 md:mr-64 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Bell className="h-8 w-8" />
                الإشعارات
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-sm">
                    {unreadCount} جديد
                  </Badge>
                )}
              </h1>
              <p className="text-gray-600">إدارة الإشعارات والتنبيهات</p>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setSoundEnabled(!soundEnabled)}>
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>

              <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
                <Check className="h-4 w-4 ml-2" />
                تسجيل الكل كمقروء
              </Button>

              <Button variant="outline" onClick={deleteAllRead}>
                <Trash2 className="h-4 w-4 ml-2" />
                حذف المقروءة
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في الإشعارات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الإشعارات</SelectItem>
                    <SelectItem value="unread">غير مقروءة</SelectItem>
                    <SelectItem value="read">مقروءة</SelectItem>
                    <SelectItem value="high">عالية الأولوية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`hover:shadow-md transition-shadow ${
                    !notification.is_read ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">{getNotificationIcon(notification.message)}</div>
                        <div className="flex-1">
                          <p className={`text-sm ${!notification.is_read ? "font-semibold" : ""}`}>
                            {notification.message || "إشعار بدون محتوى"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: ar,
                              })}
                            </span>
                            {getNotificationPriority(notification.message) === "high" && (
                              <Badge variant="destructive" className="text-xs">
                                عاجل
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredNotifications.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد إشعارات</h3>
                <p className="text-gray-500">
                  {filterType === "unread" ? "جميع الإشعارات مقروءة" : "لا توجد إشعارات تطابق المرشحات المحددة"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
