"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
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
import { LoadingOverlay } from "@/components/loading-overlay"
import {
  User,
  Mail,
  Phone,
  School,
  Edit3,
  Save,
  X,
  Shield,
  Key,
  Bell,
  Settings,
  FileText,
  TrendingUp,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Users,
  BarChart3,
  Award,
  BookOpen,
} from "lucide-react"
import { getCurrentUser } from "@/app/actions/auth"
import type { User as UserType } from "@/app/types/index"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Profile() {
  const router = useRouter()
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
    profilePicUrl: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    lastActivity: "",
    // Admin specific stats
    totalStudents: 0,
    totalResolved: 0,
    avgResolutionTime: "",
    monthlyComplaints: 0,
  })

  useEffect(() => {
    async function loadUserData() {
      try {
        const userData = (await getCurrentUser()) as UserType | null
        if (!userData) {
          router.push("/login")
          return
        }
        setUser(userData)
        setFormData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          bio: "",
          department: userData.department || "",
          position: userData.position || "",
          profilePicUrl: userData.profilePicUrl || "",
        })

        // Load role-specific stats
        if (userData.role === "admin") {
          // Fetch real admin profile data
          try {
            const response = await fetch('/api/admin/profile', {
              credentials: 'include'
            })
            if (response.ok) {
              const adminData = await response.json()
              setFormData({
                firstName: adminData.firstName || userData.firstName || "",
                lastName: adminData.lastName || userData.lastName || "",
                email: adminData.email || userData.email || "",
                phone: adminData.phone || userData.phone || "",
                bio: adminData.bio || "",
                department: adminData.department || userData.department || "",
                position: adminData.position || userData.position || "",
                profilePicUrl: adminData.profilePicUrl || userData.profilePicUrl || "",
              })
            }
          } catch (error) {
            console.error('Error fetching admin profile:', error)
          }

          setStats({
            totalComplaints: 156,
            pendingComplaints: 23,
            resolvedComplaints: 133,
            lastActivity: "30 minutes ago",
            totalStudents: 1250,
            totalResolved: 133,
            avgResolutionTime: "2.5 days",
            monthlyComplaints: 45,
          })
        } else {
          // Fetch real student complaint stats
          try {
            const response = await fetch('/api/auth/complaints/complaints?limit=1000', {
              credentials: 'include'
            })
            if (response.ok) {
              const complaints = await response.json()
              const total = complaints.length
              const pending = complaints.filter((c: any) => c.status === 'pending' || c.status === 'under_review').length
              const resolved = complaints.filter((c: any) => c.status === 'resolved').length
              
              setStats({
                totalComplaints: total,
                pendingComplaints: pending,
                resolvedComplaints: resolved,
                lastActivity: total > 0 ? "Recently active" : "No activity yet",
                totalStudents: 0,
                totalResolved: 0,
                avgResolutionTime: "",
                monthlyComplaints: 0,
              })
            } else {
              // Fallback to zeros if API call fails
              setStats({
                totalComplaints: 0,
                pendingComplaints: 0,
                resolvedComplaints: 0,
                lastActivity: "No activity yet",
                totalStudents: 0,
                totalResolved: 0,
                avgResolutionTime: "",
                monthlyComplaints: 0,
              })
            }
          } catch (error) {
            console.error('Error fetching student stats:', error)
            // Fallback to zeros if API call fails
            setStats({
              totalComplaints: 0,
              pendingComplaints: 0,
              resolvedComplaints: 0,
              lastActivity: "No activity yet",
              totalStudents: 0,
              totalResolved: 0,
              avgResolutionTime: "",
              monthlyComplaints: 0,
            })
          }
        }
      } catch (error) {
        console.error("Error loading user:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
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
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: user?.id,
          ...formData 
        }),
      })
      setUser((prev) => prev ? { ...prev, ...formData } : null)
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been saved.",
      })
      setIsEditing(false)
    } catch (error) {
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

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/auth/change-password", {
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
        description: "Your password has been changed.",
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
  }

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
  }

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingOverlay isLoading={true} message="Loading profile..." />
      </DashboardLayout>
    )
  }

  const isAdmin = user?.role === "admin"

  // Student Stats Cards
  const studentStatsCards = [
    {
      title: "Total Complaints",
      value: stats.totalComplaints,
      icon: FileText,
      color: "purple",
      bgColor: "from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50",
      textColor: "text-gray-900 dark:text-gray-100",
    },
    {
      title: "Pending",
      value: stats.pendingComplaints,
      icon: Clock,
      color: "amber",
      bgColor: "from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Resolved",
      value: stats.resolvedComplaints,
      icon: CheckCircle2,
      color: "green",
      bgColor: "from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Last Activity",
      value: stats.lastActivity,
      icon: TrendingUp,
      color: "blue",
      bgColor: "from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50",
      textColor: "text-blue-600 dark:text-blue-400",
    },
  ]

  // Admin Stats Cards
  const adminStatsCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "purple",
      bgColor: "from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Pending Review",
      value: stats.pendingComplaints,
      icon: Clock,
      color: "amber",
      bgColor: "from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Resolved This Month",
      value: stats.totalResolved,
      icon: CheckCircle2,
      color: "green",
      bgColor: "from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Avg Resolution Time",
      value: stats.avgResolutionTime,
      icon: BarChart3,
      color: "blue",
      bgColor: "from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50",
      textColor: "text-blue-600 dark:text-blue-400",
    },
  ]

  const statsCards = isAdmin ? adminStatsCards : studentStatsCards

  return (
    <DashboardLayout>
      {uploading && <LoadingOverlay isLoading={true} message="Uploading profile picture..." />}
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6"
        >
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient">{isAdmin ? "Admin Profile" : "My Profile"}</h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
              {isAdmin
                ? "Manage your administrative account and system preferences"
                : "Manage your account settings and preferences"}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Badge
              className={`${
                isAdmin
                  ? "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700"
                  : "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700"
              } text-xs sm:text-sm`}
            >
              {isAdmin ? (
                <>
                  <Shield className="w-3 h-3 mr-1" />
                  Administrator
                </>
              ) : (
                <>
               
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active Student
                </>
              )}
            </Badge>
            <Link href={isAdmin ? "/admin/dashboard" : "/track-complaint"}>
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
              >
                {isAdmin ? (
                  <>
                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Admin Dashboard
                  </>
                ) : (
                  <>
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    View Complaints
                  </>
                )}
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4"
        >
          {statsCards.map((stat, index) => (
            <Card key={index} className="glass-effect border-0 shadow-lg card-hover dark:bg-gray-800/50">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className={`text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2 ${stat.textColor}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${stat.bgColor} rounded-xl flex items-center justify-center`}
                  >
                    <stat.icon
                      className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-${stat.color}-600 dark:text-${stat.color}-400`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="glass-effect border-0 shadow-xl dark:bg-gray-800/50">
            <CardHeader className="border-b border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                Account Settings
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {isAdmin
                  ? "Manage your administrative account and system preferences"
                  : "Manage your personal information and account preferences"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl h-10 sm:h-12">
                  <TabsTrigger
                    value="profile"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                  >
                    <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                  >
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger
                    value="preferences"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                  >
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {isAdmin ? "Admin Settings" : "Preferences"}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="space-y-6">
                  {/* --- Centered Profile Image/Avatar --- */}
                  <div className="flex flex-col items-center justify-center gap-4 mb-4">
                    {formData.profilePicUrl ? (
                      <img
                        src={formData.profilePicUrl}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-xl flex items-center justify-center">
                        <User className="w-10 h-10 text-purple-600 dark:text-purple-300" />
                      </div>
                    )}
                    {isEditing && (
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            setUploading(true)
                            try {
                              const url = await uploadProfilePic(file)
                              setFormData((prev) => ({ ...prev, profilePicUrl: url }))
                              toast({ title: "Profile picture updated!" })
                            } catch (err) {
                              toast({ title: "Upload failed", description: "Try again.", variant: "destructive" })
                            }
                            setUploading(false)
                          }}
                          disabled={uploading}
                        />
                        {uploading && <div className="text-xs text-gray-500 mt-1">Uploading...</div>}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {isAdmin ? "Administrative Information" : "Personal Information"}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isAdmin
                          ? "Update your administrative details and contact information"
                          : "Update your personal details and contact information"}
                      </p>
                    </div>
                    {!isEditing ? (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        size="sm"
                        className="border-purple-200 text-purple-600 hover:bg-purple-50 w-full sm:w-auto dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
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
                          className="border-gray-200 text-gray-600 hover:bg-gray-50 flex-1 sm:flex-none dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
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

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="grid gap-4 sm:gap-6">
                    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="firstName"
                          className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300"
                        >
                          <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500 dark:text-gray-400" />
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="h-9 sm:h-10 lg:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800 dark:disabled:text-gray-400 text-gray-900 dark:text-gray-100"
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
                          className="h-9 sm:h-10 lg:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800 dark:disabled:text-gray-400 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300"
                      >
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
                        className="h-9 sm:h-10 lg:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800 dark:disabled:text-gray-400 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300"
                      >
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
                        placeholder="Enter your phone number"
                        className="h-9 sm:h-10 lg:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800 dark:disabled:text-gray-400 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    {/* Role-specific fields */}
                    {isAdmin ? (
                      <>
                        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label
                              htmlFor="department"
                              className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300"
                            >
                              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500 dark:text-gray-400" />
                              Department
                            </Label>
                            <Input
                              id="department"
                              name="department"
                              value={formData.department}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              placeholder="e.g., Academic Affairs"
                              className="h-9 sm:h-10 lg:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800 dark:disabled:text-gray-400 text-gray-900 dark:text-gray-100"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="position"
                              className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300"
                            >
                              <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500 dark:text-gray-400" />
                              Position
                            </Label>
                            <Input
                              id="position"
                              name="position"
                              value={formData.position}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              placeholder="e.g., Senior Administrator"
                              className="h-9 sm:h-10 lg:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800 dark:disabled:text-gray-400 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Label
                          htmlFor="studentId"
                          className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300"
                        >
                          <School className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500 dark:text-gray-400" />
                          Student ID
                        </Label>
                        <Input
                          id="studentId"
                          value={user?.studentId || ""}
                          disabled
                          className="h-9 sm:h-10 lg:h-12 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {isAdmin ? "About" : "Bio"} (Optional)
                      </Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder={
                          isAdmin
                            ? "Brief description of your role and responsibilities..."
                            : "Tell us a bit about yourself..."
                        }
                        rows={3}
                        className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800 dark:disabled:text-gray-400 resize-none text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Change Password
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Update your password to keep your account secure
                    </p>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="currentPassword"
                        className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300"
                      >
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
                          className="h-9 sm:h-10 lg:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 pr-10 text-gray-900 dark:text-gray-100"
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
                          className="h-9 sm:h-10 lg:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 pr-10 text-gray-900 dark:text-gray-100"
                          placeholder="Enter your new password"
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
                          className="h-9 sm:h-10 lg:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 pr-10 text-gray-900 dark:text-gray-100"
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
                </TabsContent>

                <TabsContent value="preferences" className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {isAdmin ? "System Preferences" : "Notification Preferences"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isAdmin
                        ? "Manage system settings and administrative preferences"
                        : "Manage how you receive notifications and updates"}
                    </p>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="space-y-4 sm:space-y-6">
                    {isAdmin ? (
                      <>
                        <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-lg flex items-center justify-center">
                              <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                                Admin Notifications
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                Receive alerts for new complaints and system updates
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700 text-xs">
                            Enabled
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-lg flex items-center justify-center">
                              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                                Daily Reports
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                Receive daily summary reports via email
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700 text-xs">
                            Enabled
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-lg flex items-center justify-center">
                              <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                                Student Updates
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                Notifications when students submit new complaints
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700 text-xs">
                            Enabled
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-lg flex items-center justify-center">
                              <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                                Email Notifications
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                Receive updates about your complaints via email
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700 text-xs">
                            Enabled
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-lg flex items-center justify-center">
                              <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                                SMS Notifications
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                Get text messages for urgent updates
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs"
                          >
                            Disabled
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-lg flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                                Status Updates
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                Notifications when complaint status changes
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700 text-xs">
                            Enabled
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Toaster />
    </DashboardLayout>
  )
}
