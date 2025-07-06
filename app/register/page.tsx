"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoadingOverlay } from "@/components/loading-overlay"
import {
  Eye,
  EyeOff,
  ArrowLeft,
  FileText,
  User,
  Mail,
  BadgeIcon as IdCard,
  Lock,
  CheckCircle,
  Building2,
  GraduationCap,
  Layers,
} from "lucide-react"

export default function Register() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    studentId: "",
    password: "",
    confirmPassword: "",
    department: "",
    faculty: "",
    level: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.studentId.trim()) {
      newErrors.studentId = "Student ID is required"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.department) {
      newErrors.department = "Department is required"
    }

    if (!formData.faculty) {
      newErrors.faculty = "Faculty is required"
    }

    if (!formData.level) {
      newErrors.level = "Level is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validate form before proceeding
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)

    try {
      const data = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: "student",
        studentId: formData.studentId,
        department: formData.department,
        faculty: formData.faculty,
        level: formData.level,
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "✅ Registration Successful!",
          description: "Welcome! Your student account has been created successfully. You can now log in with your credentials.",
          duration: 8000,
        })
        // Wait longer to show the success message before redirecting
        setTimeout(() => {
          router.push("/login")
        }, 4000)
      } else {
        toast({
          title: "Registration failed",
          description: result.message || "Something went wrong",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Error",
        description: "Failed to register. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center p-3 sm:p-4">
      <LoadingOverlay isLoading={isLoading} message="Registering your details..." />

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-800/10 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 dark:bg-blue-800/10 rounded-full opacity-40 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm sm:max-w-lg">
        {/* Back to home link */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <ThemeToggle />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card className="glass-effect shadow-2xl border-0 dark:bg-gray-800/50">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-gradient">Create Account</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                  Join EXCOS to submit and track your exam complaints
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300"
                    >
                      <User className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="h-10 sm:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                      placeholder="John"
                    />
                    {errors.firstName && <p className="text-sm text-red-500 dark:text-red-400">{errors.firstName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="h-10 sm:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                      placeholder="Doe"
                    />
                    {errors.lastName && <p className="text-sm text-red-500 dark:text-red-400">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300"
                  >
                    <Mail className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-10 sm:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                    placeholder="john.doe@university.edu"
                  />
                  {errors.email && <p className="text-sm text-red-500 dark:text-red-400">{errors.email}</p>}
                </div>

                {/* Student ID Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="studentId"
                    className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300"
                  >
                    <IdCard className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    Student ID
                  </Label>
                  <Input
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="h-10 sm:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                    placeholder="21059111"
                  />
                  {errors.studentId && <p className="text-sm text-red-500 dark:text-red-400">{errors.studentId}</p>}
                </div>

                {/* Department, Faculty, and Level Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="department"
                      className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300"
                    >
                      <Building2 className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                      Department
                    </Label>
                    <Input
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="h-10 sm:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                      placeholder="Enter your department"
                      required
                    />
                    {errors.department && <p className="text-sm text-red-500 dark:text-red-400">{errors.department}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="faculty"
                      className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300"
                    >
                      <GraduationCap className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                      Faculty
                    </Label>
                    <Input
                      id="faculty"
                      name="faculty"
                      value={formData.faculty}
                      onChange={handleChange}
                      className="h-10 sm:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                      placeholder="Enter your faculty"
                      required
                    />
                    {errors.faculty && <p className="text-sm text-red-500 dark:text-red-400">{errors.faculty}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="level"
                      className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300"
                    >
                      <Layers className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                      Level
                    </Label>
                    <Input
                      id="level"
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="h-10 sm:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                      placeholder="Enter your level"
                      required
                    />
                    {errors.level && <p className="text-sm text-red-500 dark:text-red-400">{errors.level}</p>}
                  </div>
                </div>

                {/* Password Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300"
                    >
                      <Lock className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        className="h-10 sm:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 pr-12 text-gray-900 dark:text-gray-100"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500 dark:text-red-400">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300"
                    >
                      <Lock className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="h-10 sm:h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 pr-12 text-gray-900 dark:text-gray-100"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500 dark:text-red-400">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3 pt-4">
                  <Checkbox id="terms" required className="mt-1" />
                  <Label htmlFor="terms" className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium transition-colors"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-10 sm:h-12 btn-gradient text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-3" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <div className="px-6 pb-6">
              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
      <Toaster />
    </div>
  )
}
