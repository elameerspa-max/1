"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface TaskWithDetails {
  id: string
  task_name: string
  task_description?: string
  status: string
  due_date?: string
  created_at: string
  assigned_to?: string
  assigned_user?: { name: string } | null
  orders: {
    clients: { name: string } | null
    services: { service_name: string } | null
  } | null
}

interface Order {
  id: string
  clients: { name: string } | null
  services: { service_name: string } | null
}

interface TeamMember {
  id: string
  user: { name: string } | null
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithDetails[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")

  const [newTask, setNewTask] = useState({
    order_id: "",
    task_name: "",
    task_description: "",
    assigned_to: "",
    due_date: "",
    priority: "medium",
  })

  useEffect(() => {
    fetchTasks()
    fetchOrders()
    fetchTeamMembers()
  }, [])

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          id,
          task_name,
          task_description,
          status,
          due_date,
          created_at,
          assigned_to,
          assigned_user:users!assigned_to(name),
          orders!inner(
            clients!inner(name),
            services!inner(service_name)
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
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
          clients!inner(name),
          services!inner(service_name)
        `)
        .in("status", ["pending", "in_progress"])

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase.from("team_members").select(`
          id,
          user:users!user_id(name)
        `)

      if (error) throw error
      setTeamMembers(data || [])
    } catch (error) {
      console.error("Error fetching team members:", error)
    }
  }

  const createTask = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            order_id: newTask.order_id,
            task_name: newTask.task_name,
            task_description: newTask.task_description,
            assigned_to: newTask.assigned_to || null,
            due_date: newTask.due_date || null,
            status: "to_do",
          },
        ])
        .select()

      if (error) throw error

      await fetchTasks()
      setNewTask({
        order_id: "",
        task_name: "",
        task_description: "",
        assigned_to: "",
        due_date: "",
        priority: "medium",
      })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error creating task:", error)
      alert("حدث خطأ أثناء إنشاء المهمة")
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId)

      if (error) throw error

      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
    } catch (error) {
      console.error("Error updating task status:", error)
    }
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId !== destination.droppableId) {
      updateTaskStatus(draggableId, destination.droppableId)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      to_do: { label: "قائمة المهام", variant: "secondary" as const, color: "bg-gray-100 text-gray-800" },
      in_progress: { label: "قيد التنفيذ", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
      review: { label: "مراجعة", variant: "outline" as const, color: "bg-yellow-100 text-yellow-800" },
      completed: { label: "مكتمل", variant: "default" as const, color: "bg-green-100 text-green-800" },
    }

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      variant: "outline" as const,
      color: "bg-gray-100 text-gray-800",
    }

    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "to_do":
        return <Clock className="h-4 w-4 text-gray-500" />
      case "in_progress":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "review":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredTasks = tasks.filter(
    (task) =>
      task.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.task_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.orders?.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const tasksByStatus = {
    to_do: filteredTasks.filter((task) => task.status === "to_do"),
    in_progress: filteredTasks.filter((task) => task.status === "in_progress"),
    review: filteredTasks.filter((task) => task.status === "review"),
    completed: filteredTasks.filter((task) => task.status === "completed"),
  }

  const TaskCard = ({ task, index }: { task: TaskWithDetails; index: number }) => (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-3 hover:shadow-md transition-shadow cursor-pointer"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-sm">{task.task_name}</h4>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {task.task_description && (
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.task_description}</p>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <User className="h-3 w-3" />
                <span>{task.orders?.clients?.name || "غير محدد"}</span>
              </div>

              {task.due_date && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(task.due_date).toLocaleDateString("ar-EG")}</span>
                </div>
              )}

              {task.assigned_user?.name && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">{task.assigned_user.name.charAt(0)}</span>
                  </div>
                  <span className="text-gray-600">{task.assigned_user.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  )

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 md:mr-64 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة المهام</h1>
              <p className="text-gray-600">تنظيم ومتابعة المهام والمشاريع</p>
            </div>

            <div className="flex items-center gap-4">
              <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <TabsList>
                  <TabsTrigger value="kanban">لوحة كانبان</TabsTrigger>
                  <TabsTrigger value="list">قائمة</TabsTrigger>
                </TabsList>
              </Tabs>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 ml-2" />
                    مهمة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إنشاء مهمة جديدة</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="order">الطلب المرتبط</Label>
                      <Select
                        value={newTask.order_id}
                        onValueChange={(value) => setNewTask({ ...newTask, order_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الطلب" />
                        </SelectTrigger>
                        <SelectContent>
                          {orders.map((order) => (
                            <SelectItem key={order.id} value={order.id}>
                              {order.services?.service_name} - {order.clients?.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="task_name">اسم المهمة</Label>
                      <Input
                        value={newTask.task_name}
                        onChange={(e) => setNewTask({ ...newTask, task_name: e.target.value })}
                        placeholder="اسم المهمة"
                      />
                    </div>

                    <div>
                      <Label htmlFor="task_description">وصف المهمة</Label>
                      <Textarea
                        value={newTask.task_description}
                        onChange={(e) => setNewTask({ ...newTask, task_description: e.target.value })}
                        placeholder="وصف تفصيلي للمهمة"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="assigned_to">المسؤول عن المهمة</Label>
                      <Select
                        value={newTask.assigned_to}
                        onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المسؤول" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.user?.name || "غير محدد"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="due_date">تاريخ الاستحقاق</Label>
                      <Input
                        type="date"
                        value={newTask.due_date}
                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                      />
                    </div>

                    <Button onClick={createTask} className="w-full" disabled={!newTask.order_id || !newTask.task_name}>
                      إنشاء المهمة
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث في المهام..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tasks Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : viewMode === "kanban" ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                  <Card key={status}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <CardTitle className="text-sm">
                            {status === "to_do" && "قائمة المهام"}
                            {status === "in_progress" && "قيد التنفيذ"}
                            {status === "review" && "مراجعة"}
                            {status === "completed" && "مكتمل"}
                          </CardTitle>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {statusTasks.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Droppable droppableId={status}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[200px]">
                            {statusTasks.map((task, index) => (
                              <TaskCard key={task.id} task={task} index={index} />
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DragDropContext>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          {getStatusIcon(task.status)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{task.task_name}</h3>
                          <p className="text-gray-600">
                            {task.orders?.services?.service_name} - {task.orders?.clients?.name}
                          </p>
                          {task.task_description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.task_description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          {getStatusBadge(task.status)}
                          {task.due_date && (
                            <p className="text-sm text-gray-500 mt-1">
                              الاستحقاق: {new Date(task.due_date).toLocaleDateString("ar-EG")}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredTasks.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مهام</h3>
                <p className="text-gray-500">ابدأ بإنشاء مهمة جديدة</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
