"use client"

import { useState } from "react"
import { Users, Loader2, Eye, EyeOff } from "lucide-react"

export function EmployeeLogin({ onSuccess }: { onSuccess: (user: any) => void }) {
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password })
      })
      const data = await res.json()

      if (data.success) {
        onSuccess(data.user)
      } else {
        setError(data.error || "Invalid credentials")
      }
    } catch (err) {
      setError("An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="w-full max-w-sm rounded-3xl border border-white/70 bg-white/70 p-8 shadow-[0_20px_50px_rgba(120,90,60,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(120deg,#fb7185,#fdba74)] text-white shadow-lg">
            <Users className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-stone-800">Employee Login</h2>
          <p className="mt-1 text-sm text-stone-400">Welcome back to Equinox POS</p>
        </div>
        
        {error && <div className="mb-4 rounded-xl bg-rose-50 p-3 text-center text-sm font-medium text-rose-600">{error}</div>}

        <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2">Demo Credentials</p>
          <div className="flex justify-center gap-4 text-sm font-medium text-indigo-900">
            <div><span className="text-indigo-400 font-normal">ID:</span> admin <br/><span className="text-indigo-400 font-normal">Pass:</span> equinox@123</div>
            <div className="w-px bg-indigo-200" />
            <div><span className="text-indigo-400 font-normal">ID:</span> USR-8888 <br/><span className="text-indigo-400 font-normal">Pass:</span> demo123</div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Employee ID</span>
            <input
              required
              value={id}
              onChange={e => setId(e.target.value)}
              className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm text-stone-700 shadow-[inset_0_1px_2px_rgba(120,90,60,0.06)] outline-none transition-all placeholder:text-stone-300 focus:border-indigo-200 focus:ring-4 focus:ring-indigo-100/70"
              placeholder="Write your employee id"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Password</span>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 pr-12 text-sm text-stone-700 shadow-[inset_0_1px_2px_rgba(120,90,60,0.06)] outline-none transition-all placeholder:text-stone-300 focus:border-indigo-200 focus:ring-4 focus:ring-indigo-100/70"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full justify-center gap-2 rounded-2xl bg-stone-800 px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-stone-700 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log In"}
          </button>
      </form>
      </div>
      <div className="mt-6 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">Made By</p>
        <p className="mt-0.5 font-serif text-sm font-semibold tracking-wide text-stone-600">Krish Raj</p>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-400">Gen AI Engineer</p>
      </div>
    </div>
  )
}
