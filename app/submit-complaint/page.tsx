"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ArrowLeft, FileText, Upload, AlertCircle, CheckCircle, User, Mail, Phone, Calendar } from "lucide-react"
import Image from "next/image"
import type { ComplaintFormState } from "@/app/actions/complaint-actions"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoadingOverlay } from "@/components/loading-overlay"

const initialState: ComplaintFormState = {}

// Define the FilePreview type
type FilePreview = {
  url: string
  type: string
  name: string
}

export default function SubmitComplaint() {
  const router = useRouter()
  const [complaintType, setComplaintType] = useState<string>("")
  const [state, setState] = useState<ComplaintFormState>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Add this useEffect for authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check-auth", {
          credentials: "include",
        })

        if (!response.ok) {
          router.push("/login?redirect=/submit-complaint")
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/login?redirect=/submit-complaint")
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true) // Start loading
    setIsSubmitting(true)

    try {
      // Auth check before submission
      const authCheck = await fetch("/api/auth/check-auth", {
        credentials: "include",
      })

      if (!authCheck.ok) {
        toast({
          title: "Authentication required",
          description: "Please login to submit a complaint",
          variant: "destructive",
        })
        router.push("/login?redirect=/submit-complaint")
        return
      }

      // Create FormData from form element
      const form = event.target as HTMLFormElement
      const formData = new FormData(form)

      // Add complaint type separately
      formData.append("complaintType", complaintType)

      // Handle file upload if a file is selected
      let evidenceUrl = null
      const evidenceFile = (form.elements.namedItem('evidence') as HTMLInputElement)?.files?.[0]
      
      if (evidenceFile) {
        try {
          const uploadFormData = new FormData()
          uploadFormData.append('file', evidenceFile)
          
          const uploadResponse = await fetch('/api/upload?type=evidence', {
            method: 'POST',
            body: uploadFormData,
            credentials: 'include'
          })
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json()
            evidenceUrl = uploadResult.url
          } else {
            const errorData = await uploadResponse.json()
            console.error('Upload response error:', errorData)
            throw new Error(errorData.message || 'File upload failed')
          }
        } catch (uploadError) {
          console.error('File upload error:', uploadError)
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown error occurred'
          toast({
            title: "File upload failed",
            description: `Error: ${errorMessage}. Your complaint will be submitted without the evidence file.`,
            variant: "destructive",
          })
        }
      }

      // Remove the evidence file from formData and add the URL instead
      formData.delete("evidence")
      if (evidenceUrl) {
        formData.append("evidenceUrl", evidenceUrl)
      }

      try {
        // Debug: Log form data before sending
        console.log("Form data being sent:")
        for (let [key, value] of formData.entries()) {
          console.log(key, value)
        }
        
        const httpResponse = await fetch("/api/auth/complaints/complaints", {
          method: "POST",
          body: formData,
          credentials: "include",
        })

        const response = await httpResponse.json()
        
        // Debug: Log response
        console.log("API Response:", response)
        console.log("HTTP Status:", httpResponse.status)

        if (!httpResponse.ok) {
          console.error("Submission failed:", response)
          toast({
            title: "Submission failed",
            description: response.message || `Error ${httpResponse.status}: Failed to submit complaint.`,
            variant: "destructive",
            duration: 8000,
          })
          setIsLoading(false)
          setIsSubmitting(false)
          return
        }

        if (response.referenceNumber) {
          toast({
            title: "✅ Success!",
            description: `Complaint submitted! Reference ID: ${response.referenceNumber}`,
            duration: 8000,
          })
          // Don't set isLoading to false here
          setTimeout(() => {
            router.push(`/submission-success?ref=${response.referenceNumber}`)
          }, 3000)
        } else if (response.message) {
          toast({
            title: "Error",
            description: response.message,
            variant: "destructive",
          })
          setIsLoading(false)
          setIsSubmitting(false)
        }

        setState(response)
      } catch (error) {
        console.error("Error submitting complaint:", error)
        toast({
          title: "Network error",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        })
        setIsLoading(false)
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error during submission:", error)
      setIsLoading(false)
      setIsSubmitting(false)
      toast({
        title: "Submission error",
        description: "An error occurred while submitting your complaint. Please try again.",
        variant: "destructive",
      })
    }
  }

  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Exam Details", icon: FileText },
    { number: 3, title: "Complaint", icon: AlertCircle },
    { number: 4, title: "Review", icon: CheckCircle },
  ]

  const [filePreview, setFilePreview] = useState<FilePreview | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Create preview URL
    const url = URL.createObjectURL(file)
    setFilePreview({
      url,
      type: file.type,
      name: file.name,
    })
  }

  useEffect(() => {
    return () => {
      // Cleanup preview URL when component unmounts
      if (filePreview) {
        URL.revokeObjectURL(filePreview.url)
      }
    }
  }, [filePreview])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-0">
      <LoadingOverlay isLoading={isLoading} message="Submitting your complaint..." />
      <div className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto px-2 sm:px-4 md:px-8 relative">
        {/* Back Link */}
        <div className="flex justify-between items-center mb-6 sm:mb-8 pt-4 px-1 sm:px-0">
          <Link
            href="/track-complaint"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <ThemeToggle />
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-800/10 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 dark:bg-blue-800/10 rounded-full opacity-40 animate-pulse delay-1000"></div>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8 px-1 sm:px-0"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-4">Submit Exam Complaint</h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Please provide detailed information about your exam complaint. All fields marked with * are required.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 sm:mb-8 px-0"
        >
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 lg:gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`
                  w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all
                  ${
                    currentStep >= step.number
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }
                `}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="ml-2 hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{step.title}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 lg:w-16 h-0.5 bg-gray-200 dark:bg-gray-700 mx-4 lg:mx-8"></div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="glass-effect border-0 shadow-2xl dark:bg-gray-800/50 w-full mx-auto">
            <CardHeader className="border-b border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30">
              <CardTitle className="text-xl font-semibold flex items-center text-gray-900 dark:text-gray-100">
                <FileText className="w-6 h-6 mr-3 text-purple-600 dark:text-purple-400" />
                Complaint Details
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Please fill out all required information accurately to ensure proper processing of your complaint.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 md:p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
                {/* Personal Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Personal Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name *
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="Enter your full name"
                        required
                        className="h-10 sm:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                      />
                      {state.errors?.fullName && (
                        <p className="text-sm text-red-500 dark:text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {state.errors.fullName[0]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="studentId" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Student ID *
                      </Label>
                      <Input
                        id="studentId"
                        name="studentId"
                        placeholder="Enter your student ID"
                        required
                        className="h-10 sm:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                      />
                      {state.errors?.studentId && (
                        <p className="text-sm text-red-500 dark:text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {state.errors.studentId[0]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          required
                          className="h-10 sm:h-12 pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      {state.errors?.email && (
                        <p className="text-sm text-red-500 dark:text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {state.errors.email[0]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="Enter your phone number (optional)"
                          className="h-10 sm:h-12 pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      {state.errors?.phone && (
                        <p className="text-sm text-red-500 dark:text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {state.errors.phone[0]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Exam Information Section */}
                <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Exam Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="examName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Exam Name *
                      </Label>
                      <Input
                        id="examName"
                        name="examName"
                        placeholder="Enter the exam name"
                        required
                        className="h-10 sm:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                      />
                      {state.errors?.examName && (
                        <p className="text-sm text-red-500 dark:text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {state.errors.examName[0]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="examDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Exam Date *
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          id="examDate"
                          name="examDate"
                          type="date"
                          required
                          className="h-10 sm:h-12 pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      {state.errors?.examDate && (
                        <p className="text-sm text-red-500 dark:text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {state.errors.examDate[0]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="course" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Course Code
                      </Label>
                      <Input
                        id="course"
                        name="course"
                        placeholder="e.g., CS101, MATH201"
                        className="h-10 sm:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                      />
                      {state.errors?.course && (
                        <p className="text-sm text-red-500 dark:text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {state.errors.course[0]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Department
                      </Label>
                      <Input
                        id="department"
                        name="department"
                        placeholder="e.g., Computer Science"
                        className="h-10 sm:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                      />
                      {state.errors?.department && (
                        <p className="text-sm text-red-500 dark:text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {state.errors.department[0]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="faculty" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Faculty
                      </Label>
                      <Input
                        id="faculty"
                        name="faculty"
                        placeholder="e.g., Engineering"
                        className="h-10 sm:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                      />
                      {state.errors?.faculty && (
                        <p className="text-sm text-red-500 dark:text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {state.errors.faculty[0]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 sm:col-span-1">
                      <Label htmlFor="complaintType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Complaint Type *
                      </Label>
                      <Select onValueChange={setComplaintType}>
                        <SelectTrigger className="h-10 sm:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100">
                          <SelectValue placeholder="Select the type of complaint" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grading">Grading Issue</SelectItem>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="content">Exam Content Issue</SelectItem>
                          <SelectItem value="administration">Administration Issue</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {state.errors?.complaintType && (
                        <p className="text-sm text-red-500 dark:text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {state.errors.complaintType[0]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Complaint Details Section */}
                <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/50 dark:to-pink-900/50 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Complaint Details
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Detailed Description *
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Provide a detailed description of your complaint. Include specific details about what happened, when it occurred, and any relevant circumstances."
                        required
                        rows={5}
                        className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 resize-none text-gray-900 dark:text-gray-100"
                      />
                      {state.errors?.description && (
                        <p className="text-sm text-red-500 dark:text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {state.errors.description[0]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="desiredResolution"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Desired Resolution *
                      </Label>
                      <Textarea
                        id="desiredResolution"
                        name="desiredResolution"
                        placeholder="Describe what outcome you would like to see from this complaint. Be specific about your expectations."
                        required
                        rows={4}
                        className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 resize-none text-gray-900 dark:text-gray-100"
                      />
                      {state.errors?.desiredResolution && (
                        <p className="text-sm text-red-500 dark:text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {state.errors.desiredResolution[0]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="evidence" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Supporting Evidence
                      </Label>
                      <div className="relative">
                        <input
                          id="evidence"
                          name="evidence"
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/20 dark:file:text-purple-400 dark:hover:file:bg-purple-900/30 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:ring-purple-500/20"
                        />
                        {filePreview && (
                          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center">
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                                {filePreview.name}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Upload documents, images, or other files that support your complaint (PDF, DOC, DOCX, JPG, PNG, GIF - Max 10MB)
                      </p>
                      {state.errors?.evidenceFile && (
                        <p className="text-sm text-red-500 dark:text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {state.errors.evidenceFile[0]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                  <Button
                    type="submit"
                    className="w-full h-12 sm:h-14 btn-gradient text-white font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Submitting Complaint...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-3" />
                        Submit Complaint
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Toaster />
    </div>
  )
}
