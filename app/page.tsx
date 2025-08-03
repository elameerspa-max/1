"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard
    router.push("/dashboard")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">EhabGM Platform</h1>
        <p className="text-gray-600">جاري التحويل إلى لوحة التحكم...</p>
      </div>
    </div>
  )
}
