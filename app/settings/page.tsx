"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Bell, Shield, Database, Bot, MessageSquare, Save, RefreshCw } from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    companyName: "EhabGM Online Services",
    companyEmail: "ehabgm200@gmail.com",
    companyPhone: "01022679250",
    companyAddress: "القاهرة، مصر",

    // Notification Settings
    emailNotifications: true,
    whatsappNotifications: true,
    pushNotifications: true,
    soundEnabled: true,

    // AI Settings
    openaiEnabled: true,
    geminiEnabled: true,
    autoGenerateContent: false,
    aiResponseDelay: 1000,

    // WhatsApp Settings
    greenApiInstanceId: "7103121490",
    greenApiToken: "5302bc690deb405c9bd36048a27167e4c0baaa81616449d0d",
    whatsappAutoReply: false,

    // Theme Settings
    darkMode: false,
    language: "ar",
    rtlSupport: true,

    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,

    // Database Settings
    autoBackup: true,
    backupFrequency: "daily",
    dataRetention: 365,
  })

  const [saving, setSaving] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      // Simulate API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Save to localStorage for demo purposes
      localStorage.setItem("ehabgm-settings", JSON.stringify(settings))

      alert("تم حفظ الإعدادات بنجاح!")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("حدث خطأ أثناء حفظ الإعدادات")
    } finally {
      setSaving(false)
    }
  }

  const testWhatsAppConnection = async () => {
    setTestingConnection(true)
    try {
      // Test WhatsApp API connection
      const response = await fetch(
        `https://api.green-api.com/waInstance${settings.greenApiInstanceId}/getStateInstance/${settings.greenApiToken}`,
      )

      if (response.ok) {
        alert("تم الاتصال بواتساب بنجاح!")
      } else {
        alert("فشل في الاتصال بواتساب. يرجى التحقق من البيانات.")
      }
    } catch (error) {
      console.error("Error testing WhatsApp connection:", error)
      alert("حدث خطأ أثناء اختبار الاتصال")
    } finally {
      setTestingConnection(false)
    }
  }

  const resetToDefaults = () => {
    if (confirm("هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟")) {
      setSettings({
        companyName: "EhabGM Online Services",
        companyEmail: "ehabgm200@gmail.com",
        companyPhone: "01022679250",
        companyAddress: "القاهرة، مصر",
        emailNotifications: true,
        whatsappNotifications: true,
        pushNotifications: true,
        soundEnabled: true,
        openaiEnabled: true,
        geminiEnabled: true,
        autoGenerateContent: false,
        aiResponseDelay: 1000,
        greenApiInstanceId: "7103121490",
        greenApiToken: "5302bc690deb405c9bd36048a27167e4c0baaa81616449d0d",
        whatsappAutoReply: false,
        darkMode: false,
        language: "ar",
        rtlSupport: true,
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordExpiry: 90,
        autoBackup: true,
        backupFrequency: "daily",
        dataRetention: 365,
      })
    }
  }

  useEffect(() => {
    // Load settings from localStorage on component mount
    const savedSettings = localStorage.getItem("ehabgm-settings")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings((prev) => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error("Error loading saved settings:", error)
      }
    }
  }, [])

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 md:mr-64 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Settings className="h-8 w-8" />
                الإعدادات
              </h1>
              <p className="text-gray-600">إدارة إعدادات النظام والتخصيص</p>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={resetToDefaults}>
                <RefreshCw className="h-4 w-4 ml-2" />
                إعادة تعيين
              </Button>
              <Button onClick={saveSettings} disabled={saving}>
                <Save className="h-4 w-4 ml-2" />
                {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                عام
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                الإشعارات
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                الذكاء الاصطناعي
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                واتساب
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                الأمان
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                النظام
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    الإعدادات العامة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="companyName">اسم الشركة</Label>
                      <Input
                        id="companyName"
                        value={settings.companyName}
                        onChange={(e) => handleSettingChange("companyName", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyEmail">البريد الإلكتروني</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={settings.companyEmail}
                        onChange={(e) => handleSettingChange("companyEmail", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyPhone">رقم الهاتف</Label>
                      <Input
                        id="companyPhone"
                        value={settings.companyPhone}
                        onChange={(e) => handleSettingChange("companyPhone", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="language">اللغة</Label>
                      <Select
                        value={settings.language}
                        onValueChange={(value) => handleSettingChange("language", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ar">العربية</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="companyAddress">العنوان</Label>
                    <Textarea
                      id="companyAddress"
                      value={settings.companyAddress}
                      onChange={(e) => handleSettingChange("companyAddress", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>الوضع المظلم</Label>
                      <p className="text-sm text-gray-500">تفعيل المظهر المظلم للواجهة</p>
                    </div>
                    <Switch
                      checked={settings.darkMode}
                      onCheckedChange={(checked) => handleSettingChange("darkMode", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>دعم الكتابة من اليمين لليسار</Label>
                      <p className="text-sm text-gray-500">تحسين الواجهة للغة العربية</p>
                    </div>
                    <Switch
                      checked={settings.rtlSupport}
                      onCheckedChange={(checked) => handleSettingChange("rtlSupport", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    إعدادات الإشعارات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>إشعارات البريد الإلكتروني</Label>
                      <p className="text-sm text-gray-500">استقبال الإشعارات عبر البريد الإلكتروني</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>إشعارات الواتساب</Label>
                      <p className="text-sm text-gray-500">استقبال الإشعارات عبر الواتساب</p>
                    </div>
                    <Switch
                      checked={settings.whatsappNotifications}
                      onCheckedChange={(checked) => handleSettingChange("whatsappNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>الإشعارات الفورية</Label>
                      <p className="text-sm text-gray-500">إشعارات فورية في المتصفح</p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>الأصوات</Label>
                      <p className="text-sm text-gray-500">تشغيل أصوات الإشعارات</p>
                    </div>
                    <Switch
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => handleSettingChange("soundEnabled", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Settings */}
            <TabsContent value="ai">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    إعدادات الذكاء الاصطناعي
                    <Badge variant="secondary">AI</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>تفعيل OpenAI GPT</Label>
                      <p className="text-sm text-gray-500">استخدام GPT لتوليد المحتوى</p>
                    </div>
                    <Switch
                      checked={settings.openaiEnabled}
                      onCheckedChange={(checked) => handleSettingChange("openaiEnabled", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>تفعيل Google Gemini</Label>
                      <p className="text-sm text-gray-500">استخدام Gemini للتحليل المتقدم</p>
                    </div>
                    <Switch
                      checked={settings.geminiEnabled}
                      onCheckedChange={(checked) => handleSettingChange("geminiEnabled", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>التوليد التلقائي للمحتوى</Label>
                      <p className="text-sm text-gray-500">توليد المحتوى تلقائياً عند إنشاء الحملات</p>
                    </div>
                    <Switch
                      checked={settings.autoGenerateContent}
                      onCheckedChange={(checked) => handleSettingChange("autoGenerateContent", checked)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="aiResponseDelay">تأخير الاستجابة (مللي ثانية)</Label>
                    <Input
                      id="aiResponseDelay"
                      type="number"
                      value={settings.aiResponseDelay}
                      onChange={(e) => handleSettingChange("aiResponseDelay", Number.parseInt(e.target.value))}
                      min="0"
                      max="5000"
                    />
                    <p className="text-sm text-gray-500 mt-1">تأخير اختياري لمحاكاة الكتابة الطبيعية</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* WhatsApp Settings */}
            <TabsContent value="whatsapp">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    إعدادات الواتساب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="greenApiInstanceId">معرف Instance ID</Label>
                    <Input
                      id="greenApiInstanceId"
                      value={settings.greenApiInstanceId}
                      onChange={(e) => handleSettingChange("greenApiInstanceId", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="greenApiToken">API Token</Label>
                    <Input
                      id="greenApiToken"
                      type="password"
                      value={settings.greenApiToken}
                      onChange={(e) => handleSettingChange("greenApiToken", e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={testWhatsAppConnection} disabled={testingConnection}>
                      {testingConnection ? "جاري الاختبار..." : "اختبار الاتصال"}
                    </Button>
                    <Badge variant="outline" className="text-green-600">
                      متصل
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>الرد التلقائي</Label>
                      <p className="text-sm text-gray-500">تفعيل الردود التلقائية على الرسائل</p>
                    </div>
                    <Switch
                      checked={settings.whatsappAutoReply}
                      onCheckedChange={(checked) => handleSettingChange("whatsappAutoReply", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    إعدادات الأمان
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>المصادقة الثنائية</Label>
                      <p className="text-sm text-gray-500">تفعيل المصادقة الثنائية للحساب</p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => handleSettingChange("twoFactorAuth", checked)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sessionTimeout">انتهاء الجلسة (دقيقة)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange("sessionTimeout", Number.parseInt(e.target.value))}
                      min="5"
                      max="480"
                    />
                  </div>

                  <div>
                    <Label htmlFor="passwordExpiry">انتهاء صلاحية كلمة المرور (يوم)</Label>
                    <Input
                      id="passwordExpiry"
                      type="number"
                      value={settings.passwordExpiry}
                      onChange={(e) => handleSettingChange("passwordExpiry", Number.parseInt(e.target.value))}
                      min="30"
                      max="365"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    إعدادات النظام
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>النسخ الاحتياطي التلقائي</Label>
                      <p className="text-sm text-gray-500">إنشاء نسخ احتياطية تلقائية من البيانات</p>
                    </div>
                    <Switch
                      checked={settings.autoBackup}
                      onCheckedChange={(checked) => handleSettingChange("autoBackup", checked)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="backupFrequency">تكرار النسخ الاحتياطي</Label>
                    <Select
                      value={settings.backupFrequency}
                      onValueChange={(value) => handleSettingChange("backupFrequency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">كل ساعة</SelectItem>
                        <SelectItem value="daily">يومياً</SelectItem>
                        <SelectItem value="weekly">أسبوعياً</SelectItem>
                        <SelectItem value="monthly">شهرياً</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dataRetention">مدة الاحتفاظ بالبيانات (يوم)</Label>
                    <Input
                      id="dataRetention"
                      type="number"
                      value={settings.dataRetention}
                      onChange={(e) => handleSettingChange("dataRetention", Number.parseInt(e.target.value))}
                      min="30"
                      max="3650"
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-4">معلومات النظام</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">إصدار النظام:</span>
                        <span className="font-medium ml-2">v2.1.0</span>
                      </div>
                      <div>
                        <span className="text-gray-500">آخر تحديث:</span>
                        <span className="font-medium ml-2">2024-01-15</span>
                      </div>
                      <div>
                        <span className="text-gray-500">قاعدة البيانات:</span>
                        <span className="font-medium ml-2">Supabase</span>
                      </div>
                      <div>
                        <span className="text-gray-500">الخادم:</span>
                        <span className="font-medium ml-2">Vercel</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
