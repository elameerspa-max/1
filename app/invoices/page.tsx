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
import {
  FileText,
  Plus,
  Search,
  Download,
  Send,
  Eye,
  DollarSign,
  Calendar,
  User,
  Building,
  MoreHorizontal,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface InvoiceWithDetails {
  id: string
  invoice_number: string
  amount: number
  tax_amount: number
  total_amount: number
  status: "draft" | "sent" | "paid" | "overdue"
  due_date: string
  created_at: string
  orders: {
    clients: {
      name: string
      email: string
      company?: string
    } | null
    services: {
      service_name: string
      price: number
    } | null
  } | null
}

interface Order {
  id: string
  clients: {
    name: string
    email: string
    company?: string
  } | null
  services: {
    service_name: string
    price: number
  } | null
  total_amount: number
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithDetails | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const [newInvoice, setNewInvoice] = useState({
    order_id: "",
    due_date: "",
    tax_rate: 17, // 17% VAT in Palestine
    notes: "",
  })

  useEffect(() => {
    fetchInvoices()
    fetchOrders()
  }, [])

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          id,
          invoice_number,
          amount,
          tax_amount,
          total_amount,
          status,
          due_date,
          created_at,
          orders!inner(
            clients!inner(name, email, company),
            services!inner(service_name, price)
          )
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

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          total_amount,
          clients!inner(name, email, company),
          services!inner(service_name, price)
        `)
        .eq("status", "completed")
        .not("id", "in", `(SELECT order_id FROM invoices)`)

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  const generateInvoiceNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `INV-${year}${month}-${random}`
  }

  const createInvoice = async () => {
    try {
      const selectedOrder = orders.find((order) => order.id === newInvoice.order_id)
      if (!selectedOrder) return

      const amount = selectedOrder.total_amount
      const taxAmount = (amount * newInvoice.tax_rate) / 100
      const totalAmount = amount + taxAmount

      const { data, error } = await supabase
        .from("invoices")
        .insert([
          {
            order_id: newInvoice.order_id,
            invoice_number: generateInvoiceNumber(),
            amount: amount,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            due_date: newInvoice.due_date,
            status: "draft",
          },
        ])
        .select()

      if (error) throw error

      await fetchInvoices()
      await fetchOrders()
      setNewInvoice({
        order_id: "",
        due_date: "",
        tax_rate: 17,
        notes: "",
      })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error creating invoice:", error)
      alert("حدث خطأ أثناء إنشاء الفاتورة")
    }
  }

  const updateInvoiceStatus = async (invoiceId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("invoices").update({ status: newStatus }).eq("id", invoiceId)

      if (error) throw error

      setInvoices(
        invoices.map((invoice) => (invoice.id === invoiceId ? { ...invoice, status: newStatus as any } : invoice)),
      )
    } catch (error) {
      console.error("Error updating invoice status:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { label: "مسودة", color: "bg-gray-100 text-gray-800" },
      sent: { label: "مرسلة", color: "bg-blue-100 text-blue-800" },
      paid: { label: "مدفوعة", color: "bg-green-100 text-green-800" },
      overdue: { label: "متأخرة", color: "bg-red-100 text-red-800" },
    }

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      color: "bg-gray-100 text-gray-800",
    }

    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
  }

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== "paid"
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.orders?.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.orders?.clients?.company?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalStats = {
    total: invoices.reduce((sum, inv) => sum + inv.total_amount, 0),
    paid: invoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.total_amount, 0),
    pending: invoices.filter((inv) => inv.status === "sent").reduce((sum, inv) => sum + inv.total_amount, 0),
    overdue: invoices.filter((inv) => inv.status === "overdue").reduce((sum, inv) => sum + inv.total_amount, 0),
  }

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
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="order">الطلب</Label>
                    <Select
                      value={newInvoice.order_id}
                      onValueChange={(value) => setNewInvoice({ ...newInvoice, order_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الطلب" />
                      </SelectTrigger>
                      <SelectContent>
                        {orders.map((order) => (
                          <SelectItem key={order.id} value={order.id}>
                            <div className="flex flex-col">
                              <span>{order.services?.service_name}</span>
                              <span className="text-sm text-gray-500">
                                {order.clients?.name} - ₪{order.total_amount}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="due_date">تاريخ الاستحقاق</Label>
                    <Input
                      type="date"
                      value={newInvoice.due_date}
                      onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tax_rate">معدل الضريبة (%)</Label>
                    <Input
                      type="number"
                      value={newInvoice.tax_rate}
                      onChange={(e) => setNewInvoice({ ...newInvoice, tax_rate: Number(e.target.value) })}
                      min="0"
                      max="100"
                    />
                  </div>

                  <Button
                    onClick={createInvoice}
                    className="w-full"
                    disabled={!newInvoice.order_id || !newInvoice.due_date}
                  >
                    إنشاء الفاتورة
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الفواتير</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₪{totalStats.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">جميع الفواتير</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المدفوعة</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₪{totalStats.paid.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">تم الدفع</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">في الانتظار</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">₪{totalStats.pending.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">مرسلة</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متأخرة</CardTitle>
                <DollarSign className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">₪{totalStats.overdue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">متأخرة الدفع</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="البحث في الفواتير..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="sent">مرسلة</SelectItem>
                      <SelectItem value="paid">مدفوعة</SelectItem>
                      <SelectItem value="overdue">متأخرة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-48"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
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
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{invoice.invoice_number}</h3>
                            {getStatusBadge(invoice.status)}
                            {isOverdue(invoice.due_date, invoice.status) && (
                              <Badge className="bg-red-100 text-red-800">متأخرة</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{invoice.orders?.clients?.name}</span>
                            </div>
                            {invoice.orders?.clients?.company && (
                              <div className="flex items-center gap-1">
                                <Building className="h-4 w-4" />
                                <span>{invoice.orders?.clients?.company}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>الاستحقاق: {new Date(invoice.due_date).toLocaleDateString("ar-EG")}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{invoice.orders?.services?.service_name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <div className="text-2xl font-bold text-gray-900">
                            ₪{invoice.total_amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            المبلغ: ₪{invoice.amount.toLocaleString()} + ضريبة: ₪{invoice.tax_amount.toLocaleString()}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(invoice)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {invoice.status === "draft" && (
                            <Button variant="ghost" size="sm" onClick={() => updateInvoiceStatus(invoice.id, "sent")}>
                              <Send className="h-4 w-4" />
                            </Button>
                          )}

                          {invoice.status === "sent" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateInvoiceStatus(invoice.id, "paid")}
                              className="text-green-600 hover:text-green-700"
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          )}

                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>

                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
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

          {/* Invoice View Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>عرض الفاتورة</DialogTitle>
              </DialogHeader>
              {selectedInvoice && (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedInvoice.invoice_number}</h2>
                      <p className="text-gray-600">
                        تاريخ الإنشاء: {new Date(selectedInvoice.created_at).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                    {getStatusBadge(selectedInvoice.status)}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">معلومات العميل</h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>الاسم:</strong> {selectedInvoice.orders?.clients?.name}
                        </p>
                        <p>
                          <strong>البريد:</strong> {selectedInvoice.orders?.clients?.email}
                        </p>
                        {selectedInvoice.orders?.clients?.company && (
                          <p>
                            <strong>الشركة:</strong> {selectedInvoice.orders?.clients?.company}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">تفاصيل الفاتورة</h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>الخدمة:</strong> {selectedInvoice.orders?.services?.service_name}
                        </p>
                        <p>
                          <strong>تاريخ الاستحقاق:</strong>{" "}
                          {new Date(selectedInvoice.due_date).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>المبلغ الأساسي:</span>
                        <span>₪{selectedInvoice.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الضريبة:</span>
                        <span>₪{selectedInvoice.tax_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>المجموع:</span>
                        <span>₪{selectedInvoice.total_amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">
                      <Download className="h-4 w-4 ml-2" />
                      تحميل PDF
                    </Button>
                    {selectedInvoice.status === "draft" && (
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => {
                          updateInvoiceStatus(selectedInvoice.id, "sent")
                          setIsViewDialogOpen(false)
                        }}
                      >
                        <Send className="h-4 w-4 ml-2" />
                        إرسال
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}
