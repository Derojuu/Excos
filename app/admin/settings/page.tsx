"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { AdminSidebar, AdminSidebarRef } from "@/components/admin-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoadingOverlay } from "@/components/loading-overlay"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import type { User as UserType } from "@/app/types/index"
import {
  Settings,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Mail,
  Shield,
  Bell,
  FileText,
  Database,
  Clock,
  Edit3,
  X,
  GripVertical,
  Menu,
  LogOut,
  User,
  BarChart3,
} from "lucide-react"
import {
  getAdminSettings,
  updateComplaintCategories,
  updateSystemSettings,
  updateNotificationSettings,
  createComplaintCategory,
  deleteComplaintCategory,
  testEmailConfiguration,
  exportSystemData,
} from "@/app/actions/admin-settings"

interface ComplaintCategory {
  id: string
  name: string
  description: string
  isActive: boolean
}

interface StatusWorkflow {
  id: string
  name: string
  order: number
  color: string
  isActive: boolean
}

interface SystemSettings {
  autoAssignment: boolean
  requireApproval: boolean
  enableNotifications: boolean
  sessionTimeout: number
  maxFileSize: number
  allowedFileTypes: string[]
}

interface NotificationSettings {
  emailEnabled: boolean
  smsEnabled: boolean
  escalationTime: number
  reminderTime: number
  adminNotifications: boolean
  studentNotifications: boolean
}

