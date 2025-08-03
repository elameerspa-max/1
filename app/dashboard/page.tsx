"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, TrendingUp, Users, ShoppingCart, DollarSign, Calendar, Bell, Plus, ArrowLeft, Sparkles, Target, Zap } from 'lucide-react'

const quickActions = [
  {
    title: "إضافة عميل جديد",
    description: "إضافة عميل جديد إلى قاعدة البيانات",
    href: "/clients",
    icon: Users,
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    title: "إنشاء طلب جديد",
    description: "إنشاء طلب جديد لأحد العملاء",
    href: "/orders",
    icon: ShoppingCart,
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    title: "إنشاء فاتورة",
    description: "إنشاء فاتورة جديدة للطلبات المكتملة",
    href: "/invoices",
    icon: DollarSign,
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    title: "إضافة مهمة",
    description: "إضافة مهمة جديدة لفريق العمل",
    href: "/tasks",
    icon: Target,
    color: "bg-orange-500 hover:bg-orange-600",
  },
]

const upcomingTasks = [
  {
    title: "مراجعة تصميم موقع شركة التقنية",
    client: "أحمد محمد",
    dueDate: "اليوم",
    priority: "عالية",
    status: "قيد المراجعة",
  },
  {
    title: "تسليم حملة فيسبوك لمؤسسة الإبداع",
    client: "فاطمة حسن",
    dueDate: "غداً",
    priority: "متوسطة",
    status: "في التنفيذ",
  },
  {
    title: "استشارة تسويقية لشركة النجاح",
    client: "محمد عبدالله",
    dueDate: "بعد يومين",
    priority: "منخفضة",
    status: "مجدولة",
  },
]

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 md:mr-80 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <LayoutDashboard className="h-6 w-6 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <Sparkles className="h-3 w-3 ml-1" />
                  AI
                </Badge>
              </div>
              <p className="text-gray-600">مرحباً بك في منصة إيهاب جي إم الذكية</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 ml-2" />
                اليوم
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 ml-2" />
                الإشعارات
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 ml-2" />
                إضافة جديد
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity - Takes 2 columns */}
            <div className="lg:col-span-2">
              <RecentActivity />
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              {/* Quick Actions Card */}
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Zap className="h-5 w-5 text-purple-600" />
                    </div>
                    إجراءات سريعة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start h-auto p-4 hover:bg-white/80 border border-gray-200 hover:border-purple-300 transition-all"
                      asChild
                    >
                      <a href={action.href}>
                        <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                          <action.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-right flex-1">
                          <div className="font-medium text-gray-900">{action.title}</div>
                          <div className="text-xs text-gray-500">{action.description}</div>
                        </div>
                        <ArrowLeft className="h-4 w-4 text-gray-400" />
                      </a>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Upcoming Tasks */}
              <Card className="border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-900">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    المهام القادمة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingTasks.map((task, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border border-orange-200 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm leading-tight">{task.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            task.priority === "عالية" 
                              ? "border-red-200 text-red-700 bg-red-50" 
                              : task.priority === "متوسطة"
                              ? "border-yellow-200 text-yellow-700 bg-yellow-50"
                              : "border-green-200 text-green-700 bg-green-50"
                          }`}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{task.client}</span>
                        <span>{task.dueDate}</span>
                      </div>
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                    عرض جميع المهام
                    <ArrowLeft className="h-4 w-4 mr-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Performance Overview */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-white to-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                نظرة عامة على الأداء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">127</div>
                  <p className="text-sm text-gray-600">عميل نشط</p>
                  <div className="text-xs text-green-600 mt-1">+8.2% من الشهر الماضي</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">23</div>
                  <p className="text-sm text-gray-600">طلب جديد</p>
                  <div className="text-xs text-blue-600 mt-1">+15.3% من الشهر الماضي</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">45,230 ج.م</div>
                  <p className="text-sm text-gray-600">الإيرادات الشهرية</p>
                  <div className="text-xs text-purple-600 mt-1">+12.5% من الشهر الماضي</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">98%</div>
                  <p className="text-sm text-gray-600">معدل رضا العملاء</p>
                  <div className="text-xs text-orange-600 mt-1">+2.1% من الشهر الماضي</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
