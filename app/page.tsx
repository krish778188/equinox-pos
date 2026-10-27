"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { Sidebar, type NavKey } from "@/components/pos/sidebar"
import { SupermarketProductGrid } from "@/components/supermarket/supermarket-product-grid"
import { SupermarketCart, type CartItem } from "@/components/supermarket/supermarket-cart"
import { AdminPortal } from "@/components/pos/admin-portal"
import { SupermarketAuth } from "@/components/auth/supermarket-auth"
import { OrderHistoryModal } from "@/components/supermarket/order-history-modal"
import { AddressModal } from "@/components/supermarket/address-modal"
import { ProfileModal } from "@/components/supermarket/profile-modal"
import { WalletModal } from "@/components/supermarket/wallet-modal"
import { type Product, SUPERMARKET_CATEGORIES } from "@/lib/pos-data"
import { Moon, Sun, MapPin } from "lucide-react"

export default function Page() {
  const [active, setActive] = useState<NavKey>("shop")
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All Products")
  const [cart, setCart] = useState<CartItem[]>([])
  const [darkMode, setDarkMode] = useState(false)
  
  const [loggedInUser, setLoggedInUser] = useState<any>(null)
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [pendingReturnsCount, setPendingReturnsCount] = useState(0)
  const mainContentRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Scroll window/page to top
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior })
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0
    }
  }, [active])

  useEffect(() => {
    const saved = localStorage.getItem("supermarket_user") || localStorage.getItem("pos_user")
    if (saved) {
      try {
        const u = JSON.parse(saved)
        const addr = typeof u?.address === "string" ? u.address : ""
        if (u && u.email === "user@equinox.com" && (!addr || addr.includes("Bellandur") || addr.includes("Bengaluru"))) {
          u.address = "IIIT Nagpur, waranga, Nagpur-441108"
          localStorage.setItem("supermarket_user", JSON.stringify(u))
        } else if (u && addr && (addr.includes("Bellandur") || addr.includes("Bengaluru"))) {
          u.address = "IIIT Nagpur, waranga, Nagpur-441108"
          localStorage.setItem("supermarket_user", JSON.stringify(u))
        }
        setLoggedInUser(u)
      } catch (e) {}
    }
  }, [])

  const handleUpdateAddress = async (newAddress: string) => {
    if (!loggedInUser) return

    try {
      const res = await fetch("/api/user/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loggedInUser.email, address: newAddress })
      })
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to update address in database")
      }
    } catch (e) {
      console.warn("Could not save address to server, saving locally:", e)
    }

    const updated = { ...loggedInUser, address: newAddress }
    setLoggedInUser(updated)
    localStorage.setItem("supermarket_user", JSON.stringify(updated))
  }

  const handleLoginSuccess = (user: any) => {
    localStorage.setItem("supermarket_user", JSON.stringify(user))
    setLoggedInUser(user)
    if (user.role === "Admin" || user.role === "Store Manager") {
      setActive("settings")
    } else {
      setActive("shop")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("supermarket_user")
    localStorage.removeItem("pos_user")
    setLoggedInUser(null)
    setActive("shop")
    setCart([])
  }

  const refreshProducts = () => {
    fetch(`/api/products?t=${Date.now()}`, { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products)
        }
      })
      .catch(err => console.warn("Could not fetch products:", err))
  }

  useEffect(() => {
    refreshProducts()
    const interval = setInterval(refreshProducts, 3000)
    window.addEventListener("focus", refreshProducts)
    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", refreshProducts)
    }
  }, [])

  useEffect(() => {
    if (loggedInUser) {
      const isAdmin = loggedInUser.role === "Admin" || loggedInUser.role === "Store Manager"
      if (!isAdmin && active !== "shop") {
        setActive("shop")
      } else if (isAdmin && active === "shop") {
        setActive("settings")
      }

      if (isAdmin) {
        // Fetch returns once on load (strictly manual refresh in Admin Portal per instructions)
        fetch(`/api/returns?t=${Date.now()}`, { cache: "no-store" })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.requests) {
              const pending = (data.requests as any[]).filter(r => r.status === "Pending").length
              setPendingReturnsCount(pending)
            }
          })
          .catch(console.error)
      } else if (loggedInUser?.email) {
        // Fetch wallet balance for user
        fetch(`/api/user/wallet?email=${encodeURIComponent(loggedInUser.email)}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && typeof data.wallet_balance === "number") {
              setWalletBalance(data.wallet_balance)
            }
          })
          .catch(console.error)
      }
    }
  }, [loggedInUser])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (products || []).filter((p) => {
      if (!p) return false
      const cat = (p.category || "").toLowerCase()
      const matchesCategory =
        selectedCategory === "All Products" ||
        cat === selectedCategory.toLowerCase() ||
        (selectedCategory.toLowerCase().includes("vegetable") && cat.includes("vegetable"))

      const matchesSearch =
        !q ||
        (p.name || "").toLowerCase().includes(q) ||
        cat.includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q))

      return matchesCategory && matchesSearch
    })
  }, [query, selectedCategory, products])

  function addToCart(product: Product, quantity = 1) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        if (existing.quantity + quantity > product.stock) return prev
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      }
      return [...prev, { ...product, quantity }]
    })
  }

  function increment(id: string) {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id && item.quantity < item.stock) {
          return { ...item, quantity: item.quantity + 1 }
        }
        return item
      })
    )
  }

  function decrement(id: string) {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    )
  }

  function setQuantity(product: Product, quantity: number) {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.id !== product.id)
      }
      const clamped = Math.min(quantity, product.stock)
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: clamped } : item
        )
      }
      return [...prev, { ...product, quantity: clamped }]
    })
  }

  function remove(id: string) {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  if (!loggedInUser) {
    return <SupermarketAuth onSuccess={handleLoginSuccess} />
  }

  const getHeaderInfo = () => {
    switch (active) {
      case "returns":
        return {
          title: "Customer Return & Refund Requests",
          subtitle: "Inspect return items and authorize customer refunds directly"
        }
      case "stock":
        return {
          title: "Inventory & Catalog Management",
          subtitle: "Add new products, specify batch numbers, expiry dates, and replenish unit quantities"
        }
      case "demand":
        return {
          title: "Demand ML & Velocity Forecasting",
          subtitle: "Real-time AI restocking insights, reorder alerts, and sales volume velocity"
        }
      case "sales":
        return {
          title: "Orders & Invoices Log",
          subtitle: "Complete transaction history, bill downloads, and order fulfillment tracking"
        }
      case "settings":
        return {
          title: "Supermarket Configuration",
          subtitle: "Store defaults, GST configurations, invoice formatting, and system health"
        }
      default:
        return {
          title: "Supermarket Store",
          subtitle: "Farm-fresh groceries, household essentials & daily staples delivered to your doorstep"
        }
    }
  }

  const headerInfo = getHeaderInfo()
  const isAdmin = loggedInUser.role === "Admin" || loggedInUser.role === "Store Manager"

  return (
    <div className={`relative flex flex-col lg:flex-row min-h-screen lg:h-screen gap-4 lg:overflow-hidden bg-[#FAF9F6] p-4 text-stone-800 transition-all duration-300 ${darkMode ? 'invert hue-rotate-180' : ''}`}>
      {/* Decorative ambient gradients */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.12),transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 right-1/3 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.10),transparent_70%)] blur-3xl"
      />

      {/* Left Sidebar */}
      <Sidebar
        active={active}
        onSelect={setActive}
        user={loggedInUser}
        pendingReturnsCount={pendingReturnsCount}
        onOpenOrderHistory={() => setIsOrderHistoryOpen(true)}
        onOpenWallet={() => setIsWalletModalOpen(true)}
        walletBalance={walletBalance}
        onLogout={handleLogout}
        onChangeAddress={() => setIsAddressModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main ref={mainContentRef} className="relative z-10 flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="flex shrink-0 items-center justify-between px-2 pb-4 pt-1 border-b border-stone-200/60 mb-2">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold tracking-tight text-stone-900">
              {headerInfo.title}
            </h1>
            <p className="mt-0.5 text-xs text-stone-500 font-medium">
              {headerInfo.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle Theme"
              className="rounded-full bg-white/80 p-2 text-stone-600 shadow-xs hover:bg-white transition"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Status Badge */}
            {isAdmin ? (
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-stone-700 shadow-xs backdrop-blur-xl">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                <span>Admin Console Live</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-xs backdrop-blur-xl">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>Express 15-Min Delivery Live</span>
              </div>
            )}

            <div className="text-xs font-semibold text-stone-700 hidden md:block">
              Hi, <span className="text-stone-900">{(loggedInUser?.name || "Shopper").split(" ")[0]}</span>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs font-bold text-rose-500 hover:text-rose-700 transition"
            >
              Logout
            </button>
          </div>
        </header>

        {/* View Switcher: Shop vs Admin Sections */}
        {active === "shop" ? (
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row gap-4">
            {/* Products Grid with Categories & Search */}
            <section className="flex min-w-0 flex-1 flex-col">
              <SupermarketProductGrid
                products={filtered}
                query={query}
                onQueryChange={setQuery}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                cart={cart}
                onAddToCart={addToCart}
                onIncrement={increment}
                onDecrement={decrement}
                onSetQuantity={setQuantity}
              />
            </section>

            {/* Right Basket / Cart */}
            <SupermarketCart
              items={cart}
              onIncrement={increment}
              onDecrement={decrement}
              onRemove={remove}
              onClear={() => setCart([])}
              user={loggedInUser}
              onUpdateUser={setLoggedInUser}
              onChangeAddress={() => setIsAddressModalOpen(true)}
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <AdminPortal
              activeTab={active}
              onSelectTab={setActive}
              onPendingCountChange={setPendingReturnsCount}
              loggedInUser={loggedInUser}
            />
          </div>
        )}
      </main>

      {/* User Order History Modal with 7-Day Return & Bill Download */}
      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        user={loggedInUser}
      />

      {/* Change / Add Delivery Address Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        currentAddress={loggedInUser?.address || ""}
        onSave={handleUpdateAddress}
      />

      {/* Profile & Password Management Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={loggedInUser}
        onUpdateUser={(updated) => setLoggedInUser(updated)}
      />

      {/* Equinox Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        user={loggedInUser}
        onBalanceUpdate={(bal) => setWalletBalance(bal)}
      />
    </div>
  )
}
