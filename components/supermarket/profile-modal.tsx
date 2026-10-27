"use client"

import { useState, useEffect } from "react"
import { X, User, Phone, MapPin, Lock, Check, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
  onUpdateUser: (updatedUser: any) => void
}

export function ProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}: ProfileModalProps) {
  const [name, setName] = useState("")
  const [mobile, setMobile] = useState("")
  const [address, setAddress] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || "")
      setMobile(user.mobile || "")
      setAddress(user.address || "")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setError("")
      setSuccess("")
      setSaving(false)
    }
  }, [isOpen, user])

  if (!isOpen || !user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (newPassword) {
      if (!currentPassword) {
        setError("Please enter your current password to set a new password.")
        return
      }
      if (newPassword.length < 4) {
        setError("New password must be at least 4 characters.")
        return
      }
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match.")
        return
      }
    }

    setSaving(true)

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: name.trim(),
          mobile: mobile.trim(),
          address: address.trim(),
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to update profile.")
      }

      const updated = {
        ...user,
        name: data.user.name,
        mobile: data.user.mobile,
        address: data.user.address,
      }

      onUpdateUser(updated)
      localStorage.setItem("supermarket_user", JSON.stringify(updated))
      setSuccess("Profile updated successfully!")

      setTimeout(() => {
        onClose()
      }, 900)
    } catch (err: any) {
      setError(err?.message || "Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-stone-100 flex flex-col gap-4 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-lg font-bold text-white shadow-md shadow-emerald-700/20">
            {name ? name.substring(0, 2).toUpperCase() : "US"}
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900">Manage Account & Profile</h2>
            <p className="text-xs text-stone-500">Update personal info and change your password</p>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-semibold text-emerald-800">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Account Details Section */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">Personal Details</p>

            {/* Email */}
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-stone-600">Email Address</span>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full rounded-2xl border border-stone-200 bg-stone-100 px-4 py-2.5 text-sm text-stone-500 cursor-not-allowed"
              />
            </label>

            {/* Full Name */}
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-stone-600">Full Name</span>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Demo Shopper"
                  className="w-full rounded-2xl border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-sm text-stone-800 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                />
              </div>
            </label>

            {/* Phone Number */}
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-stone-600">Mobile Number</span>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-2xl border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-sm text-stone-800 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                />
              </div>
            </label>

            {/* Delivery Address */}
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-stone-600">Delivery Address</span>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. IIIT Nagpur, waranga, Nagpur-441108"
                  className="w-full rounded-2xl border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-sm text-stone-800 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                />
              </div>
            </label>
          </div>

          {/* Change Password Section */}
          <div className="mt-2 pt-3 border-t border-stone-100 flex flex-col gap-3">
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-stone-500" />
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">Change Password</p>
            </div>

            {/* Current Password */}
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-stone-600">Current Password</span>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {/* New Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-stone-600">New Password</span>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 4 characters"
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-stone-600">Confirm New Password</span>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-2xl border border-stone-200 bg-white px-5 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-emerald-800 active:scale-95 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
