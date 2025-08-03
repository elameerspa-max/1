"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DollarSign, Plus, Search, Eye, Download, Send, Calendar, User, FileText, CreditCard } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface InvoiceWithDetails {
  id: string
  amount: number
  status: string
  issue_date: string
  created_at: string
  users: { name: string; email: string; whatsapp_number?: string } | null
}

interface Client {
  id: string
  name: string
  email: string
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const [newInvoice, setNewInvoice] = useState({
    client_id: "",
    amount: "",
    description: "",
    due_date: "",
  })

  const [stats, setStats] = useState({
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    overdueAmount: 0,
  })

  useEffect(() => {
    fetchInvoices()
    fetchClients()
  }, [])

  useEffect(() => {
    calculateStats()
  }, [invoices])

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          id,
          amount,
          status,
          issue_date,
          created_at,
          users!inner(name, email, whatsapp_number)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setInvoices(data || [])
    } catch (error) {
      console.error("Error fetching invoices:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase.from("users").select("id, name, email").eq("role", "client")

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const calculateStats = () => {
    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
    const paidAmount = invoices
      .filter((invoice) => invoice.status === "paid")
      .reduce((sum, invoice) => sum + invoice.amount, 0)
    const unpaidAmount = invoices
      .filter((invoice) => invoice.status === "unpaid")
      .reduce((sum, invoice) => sum + invoice.amount, 0)
    const overdueAmount = invoices
      .filter((invoice) => invoice.status === "overdue")
      .reduce((sum, invoice) => sum + invoice.amount, 0)

    setStats({ totalAmount, paidAmount, unpaidAmount, overdueAmount })
  }

  const createInvoice = async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .insert([
          {
            user_id: newInvoice.client_id,
            amount: Number.parseFloat(newInvoice.amount),
            status: "unpaid",
            issue_date: new Date().toISOString(),
          },
        ])
        .select()

      if (error) throw error

      await fetchInvoices()
      setNewInvoice({ client_id: "", amount: "", description: "", due_date: "" })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error creating invoice:", error)
      alert("حدث خطأ أثناء إنشاء الفاتورة")
    }
  }

  const updateInvoiceStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("invoices").update({ status }).eq("id", id)

      if (error) throw error

      setInvoices(invoices.map((invoice) => (invoice.id === id ? { ...invoice, status } : invoice)))
    } catch (error) {
      console.error("Error updating invoice status:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      paid: { label: "مدفوع", variant: "default" as const, color: "bg-green-100 text-green-800" },
      unpaid: { label: "غير مدفوع", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
      overdue: { label: "متأخر", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
    }

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      variant: "outline" as const,
      color: "bg-gray-100 text-gray-800",
    }

    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.amount.toString().includes(searchTerm)

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const statsCards = [
    {
      title: "إجمالي الفواتير",
      value: `${stats.totalAmount.toLocaleString()} ج.م`,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "المبالغ المحصلة",
      value: `${stats.paidAmount.toLocaleString()} ج.م`,
      icon: CreditCard,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "المبالغ المستحقة",
      value: `${stats.unpaidAmount.toLocaleString()} ج.م`,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "المبالغ المتأخرة",
      value: `${stats.overdueAmount.toLocaleString()} ج.م`,
      icon: Calendar,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 md:mr-64 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الفواتير</h1>
              <p className="text-gray-600">إنشاء ومتابعة الفواتير والمدفوعات</p>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  فاتورة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="client">العميل</Label>
                    <Select
                      value={newInvoice.client_id}
                      onValueChange={(value) => setNewInvoice({ ...newInvoice, client_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر العميل" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} - {client.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amount">المبلغ (ج.م)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newInvoice.amount}
                      onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">وصف الفاتورة</Label>
                    <Input
                      value={newInvoice.description}
                      onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
                      placeholder="وصف الخدمة أو المنتج"
                    />
                  </div>

                  <div>
                    <Label htmlFor="due_date">تاريخ الاستحقاق</Label>
                    <Input
                      type="date"
                      value={newInvoice.due_date}
                      onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                    />
                  </div>

                  <Button
                    onClick={createInvoice}
                    className="w-full"
                    disabled={!newInvoice.client_id || !newInvoice.amount}
                  >
                    إنشاء الفاتورة
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((card, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
                  <div className={`p-2 rounded-full ${card.bgColor}`}>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في الفواتير..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفواتير</SelectItem>
                    <SelectItem value="paid">مدفوع</SelectItem>
                    <SelectItem value="unpaid">غير مدفوع</SelectItem>
                    <SelectItem value="overdue">متأخر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Invoices List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">فاتورة #{invoice.id.slice(0, 8)}</h3>
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="h-4 w-4" />
                            <span>{invoice.users?.name || "عميل غير محدد"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>تاريخ الإصدار: {new Date(invoice.issue_date).toLocaleDateString("ar-EG")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <p className="font-bold text-2xl text-green-600">{invoice.amount.toLocaleString()} ج.م</p>
                          {getStatusBadge(invoice.status)}
                        </div>

                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>

                        {invoice.status === "unpaid" && (
                          <Button size="sm" onClick={() => updateInvoiceStatus(invoice.id, "paid")}>
                            تسجيل الدفع
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredInvoices.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فواتير</h3>
                <p className="text-gray-500">ابدأ بإنشاء فاتورة جديدة</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
