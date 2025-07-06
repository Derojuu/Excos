"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Users, Shield } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { requestPasswordReset } from "../actions/password-actions"
import { Toaster } from "@/components/ui/toaster"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoadingOverlay } from "@/components/loading-overlay"

export default function ForgotPassword() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("student")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const role = activeTab // "student" or "admin"

    try {
      const result = await requestPasswordReset(email, role)

      if (result.success) {
        setSent(true)
        toast({
          title: "Reset Link Sent",
          description: "If an account exists with this email, you will receive a password reset link.",
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error requesting password reset:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center p-4">
      <LoadingOverlay isLoading={isSubmitting} message="Sending reset link..." />

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-800/10 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 dark:bg-blue-800/10 rounded-full opacity-40 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>
          <ThemeToggle />
        </div>

        <Card className="glass-effect shadow-2xl border-0 dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Forgot Password</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Enter your email address and we'll send you a password reset link
            </CardDescription>
          </CardHeader>

          <CardContent>
            {sent ? (
              <div className="text-center py-8">
                {/* Success Icon */}
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                {/* Success Title */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Reset Link Sent! ✉️
                </h3>

                {/* Main Message */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6">
                  <p className="text-green-800 dark:text-green-200 font-medium mb-3">
                    If your email is registered in our system, you will receive a password reset link shortly.
                  </p>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    Please check your email and follow the instructions to reset your password.
                  </p>
                </div>

                {/* Instructions Box */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 mb-6">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What to do next:</h4>
                  <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1 text-left">
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      Check your email inbox and spam folder
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      Click the reset link (valid for 1 hour)
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      Create a new secure password
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => setSent(false)}
                    variant="outline"
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Send Another Email
                  </Button>
                  <Button
                    onClick={() => router.push('/login')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
                  >
                    Back to Login
                  </Button>
                </div>

                {/* Footer Note */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Didn't receive an email? Check your spam folder or try again in a few minutes.
                  </p>
                </div>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl">
                  <TabsTrigger
                    value="student"
                    className="flex items-center space-x-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all text-gray-700 dark:text-gray-300"
                  >
                    <Users className="w-4 h-4" />
                    <span>Student</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="admin"
                    className="flex items-center space-x-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all text-gray-700 dark:text-gray-300"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="student">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-email" className="text-gray-700 dark:text-gray-300">
                        Student Email
                      </Label>
                      <Input
                        id="student-email"
                        name="email"
                        type="email"
                        placeholder="Enter your student email"
                        required
                        className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <Button type="submit" className="w-full btn-gradient" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="admin">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email" className="text-gray-700 dark:text-gray-300">
                        Admin Email
                      </Label>
                      <Input
                        id="admin-email"
                        name="email"
                        type="email"
                        placeholder="Enter your admin email"
                        required
                        className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <Button type="submit" className="w-full btn-gradient" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
      <Toaster />
    </div>
  )
}
