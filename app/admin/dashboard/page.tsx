"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, LogOut, User, TrendingUp, CheckCircle2, Clock, FileText, BarChart3, Menu } from "lucide-react"
import { LoadingOverlay } from "@/components/loading-overlay"
import type { User as UserType } from "@/app/types/index"
import { ThemeToggle } from "@/components/theme-toggle"
import { AdminSidebar, AdminSidebarRef } from "@/components/admin-sidebar"

interface ComplaintType {
  id: string
  referenceNumber: string
  student: string
  examName: string
  createdAt: string
  type: string
  status: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const adminSidebarRef = useRef<AdminSidebarRef>(null)
  const [user, setUser] = useState<UserType | null>(null)
  const [complaints, setComplaints] = useState<ComplaintType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

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
        fetchComplaints() // Only fetch complaints after auth is confirmed
      } catch (error) {
        console.error("Auth error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchComplaints = async () => {
    try {
      const response = await fetch("/api/auth/complaints/complaints", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch complaints")
      }

      const data = await response.json()
      
      // Ensure we always have an array
      if (Array.isArray(data)) {
        setComplaints(data)
      } else {
        console.warn("Unexpected complaints data structure:", data)
        setComplaints([])
      }
    } catch (error) {
      console.error("Error fetching complaints:", error)
      setComplaints([]) // Ensure complaints is always an array
      toast({
        title: "Error",
        description: "Failed to load complaints",
        variant: "destructive",
      })
    }
  }

  // Show loading state
  if (loading) {
    return <LoadingOverlay isLoading={true} message="Loading admin dashboard..." />
  }

  // Protect against non-admin access
  if (!user || user.role !== "admin") {
    return null
  }

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (complaint.student && complaint.student.toLowerCase().includes(searchTerm.toLowerCase())) ||
      complaint.examName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "under-review":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700 text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            Under Review
          </Badge>
        )
      case "resolved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700 text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Resolved
          </Badge>
        )
      default:
        return (
          <Badge
            variant="outline"
            className="text-xs border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
          >
            {status}
          </Badge>
        )
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookie handling
      })

      const data = await response.json()

      if (data.success) {
        // Force a hard refresh to clear all client-side state
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

  const pendingCount = complaints.filter((c) => c.status === "pending").length
  const reviewCount = complaints.filter((c) => c.status === "under-review").length
  const resolvedCount = complaints.filter((c) => c.status === "resolved").length

  return (
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
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gradient truncate">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                Manage exam complaints efficiently
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
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-2 pb-3 sm:pt-3 sm:pb-4 lg:pt-4 lg:pb-8 relative z-10">
        {/* Admin Role Info */}
        {user && (user.position || user.department || user.faculty || user.courses) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <Card className="glass-effect border-0 shadow-lg dark:bg-gray-800/50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Access Level</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.position === 'lecturer' && 'You can view complaints for your assigned courses'}
                      {user.position === 'hod' && 'You can view complaints for your department'}
                      {user.position === 'dean' && 'You can view complaints for your faculty'}
                      {(user.position === 'admin' || user.position === 'system-administrator') && 'You can view all complaints'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="font-medium text-gray-700 dark:text-gray-300">Position</p>
                    <p className="text-gray-900 dark:text-gray-100 capitalize">{user.position || 'Not specified'}</p>
                  </div>
                  {user.department && (
                    <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="font-medium text-gray-700 dark:text-gray-300">Department</p>
                      <p className="text-gray-900 dark:text-gray-100">{user.department}</p>
                    </div>
                  )}
                  {user.faculty && (
                    <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="font-medium text-gray-700 dark:text-gray-300">Faculty</p>
                      <p className="text-gray-900 dark:text-gray-100">{user.faculty}</p>
                    </div>
                  )}
                  {user.courses && (
                    <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="font-medium text-gray-700 dark:text-gray-300">Courses</p>
                      <p className="text-gray-900 dark:text-gray-100">{user.courses}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8"
        >
          <Card className="glass-effect border-0 shadow-lg card-hover dark:bg-gray-800/50">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Total</p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {complaints.length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-lg card-hover dark:bg-gray-800/50">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Pending</p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                    {pendingCount}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-lg card-hover dark:bg-gray-800/50">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Review</p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {reviewCount}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-lg card-hover dark:bg-gray-800/50">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Resolved</p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {resolvedCount}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="glass-effect border-0 shadow-xl dark:bg-gray-800/50">
            <CardHeader className="border-b border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30 p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl font-semibold flex items-center text-gray-900 dark:text-gray-100">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span className="truncate">Exam Complaints Management</span>
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Review, manage, and respond to student exam complaints efficiently.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {/* Search and Filter */}
              <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    placeholder="Search complaints..."
                    className="pl-10 h-10 sm:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-sm sm:text-base text-gray-900 dark:text-gray-100"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-10 sm:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-sm sm:text-base text-gray-900 dark:text-gray-100">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under-review">Under Review</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-3">
                {filteredComplaints.length > 0 ? (
                  filteredComplaints.map((complaint, index) => (
                    <motion.div
                      key={complaint.referenceNumber}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="glass-effect border border-gray-200 dark:border-gray-700 shadow-sm dark:bg-gray-800/30">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="min-w-0 flex-1">
                              <p className="font-mono text-sm font-medium text-purple-600 dark:text-purple-400 truncate">
                                {complaint.referenceNumber}
                              </p>
                              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                {complaint.student}
                              </p>
                            </div>
                            <div className="ml-2 flex-shrink-0">{getStatusBadge(complaint.status)}</div>
                          </div>
                          <div className="space-y-2 mb-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              <span className="font-medium">Exam:</span> {complaint.examName}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Date:</span>{" "}
                              {complaint.createdAt
                                ? new Date(complaint.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "N/A"}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Type:</span> {complaint.type}
                            </p>
                          </div>
                          <Link href={`/admin/complaints/${complaint.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20 text-sm"
                            >
                              View Details
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No complaints found</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      No complaints match your search criteria.
                    </p>
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white/50 dark:bg-gray-800/30">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                        Reference
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Student</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-sm hidden lg:table-cell">
                        Exam
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-sm hidden lg:table-cell">
                        Date
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-sm hidden md:table-cell">
                        Type
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-sm text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComplaints.length > 0 ? (
                      filteredComplaints.map((complaint, index) => (
                        <motion.tr
                          key={complaint.referenceNumber}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-white/70 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <TableCell className="font-medium font-mono text-sm text-gray-900 dark:text-gray-100">
                            {complaint.referenceNumber}
                          </TableCell>
                          <TableCell className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {complaint.student}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-gray-700 dark:text-gray-300">
                            {complaint.examName}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-gray-700 dark:text-gray-300">
                            {complaint.createdAt
                              ? new Date(complaint.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{complaint.type}</span>
                          </TableCell>
                          <TableCell className="text-sm">{getStatusBadge(complaint.status)}</TableCell>
                          <TableCell className="text-right text-sm">
                            <Link href={`/admin/complaints/${complaint.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20 text-xs sm:text-sm"
                              >
                                View
                              </Button>
                            </Link>
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 sm:py-12">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                              <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                                No complaints found
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400">
                                No complaints match your search criteria. Try adjusting your filters.
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
