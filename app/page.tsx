"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Sparkles, Users, TrendingUp, Shield, Zap, Star, CheckCircle, Phone, Mail, Globe, BarChart3, Bot, Target, Award, Rocket, Heart, MessageSquare, Calendar, DollarSign } from 'lucide-react'

const features = [
  {
    icon: Users,
    title: "إدارة العملاء الذكية",
    description: "نظام شامل لإدارة قاعدة العملاء مع تتبع تفاعلي وتحليلات متقدمة",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: BarChart3,
    title: "تحليلات متقدمة",
    description: "تقارير تفصيلية وإحصائيات ذكية لمتابعة أداء أعمالك بدقة",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: Bot,
    title: "الذكاء الاصطناعي",
    description: "أدوات AI متطورة لتحسين الإنتاجية وأتمتة المهام الروتينية",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: Shield,
    title: "أمان متقدم",
    description: "حماية عالية المستوى لبياناتك مع تشفير متقدم وأمان شامل",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    icon: Zap,
    title: "أداء سريع",
    description: "منصة محسنة للسرعة مع استجابة فورية وتحميل سريع",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    icon: Target,
    title: "إدارة المشاريع",
    description: "نظام كانبان متقدم لتنظيم المهام ومتابعة تقدم المشاريع",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
]

const testimonials = [
  {
    name: "أحمد محمد",
    company: "شركة التقنية المتقدمة",
    content: "منصة رائعة ساعدتني في تنظيم أعمالي وزيادة الإنتاجية بشكل كبير. الواجهة سهلة الاستخدام والميزات متطورة جداً.",
    rating: 5,
    avatar: "أ.م",
  },
  {
    name: "فاطمة حسن",
    company: "مؤسسة الإبداع الرقمي",
    content: "أفضل استثمار قمت به لأعمالي. النظام شامل ومتكامل، والدعم الفني ممتاز. أنصح بها بشدة.",
    rating: 5,
    avatar: "ف.ح",
  },
  {
    name: "محمد عبدالله",
    company: "شركة النجاح للتسويق",
    content: "التحليلات والتقارير مذهلة! ساعدتني في فهم عملائي بشكل أفضل واتخاذ قرارات مدروسة.",
    rating: 5,
    avatar: "م.ع",
  },
]

const stats = [
  { label: "عميل راضٍ", value: "500+", icon: Users },
  { label: "مشروع مكتمل", value: "1200+", icon: CheckCircle },
  { label: "معدل النجاح", value: "98%", icon: TrendingUp },
  { label: "سنوات خبرة", value: "8+", icon: Award },
]

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">إيهاب جي إم</h1>
                <p className="text-xs text-gray-500">منصة الأعمال الذكية</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
                <a href="#features" className="hover:text-blue-600 transition-colors">الميزات</a>
                <a href="#testimonials" className="hover:text-blue-600 transition-colors">آراء العملاء</a>
                <a href="#contact" className="hover:text-blue-600 transition-colors">تواصل معنا</a>
              </div>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  دخول المنصة
                  <ArrowLeft className="h-4 w-4 mr-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200 mb-4">
              <Rocket className="h-3 w-3 ml-1" />
              منصة متطورة بالذكاء الاصطناعي
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              منصة <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">إيهاب جي إم</span>
              <br />
              لإدارة الأعمال الذكية
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              حلول شاملة ومتطورة لإدارة أعمالك بكفاءة عالية مع تقنيات الذكاء الاصطناعي المتقدمة
              وواجهات سهلة الاستخدام لتحقيق أقصى إنتاجية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3">
                  ابدأ الآن مجاناً
                  <ArrowLeft className="h-5 w-5 mr-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-2 hover:bg-gray-50">
                <MessageSquare className="h-5 w-5 ml-2" />
                تواصل معنا
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-4">
              <Zap className="h-3 w-3 ml-1" />
              ميزات متطورة
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              كل ما تحتاجه لإدارة أعمالك بنجاح
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              مجموعة شاملة من الأدوات والميزات المتطورة لتسهيل إدارة أعمالك وزيادة الإنتاجية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-purple-100 text-purple-800 border-purple-200 mb-4">
            <Heart className="h-3 w-3 ml-1" />
            آراء عملائنا
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            ماذا يقول عملاؤنا عنا؟
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            آراء حقيقية من عملاء راضين عن خدماتنا ومنصتنا المتطورة
          </p>

          <Card className="border-2 border-purple-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-xl text-gray-700 leading-relaxed mb-6">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{testimonials[currentTestimonial].name}</div>
                  <div className="text-gray-600">{testimonials[currentTestimonial].company}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentTestimonial ? "bg-purple-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-green-100 text-green-800 border-green-200 mb-4">
            <Phone className="h-3 w-3 ml-1" />
            تواصل معنا
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            هل أنت مستعد لتطوير أعمالك؟
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            تواصل معنا اليوم وابدأ رحلتك نحو النجاح مع منصة إيهاب جي إم المتطورة
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="border-2 border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">اتصل بنا</h3>
                <p className="text-gray-600">01022679250</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">راسلنا</h3>
                <p className="text-gray-600">ehabgm200@gmail.com</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">زر موقعنا</h3>
                <p className="text-gray-600">EhabGM Online Services</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-lg px-8 py-3">
                ابدأ الآن
                <ArrowLeft className="h-5 w-5 mr-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-2 hover:bg-gray-50">
              <Calendar className="h-5 w-5 ml-2" />
              احجز استشارة مجانية
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">إيهاب جي إم</h3>
                  <p className="text-gray-400 text-sm">منصة الأعمال الذكية</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 leading-relaxed">
                نحن نقدم حلولاً متطورة لإدارة الأعمال مع تقنيات الذكاء الاصطناعي 
                لمساعدة الشركات على تحقيق أهدافها وزيادة الإنتاجية.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>01022679250</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>ehabgm200@gmail.com</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">الخدمات</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">إدارة العملاء</a></li>
                <li><a href="#" className="hover:text-white transition-colors">التحليلات</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الذكاء الاصطناعي</a></li>
                <li><a href="#" className="hover:text-white transition-colors">إدارة المشاريع</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">الدعم</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">مركز المساعدة</a></li>
                <li><a href="#" className="hover:text-white transition-colors">تواصل معنا</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الأسئلة الشائعة</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الدعم الفني</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 إيهاب جي إم - جميع الحقوق محفوظة | EhabGM Online Services</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
