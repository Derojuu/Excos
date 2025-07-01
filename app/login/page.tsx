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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, ArrowLeft, FileText, Shield, Users, Mail, Lock } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoadingOverlay } from "@/components/loading-overlay"

export default function Login() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("student")
  const [error, setError] = useState<string | null>(null)
  const [showStudentPassword, setShowStudentPassword] = useState(false)
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>, role: "student" | "admin") => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          role,
        }),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      if (data.success) {
        // Don't set isLoading to false here!
        router.push(role === "student" ? "/track-complaint" : "/admin/dashboard")
      } else {
        throw new Error(data.message || "Login failed")
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to the server")
      setIsLoading(false) // Only set to false on error
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-3 sm:p-4 overflow-auto">
      <LoadingOverlay isLoading={isLoading} message="Signing you in..." />

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-800/10 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 dark:bg-blue-800/10 rounded-full opacity-40 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
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
            <CardHeader className="text-center space-y-3 pb-6 sm:space-y-4 sm:pb-8">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-gradient">Welcome Back</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                  Sign in to access your exam complaint dashboard
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {mounted ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl">
                    <TabsTrigger
                      value="student"
                      id="login-tab-student"
                      className="flex items-center space-x-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all text-gray-700 dark:text-gray-300"
                    >
                      <Users className="w-4 h-4" />
                      <span>Student</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="admin"
                      id="login-tab-admin"
                      className="flex items-center space-x-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all text-gray-700 dark:text-gray-300"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="student" id="login-content-student">
                  <form onSubmit={(e) => handleLogin(e, "student")} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="student-email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          required
                          className="h-10 sm:h-12 pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="student-password"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Password
                        </Label>
                        <Link
                          href="/forgot-password"
                          className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="student-password"
                          name="password"
                          type={showStudentPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          required
                          className="h-10 sm:h-12 pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 pr-12 text-gray-900 dark:text-gray-100"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                          onClick={() => setShowStudentPassword(!showStudentPassword)}
                        >
                          {showStudentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-10 sm:h-12 btn-gradient text-white font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In as Student"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="admin" id="login-content-admin">
                  <form onSubmit={(e) => handleLogin(e, "admin")} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Admin Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="admin-email"
                          name="email"
                          type="email"
                          placeholder="Enter admin email"
                          required
                          className="h-10 sm:h-12 pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="admin-password"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Password
                        </Label>
                        <Link
                          href="/forgot-password"
                          className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="admin-password"
                          name="password"
                          type={showAdminPassword ? "text" : "password"}
                          placeholder="Enter admin password"
                          required
                          className="h-10 sm:h-12 pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 pr-12 text-gray-900 dark:text-gray-100"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                        >
                          {showAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-10 sm:h-12 btn-gradient text-white font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In as Administrator"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              )}
            </CardContent>

            <div className="px-6 pb-6">
              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    href={activeTab === "student" ? "/register" : "/register/admin"}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium transition-colors"
                  >
                    Create one here
                  </Link>
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
