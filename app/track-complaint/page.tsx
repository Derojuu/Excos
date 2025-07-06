"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LoadingOverlay } from "@/components/loading-overlay"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  PlusCircle,
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Menu as MenuIcon, // Rename to avoid confusion
  X,
  User,
} from "lucide-react"
import type { Complaint } from "@/app/types"
import { useRouter } from "next/navigation"
import { StudentSidebar, type StudentSidebarRef } from "@/components/student-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogOut } from "lucide-react"

export default function TrackComplaint() {
  const sidebarRef = useRef<StudentSidebarRef>(null)
  const [navOpen, setNavOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchComplaints() {
      try {
        const response = await fetch("/api/auth/complaints/complaints", {
          credentials: "include",
        })

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login?redirect=/track-complaint")
            return
          }
          throw new Error("Failed to fetch complaints")
        }

        const data = await response.json()
        setComplaints(data)
      } catch (error) {
        console.error("Error fetching complaints:", error)
        toast({
          title: "Error",
          description: "Failed to fetch complaints. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchComplaints()
  }, [router])

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (complaint.complaintType && complaint.complaintType.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && complaint.status === "pending") ||
      (activeTab === "under-review" && complaint.status === "under-review") ||
      (activeTab === "resolved" && complaint.status === "resolved")

    return matchesSearch && matchesStatus && matchesTab
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "under-review":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700">
            <TrendingUp className="w-3 h-3 mr-1" />
            Under Review
          </Badge>
        )
      case "resolved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Resolved
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
            {status}
          </Badge>
        )
    }
  }

  const pendingCount = complaints.filter((c) => c.status === "pending").length
  const reviewCount = complaints.filter((c) => c.status === "under-review").length
  const resolvedCount = complaints.filter((c) => c.status === "resolved").length

  return (
    <StudentSidebar ref={sidebarRef}>
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
        <LoadingOverlay isLoading={isLoading} message="Loading your complaints..." />

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-800/10 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 dark:bg-blue-800/10 rounded-full opacity-40 animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 w-full mx-auto px-1 sm:px-4 lg:px-6 py-2 sm:py-6 lg:py-8 space-y-4 sm:space-y-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
          >
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gradient">My Complaints</h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                Track and manage your exam complaints with ease
              </p>
            </div>
            <Link href="/submit-complaint" className="w-full lg:w-auto">
              <Button
                asChild
                size="lg"
                className="btn-gradient shadow-lg hover:shadow-xl transition-all duration-300 w-full lg:w-auto"
              >
                <span>
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Submit New Complaint
                </span>
              </Button>
            </Link>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid gap-6 md:grid-cols-3"
          >
            <Card className="glass-effect border-0 shadow-lg card-hover dark:bg-gray-800/50">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Complaints</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                      {complaints.length}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-0 shadow-lg card-hover dark:bg-gray-800/50">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Review</p>
                    <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
                      {pendingCount + reviewCount}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-0 shadow-lg card-hover dark:bg-gray-800/50">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                      {resolvedCount}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="glass-effect border-0 shadow-xl dark:bg-gray-800/50">
              <CardHeader className="border-b border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Complaint History
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  View and track all your submitted complaints in one place
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {/* Search and Filter */}
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <Input
                        placeholder="Search complaints by exam name, type, or reference..."
                        className="pl-10 h-10 sm:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full lg:w-auto">
                      <Filter className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full lg:w-[200px] h-10 sm:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
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

                  {/* Improved Tabs for Mobile & Desktop */}
                  <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                    {/* Mobile: Dropdown Style */}
                    <div className="block sm:hidden mb-6">
                      <Select value={activeTab} onValueChange={setActiveTab}>
                        <SelectTrigger className="w-full h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Complaints ({complaints.length})</SelectItem>
                          <SelectItem value="pending">Pending ({pendingCount})</SelectItem>
                          <SelectItem value="under-review">Under Review ({reviewCount})</SelectItem>
                          <SelectItem value="resolved">Resolved ({resolvedCount})</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Desktop: Tab Style */}
                    <TabsList className="hidden sm:grid grid-cols-4 mb-6 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl h-12 w-full">
                      <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all font-medium text-sm text-gray-700 dark:text-gray-300"
                      >
                        All ({complaints.length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="pending"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all font-medium text-sm text-gray-700 dark:text-gray-300"
                      >
                        Pending ({pendingCount})
                      </TabsTrigger>
                      <TabsTrigger
                        value="under-review"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all font-medium text-sm text-gray-700 dark:text-gray-300"
                      >
                        Review ({reviewCount})
                      </TabsTrigger>
                      <TabsTrigger
                        value="resolved"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all font-medium text-sm text-gray-700 dark:text-gray-300"
                      >
                        Resolved ({resolvedCount})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4">
                      {renderComplaintList(filteredComplaints, getStatusBadge)}
                    </TabsContent>
                    <TabsContent value="pending" className="space-y-4">
                      {renderComplaintList(filteredComplaints, getStatusBadge)}
                    </TabsContent>
                    <TabsContent value="under-review" className="space-y-4">
                      {renderComplaintList(filteredComplaints, getStatusBadge)}
                    </TabsContent>
                    <TabsContent value="resolved" className="space-y-4">
                      {renderComplaintList(filteredComplaints, getStatusBadge)}
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </StudentSidebar>
  )
}

// Add the logout handler
async function handleLogout() {
  const router = useRouter()

  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })
    router.push("/login")
  } catch (error) {
    console.error("Logout failed:", error)
    toast({
      title: "Error",
      description: "Failed to sign out. Please try again.",
      variant: "destructive",
    })
  }
}

function renderComplaintList(complaints: Complaint[], getStatusBadge: (status: string) => React.ReactNode) {
  if (complaints.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="py-12 sm:py-16 text-center"
      >
        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No complaints found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          We couldn't find any complaints matching your criteria. Start by submitting your first complaint.
        </p>
        <Link href="/submit-complaint">
          <Button className="btn-gradient shadow-lg">
            <PlusCircle className="mr-2 h-4 w-4" />
            Submit Your First Complaint
          </Button>
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {complaints.map((complaint, index) => (
        <motion.div
          key={complaint.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Link href={`/complaints/${complaint.id}`}>
            <Card className="glass-effect border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group dark:bg-gray-800/30">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {complaint.examName}
                      </h3>
                      {getStatusBadge(complaint.status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span>
                          {complaint.examDate
                            ? new Date(complaint.examDate).toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span>{complaint.type || complaint.complaintType}</span>
                      </div>
                      {complaint.referenceNumber && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {complaint.referenceNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20 transition-all"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
