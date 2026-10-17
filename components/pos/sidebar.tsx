"use client"

import {
  ShoppingBag,
  RotateCcw,
  Package,
  Layers,
  ReceiptText,
  Settings,
  History,
  Store,
  LogOut,
  ShieldCheck,
  MapPin
} from "lucide-react"

export type NavKey = "shop" | "returns" | "stock" | "demand" | "sales" | "settings"

export function Sidebar({
  active,
  onSelect,
  user,
  pendingReturnsCount = 0,
  onOpenOrderHistory,
  onLogout,
  onChangeAddress,
  onOpenProfile
}: {
  active: NavKey
  onSelect: (key: NavKey) => void
  user: any
  pendingReturnsCount?: number
  onOpenOrderHistory: () => void
  onLogout: () => void
  onChangeAddress?: () => void
  onOpenProfile?: () => void
}) {
  const isAdmin = user?.role === "Admin" || user?.role === "Store Manager"

  const adminNavItems = [
    { key: "settings" as const, label: "Store Settings", icon: Settings },
    { key: "returns" as const, label: "Return Requests", icon: RotateCcw, hasBadge: true },
    { key: "stock" as const, label: "Stock Management", icon: Package },
    { key: "demand" as const, label: "Demand ML", icon: Layers },
    { key: "sales" as const, label: "Orders & Invoices", icon: ReceiptText },
  ]

  return (
    <aside className="flex w-full lg:w-64 shrink-0 flex-col rounded-3xl border border-white/80 bg-white/80 p-4 shadow-[0_20px_50px_rgba(40,30,20,0.06)] backdrop-blur-2xl justify-between">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 border-b border-stone-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-lg font-bold text-white shadow-md shadow-emerald-700/20">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="font-serif text-[17px] font-bold tracking-tight text-stone-900">Equinox</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              {isAdmin ? "Admin Center" : "Supermarket"}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-col gap-1.5">
          {/* Storefront only for regular customers */}
          {!isAdmin && (
            <>
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                Storefront
              </p>

              {/* Shop Catalog */}
              <button
                type="button"
                onClick={() => onSelect("shop")}
                className={`group flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                  active === "shop"
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/25 ring-1 ring-emerald-600"
                    : "text-stone-600 hover:bg-stone-100/80 hover:text-stone-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                      active === "shop"
                        ? "bg-white/20 text-white"
                        : "bg-stone-100 text-stone-500 group-hover:bg-white"
                    }`}
                  >
                    <Store className="h-4 w-4" />
                  </span>
                  <span>All Products</span>
                </div>
              </button>
            </>
          )}

          {/* Admin Sections in Sidebar */}
          {isAdmin && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between px-3 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                  Management
                </span>
                <span className="rounded bg-stone-900 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  ADMIN
                </span>
              </div>

              {adminNavItems.map((item) => {
                const Icon = item.icon
                const isSelected = active === item.key

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onSelect(item.key)}
                    className={`group flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                      isSelected
                        ? "bg-stone-900 text-white shadow-md shadow-stone-900/25"
                        : "text-stone-600 hover:bg-stone-100/80 hover:text-stone-900"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-stone-100 text-stone-500 group-hover:bg-white"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.hasBadge && pendingReturnsCount > 0 && (
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm shrink-0">
                        {pendingReturnsCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Customer Order History - Only shown for customers */}
          {!isAdmin && (
            <div className="mt-3 pt-3 border-t border-stone-100">
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                Customer Account
              </p>
              <button
                type="button"
                onClick={onOpenOrderHistory}
                className="group mt-1 flex w-full items-center justify-between rounded-2xl border border-stone-200/80 bg-stone-50/80 px-3.5 py-2.5 text-sm font-semibold text-stone-700 transition-all hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-900 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-stone-600 shadow-xs group-hover:text-emerald-700">
                    <History className="h-4 w-4" />
                  </span>
                  <span>Order History</span>
                </div>
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* User Profile Card (Bottom - Click to Edit Profile & Change Password) */}
      <div className="mt-6 pt-3 border-t border-stone-100">
        <button
          type="button"
          onClick={onOpenProfile}
          title="Click to manage profile & change password"
          className="group flex w-full text-left items-center gap-2.5 rounded-2xl border border-stone-200/70 bg-stone-50/70 p-2.5 transition-all hover:bg-emerald-50/80 hover:border-emerald-200 hover:shadow-xs active:scale-[0.98] cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-xs font-bold text-white shrink-0 group-hover:bg-emerald-800 transition">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="truncate text-xs font-bold text-stone-900 group-hover:text-emerald-900 transition">{user?.name || "Shopper"}</p>
              <span className="text-[10px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition shrink-0 ml-1">Edit ⚙</span>
            </div>
            <p className="truncate text-[10px] text-stone-400 capitalize">{user?.role === "Admin" ? "Store Admin" : "Verified Customer"}</p>
            {user?.role !== "Admin" && user?.address && (
              <p className="mt-0.5 truncate text-[10px] font-medium text-emerald-700 flex items-center gap-1 min-w-0" title={user.address}>
                <MapPin className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{user.address}</span>
              </p>
            )}
          </div>
        </button>
      </div>
    </aside>
  )
}
