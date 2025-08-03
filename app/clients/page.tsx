"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Users, Plus, Search, Phone, Mail, Calendar, Edit, Trash2 } from "lucide-react"
import { supabase, type User } from "@/lib/supabase"

export default function ClientsPage() {
  const [clients, setClients] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone_number: "",
    whatsapp_number: "",
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "client")
        .order("created_at", { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setLoading(false)
    }
  }

  const addClient = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert([{ ...newClient, role: "client" }])
        .select()

      if (error) throw error

      setClients([data[0], ...clients])
      setNewClient({ name: "", email: "", phone_number: "", whatsapp_number: "" })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error adding client:", error)
      alert("حدث خطأ أثناء إضافة العميل")
    }
  }

  const deleteClient = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العميل؟")) return

    try {
      const { error } = await supabase.from("users").delete().eq("id", id)

      if (error) throw error

      setClients(clients.filter((client) => client.id !== id))
    } catch (error) {
      console.error("Error deleting client:", error)
      alert("حدث خطأ أثناء حذف العميل")
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone_number?.includes(searchTerm),
  )

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 md:mr-64 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة العملاء</h1>
              <p className="text-gray-600">إدارة قاعدة بيانات العملاء والتواصل معهم</p>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة عميل جديد
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة عميل جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">الاسم</Label>
                    <Input
                      id="name"
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      placeholder="اسم العميل"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      placeholder="example@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      value={newClient.phone_number}
                      onChange={(e) => setNewClient({ ...newClient, phone_number: e.target.value })}
                      placeholder="01234567890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">رقم الواتساب</Label>
                    <Input
                      id="whatsapp"
                      value={newClient.whatsapp_number}
                      onChange={(e) => setNewClient({ ...newClient, whatsapp_number: e.target.value })}
                      placeholder="01234567890"
                    />
                  </div>
                  <Button onClick={addClient} className="w-full">
                    إضافة العميل
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث في العملاء..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Clients Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client) => (
                <Card key={client.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{client.name || "غير محدد"}</h3>
                          <Badge variant={client.is_active ? "default" : "secondary"}>
                            {client.is_active ? "نشط" : "غير نشط"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteClient(client.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{client.email}</span>
                        </div>
                      )}
                      {client.phone_number && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{client.phone_number}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>انضم في {new Date(client.created_at).toLocaleDateString("ar-EG")}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" className="w-full bg-transparent">
                        عرض التفاصيل
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredClients.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عملاء</h3>
                <p className="text-gray-500">ابدأ بإضافة عميل جديد لرؤية البيانات هنا</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
