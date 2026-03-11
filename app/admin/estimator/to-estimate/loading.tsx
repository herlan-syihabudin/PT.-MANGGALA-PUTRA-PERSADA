export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="aanimate-pulse duration-1000 space-y-6">
          {/* Header dengan skeleton lebih detail */}
          <div className="space-y-2">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-1/4" /> {/* Subtitle */}
          </div>
          
          {/* Stats Cards - sekarang 4 card sesuai komponen asli */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-slate-200 rounded-lg" /> {/* Icon */}
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-2/3" /> {/* Label */}
                    <div className="h-5 bg-slate-200 rounded w-1/2" /> {/* Value */}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Estimator Load Section - baru sesuai komponen */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 bg-slate-200 rounded w-32" /> {/* Title */}
              <div className="h-3 bg-slate-200 rounded w-24" /> {/* Capacity info */}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 bg-slate-200 rounded w-16" /> {/* Name */}
                    <div className="h-3 bg-slate-200 rounded w-12" /> {/* Count */}
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full" /> {/* Progress bar */}
                </div>
              ))}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <div className="h-10 bg-slate-200 rounded-lg" /> {/* Search input */}
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-32 bg-slate-200 rounded-lg" /> {/* Priority filter */}
                <div className="h-10 w-32 bg-slate-200 rounded-lg" /> {/* Sort filter */}
              </div>
            </div>
          </div>

          {/* Table dengan skeleton lebih detail */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="bg-slate-50 border-b border-slate-200 p-4">
              <div className="grid grid-cols-7 gap-4">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-3 bg-slate-200 rounded w-3/4" />
                ))}
              </div>
            </div>

            {/* Table Rows */}
            {[...Array(5)].map((_, rowIndex) => (
              <div key={rowIndex} className="p-4 border-b border-slate-100 last:border-0">
                <div className="grid grid-cols-7 gap-4 items-center">
                  {/* Customer & Project */}
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-24" />
                    <div className="h-3 bg-slate-200 rounded w-32" />
                  </div>
                  
                  {/* Nilai */}
                  <div className="h-4 bg-slate-200 rounded w-20" />
                  
                  {/* Umur */}
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-slate-200 rounded-full" /> {/* Icon */}
                    <div className="h-4 bg-slate-200 rounded w-12" />
                  </div>
                  
                  {/* Deal Score */}
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 bg-slate-200 rounded-full" /> {/* Progress bar */}
                    <div className="h-3 bg-slate-200 rounded w-8" /> {/* Percentage */}
                  </div>
                  
                  {/* Estimator */}
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-slate-200 rounded-full" /> {/* Icon */}
                    <div className="h-4 bg-slate-200 rounded w-16" /> {/* Name */}
                  </div>
                  
                  {/* Risk Badge */}
                  <div className="h-6 bg-slate-200 rounded-full w-20" /> {/* Risk badge */}
                  
                  {/* Action Button */}
                  <div className="h-8 bg-slate-200 rounded-lg w-24 mx-auto" /> {/* Button */}
                </div>
              </div>
            ))}
          </div>

          {/* AI Recommendation Skeleton */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 bg-slate-200 rounded-lg" /> {/* Icon */}
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-24" /> {/* Label */}
                <div className="space-y-1">
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
