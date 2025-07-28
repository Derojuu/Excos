"use client"
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, BarChart3, Users, FileText, Settings, User, LogOut, Bell, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { getCurrentUser } from "@/app/actions/auth"
import { LoadingOverlay } from "@/components/loading-overlay"
import { NotificationDropdown } from "@/components/notification-dropdown"
import type { User as UserType } from "@/app/types/index"

export interface AdminSidebarRef {
  toggleSidebar: () => void
}

export const AdminSidebar = forwardRef<AdminSidebarRef, { children: React.ReactNode }>(
  function AdminSidebar({ children }, ref) {
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
          if (!userData || userData.role !== "admin") {
            router.push("/login")
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

    // Prevent body scroll when sidebar is open on mobile
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
      { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { name: "Complaints", href: "/admin/complaints", icon: FileText },
      { name: "Profile", href: "/admin/profile", icon: User },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ]

    const isActive = (href: string) => {
      if (href === "/admin/dashboard") {
        return pathname === "/admin/dashboard"
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
      <>
        <LoadingOverlay isLoading={logoutLoading} message="Signing out..." />        {/* Sidebar overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
        )}{/* Sidebar */}
        <aside
          className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Admin Portal</h2>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationDropdown apiUrl="/api/notifications" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 lg:hidden"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>          {/* User Info */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4">
              {user?.profilePicUrl ? (
                <img
                  src={user.profilePicUrl}
                  alt="Profile"
                  className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl flex items-center justify-center">
                  <Shield className="w-7 h-7 text-blue-600 dark:text-blue-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {user?.firstName || "Admin"}
                  {user?.lastName ? ` ${user.lastName}` : ""}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || ""}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Administrator
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
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
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
        </aside>        {/* Page content */}
        <div>
          {children}
        </div>
      </>
    )
  }
)

AdminSidebar.displayName = "AdminSidebar"
