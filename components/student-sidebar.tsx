"use client"
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Home, FileText, Search, User, LogOut, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { getCurrentUser } from "@/app/actions/auth"
import { LoadingOverlay } from "@/components/loading-overlay"
import { NotificationDropdown } from "@/components/notification-dropdown"
import type { User as UserType } from "@/app/types/index"

export interface StudentSidebarRef {
  toggleSidebar: () => void
}

export const StudentSidebar = forwardRef<StudentSidebarRef, { children: React.ReactNode }>(
  function StudentSidebar({ children }, ref) {
    const [isOpen, setIsOpen] = useState(false)
    const [user, setUser] = useState<UserType | null>(null)
    const [loading, setLoading] = useState(true)
    const [logoutLoading, setLogoutLoading] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    // Fetch user info on mount
    useEffect(() => {
      async function loadUser() {
        try {
          const userData = await getCurrentUser()
          if (!userData) {
            router.push("/login")
            return
          }
          // Check if user is a student, redirect admins to admin portal
          if (userData.role === "admin") {
            router.push("/admin/dashboard")
            return
          }
          setUser(userData)
        } catch (error) {
          router.push("/login")
        } finally {
          setLoading(false)
        }
      }
      loadUser()
    }, [router])

    // Prevent body scroll when sidebar is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden"
      } else {
        document.body.style.overflow = ""
      }
      return () => {
        document.body.style.overflow = ""
      }
    }, [isOpen])

    const navigation = [
      { name: "Dashboard", href: "/track-complaint", icon: Home },
      { name: "Submit Complaint", href: "/submit-complaint", icon: FileText },
      { name: "Track Complaints", href: "/track-complaint", icon: Search },
      { name: "Profile", href: "/profile", icon: User },
    ]

    const isActive = (href: string) => {
      if (href === "/") {
        return pathname === "/"
      }
      return pathname ? pathname.startsWith(href) : false
    }

    const handleLogout = async () => {
      setLogoutLoading(true)
      try {
        await fetch("/api/auth/logout", { method: "POST" })
        router.push("/login")
      } catch (error) {
        // Optionally show a toast
      } finally {
        setLogoutLoading(false)
      }
    }

    // Expose the toggle function
    useImperativeHandle(ref, () => ({
      toggleSidebar: () => setIsOpen((prev) => !prev),
    }))

    // Only show logout overlay
    if (loading) return null

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
        <LoadingOverlay isLoading={logoutLoading} message="Signing out..." />

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-800/10 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 dark:bg-blue-800/10 rounded-full opacity-40 animate-pulse delay-1000"></div>
        </div>

        {/* Sidebar overlay for mobile */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        `}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Student Portal</h2>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationDropdown apiUrl="/api/student/notifications" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8" // Removed lg:hidden
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          {/* User Info */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4">
              {user?.profilePicUrl ? (
                <img
                  src={user.profilePicUrl}
                  alt="Profile"
                  className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-xl flex items-center justify-center">
                  <User className="w-7 h-7 text-purple-600 dark:text-purple-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {user?.firstName || "Student"}
                  {user?.lastName ? ` ${user.lastName}` : ""}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || ""}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.studentId || ""}
                </p>
              </div>
            </div>
          </div>
          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${
                        isActive(item.href)
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }
                    `}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="ghost"
              onClick={() => {
                setIsOpen(false)
                handleLogout()
              }}
              className="w-full justify-start gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main content area with topbar */}
        <div className="w-full">
          {/* Top bar */}
          <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-800/40 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-white/60 dark:hover:bg-gray-800/60 rounded-xl transition-all duration-200"
                  onClick={() => setIsOpen(true)}
                >
                  <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </Button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Student Dashboard</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                    Manage your academic complaints
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <NotificationDropdown apiUrl="/api/student/notifications" />
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-white/60 dark:hover:bg-gray-800/60 rounded-xl transition-all duration-200 p-2 group"
                  >
                    <User className="w-5 h-5 text-gray-600 dark:text-purple-300 group-hover:text-purple-600 group-hover:scale-110 transition-all duration-200" />
                  </Button>
                </Link>
              </div>
            </div>
          </header>
          {/* Page content */}
          <main className="relative z-10 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    )
  }
)
