"use client"

import { useState } from "react"
import { ShoppingBag, Loader2, Eye, EyeOff, ShieldCheck, User, Phone, Mail, MapPin, Lock, ArrowRight, CheckCircle2 } from "lucide-react"

export function SupermarketAuth({ onSuccess }: { onSuccess: (user: any) => void }) {
  const [mode, setMode] = useState<"signin" | "signup" | "admin">("signin")
  
  // Sign in state
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  // Sign up state
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    address: ""
  })
  
  // Admin state
  const [adminId, setAdminId] = useState("")
  const [adminPassword, setAdminPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccessMsg("")

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      })
      const data = await res.json()

      if (data.success) {
        onSuccess(data.user)
      } else {
        setError(data.error || "Invalid credentials")
      }
    } catch (err) {
      setError("An error occurred during sign in. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccessMsg("")

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm)
      })
      const data = await res.json()

      if (data.success) {
        setSuccessMsg("Account created! Logging you in...")
        setTimeout(() => {
          onSuccess(data.user)
        }, 800)
      } else {
        setError(data.error || "Failed to create account")
      }
    } catch (err) {
      setError("An error occurred during registration. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: adminId, password: adminPassword })
      })
      const data = await res.json()

      if (data.success) {
        onSuccess(data.user)
      } else {
        setError(data.error || "Invalid admin credentials")
      }
    } catch (err) {
      setError("Admin authentication failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#FAF9F6] p-4 text-stone-800">
      {/* Background Glows */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.12),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.12),transparent_70%)] blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/80 bg-white/80 p-8 shadow-[0_24px_60px_rgba(40,30,20,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl transition-all">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-400 text-white shadow-[0_12px_24px_-8px_rgba(16,185,129,0.5)]">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-900">
            Equinox Supermarket
          </h1>
          <p className="mt-1 text-xs font-medium text-stone-500">
            Fresh Groceries, Household &amp; Daily Essentials Delivered
          </p>
        </div>

        {/* Tab Selection */}
        <div className="mb-6 flex rounded-2xl bg-stone-100/80 p-1 text-xs font-semibold text-stone-600">
          <button
            type="button"
            onClick={() => { setMode("signin"); setError(""); setSuccessMsg(""); }}
            className={`flex-1 rounded-xl py-2.5 transition-all ${mode === "signin" ? "bg-white text-emerald-800 shadow-sm" : "hover:text-stone-900"}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode("signup"); setError(""); setSuccessMsg(""); }}
            className={`flex-1 rounded-xl py-2.5 transition-all ${mode === "signup" ? "bg-white text-emerald-800 shadow-sm" : "hover:text-stone-900"}`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => { setMode("admin"); setError(""); setSuccessMsg(""); }}
            className={`flex-1 rounded-xl py-2.5 transition-all ${mode === "admin" ? "bg-stone-900 text-white shadow-sm" : "hover:text-stone-900"}`}
          >
            Admin Portal
          </button>
        </div>

        {/* Demo Credentials Box */}
        {mode === "signin" && (
          <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200/60">
              <span className="font-semibold uppercase tracking-wider text-emerald-800">Demo User Account</span>
              <button
                type="button"
                onClick={() => {
                  setIdentifier("user@equinox.com")
                  setPassword("user123")
                }}
                className="font-semibold text-emerald-700 hover:text-emerald-900 underline"
              >
                Auto Fill
              </button>
            </div>
            <div className="mt-2 flex justify-between gap-2 text-stone-600">
              <div><span className="font-medium text-stone-400">Email:</span> user@equinox.com</div>
              <div><span className="font-medium text-stone-400">Pass:</span> user123</div>
            </div>
          </div>
        )}

        {mode === "admin" && (
          <div className="mb-6 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-3.5 text-xs text-amber-900">
            <div className="flex items-center justify-between pb-1.5 border-b border-amber-200">
              <span className="font-semibold uppercase tracking-wider text-amber-800">Store Admin Login</span>
              <button
                type="button"
                onClick={() => {
                  setAdminId("admin")
                  setAdminPassword("equinox@123")
                }}
                className="font-semibold text-amber-800 hover:text-amber-950 underline"
              >
                Auto Fill
              </button>
            </div>
            <div className="mt-2 flex justify-between gap-2 text-amber-800">
              <div><span className="font-medium text-amber-600/90">ID:</span> admin</div>
              <div><span className="font-medium text-amber-600/90">Pass:</span> equinox@123</div>
            </div>
          </div>
        )}

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-center text-xs font-medium text-rose-700">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {successMsg}
          </div>
        )}

        {/* Form: Sign In */}
        {mode === "signin" && (
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                Email or Mobile Number
              </span>
              <div className="relative">
                <input
                  required
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-2xl border border-white/80 bg-white/90 px-4 py-3 pl-11 text-sm text-stone-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-stone-300 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100/70"
                  placeholder="e.g. user@equinox.com or 9876543210"
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                Password
              </span>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/80 bg-white/90 px-4 py-3 pl-11 pr-11 text-sm text-stone-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-stone-300 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100/70"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In & Shop"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        )}

        {/* Form: Sign Up */}
        {mode === "signup" && (
          <form onSubmit={handleSignUp} className="flex flex-col gap-3.5">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Full Name</span>
              <div className="relative">
                <input
                  required
                  type="text"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  className="w-full rounded-2xl border border-white/80 bg-white/90 px-4 py-2.5 pl-10 text-sm text-stone-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100/70"
                  placeholder="Your Full Name"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              </div>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Email Address</span>
                <div className="relative">
                  <input
                    required
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    className="w-full rounded-2xl border border-white/80 bg-white/90 px-3.5 py-2.5 pl-9 text-xs text-stone-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100/70"
                    placeholder="name@email.com"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                </div>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Mobile No.</span>
                <div className="relative">
                  <input
                    required
                    type="tel"
                    value={signupForm.mobile}
                    onChange={(e) => setSignupForm({ ...signupForm, mobile: e.target.value })}
                    className="w-full rounded-2xl border border-white/80 bg-white/90 px-3.5 py-2.5 pl-9 text-xs text-stone-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100/70"
                    placeholder="9876543210"
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                </div>
              </label>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Delivery Address</span>
              <div className="relative">
                <input
                  required
                  type="text"
                  value={signupForm.address}
                  onChange={(e) => setSignupForm({ ...signupForm, address: e.target.value })}
                  className="w-full rounded-2xl border border-white/80 bg-white/90 px-4 py-2.5 pl-10 text-sm text-stone-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100/70"
                  placeholder="Flat / Street, City, Pincode"
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              </div>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Set Password</span>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  className="w-full rounded-2xl border border-white/80 bg-white/90 px-4 py-2.5 pl-10 pr-10 text-sm text-stone-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100/70"
                  placeholder="Create a strong password"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Complete Registration"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        )}

        {/* Form: Admin Login */}
        {mode === "admin" && (
          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                Admin Username / ID
              </span>
              <div className="relative">
                <input
                  required
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full rounded-2xl border border-white/80 bg-white/90 px-4 py-3 pl-11 text-sm text-stone-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                  placeholder="admin"
                />
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                Master Security Key / Password
              </span>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/80 bg-white/90 px-4 py-3 pl-11 pr-11 text-sm text-stone-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 py-3.5 text-sm font-semibold text-white shadow-xl shadow-stone-900/20 transition-all hover:bg-stone-800 active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Access Admin Command Center"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 text-center text-xs text-stone-400">
        <p>Equinox Supermarket · Quick &amp; Safe Home Delivery</p>
      </div>
    </div>
  )
}
