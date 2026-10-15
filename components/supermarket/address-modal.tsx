"use client"

import { useState, useEffect } from "react"
import { MapPin, X, Check, Building, Sparkles } from "lucide-react"

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  currentAddress: string
  onSave: (newAddress: string) => Promise<void> | void
}

export function AddressModal({
  isOpen,
  onClose,
  currentAddress,
  onSave,
}: AddressModalProps) {
  const [address, setAddress] = useState(currentAddress || "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      setAddress(currentAddress || "")
      setError("")
      setSaving(false)
    }
  }, [isOpen, currentAddress])

  if (!isOpen) return null

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    setError("")

    try {
      await onSave(address.trim())
      onClose()
    } catch (err: any) {
      setError(err?.message || "Failed to update address. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const applyPreset = (preset: string) => {
    setAddress(preset)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-stone-100 flex flex-col gap-4 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute right-5 top-5 rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              {currentAddress ? "Change Delivery Address" : "Add Delivery Address"}
            </h2>
            <p className="text-xs text-stone-500">
              Your groceries will be delivered right to your doorstep
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Address Input Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
              Full Delivery Address <span className="text-emerald-700">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Room/Flat No., Hostel/Apartment, Street/Landmark, IIIT Nagpur, Waranga - 441108"
              className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 p-3.5 text-xs text-stone-800 placeholder-stone-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition resize-none leading-relaxed"
            />
          </div>

          {/* Quick Suggestions / Presets */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 mb-2">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Quick Presets</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset("IIIT Nagpur, waranga, Nagpur-441108")}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-1.5 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100/80 transition"
              >
                <Building className="h-3.5 w-3.5 text-emerald-700" />
                <span>IIIT Nagpur Campus (441108)</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset("Boy's Hostel, IIIT Nagpur, Waranga - 441108")}
                className="rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-[11px] font-medium text-stone-700 hover:bg-stone-100 transition"
              >
                Boy's Hostel
              </button>

              <button
                type="button"
                onClick={() => applyPreset("Girl's Hostel, IIIT Nagpur, Waranga - 441108")}
                className="rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-[11px] font-medium text-stone-700 hover:bg-stone-100 transition"
              >
                Girl's Hostel
              </button>

              {address && (
                <button
                  type="button"
                  onClick={() => setAddress("")}
                  className="rounded-xl border border-stone-200 px-2 py-1.5 text-[11px] font-medium text-stone-400 hover:text-stone-700 transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-3 flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !address.trim()}
              className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {saving ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Save Delivery Address</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
