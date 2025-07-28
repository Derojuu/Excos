"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  User,
  Mail,
  Phone,
  Edit3,
  Save,
  X,
  Shield,
  Key,
  Bell,
  Settings,
  BarChart3,
  Users,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Award,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Activity,
  Menu,
} from "lucide-react"
import type { User as UserType } from "@/app/types/index"
import { LoadingOverlay } from "@/components/loading-overlay"
import { AdminSidebar, AdminSidebarRef } from "@/components/admin-sidebar"

export default function AdminProfile() {
  const router = useRouter()
  const adminSidebarRef = useRef<AdminSidebarRef>(null)
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    department: "",
    position: "",
    faculty: "",
    adminLevel: "",
    profilePicUrl: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [adminStats, setAdminStats] = useState({
    totalStudents: 0,
    totalComplaints: 0,    pendingReview: 0,
    resolvedThisMonth: 0,
    avgResolutionTime: "0 days",
    activeAdmins: 0,
    systemUptime: "99.8%",
    lastLogin: "Loading...",
    recentActivity: 0
  })
  
  useEffect(() => {
    async function loadAdminProfile() {
      console.log("🔍 Starting admin profile load...")
      try {
        // First check authentication
        const authResponse = await fetch("/api/auth/check-auth", {
          credentials: "include",
        })

        console.log("🔐 Auth response status:", authResponse.status)

        if (!authResponse.ok) {
          console.log("❌ Auth check failed")
          throw new Error("Auth check failed")
        }

        const authData = await authResponse.json()
        console.log("✅ Current user role:", authData.role) // Debug log

        if (authData.role !== "admin") {
          console.log("🚫 Non-admin access attempted:", authData.role)
          router.push("/profile")
          return
        }

        // Now fetch the full profile data
        const profileResponse = await fetch("/api/admin/profile", {
          credentials: "include",
        })

        console.log("📋 Profile response status:", profileResponse.status)

        if (!profileResponse.ok) {
          console.log("❌ Failed to fetch admin profile:", profileResponse.status)
          throw new Error("Failed to fetch admin profile")
        }

        const profileData = await profileResponse.json()
        console.log("📊 Admin profile data:", profileData) // Debug log

        setUser(profileData)
        console.log("✅ User state set:", profileData)
          setFormData({
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          bio: profileData.bio || "",
          department: profileData.department || "",
          position: profileData.position || "",
          faculty: profileData.faculty || "",
          adminLevel: profileData.adminLevel || "Standard",
          profilePicUrl: profileData.profilePicUrl || "",
        })

        console.log("📝 Form data set")

        // Fetch admin stats (non-blocking)
        try {
          const statsResponse = await fetch("/api/admin/stats", {
            credentials: "include",
          })

          if (statsResponse.ok) {
            const statsData = await statsResponse.json()
            setAdminStats(statsData)
            console.log("📈 Stats loaded successfully")
          } else {
            console.error("Failed to fetch stats:", statsResponse.status)
          }
        } catch (statsError) {
          console.error("Error fetching admin stats:", statsError)
          // Just keep the default values
        }

      } catch (error) {
        console.error("💥 Admin profile load error:", error)
        router.push("/login")
      } finally {
        console.log("🏁 Setting loading to false")
        setLoading(false)
      }
    }

    loadAdminProfile()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,      [name]: value,
    }))
  }
  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {      // Send all the fields that can be updated in the database
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        position: formData.position,
        faculty: formData.faculty,
        profilePicUrl: formData.profilePicUrl,
      }

      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
      
      // Update form data with the response
      setFormData(prev => ({
        ...prev,
        firstName: updatedUser.firstName || "",
        lastName: updatedUser.lastName || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        department: updatedUser.department || "",
        position: updatedUser.position || "",
        faculty: updatedUser.faculty || "",
      }))
      
      toast({
        title: "Admin profile updated successfully",
        description: "Your administrative information has been saved.",
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Failed to update profile",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both password fields match.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Admin passwords must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password")
      }

      toast({
        title: "Password updated successfully",
        description: "Your admin password has been changed.",
      })

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Password change error:", error)
      toast({
        title: "Failed to change password",
        description: error instanceof Error ? error.message : "Please check your current password and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }  // Show loading state
  if (loading) {
    console.log("🔄 Showing loading state")
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
        <LoadingOverlay isLoading={true} message="Loading admin profile..." />
      </div>
    )
  }

  // Protect against non-admin access
  if (!user || user.role !== "admin") {
    console.log("🚫 User check failed:", { user, userRole: user?.role })
    return null // Router will handle redirect
  }

  console.log("✅ Rendering admin profile page for user:", user.email)

  const adminStatsCards = [
    {
      title: "Total Students",
      value: adminStats.totalStudents.toLocaleString(),
      icon: Users,
      color: "purple",
      bgColor: "from-purple-100 to-blue-100",
      textColor: "text-purple-600",
    },
    {
      title: "Pending Review",
      value: adminStats.pendingReview,
      icon: Clock,
      color: "amber",
      bgColor: "from-amber-100 to-orange-100",
      textColor: "text-amber-600",
    },
    {
      title: "Resolved This Month",
      value: adminStats.resolvedThisMonth,
      icon: CheckCircle2,
      color: "green",
      bgColor: "from-green-100 to-emerald-100",
      textColor: "text-green-600",
    },
    {
      title: "Avg Resolution Time",
      value: adminStats.avgResolutionTime,
      icon: TrendingUp,
      color: "blue",
      bgColor: "from-blue-100 to-indigo-100",
      textColor: "text-blue-600",
    },
  ]
  // Add this function for uploading profile pic
  async function uploadProfilePic(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    
    const res = await fetch('/api/upload?type=profile', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })
    
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to upload file')
    }
    
    const { url } = await res.json()
    
    return url
  }    return (
    <>
      <AdminSidebar ref={adminSidebarRef}>
        <div />
      </AdminSidebar>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-800/10 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 dark:bg-blue-800/10 rounded-full opacity-40 animate-pulse delay-1000"></div>
        </div>

        {/* Header */}
        <header className="glass-effect border-b border-white/20 dark:border-gray-700/20 sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2 flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              {/* Menu button for mobile, replaced EXCOS icon */}
              <Button
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                onClick={() => adminSidebarRef.current?.toggleSidebar()}
              >
                <Menu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gradient truncate">Admin Profile</h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                  Manage your admin profile and settings
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-3 sm:p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6 lg:space-y-8 relative z-10">
          {/* Page Header - keeping the original content below */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Admin Profile
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                Manage your administrative account and system access
              </p>
            </div>
            <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-sm px-3 py-1 w-fit">
              <Shield className="w-4 h-4 mr-2" />
              Administrator
            </Badge>
          </div>        {/* Admin Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
        >
          {adminStatsCards.map((stat, index) => (
            <Card key={index} className="glass-effect border-0 shadow-lg card-hover">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{stat.title}</p>
                    <p className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mt-1 sm:mt-2 ${stat.textColor} dark:${stat.textColor.replace('-600', '-400')} truncate`}>
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${stat.bgColor} dark:from-${stat.color}-900/50 dark:to-${stat.color}-800/50 rounded-xl flex items-center justify-center flex-shrink-0 ml-2`}
                  >
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>        {/* System Status Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        ><Card className="glass-effect border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">System Uptime</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 mt-2 truncate">{adminStats.systemUptime}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-xl flex items-center justify-center flex-shrink-0 ml-3">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Active Admins</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2 truncate">{adminStats.activeAdmins}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl flex items-center justify-center flex-shrink-0 ml-3">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-lg sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Last Login</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mt-2 truncate">{adminStats.lastLogin}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-900/50 dark:to-slate-900/50 rounded-xl flex items-center justify-center flex-shrink-0 ml-3">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Profile Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >          <Card className="glass-effect border-0 shadow-xl">
            <CardHeader className="border-b border-white/20 dark:border-gray-800/50 bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-900/50 dark:to-gray-800/30">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Administrative Account</CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Manage your administrative profile and system access
              </CardDescription>
            </CardHeader>            <CardContent className="p-3 sm:p-4 lg:p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 sm:mb-6 lg:mb-8 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl h-auto sm:h-14 gap-1">
                  <TabsTrigger
                    value="profile"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 px-2 sm:px-3 py-2 sm:py-3 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 min-h-[3rem] sm:min-h-0"
                  >
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Info</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 px-2 sm:px-3 py-2 sm:py-3 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 min-h-[3rem] sm:min-h-0"
                  >
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Security</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="permissions"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 px-2 sm:px-3 py-2 sm:py-3 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 min-h-[3rem] sm:min-h-0"
                  >
                    <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-center leading-tight">Perms</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="system"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 px-2 sm:px-3 py-2 sm:py-3 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 min-h-[3rem] sm:min-h-0"
                  >
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>System</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4 sm:space-y-6">
                  {/* Notice about database limitations */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Limited Profile Features</h4>
                        <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 mt-1">
                          Some profile fields (phone, bio, department, position, profile picture) are not yet supported by the current database schema. Only name and email can be updated at this time.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Image/Avatar for Admin */}
                  <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    {formData.profilePicUrl ? (
                      <img
                        src={formData.profilePicUrl}
                        alt="Profile"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-full flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                        <User className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 dark:text-purple-300" />
                      </div>
                    )}
                    {isEditing && (
                      <div className="w-full max-w-xs">
                        <div className="text-xs text-gray-500 text-center mb-2">Profile picture upload not available yet</div>
                        <Input
                          type="file"
                          accept="image/*"
                          disabled={true}
                          className="text-xs sm:text-sm bg-gray-100 dark:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500"
                        />
                      </div>
                    )}
                  </div><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Administrative Information</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Update your administrative details and contact information
                      </p>
                    </div>
                    {!isEditing ? (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        size="sm"
                        className="border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 w-full sm:w-auto"
                      >
                        <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          onClick={() => setIsEditing(false)}
                          variant="outline"
                          size="sm"
                          className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex-1 sm:flex-none"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          size="sm"
                          className="btn-gradient flex-1 sm:flex-none"
                        >
                          {isSaving ? (
                            <>
                              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1 sm:mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              Save
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />                  <div className="grid gap-4 sm:gap-6">
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500 dark:text-gray-400" />
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="h-10 sm:h-11 lg:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 text-gray-900 dark:text-gray-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="h-10 sm:h-11 lg:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500 dark:text-gray-400" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="h-10 sm:h-11 lg:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 text-gray-900 dark:text-gray-100"
                      />
                    </div>                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500 dark:text-gray-400" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter phone number"
                        className="h-10 sm:h-11 lg:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 text-gray-900 dark:text-gray-100"
                      />
                    </div><div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300">
                          <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500 dark:text-gray-400" />
                          Department
                        </Label>
                        <Input
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter department"
                          className="h-10 sm:h-11 lg:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 text-gray-900 dark:text-gray-100"
                        />
                      </div>                      <div className="space-y-2">
                        <Label htmlFor="position" className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300">
                          <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500 dark:text-gray-400" />
                          Position
                        </Label>
                        <Input
                          id="position"
                          name="position"                          value={formData.position}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter position"
                          className="h-10 sm:h-11 lg:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 text-gray-900 dark:text-gray-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="faculty" className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300">
                          <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500 dark:text-gray-400" />
                          Faculty
                        </Label>
                        <Input
                          id="faculty"
                          name="faculty"
                          value={formData.faculty}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter faculty"
                          className="h-10 sm:h-11 lg:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div><div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        About (Optional)
                        <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">(Not stored in database)</span>
                      </Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={true}
                        placeholder="Feature not available yet"
                        rows={3}
                        className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 resize-none text-gray-900 dark:text-gray-100 min-h-[80px] sm:min-h-[100px]"
                      />
                    </div>
                  </div>
                </TabsContent>                <TabsContent value="security" className="space-y-4 sm:space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Security Settings</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage your admin account security and password</p>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300">
                        <Key className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500 dark:text-gray-400" />
                        Current Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="h-10 sm:h-11 lg:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 pr-10 text-gray-900 dark:text-gray-100"
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="h-10 sm:h-11 lg:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 pr-10 text-gray-900 dark:text-gray-100"
                          placeholder="Enter your new password (min 8 characters)"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="h-10 sm:h-11 lg:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 pr-10 text-gray-900 dark:text-gray-100"
                          placeholder="Confirm your new password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      onClick={handleChangePassword}
                      disabled={
                        isSaving ||
                        !passwordData.currentPassword ||
                        !passwordData.newPassword ||
                        !passwordData.confirmPassword
                      }
                      className="btn-gradient w-full sm:w-auto"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Updating Password...
                        </>
                      ) : (
                        <>
                          <Key className="w-4 h-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>                <TabsContent value="permissions" className="space-y-4 sm:space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Admin Permissions</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">View your administrative access levels and permissions</p>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">Complaint Management</p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">View, edit, and resolve student complaints</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800 text-xs self-start sm:self-center">Full Access</Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">User Management</p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Manage student and admin accounts</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800 text-xs self-start sm:self-center">Full Access</Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">System Settings</p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Configure system-wide settings</p>
                        </div>
                      </div>
                      <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-xs self-start sm:self-center">Limited</Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/50 dark:to-pink-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">Super Admin</p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Full system administration access</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs self-start sm:self-center">
                        No Access
                      </Badge>
                    </div>
                  </div>
                </TabsContent>                <TabsContent value="system" className="space-y-4 sm:space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">System Preferences</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Configure your admin dashboard and notification preferences</p>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">Real-time Notifications</p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Receive instant notifications for new complaints
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800 text-xs self-start sm:self-center">Enabled</Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">Daily Email Reports</p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Receive daily summary reports via email</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800 text-xs self-start sm:self-center">Enabled</Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">Advanced Analytics</p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Access detailed analytics and reporting tools
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800 text-xs self-start sm:self-center">Enabled</Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">Escalation Alerts</p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Alerts for complaints requiring urgent attention
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800 text-xs self-start sm:self-center">Enabled</Badge>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>            </CardContent>
          </Card>
        </motion.div>        </div>
      </div>
      <Toaster />
    </>
  )
}
