// app/track/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-sm text-gray-600">Loading Complaints...</p>
      </div>
    </div>
  );
}
