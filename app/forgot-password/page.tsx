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
import { toast } from "@/components/ui/use-toast"
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
              <div className="text-center py-4">
                <p className="text-green-600 dark:text-green-400 mb-4">Reset link sent!</p>
                <p className="text-gray-600 dark:text-gray-400">
                  If your email is registered in our system, you will receive a password reset link shortly.
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Please check your email and follow the instructions to reset your password.
                </p>
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
