"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  LogOut, 
  User, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  FileText, 
  BarChart3,
  Calendar,
  Download,
  PieChart,
  Activity,
  Timer,
  Menu
} from "lucide-react"
import { LoadingOverlay } from "@/components/loading-overlay"
import type { User as UserType } from "@/app/types/index"
import { ThemeToggle } from "@/components/theme-toggle"
import { AdminSidebar, AdminSidebarRef } from "@/components/admin-sidebar"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

interface AnalyticsData {
  trends: Array<{
    date: string
    count: number
    pending: number
    under_review: number
    resolved: number
  }>
  typeDistribution: Array<{
    type: string
    count: number
    percentage: number
  }>
  statusDistribution: Array<{
    status: string
    count: number
    percentage: number
  }>
  resolutionTimes: {
    avg_resolution_days: number
    min_resolution_days: number
    max_resolution_days: number
  }
  monthlyComparison: Array<{
    month: number
    year: number
    count: number
  }>
  hourlyDistribution: Array<{
    hour: number
    count: number
  }>
  topExamTypes: Array<{
    exam_name: string
    complaint_count: number
    avg_resolution_time: number
  }>
  responseStats: {
    complaints_with_responses: number
    total_responses: number
    avg_first_response_time: number
  }
  summary: {
    totalComplaints: number
    avgDailyComplaints: string
    resolutionRate: number
    pendingRate: number
  }
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff0000']
const STATUS_COLORS = {
  pending: '#f59e0b',
  'under-review': '#3b82f6',
  resolved: '#10b981'
}

export default function AdminAnalytics() {
  const router = useRouter()
  const adminSidebarRef = useRef<AdminSidebarRef>(null)
  const [user, setUser] = useState<UserType | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchingAnalytics, setFetchingAnalytics] = useState(false)
  const [dateRange, setDateRange] = useState("30")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check-auth", {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Auth check failed")
        }

        const data = await response.json()

        if (data.role !== "admin") {
          router.push("/profile")
          return
        }

        setUser(data)
        fetchAnalytics()
      } catch (error) {
        console.error("Auth error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, dateRange, statusFilter, typeFilter])

  const fetchAnalytics = async () => {
    try {
      const params = new URLSearchParams()
      
      // Add date range filter
      if (dateRange !== "all") {
        const endDate = new Date()
        const startDate = subDays(endDate, parseInt(dateRange))
        params.append('startDate', format(startDate, 'yyyy-MM-dd'))
        params.append('endDate', format(endDate, 'yyyy-MM-dd'))
      }
      
      if (statusFilter !== "all") {
        params.append('status', statusFilter)
      }
      
      if (typeFilter !== "all") {
        params.append('type', typeFilter)
      }

      const response = await fetch(`/api/admin/analytics?${params.toString()}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch analytics")
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
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
    }
  }

  const handleExportData = () => {
    if (!analytics) return
    
    const csvData = [
      ['Date', 'Total', 'Pending', 'Under Review', 'Resolved'],
      ...analytics.trends.map(day => [
        day.date,
        day.count,
        day.pending,
        day.under_review,
        day.resolved
      ])
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `complaint-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Show loading state
  if (loading) {
    return <LoadingOverlay isLoading={true} message="Loading analytics dashboard..." />
  }

  // Protect against non-admin access
  if (!user || user.role !== "admin") {
    return null
  }
  if (!analytics) {
    return <LoadingOverlay isLoading={true} message="Loading analytics data..." />
  }
  // Prepare chart data
  const trendsData = analytics.trends
    .filter((day: any) => day.date) // Filter out null dates
    .map((day: any, index: number) => ({      ...day,
      date: format(new Date(day.date), 'MMM dd'),
      id: `trend-${day.date}-${index}` // Add unique ID
    }))

  const statusChartData = analytics.statusDistribution
    .filter((item: any) => item.status && item.status.trim() !== '') // Filter out null/empty status
    .map((item: any, index: number) => ({
      name: item.status ? item.status.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : `Unknown ${index + 1}`,
      value: item.count || 0,
      percentage: item.percentage || 0,
      id: `status-${item.status || 'unknown'}-${index}` // Unique ID
    }))
  const typeChartData = analytics.typeDistribution
    .filter((item: any) => item.type && item.type.trim() !== '') // Filter out null/empty types
    .map((item: any, index: number) => ({
      name: item.type ? item.type.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : `Unknown ${index + 1}`,
      value: item.count || 0,
      percentage: item.percentage || 0,
      id: `type-${item.type || 'unknown'}-${index}` // Unique ID
    }))

  const hourlyData = analytics.hourlyDistribution
    .filter((item: any) => item.hour !== null && item.hour !== undefined) // Filter out null hours
    .map((item: any, index: number) => ({
      hour: `${item.hour}:00`,
      count: item.count || 0,
      id: `hour-${item.hour}-${index}` // Add unique ID
    }))
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 relative">
      <AdminSidebar ref={adminSidebarRef}>
        <div />
      </AdminSidebar>
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-800/10 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 dark:bg-blue-800/10 rounded-full opacity-40 animate-pulse delay-1000"></div>
      </div>      {/* Header */}
      <header className="glass-effect border-b border-white/20 dark:border-gray-700/20 sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            {/* Menu button for mobile, replaced EXCOS icon */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/20"
              onClick={() => adminSidebarRef.current?.toggleSidebar()}
            >
              <Menu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gradient truncate">Analytics Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                Advanced insights and reporting
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <ThemeToggle />
            <Link href="/admin/dashboard">
              <Button variant="outline" className="text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
            <Link href="/admin/profile">
              <Button className="btn-gradient shadow-lg text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4">
                <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-8 relative z-10">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Card className="glass-effect border-0 shadow-lg dark:bg-gray-800/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Analytics Filters</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Customize your analytics view with date range and filters
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-full sm:w-40 bg-white/50 dark:bg-gray-800/50">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Last year</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40 bg-white/50 dark:bg-gray-800/50">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under-review">Under Review</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleExportData} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8"
        >
          <Card className="glass-effect border-0 shadow-lg card-hover dark:bg-gray-800/50">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Total Complaints</p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {analytics.summary.totalComplaints || 0}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-lg card-hover dark:bg-gray-800/50">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Avg Daily</p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {analytics.summary.avgDailyComplaints && typeof analytics.summary.avgDailyComplaints === 'number' 
                      ? (analytics.summary.avgDailyComplaints as number).toFixed(1) 
                      : '0.0'}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-lg lg:rounded-xl flex items-center justify-between flex-shrink-0">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-lg card-hover dark:bg-gray-800/50">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Resolution Rate</p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {analytics.summary.resolutionRate && typeof analytics.summary.resolutionRate === 'number' 
                      ? analytics.summary.resolutionRate.toFixed(1) 
                      : '0.0'}%
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-lg card-hover dark:bg-gray-800/50">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Avg Resolution</p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                    {analytics.resolutionTimes.avg_resolution_days ? Math.round(analytics.resolutionTimes.avg_resolution_days) : 0}d
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Timer className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Complaint Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="glass-effect border-0 shadow-xl dark:bg-gray-800/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center text-gray-900 dark:text-gray-100">
                  <TrendingUp className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                  Complaint Trends
                </CardTitle>
                <CardDescription>Daily complaint submissions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendsData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8884d8" 
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                      name="Total Complaints"
                      key="area-total-complaints"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="glass-effect border-0 shadow-xl dark:bg-gray-800/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center text-gray-900 dark:text-gray-100">
                  <PieChart className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Status Distribution
                </CardTitle>
                <CardDescription>Current complaint status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      key="status-pie-chart"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Hourly Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="glass-effect border-0 shadow-xl dark:bg-gray-800/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center text-gray-900 dark:text-gray-100">
                  <Clock className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                  Activity by Hour
                </CardTitle>
                <CardDescription>When complaints are submitted most frequently</CardDescription>
              </CardHeader>
              <CardContent>                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" key="hourly-count-bar" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Type Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="glass-effect border-0 shadow-xl dark:bg-gray-800/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center text-gray-900 dark:text-gray-100">
                  <BarChart3 className="w-5 h-5 mr-2 text-amber-600 dark:text-amber-400" />
                  Complaint Types
                </CardTitle>
                <CardDescription>Distribution of complaint categories</CardDescription>
              </CardHeader>
              <CardContent>                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={typeChartData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#f59e0b" key="type-value-bar" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Detailed Trends Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <Card className="glass-effect border-0 shadow-xl dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center text-gray-900 dark:text-gray-100">
                <Activity className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                Detailed Status Trends
              </CardTitle>
              <CardDescription>Track how complaint statuses change over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />                  <Line 
                    type="monotone" 
                    dataKey="pending" 
                    stroke={STATUS_COLORS.pending} 
                    strokeWidth={2}
                    name="Pending"
                    key="line-pending"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="under_review" 
                    stroke={STATUS_COLORS['under-review']} 
                    strokeWidth={2}
                    name="Under Review"
                    key="line-under-review"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke={STATUS_COLORS.resolved} 
                    strokeWidth={2}
                    name="Resolved"
                    key="line-resolved"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Exam Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card className="glass-effect border-0 shadow-xl dark:bg-gray-800/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center text-gray-900 dark:text-gray-100">
                  <FileText className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
                  Top Exam Types by Complaints
                </CardTitle>
                <CardDescription>Exams with the most complaints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topExamTypes.slice(0, 5).map((exam, index) => (
                    <div key={exam.exam_name} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/50 dark:to-pink-900/50 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-red-600 dark:text-red-400">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-40">
                            {exam.exam_name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Avg resolution: {exam.avg_resolution_time ? Math.round(exam.avg_resolution_time) : 0} days
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                        {exam.complaint_count} complaints
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Response Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="glass-effect border-0 shadow-xl dark:bg-gray-800/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center text-gray-900 dark:text-gray-100">
                  <Timer className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Response Statistics
                </CardTitle>
                <CardDescription>Admin response performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Complaints with Responses</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total complaints that received responses</p>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                      {analytics.responseStats.complaints_with_responses}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Total Responses</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">All responses sent by admins</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                      {analytics.responseStats.total_responses}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Avg First Response Time</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Time to first admin response</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                      {analytics.responseStats.avg_first_response_time ? Math.round(analytics.responseStats.avg_first_response_time) : 0} days
                    </Badge>
                  </div>
                </div>              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
