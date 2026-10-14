"use client"

import { useMemo, useState, useEffect } from "react"
import { Sidebar, type NavKey } from "@/components/pos/sidebar"
import { ProductGrid } from "@/components/pos/product-grid"
import { CurrentBill, type CartItem } from "@/components/pos/current-bill"
import { AdminPortal } from "@/components/pos/admin-portal"
import { EmployeeLogin } from "@/components/pos/employee-login"
import { type Product } from "@/lib/pos-data"

const pageTitles: Record<NavKey, { title: string; subtitle: string }> = {
  checkout: { title: "Checkout", subtitle: "Ring up items and process a sale" },
  stock: { title: "Stock Management", subtitle: "Track inventory levels across your catalog" },
  demand: { title: "Demand ML", subtitle: "Forecasts and reorder recommendations" },
  admin: { title: "Admin Portal", subtitle: "Configure your system, team, and connections" },
}

export default function Page() {
  const [active, setActive] = useState<NavKey>("checkout")
  const [query, setQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [darkMode, setDarkMode] = useState(false)
  
  const [loggedInUser, setLoggedInUser] = useState<any>(null)

  useEffect(() => {
    const saved = localStorage.getItem("pos_user")
    if (saved) {
      setLoggedInUser(JSON.parse(saved))
    }
  }, [])

  const handleLoginSuccess = (user: any) => {
    localStorage.setItem("pos_user", JSON.stringify(user))
    setLoggedInUser(user)
    if (user.role === "Admin" || user.role === "Store Manager") {
      setActive("admin")
    } else {
      setActive("checkout")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("pos_user")
    setLoggedInUser(null)
    setActive("checkout")
  }

  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    if (loggedInUser) {
      if ((loggedInUser.role === "Admin" || loggedInUser.role === "Store Manager") && active !== "admin") {
        setActive("admin")
      } else if (loggedInUser.role !== "Admin" && loggedInUser.role !== "Store Manager" && active === "admin") {
        setActive("checkout")
      }
      fetch("/api/products")
        .then(res => res.json())
        .then(data => {
          if (data.products) setProducts(data.products)
        })
    }
  }, [loggedInUser])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
    )
  }, [query, products])

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) return prev
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  function increment(id: string) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity < item.stock
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    )
  }

  function decrement(id: string) {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  function remove(id: string) {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  if (!loggedInUser) {
    return <EmployeeLogin onSuccess={handleLoginSuccess} />
  }

  const heading = pageTitles[active] || pageTitles.admin

  return (
    <div className={`relative flex flex-col lg:flex-row min-h-screen lg:h-screen gap-4 lg:overflow-hidden bg-[#FAF9F6] p-4 text-stone-800 transition-all duration-500 ${darkMode ? 'invert hue-rotate-180' : ''}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(251,113,133,0.14),transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 right-1/3 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.12),transparent_70%)] blur-3xl"
      />

      <Sidebar active={active} onSelect={setActive} user={loggedInUser} />

      <main className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between px-2 pb-5 pt-2">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-800">{heading.title}</h1>
            <p className="mt-0.5 text-sm text-stone-400">{heading.subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="rounded-full bg-white/70 p-2 text-stone-600 shadow hover:bg-white transition-all">
              {darkMode ? "☀️" : "🌙"}
            </button>
            <div className="text-sm font-medium text-stone-600">
              Logged in as <span className="font-semibold text-stone-800">{loggedInUser.name}</span>
            </div>
            <button onClick={handleLogout} className="text-xs font-semibold text-rose-500 hover:text-rose-700 underline">Logout</button>
            <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-medium text-stone-500 shadow-[0_10px_30px_rgba(120,90,60,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Register open
            </div>
          </div>
        </header>

        {active === "checkout" ? (
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row gap-4">
            <section className="flex min-w-0 flex-1 flex-col">
              <ProductGrid
                products={filtered}
                query={query}
                onQueryChange={setQuery}
                onAdd={addToCart}
              />
            </section>
            <CurrentBill
              items={cart}
              onIncrement={increment}
              onDecrement={decrement}
              onRemove={remove}
              onClear={() => setCart([])}
            />
          </div>
        ) : active === "admin" ? (
          loggedInUser.role === "Admin" || loggedInUser.role === "Store Manager" ? (
            <AdminPortal loggedInUser={loggedInUser} />
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <div className="max-w-sm rounded-3xl border border-rose-100 bg-rose-50 p-12 text-center shadow-[0_20px_50px_rgba(225,29,72,0.08)] backdrop-blur-xl">
                <h2 className="font-serif text-lg font-semibold text-rose-800">Access Denied</h2>
                <p className="mt-2 text-sm text-rose-500">
                  You do not have administrative privileges to view this portal.
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div className="max-w-sm rounded-3xl border border-white/70 bg-white/70 p-12 text-center shadow-[0_20px_50px_rgba(120,90,60,0.08)] backdrop-blur-xl">
              <h2 className="font-serif text-lg font-semibold text-stone-800">{heading.title}</h2>
              <p className="mt-2 text-sm text-stone-400">
                This view is a placeholder. The Checkout screen contains the full POS layout.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
