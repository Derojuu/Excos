"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Clock,
  Calendar,
  FileText,
  User,
  Mail,
  School,
  GraduationCap,
  MessageSquare,
  Send,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Download,
  Eye,
  Layers,
  Building2,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationDropdown } from "@/components/notification-dropdown"
import type { Complaint } from "@/app/types"
import { LoadingOverlay } from "@/components/loading-overlay"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function ComplaintDetail() {
  const params = useParams()
  const complaintId = params?.id as string

  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [status, setStatus] = useState("")
  const [response, setResponse] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [keyCounter, setKeyCounter] = useState(0) // For generating unique keys

  useEffect(() => {
    async function fetchComplaintDetails() {
      try {
        const response = await fetch(`/api/auth/complaints/${complaintId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch complaint details")
        }
        const data = await response.json()
        
        // Initialize status history if it doesn't exist
        if (!data.statusHistory) {
          data.statusHistory = [{
            id: `status-${keyCounter}`,
            new_status: data.status,
            old_status: '',
            changed_by_name: 'System',
            formatted_date: new Date(data.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            }),
            notes: 'Initial status'
          }]
        }
        
        setComplaint(data)
        setStatus(data.status)
      } catch (error) {
        console.error("Error fetching complaint details:", error)
        toast({
          title: "Error",
          description: "An error occurred while fetching complaint details.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchComplaintDetails()
  }, [complaintId])

  const handleSubmitResponse = async () => {
    if (!response.trim()) {
      toast({
        title: "Response required",
        description: "Please enter a response before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/auth/complaints/${complaintId}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: response }),
      })

      if (!res.ok) {
        throw new Error("Failed to submit response")
      }

      const newResponse = await res.json()

      toast({
        title: "Response sent successfully",
        description: "Your response has been sent to the student.",
      })

      setComplaint((prev) => ({
        ...prev!,
        responses: [...prev!.responses, newResponse],
      }))

      setResponse("")
    } catch (error) {
      console.error("Error submitting response:", error)
      toast({
        title: "Failed to send response",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "under-review":
        return (
          <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800">
            <TrendingUp className="w-3 h-3 mr-1" />
            Under Review
          </Badge>
        )
      case "resolved":
        return (
          <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Resolved
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  async function handleUpdateStatus(value: string): Promise<void> {
    if (value === status) return
    
    const notes = "" // Add default empty notes
    const oldStatus = status
    setStatus(value)
    
    try {
      const res = await fetch(`/api/auth/complaints/${complaintId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: value,
          notes: notes,
          old_status: oldStatus
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to update status")
      }

      const data = await res.json()
      
      // Create new status history entry
      const newStatusHistory = {
        id: `status-${keyCounter + 1}`,
        new_status: value,
        old_status: oldStatus,
        changed_by_name: "Admin", // Replace with actual admin name
        formatted_date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        notes: notes
      }

      // Update complaint state with new status and history
      setComplaint((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          status: value,
          statusHistory: [newStatusHistory, ...(prev.statusHistory || [])]
        }
      })

      // Increment key counter for next unique ID
      setKeyCounter(prev => prev + 1)

      toast({
        title: "Status updated successfully",
        description: `Complaint status changed from "${oldStatus}" to "${value}".`,
      })
    } catch (error) {
      setStatus(oldStatus)
      toast({
        title: "Failed to update status",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <LoadingOverlay isLoading={true} message="Loading complaint details..." />
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 relative flex items-center justify-center">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-800/10 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 dark:bg-blue-800/10 rounded-full opacity-40 animate-pulse delay-1000"></div>
        </div>

        <Card className="glass-effect border-0 shadow-xl max-w-md w-full mx-4 relative z-10">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Complaint Not Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The complaint you're looking for doesn't exist or has been removed.</p>
            <Link href="/admin/dashboard">
              <Button className="btn-gradient">Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 relative">
      <AdminSidebar>
        <div />
      </AdminSidebar>
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-800/10 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 dark:bg-blue-800/10 rounded-full opacity-40 animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
              <div className="flex items-center gap-4 sm:hidden">
                <NotificationDropdown apiUrl="/api/notifications" />
                <ThemeToggle />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">Complaint Details</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Review and manage student complaint</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <NotificationDropdown apiUrl="/api/notifications" />
            <ThemeToggle />
            <Link href="/admin/profile">
              <Button
                variant="outline"
                className="border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <User className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="glass-effect border-0 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-800 dark:to-blue-800 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        Complaint {complaint.referenceNumber}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Submitted on {complaint.createdAt
                          ? new Date(complaint.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(status)}
                      <Select value={status} onValueChange={handleUpdateStatus}>
                        <SelectTrigger className="w-[180px] h-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="under-review">Under Review</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="space-y-8">
                    {/* Student Information */}
                    <div className="space-y-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        Student Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                          <User className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Student Name</p>
                            <p className="text-gray-900 dark:text-gray-100 font-medium break-words">{complaint.fullName}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                          <User className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Student ID</p>
                            <p className="text-gray-900 dark:text-gray-100 font-medium break-words">{complaint.studentId}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                          <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                            <p className="text-gray-900 dark:text-gray-100 break-all">{complaint.email}</p>
                            {complaint.phone && (
                              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{complaint.phone}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                          <GraduationCap className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</p>
                            <p className="text-gray-900 dark:text-gray-100 break-words">
                              {complaint.userDepartment || 'Not specified'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-gray-200 dark:bg-gray-700" />

                    {/* Exam Information */}
                    <div className="space-y-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <School className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        Exam Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                          <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Exam Name</p>
                            <p className="text-gray-900 dark:text-gray-100 font-medium break-words">{complaint.examName}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                          <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Exam Date</p>
                            <p className="text-gray-900 dark:text-gray-100 break-words">
                              {complaint.examDate
                                ? new Date(complaint.examDate).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 sm:col-span-2">
                          <AlertCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Complaint Type</p>
                            <p className="text-gray-900 dark:text-gray-100 break-words capitalize">{complaint.complaintType}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-gray-200 dark:bg-gray-700" />

                    {/* Complaint Details */}
                    <div className="space-y-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-red-600 dark:text-red-400" />
                        Complaint Details
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Description</h4>
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{complaint.description}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Desired Resolution</h4>
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{complaint.desiredResolution}</p>
                          </div>
                        </div>

                        {complaint.evidenceFile && (
                          <div>
                            <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Supporting Evidence</h4>
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 p-4 sm:p-6 rounded-xl border border-purple-200 dark:border-purple-700">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">Evidence File</p>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Evidence file attached</p>
                                  </div>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(complaint.evidenceFile, '_blank')}
                                    className="border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 flex-1 sm:flex-none text-xs sm:text-sm"
                                  >
                                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const evidenceUrl = complaint.evidenceFile
                                      if (evidenceUrl) {
                                        const link = document.createElement('a')
                                        link.href = evidenceUrl
                                        link.download = 'evidence-file'
                                        link.click()
                                      }
                                    }}
                                    className="border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 flex-1 sm:flex-none text-xs sm:text-sm"
                                  >
                                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Response History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="glass-effect border-0 shadow-xl">
                <CardHeader className="border-b border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Response History
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">All responses and communications for this complaint</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {complaint.responses && complaint.responses.length > 0 ? (
                    <div className="space-y-4">
                      {complaint.responses.map((resp, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="bg-gradient-to-r from-white/70 to-white/50 dark:from-gray-800/70 dark:to-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-800 dark:to-emerald-800 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{resp.author}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{resp.date}</p>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{resp.text}</p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No responses yet</h3>
                      <p className="text-gray-600 dark:text-gray-400">Be the first to respond to this complaint.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Status Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="glass-effect border-0 shadow-xl">
                <CardHeader className="border-b border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    Status History
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Track status changes throughout the complaint lifecycle</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {complaint.statusHistory && complaint.statusHistory.length > 0 ? (
                    <div className="relative">
                      <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                      <div className="space-y-8">
                        {complaint.statusHistory.map((event, index) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="relative pl-8"
                          >
                            <div className="absolute left-0 w-8 flex items-center justify-center">
                              <div className={`w-2.5 h-2.5 rounded-full ${
                                event.new_status === 'pending' ? 'bg-amber-500' :
                                event.new_status === 'under-review' ? 'bg-blue-500' :
                                'bg-green-500'
                              }`}></div>
                            </div>
                            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                              <p className="text-sm text-gray-500 dark:text-gray-400">{event.formatted_date}</p>
                              <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                                Status changed to <span className="font-semibold capitalize">{event.new_status}</span>
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Changed by {event.changed_by_name}
                              </p>
                              {event.notes && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                                  "{event.notes}"
                                </p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No status changes yet</h3>
                      <p className="text-gray-600 dark:text-gray-400">Status history will appear here when changes are made.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="glass-effect border-0 shadow-xl">
                <CardHeader className="border-b border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30">
                  <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export Details
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-green-200 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Student
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Set Reminder
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Add Response */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="glass-effect border-0 shadow-xl">
                <CardHeader className="border-b border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Send className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    Add Response
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Your response will be sent to the student via email</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <Textarea
                    placeholder="Enter your response to this complaint..."
                    rows={4}
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </CardContent>
                <CardFooter className="flex justify-between gap-3 p-6 pt-0">
                  <Button
                    variant="outline"
                    onClick={() => setResponse("")}
                    className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleSubmitResponse}
                    disabled={isSubmitting || !response.trim()}
                    className="btn-gradient shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Response
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>

      </div>
      <Toaster />
    </div>
  )
}
