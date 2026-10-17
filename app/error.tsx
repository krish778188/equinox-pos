"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("App client error caught by boundary:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-4 text-stone-800">
      <div className="max-w-md w-full rounded-3xl bg-white border border-stone-200/80 p-6 text-center shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 mb-4 border border-amber-200">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="font-serif text-xl font-bold text-stone-900 mb-2">Something went wrong</h2>
        <p className="text-xs text-stone-500 mb-6">
          The supermarket application encountered a temporary glitch. Click below to refresh.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              try {
                localStorage.removeItem("supermarket_user")
                localStorage.removeItem("pos_user")
              } catch (e) {}
              window.location.reload()
            }}
            className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
          >
            Clear Data & Reload
          </button>
          <button
            onClick={() => reset()}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    </div>
  )
}
