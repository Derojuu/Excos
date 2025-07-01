"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
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
    loadSettings()
  }, [])

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
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-sm sm:text-base text-gray-600">Loading admin settings...</p>
          </div>
        </div>
      </AdminSidebar>
    )
  }  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 relative">
      <AdminSidebar>
        <div />
      </AdminSidebar>
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-800/10 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 dark:bg-blue-800/10 rounded-full opacity-40 animate-pulse delay-1000"></div>
      </div>

      <div className="space-y-6 sm:space-y-8 relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6"
        >
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient">System Settings</h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">
              Configure system-wide settings and preferences
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs sm:text-sm">
              <Shield className="w-3 h-3 mr-1" />
              Admin Only
            </Badge>
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

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="glass-effect border-0 shadow-xl">
            <CardHeader className="border-b border-white/20 bg-gradient-to-r from-white/50 to-white/30">
              <CardTitle className="text-lg sm:text-xl font-semibold">Admin Configuration</CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600">
                Manage system-wide settings that affect all users
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8 bg-gray-100/50 p-1 rounded-xl h-auto">
                  <TabsTrigger
                    value="categories"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all font-medium text-xs sm:text-sm p-2 sm:p-3"
                  >
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Categories
                  </TabsTrigger>
                  <TabsTrigger
                    value="workflow"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all font-medium text-xs sm:text-sm p-2 sm:p-3"
                  >
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Workflow
                  </TabsTrigger>
                  <TabsTrigger
                    value="system"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all font-medium text-xs sm:text-sm p-2 sm:p-3"
                  >
                    <Database className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    System
                  </TabsTrigger>
                  <TabsTrigger
                    value="notifications"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all font-medium text-xs sm:text-sm p-2 sm:p-3"
                  >
                    <Bell className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Notifications
                  </TabsTrigger>
                </TabsList>

                {/* Complaint Categories Tab */}
                <TabsContent value="categories" className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Complaint Categories</h3>
                    <p className="text-sm text-gray-600">Manage the types of complaints students can submit</p>
                  </div>

                  <Separator className="bg-gray-200" />

                  {/* Add New Category */}
                  <Card className="bg-white/50 border border-gray-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base font-semibold flex items-center">
                        <Plus className="w-4 h-4 mr-2 text-purple-600" />
                        Add New Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="categoryName" className="text-sm font-medium">
                            Category Name
                          </Label>
                          <Input
                            id="categoryName"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            placeholder="e.g., Academic Issues"
                            className="h-10 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="categoryDescription" className="text-sm font-medium">
                            Description
                          </Label>
                          <Input
                            id="categoryDescription"
                            value={newCategory.description}
                            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                            placeholder="Brief description of this category"
                            className="h-10 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleCreateCategory}
                        disabled={saving || !newCategory.name.trim()}
                        className="btn-gradient"
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
                  </Card>

                  {/* Existing Categories */}
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <Card key={category.id} className="bg-white/50 border border-gray-200">
                        <CardContent className="p-4">
                          {editingCategory === category.id ? (
                            <div className="space-y-4">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Category Name</Label>
                                  <Input
                                    value={category.name}
                                    onChange={(e) =>
                                      setCategories(
                                        categories.map((cat) =>
                                          cat.id === category.id ? { ...cat, name: e.target.value } : cat,
                                        ),
                                      )
                                    }
                                    className="h-10 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Description</Label>
                                  <Input
                                    value={category.description}
                                    onChange={(e) =>
                                      setCategories(
                                        categories.map((cat) =>
                                          cat.id === category.id ? { ...cat, description: e.target.value } : cat,
                                        ),
                                      )
                                    }
                                    className="h-10 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleUpdateCategories}
                                  disabled={saving}
                                  size="sm"
                                  className="btn-gradient"
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  Save
                                </Button>
                                <Button
                                  onClick={() => setEditingCategory(null)}
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-200 text-gray-600 hover:bg-gray-50"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-900">{category.name}</h4>
                                  <Badge
                                    className={
                                      category.isActive
                                        ? "bg-green-100 text-green-800 border-green-200"
                                        : "bg-gray-100 text-gray-800 border-gray-200"
                                    }
                                  >
                                    {category.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{category.description}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => setEditingCategory(category.id)}
                                  variant="outline"
                                  size="sm"
                                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteCategory(category.id)}
                                  variant="outline"
                                  size="sm"
                                  className="border-red-200 text-red-600 hover:bg-red-50"
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

                {/* Status Workflow Tab */}
                <TabsContent value="workflow" className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Status Workflow</h3>
                    <p className="text-sm text-gray-600">Configure the complaint status progression</p>
                  </div>

                  <Separator className="bg-gray-200" />

                  <div className="space-y-4">
                    {statuses
                      .sort((a, b) => a.order - b.order)
                      .map((status) => (
                        <Card key={status.id} className="bg-white/50 border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-500">#{status.order}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-3 h-3 rounded-full bg-${status.color}-500`}
                                    style={{ backgroundColor: `var(--${status.color}-500)` }}
                                  ></div>
                                  <h4 className="font-semibold text-gray-900">{status.name}</h4>
                                  <Badge
                                    className={
                                      status.isActive
                                        ? "bg-green-100 text-green-800 border-green-200"
                                        : "bg-gray-100 text-gray-800 border-gray-200"
                                    }
                                  >
                                    {status.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>

                {/* System Settings Tab */}
                <TabsContent value="system" className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">System Configuration</h3>
                    <p className="text-sm text-gray-600">Configure general system behavior and limits</p>
                  </div>

                  <Separator className="bg-gray-200" />

                  <div className="space-y-6">
                    {/* General Settings */}
                    <Card className="bg-white/50 border border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-base font-semibold">General Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Auto-assign complaints</Label>
                            <p className="text-xs text-gray-600">
                              Automatically assign new complaints to available admins
                            </p>
                          </div>
                          <Switch
                            checked={systemSettings.autoAssignment}
                            onCheckedChange={(checked) =>
                              setSystemSettings({ ...systemSettings, autoAssignment: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Require admin approval</Label>
                            <p className="text-xs text-gray-600">New student accounts require admin approval</p>
                          </div>
                          <Switch
                            checked={systemSettings.requireApproval}
                            onCheckedChange={(checked) =>
                              setSystemSettings({ ...systemSettings, requireApproval: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Enable notifications</Label>
                            <p className="text-xs text-gray-600">Send email and SMS notifications to users</p>
                          </div>
                          <Switch
                            checked={systemSettings.enableNotifications}
                            onCheckedChange={(checked) =>
                              setSystemSettings({ ...systemSettings, enableNotifications: checked })
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Security Settings */}
                    <Card className="bg-white/50 border border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-base font-semibold">Security & Limits</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="sessionTimeout" className="text-sm font-medium">
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
                              className="h-10 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="maxFileSize" className="text-sm font-medium">
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
                              className="h-10 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Button onClick={handleUpdateSystemSettings} disabled={saving} className="btn-gradient">
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
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Notification Settings</h3>
                    <p className="text-sm text-gray-600">Configure how and when notifications are sent</p>
                  </div>

                  <Separator className="bg-gray-200" />

                  <div className="space-y-6">
                    {/* Email Settings */}
                    <Card className="bg-white/50 border border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-blue-600" />
                          Email Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Enable email notifications</Label>
                            <p className="text-xs text-gray-600">Send notifications via email</p>
                          </div>
                          <Switch
                            checked={notificationSettings.emailEnabled}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({ ...notificationSettings, emailEnabled: checked })
                            }
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={handleTestEmail} disabled={saving} variant="outline" size="sm">
                            <Mail className="w-4 h-4 mr-2" />
                            Send Test Email
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Timing Settings */}
                    <Card className="bg-white/50 border border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-orange-600" />
                          Timing Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="escalationTime" className="text-sm font-medium">
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
                              className="h-10 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="reminderTime" className="text-sm font-medium">
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
                              className="h-10 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Button onClick={handleUpdateNotificationSettings} disabled={saving} className="btn-gradient">
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
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>        </motion.div>
      </div>
      <Toaster />
    </div>
  )
}
