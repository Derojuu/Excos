export default function AdminProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Skeleton */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div>
              <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-48 h-3 bg-gray-200 rounded animate-pulse mt-1 hidden sm:block"></div>
            </div>
          </div>
          <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-effect border-0 shadow-lg rounded-xl p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* System Status Cards Skeleton */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-effect border-0 shadow-lg rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="glass-effect border-0 shadow-xl rounded-xl">
          <div className="border-b border-white/20 bg-gradient-to-r from-white/50 to-white/30 p-4 sm:p-6">
            <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-64 h-4 bg-gray-200 rounded animate-pulse mt-2"></div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse mb-8"></div>
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-full h-12 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
