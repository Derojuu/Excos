"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { StudentSidebar } from "@/components/student-sidebar"
import { LoadingOverlay } from "@/components/loading-overlay"
import { toast } from "@/hooks/use-toast"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [logoutLoading, setLogoutLoading] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check-auth", {
          credentials: "include",
        })

        if (!response.ok) {
          router.push("/login")
          return
        }
      } catch (error) {
        console.error("Auth error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
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
    } finally {
      setLogoutLoading(false)
    }
  }

  if (loading) {
    return <LoadingOverlay isLoading={true} message="Loading dashboard..." />
  }

  return (
    <StudentSidebar>
      {children}
      <LoadingOverlay isLoading={logoutLoading} message="Logging out..." />
    </StudentSidebar>
  )
}
