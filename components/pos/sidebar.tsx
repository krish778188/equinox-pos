"use client"

import { CreditCard, Boxes, LineChart, ShieldCheck, Settings, LifeBuoy } from "lucide-react"

export type NavKey = "checkout" | "stock" | "demand" | "admin"

const navItems: { key: NavKey; label: string; icon: typeof CreditCard, roles: string[] }[] = [
  { key: "checkout", label: "Checkout", icon: CreditCard, roles: ["Cashier", "Store Manager", "Inventory Clerk"] },
  { key: "admin", label: "Admin Portal", icon: ShieldCheck, roles: ["Admin", "Store Manager"] },
]

export function Sidebar({
  active,
  onSelect,
  user
}: {
  active: NavKey
  onSelect: (key: NavKey) => void
  user: any
}) {
  const visibleNavs = navItems.filter(item => item.roles.includes(user?.role || "Cashier"))

  return (
    <aside className="flex w-full lg:w-64 shrink-0 flex-col rounded-3xl border border-white/60 bg-white/70 p-4 shadow-[0_20px_50px_rgba(120,90,60,0.06)] backdrop-blur-xl">
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,#fb7185_0%,#fdba74_50%,#818cf8_100%)] text-lg font-semibold text-white shadow-[0_8px_20px_-6px_rgba(129,140,248,0.6),inset_0_1px_0_rgba(255,255,255,0.6)]">
          <span className="font-serif">E</span>
        </div>
        <div className="leading-tight">
          <p className="font-serif text-[17px] font-semibold tracking-tight text-stone-800">Equinox</p>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-stone-400">POS</p>
        </div>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1.5">
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
          Workspace
        </p>
        {visibleNavs.map(({ key, label, icon: Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              aria-current={isActive ? "page" : undefined}
              className={[
                "group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all duration-300 ease-out active:scale-[0.97]",
                isActive
                  ? "bg-white text-stone-900 shadow-[0_10px_24px_-10px_rgba(120,90,60,0.35),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-white/80"
                  : "text-stone-500 hover:bg-white/60 hover:text-stone-800",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
                  isActive
                    ? "bg-[linear-gradient(140deg,#fb7185_0%,#fdba74_55%,#818cf8_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                    : "bg-stone-100/80 text-stone-500 group-hover:bg-stone-100",
                ].join(" ")}
              >
                <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
              </span>
              {label}
            </button>
          )
        })}
      </nav>

      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/60 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(140deg,#fecdd3,#fed7aa,#c7d2fe)] text-xs font-semibold text-stone-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
          {user ? user.name.split(" ").map((n: string) => n[0]).join("").substring(0,2).toUpperCase() : "..."}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-stone-800">{user ? user.name : "..."}</p>
          <p className="truncate text-xs text-stone-400">{user ? user.role : "..."}</p>
        </div>
      </div>
    </aside>
  )
}
