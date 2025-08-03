import type { Metadata } from "next"
import { Cairo } from 'next/font/google'
import "./globals.css"

const cairo = Cairo({ 
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo"
})

export const metadata: Metadata = {
  title: "إيهاب جي إم - منصة الأعمال الذكية",
  description: "منصة شاملة لإدارة الأعمال والعملاء مع تقنيات الذكاء الاصطناعي المتقدمة",
  keywords: "إدارة الأعمال, العملاء, الذكاء الاصطناعي, التسويق الرقمي, إيهاب جي إم",
  authors: [{ name: "EhabGM", url: "https://ehabgm.com" }],
  creator: "EhabGM Online Services",
  publisher: "EhabGM",
  robots: "index, follow",
  openGraph: {
    title: "إيهاب جي إم - منصة الأعمال الذكية",
    description: "منصة شاملة لإدارة الأعمال والعملاء مع تقنيات الذكاء الاصطناعي المتقدمة",
    url: "https://ehabgm.com",
    siteName: "EhabGM Platform",
    locale: "ar_EG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "إيهاب جي إم - منصة الأعمال الذكية",
    description: "منصة شاملة لإدارة الأعمال والعملاء مع تقنيات الذكاء الاصطناعي المتقدمة",
    creator: "@ehabgm",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#3B82F6",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${cairo.className} font-cairo antialiased bg-gray-50 text-gray-900`}>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
