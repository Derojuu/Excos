"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Clock,
  Calendar,
  FileText,
  User,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Download,
  Eye,
  Mail,
  Phone,
  School,
  TrendingUp,
  RefreshCw,
  ExternalLink,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ThemeToggle } from "@/components/theme-toggle"
import Loading from "./loading"
import type { Complaint } from "@/app/types"
import { format, isValid } from "date-fns"

export default function StudentComplaintDetail() {
  const params = useParams()
  const complaintId = params?.id ? (params.id as string) : "unknown"
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchComplaint() {
      try {
        const response = await fetch(`/api/auth/complaints/${complaintId}`)
        console.log("API Response Status:", response.status)
        if (!response.ok) {
          throw new Error(`Failed to fetch complaint: ${response.status}`)
        }
        const data = await response.json()
        console.log("Fetched Complaint Data:", data)
        setComplaint(data)
      } catch (error) {
        console.error("Error fetching complaint:", error)
        toast({
          title: "Error",
          description: "Failed to load complaint details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchComplaint()
  }, [complaintId])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-800 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        )
      case "under-review":
        return (
          <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Under Review
          </Badge>
        )
      case "resolved":
        return (
          <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Resolved
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {status}
          </Badge>
        )
    }
  }

  const refreshComplaint = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/auth/complaints/${complaintId}`)
      if (!response.ok) {
        throw new Error("Failed to refresh complaint")
      }
      const data = await response.json()
      setComplaint(data)
      toast({
        title: "Refreshed",
        description: "Complaint details have been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh complaint details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-800/10 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 dark:bg-blue-800/10 rounded-full opacity-40 animate-pulse delay-1000"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <Card className="glass-effect border-0 shadow-xl max-w-md w-full dark:bg-gray-800/50">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Complaint Not Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The complaint you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Link href="/track-complaint">
                <Button className="btn-gradient">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to My Complaints
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 relative overflow-hidden">
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
                href="/track-complaint"
                className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to My Complaints
              </Link>
              <ThemeToggle />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">Complaint Details</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Track the progress of your exam complaint</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={refreshComplaint}
              className="border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href="/profile">
              <Button variant="outline" className="border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
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
                        Submitted on {
                          (() => {
                            const date = new Date(complaint.createdAt ?? "")
                            return isValid(date) ? format(date, "PPP") : "Invalid date"
                          })()
                        }
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">{getStatusBadge(complaint.status)}</div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="space-y-8">
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
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Exam Date</p>
                            <p className="text-gray-900 dark:text-gray-100">
                              {(() => {
                                const date = new Date(complaint.examDate ?? "")
                                return isValid(date) ? format(date, "PPP") : "Invalid date"
                              })()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 sm:col-span-2">
                          <AlertCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Complaint Type</p>
                            <p className="text-gray-900 dark:text-gray-100 capitalize">{complaint.complaintType}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-gray-200 dark:bg-gray-700" />

                    {/* Complaint Details */}
                    <div className="space-y-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-red-600 dark:text-red-400" />
                        Your Complaint
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Description</h4>
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Desired Resolution</h4>
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 sm:p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                              {complaint.desiredResolution}
                            </p>
                          </div>
                        </div>

                        {complaint.evidenceFile && (
                          <div>
                            <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Supporting Evidence</h4>
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 p-4 sm:p-6 rounded-xl border border-purple-200 dark:border-purple-700">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-gray-100 break-words">Evidence File</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Evidence file attached</p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(complaint.evidenceFile, '_blank')}
                                    className="border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (complaint.evidenceFile) {
                                        const link = document.createElement('a')
                                        link.href = complaint.evidenceFile
                                        link.download = 'evidence-file'
                                        link.click()
                                      }
                                    }}
                                    className="border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
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

            {/* Response from Committee */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="glass-effect border-0 shadow-xl">
                <CardHeader className="border-b border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Response from Examination Committee
                  </CardTitle>
                  <CardDescription>Official responses and updates regarding your complaint</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {complaint.responses && complaint.responses.length > 0 ? (
                    <div className="space-y-4">
                      {complaint.responses.map((resp, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="bg-gradient-to-r from-white/70 to-white/50 dark:from-gray-800/70 dark:to-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-800 dark:to-emerald-800 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{resp.author}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Examination Committee</p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{resp.date}</p>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap pl-0 sm:pl-11">{resp.text}</p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Response Yet</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">Your complaint is currently being reviewed.</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        The examination committee will respond to your complaint within 5-7 business days.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Status Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="glass-effect border-0 shadow-xl">
                <CardHeader className="border-b border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30">
                  <CardTitle className="text-lg">Status Timeline</CardTitle>
                  <CardDescription>Track your complaint progress</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Submitted</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{complaint.createdAt}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          complaint.status === "under-review" || complaint.status === "resolved"
                            ? "bg-blue-100 dark:bg-blue-800"
                            : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        <TrendingUp
                          className={`w-4 h-4 ${
                            complaint.status === "under-review" || complaint.status === "resolved"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`font-medium ${
                            complaint.status === "under-review" || complaint.status === "resolved"
                              ? "text-gray-900 dark:text-gray-100"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          Under Review
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {complaint.status === "under-review" || complaint.status === "resolved"
                            ? "In progress"
                            : "Pending"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          complaint.status === "resolved" ? "bg-green-100 dark:bg-green-800" : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 ${complaint.status === "resolved" ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}
                        />
                      </div>
                      <div>
                        <p
                          className={`font-medium ${
                            complaint.status === "resolved" ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          Resolved
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {complaint.status === "resolved" ? "Completed" : "Awaiting resolution"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="glass-effect border-0 shadow-xl">
                <CardHeader className="border-b border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <Link href="/submit-complaint">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Submit New Complaint
                    </Button>
                  </Link>
                  <Link href="/track-complaint">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View All Complaints
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-green-200 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/20"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Help & Support */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="glass-effect border-0 shadow-xl">
                <CardHeader className="border-b border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30">
                  <CardTitle className="text-lg">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      If you have questions about your complaint or need assistance, we're here to help.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        <span>support@university.edu</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4" />
                        <span>+1 (555) 123-4567</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Help Center
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