export default function AdminSettings() {
  const router = useRouter()
  const adminSidebarRef = useRef<AdminSidebarRef>(null)
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("categories")

  // Data states
  const [categories, setCategories] = useState<ComplaintCategory[]>([])
  const [statuses, setStatuses] = useState<StatusWorkflow[]>([])
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    autoAssignment: false,
    requireApproval: false,
    enableNotifications: false,
    sessionTimeout: 30,
    maxFileSize: 10,
    allowedFileTypes: [],
  })
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailEnabled: false,
    smsEnabled: false,
    escalationTime: 48,
    reminderTime: 24,
    adminNotifications: false,
    studentNotifications: false,
  })

  // Form states
  const [newCategory, setNewCategory] = useState({ name: "", description: "" })
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check-auth", {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Auth check failed")
        }

        const data = await response.json()

        if (data.role !== "admin") {
          router.push("/profile")
          return
        }

        setUser(data)
        loadSettings()
      } catch (error) {
        console.error("Auth error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
        window.location.href = "/login"
      } else {
        toast({
          title: "Logout failed",
          description: "An error occurred while logging out",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out",
        variant: "destructive",
      })
    }
  }

  const loadSettings = async () => {
    try {
      const result = await getAdminSettings()
      if (result.success && result.data) {
        setCategories(result.data.complaintCategories)
        setStatuses(result.data.statusWorkflow)
        setSystemSettings(result.data.systemSettings)
        setNotificationSettings(result.data.notificationSettings)
      } else {
        toast({
          title: "Error loading settings",
          description: result.error || "Failed to load admin settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load admin settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const result = await createComplaintCategory(newCategory)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        setNewCategory({ name: "", description: "" })
        loadSettings()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    setSaving(true)
    try {
      const result = await deleteComplaintCategory(categoryId)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        loadSettings()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateCategories = async () => {
    setSaving(true)
    try {
      const result = await updateComplaintCategories(categories)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        setEditingCategory(null)
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update categories",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateSystemSettings = async () => {
    setSaving(true)
    try {
      const result = await updateSystemSettings(systemSettings)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update system settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateNotificationSettings = async () => {
    setSaving(true)
    try {
      const result = await updateNotificationSettings(notificationSettings)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    setSaving(true)
    try {
      const result = await testEmailConfiguration()
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleExportData = async (dataType: string) => {
    setSaving(true)
    try {
      const result = await exportSystemData(dataType)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        // In a real app, trigger file download here
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }
  if (loading) {
    return <LoadingOverlay isLoading={true} message="Loading admin settings..." />
  }  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 relative">
      <AdminSidebar ref={adminSidebarRef}>
        <div />
      </AdminSidebar>
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-800/10 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 dark:bg-blue-800/10 rounded-full opacity-40 animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="glass-effect border-b border-white/20 dark:border-gray-700/20 sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            {/* Menu button for mobile and desktop */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/20"
              onClick={() => adminSidebarRef.current?.toggleSidebar()}
            >
              <Menu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gradient truncate">System Settings</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                Configure system-wide settings and preferences
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {user && (
              <>
                <ThemeToggle />
                <Link href={`/admin/analytics`}>
                  <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20 text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4">
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Analytics</span>
                  </Button>
                </Link>
                <Link href={`/admin/profile`}>
                  <Button className="btn-gradient shadow-lg text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Profile</span>
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6"
          >
            <div className="space-y-1 sm:space-y-2">
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs sm:text-sm w-fit">
                <Shield className="w-3 h-3 mr-1" />
                Admin Only
              </Badge>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                onClick={loadSettings}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Refresh
              </Button>
            </div>
          </motion.div>

          {/* Settings Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >            <Card className="glass-effect border-0 shadow-xl">
              <CardHeader className="border-b border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Admin Configuration</CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Manage system-wide settings that affect all users
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl h-auto">
                  <TabsTrigger
                    value="categories"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all font-medium text-xs sm:text-sm p-2 sm:p-3 text-gray-700 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
                  >
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Categories
                  </TabsTrigger>
                  <TabsTrigger
                    value="workflow"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all font-medium text-xs sm:text-sm p-2 sm:p-3 text-gray-700 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
                  >
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Workflow
                  </TabsTrigger>
                  <TabsTrigger
                    value="system"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all font-medium text-xs sm:text-sm p-2 sm:p-3 text-gray-700 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
                  >
                    <Database className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    System
                  </TabsTrigger>
                  <TabsTrigger
                    value="notifications"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all font-medium text-xs sm:text-sm p-2 sm:p-3 text-gray-700 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
                  >
                    <Bell className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Notifications
                  </TabsTrigger>
                </TabsList>{/* Complaint Categories Tab */}
                <TabsContent value="categories" className="space-y-4 sm:space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Complaint Categories</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage the types of complaints students can submit</p>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  {/* Add New Category */}
                  <Card className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base font-semibold flex items-center text-gray-900 dark:text-gray-100">
                        <Plus className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                        Add New Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="categoryName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Category Name
                          </Label>
                          <Input
                            id="categoryName"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            placeholder="e.g., Academic Issues"
                            className="h-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="categoryDescription" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                          </Label>
                          <Input
                            id="categoryDescription"
                            value={newCategory.description}
                            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                            placeholder="Brief description of this category"
                            className="h-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleCreateCategory}
                        disabled={saving || !newCategory.name.trim()}
                        className="btn-gradient w-full sm:w-auto"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Category
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>                  {/* Existing Categories */}
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <Card key={category.id} className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4">
                          {editingCategory === category.id ? (
                            <div className="space-y-4">
                              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category Name</Label>
                                  <Input
                                    value={category.name}
                                    onChange={(e) =>
                                      setCategories(
                                        categories.map((cat) =>
                                          cat.id === category.id ? { ...cat, name: e.target.value } : cat,
                                        ),
                                      )
                                    }
                                    className="h-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                                  <Input
                                    value={category.description}
                                    onChange={(e) =>
                                      setCategories(
                                        categories.map((cat) =>
                                          cat.id === category.id ? { ...cat, description: e.target.value } : cat,
                                        ),
                                      )
                                    }
                                    className="h-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                  onClick={handleUpdateCategories}
                                  disabled={saving}
                                  size="sm"
                                  className="btn-gradient w-full sm:w-auto"
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  Save
                                </Button>
                                <Button
                                  onClick={() => setEditingCategory(null)}
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 w-full sm:w-auto"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{category.name}</h4>
                                  <Badge
                                    className={
                                      category.isActive
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700 text-xs w-fit"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600 text-xs w-fit"
                                    }
                                  >
                                    {category.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <Button
                                  onClick={() => setEditingCategory(category.id)}
                                  variant="outline"
                                  size="sm"
                                  className="border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 h-8 w-8 p-0"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteCategory(category.id)}
                                  variant="outline"
                                  size="sm"
                                  className="border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                                  disabled={saving}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Status Workflow Tab */}                <TabsContent value="workflow" className="space-y-4 sm:space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Status Workflow</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Configure the complaint status progression</p>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="space-y-3 sm:space-y-4">
                    {statuses
                      .sort((a, b) => a.order - b.order)
                      .map((status) => (
                        <Card key={status.id} className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">#{status.order}</span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div
                                    className={`w-3 h-3 rounded-full bg-${status.color}-500 flex-shrink-0`}
                                    style={{ backgroundColor: `var(--${status.color}-500)` }}
                                  ></div>
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{status.name}</h4>
                                  <Badge
                                    className={
                                      status.isActive
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700 text-xs"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600 text-xs"
                                    }
                                  >
                                    {status.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 h-8 w-8 p-0"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>                {/* System Settings Tab */}
                <TabsContent value="system" className="space-y-4 sm:space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">System Configuration</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Configure general system behavior and limits</p>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="space-y-4 sm:space-y-6">
                    {/* General Settings */}
                    <Card className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">General Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                          <div className="space-y-1 flex-1">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-assign complaints</Label>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Automatically assign new complaints to available admins
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <Switch
                              checked={systemSettings.autoAssignment}
                              onCheckedChange={(checked) =>
                                setSystemSettings({ ...systemSettings, autoAssignment: checked })
                              }
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                          <div className="space-y-1 flex-1">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Require admin approval</Label>
                            <p className="text-xs text-gray-600 dark:text-gray-400">New student accounts require admin approval</p>
                          </div>
                          <div className="flex-shrink-0">
                            <Switch
                              checked={systemSettings.requireApproval}
                              onCheckedChange={(checked) =>
                                setSystemSettings({ ...systemSettings, requireApproval: checked })
                              }
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                          <div className="space-y-1 flex-1">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable notifications</Label>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Send email and SMS notifications to users</p>
                          </div>
                          <div className="flex-shrink-0">
                            <Switch
                              checked={systemSettings.enableNotifications}
                              onCheckedChange={(checked) =>
                                setSystemSettings({ ...systemSettings, enableNotifications: checked })
                              }
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Security Settings */}
                    <Card className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">Security & Limits</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="sessionTimeout" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Session Timeout (minutes)
                            </Label>
                            <Input
                              id="sessionTimeout"
                              type="number"
                              min="5"
                              max="480"
                              value={systemSettings.sessionTimeout}
                              onChange={(e) =>
                                setSystemSettings({
                                  ...systemSettings,
                                  sessionTimeout: Number.parseInt(e.target.value) || 30,
                                })
                              }
                              className="h-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                            />
                          </div>                          <div className="space-y-2">
                            <Label htmlFor="maxFileSize" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Max File Size (MB)
                            </Label>
                            <Input
                              id="maxFileSize"
                              type="number"
                              min="1"
                              max="100"
                              value={systemSettings.maxFileSize}
                              onChange={(e) =>
                                setSystemSettings({
                                  ...systemSettings,
                                  maxFileSize: Number.parseInt(e.target.value) || 10,
                                })
                              }
                              className="h-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Button onClick={handleUpdateSystemSettings} disabled={saving} className="btn-gradient w-full sm:w-auto">
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save System Settings
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Notification Settings</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Configure how and when notifications are sent</p>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="space-y-4 sm:space-y-6">
                    {/* Email Settings */}
                    <Card className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center text-gray-900 dark:text-gray-100">
                          <Mail className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                          Email Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                          <div className="space-y-1 flex-1">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable email notifications</Label>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Send notifications via email</p>
                          </div>
                          <div className="flex-shrink-0">
                            <Switch
                              checked={notificationSettings.emailEnabled}
                              onCheckedChange={(checked) =>
                                setNotificationSettings({ ...notificationSettings, emailEnabled: checked })
                              }
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            onClick={handleTestEmail} 
                            disabled={saving} 
                            variant="outline" 
                            size="sm"
                            className="border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Send Test Email
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Timing Settings */}
                    <Card className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center text-gray-900 dark:text-gray-100">
                          <Clock className="w-4 h-4 mr-2 text-orange-600 dark:text-orange-400" />
                          Timing Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="escalationTime" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Escalation Time (hours)
                            </Label>
                            <Input
                              id="escalationTime"
                              type="number"
                              min="1"
                              max="168"
                              value={notificationSettings.escalationTime}
                              onChange={(e) =>
                                setNotificationSettings({
                                  ...notificationSettings,
                                  escalationTime: Number.parseInt(e.target.value) || 48,
                                })
                              }
                              className="h-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="reminderTime" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Reminder Time (hours)
                            </Label>
                            <Input
                              id="reminderTime"
                              type="number"
                              min="1"
                              max="72"
                              value={notificationSettings.reminderTime}
                              onChange={(e) =>
                                setNotificationSettings({
                                  ...notificationSettings,
                                  reminderTime: Number.parseInt(e.target.value) || 24,
                                })
                              }
                              className="h-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Button onClick={handleUpdateNotificationSettings} disabled={saving} className="btn-gradient w-full sm:w-auto">
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Notification Settings
                        </>
                      )}
                    </Button></div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </main>
      <Toaster />
    </div>
  )
}
