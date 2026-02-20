import { Suspense } from "react"
import CreateRABClient from "./CreateRABClient"

export default function Page() {
  return (
    <Suspense fallback={<CreateRABSkeleton />}>
      <CreateRABClient />
    </Suspense>
  )
}

function CreateRABSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          
          {/* Form skeleton */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="h-10 bg-slate-200 rounded w-full" />
            <div className="h-10 bg-slate-200 rounded w-full" />
            <div className="h-10 bg-slate-200 rounded w-full" />
            <div className="h-32 bg-slate-200 rounded w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
