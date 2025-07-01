import { DashboardLayout } from "@/components/dashboard-layout"

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="h-6 sm:h-8 bg-gray-200 rounded-lg w-32 sm:w-40 animate-pulse"></div>
            <div className="h-4 sm:h-5 bg-gray-200 rounded-lg w-48 sm:w-64 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="h-6 sm:h-8 bg-gray-200 rounded-full w-16 sm:w-20 animate-pulse"></div>
            <div className="h-8 sm:h-10 bg-gray-200 rounded-lg w-24 sm:w-32 animate-pulse"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-effect border-0 shadow-lg rounded-xl p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20 animate-pulse"></div>
                  <div className="h-6 sm:h-8 bg-gray-200 rounded w-8 sm:w-12 animate-pulse"></div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="glass-effect border-0 shadow-xl rounded-xl">
          <div className="border-b border-white/20 bg-gradient-to-r from-white/50 to-white/30 p-4 sm:p-6">
            <div className="h-5 sm:h-6 bg-gray-200 rounded-lg w-32 sm:w-40 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-48 sm:w-64 animate-pulse"></div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="h-10 sm:h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 sm:h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
