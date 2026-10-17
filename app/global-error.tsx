"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCw, Home } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global application error caught:", error)
  }, [error])

  const handleClearAndReload = () => {
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch (e) {}
    window.location.href = "/"
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF9F6] text-stone-800 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md rounded-3xl bg-white border border-stone-200/80 p-8 text-center shadow-[0_20px_50px_rgba(40,30,20,0.08)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 mb-5 border border-emerald-100 shadow-sm">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 mb-2">
            Equinox Supermarket
          </h1>
          <p className="text-xs text-stone-500 mb-6 leading-relaxed">
            The page encountered an unexpected issue while loading. You can try refreshing or resetting your session.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={handleClearAndReload}
              className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            >
              <Home className="h-4 w-4" />
              <span>Reset &amp; Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => reset()}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
