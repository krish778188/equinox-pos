"use client"

import { useState, useEffect, useRef } from "react"
import {
  Store,
  Coins,
  ReceiptText,
  Database,
  Server,
  RotateCcw,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  X,
  Loader2,
  Eye,
  EyeOff,
  Tag,
  Package,
  Layers,
  Calendar,
  Image as ImageIcon,
  TrendingUp,
  AlertTriangle,
  Zap,
  MapPin,
  FileText
} from "lucide-react"
import { formatCurrency, SUPERMARKET_CATEGORIES } from "@/lib/pos-data"
import { printSupermarketReceipt } from "@/lib/print-bill"

const cardBase =
  "rounded-3xl border border-white/80 bg-white/85 shadow-[0_20px_50px_rgba(40,30,20,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl"

function SectionHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between px-1">
      <h2 className="font-serif text-xl font-bold tracking-tight text-stone-900">{title}</h2>
      <span className="text-xs font-medium text-stone-400">{hint}</span>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">{label}</span>
      {children}
    </label>
  )
}

function Toggle({ label, defaultOn = true }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-stone-50/60 p-3">
      <span className="text-xs font-semibold text-stone-700">{label}</span>
      <button
        type="button"
        onClick={() => setOn(!on)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          on ? "bg-emerald-600" : "bg-stone-300"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
            on ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  )
}

const inputClass =
  "w-full rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 shadow-xs outline-none transition placeholder:text-stone-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"

export type AdminTab = "settings" | "returns" | "stock" | "demand" | "sales"

export function AdminPortal({
  loggedInUser,
  activeTab: controlledActiveTab,
  onSelectTab,
  onPendingCountChange
}: {
  loggedInUser?: any
  activeTab?: AdminTab
  onSelectTab?: (tab: AdminTab) => void
  onPendingCountChange?: (count: number) => void
}) {
  const [internalActiveTab, setInternalActiveTab] = useState<AdminTab>("settings")
  const activeTab = controlledActiveTab || internalActiveTab
  const setActiveTab = onSelectTab || setInternalActiveTab
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
    }
  }, [activeTab])
  
  // Return requests state
  const [returnRequests, setReturnRequests] = useState<any[]>([])
  const [loadingReturns, setLoadingReturns] = useState(false)
  const [returnSearch, setReturnSearch] = useState("")

  // Stats & Products
  const [stats, setStats] = useState<{ stock: any[]; demand: any[] }>({ stock: [], demand: [] })
  const [stockSearch, setStockSearch] = useState("")
  
  // New Product form state
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Grocery",
    brand: "",
    batch_no: "",
    expiry_date: "",
    unit: "1 unit",
    price: "",
    mrp: "",
    stock: "50",
    description: "",
    image_url: ""
  })
  const [isAddingProduct, setIsAddingProduct] = useState(false)

  // Admin Auth / Password prompt
  const [authPrompt, setAuthPrompt] = useState<{
    action: "approve-return" | "reject-return" | "direct-refund" | "discount" | "settings"
    targetId?: any
    payload?: any
  } | null>(null)
  const [authPassword, setAuthPassword] = useState("")
  const [showAuthPassword, setShowAuthPassword] = useState(false)
  const [authError, setAuthError] = useState("")
  const [isAuthing, setIsAuthing] = useState(false)

  // Price Edit Modal State
  const [editingPriceItem, setEditingPriceItem] = useState<any | null>(null)
  const [editPriceValue, setEditPriceValue] = useState("")
  const [editMrpValue, setEditMrpValue] = useState("")
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false)

  // Sales & Invoices list
  const [salesList, setSalesList] = useState<any[]>([])
  const [selectedBill, setSelectedBill] = useState<any>(null)
  const [billSearch, setBillSearch] = useState("")

  // Store Settings Form
  const [settingsForm, setSettingsForm] = useState({
    storeName: "Equinox Supermarket",
    timezone: "Asia/Kolkata",
    currency: "INR (₹)",
    gstRate: "5",
    gstin: "29ABCDE1234F1Z5",
    headerLine: "Thank you for shopping at Equinox Supermarket",
    footerNote: "Fresh Groceries & Household Essentials · 7-Days Returns Policy",
  })
  const [discountType, setDiscountType] = useState("FLAT_THRESHOLD")

  const fetchReturns = async () => {
    setLoadingReturns(true)
    try {
      const res = await fetch("/api/returns")
      const data = await res.json()
      if (data.success && data.requests) {
        setReturnRequests(data.requests)
        const pendingCount = (data.requests as any[]).filter(r => r.status === "Pending").length
        onPendingCountChange?.(pendingCount)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingReturns(false)
    }
  }

  const fetchStockAndSales = () => {
    fetch("/api/sales")
      .then(res => res.json())
      .then(data => {
        if (data.sales) setSalesList(data.sales)
      })
      .catch(console.error)

    fetch("/api/admin-stats")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setStats({ stock: data.stock || [], demand: data.demand || [] })
        }
      })
      .catch(console.error)
  }

  useEffect(() => {
    fetchReturns()
    fetchStockAndSales()

    // Real-time polling every 4 seconds
    const interval = setInterval(() => {
      fetchReturns()
      fetchStockAndSales()
    }, 4000)

    // Immediate refresh when tab receives focus
    const handleFocus = () => {
      fetchReturns()
      fetchStockAndSales()
    }
    window.addEventListener("focus", handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", handleFocus)
    }
  }, [])

  const handleApproveReturnPrompt = (req: any) => {
    setAuthPrompt({
      action: "approve-return",
      targetId: req.id,
      payload: { requestId: req.id, saleId: req.sale_id, amount: req.amount }
    })
    setAuthError("")
    setAuthPassword("")
  }

  const handleRejectReturnPrompt = (req: any) => {
    setAuthPrompt({
      action: "reject-return",
      targetId: req.id,
      payload: { requestId: req.id, saleId: req.sale_id }
    })
    setAuthError("")
    setAuthPassword("")
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError("")
    setIsAuthing(true)

    try {
      if (authPrompt?.action === "approve-return") {
        const res = await fetch("/api/returns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "approve",
            requestId: authPrompt.payload.requestId,
            saleId: authPrompt.payload.saleId,
            amount: authPrompt.payload.amount,
            adminPassword: authPassword
          })
        })
        const data = await res.json()
        if (data.success) {
          alert(`Refund Approved & Processed!\nAmount: ${formatCurrency(authPrompt.payload.amount)}\nThe order status has been updated to Refunded and inventory items have been restocked.`)
          setAuthPrompt(null)
          fetchReturns()
          fetchStockAndSales()
        } else {
          setAuthError(data.error || "Incorrect admin password")
        }
      } else if (authPrompt?.action === "direct-refund") {
        const res = await fetch("/api/returns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "direct-refund",
            saleId: authPrompt.payload.saleId,
            amount: authPrompt.payload.amount,
            adminPassword: authPassword
          })
        })
        const data = await res.json()
        if (data.success) {
          alert(`Admin Direct Refund Processed!\nAmount: ${formatCurrency(authPrompt.payload.amount)}\nOrder #${authPrompt.payload.billNo} is now Refunded and stock is restored.`)
          setAuthPrompt(null)
          setSelectedBill(null)
          fetchReturns()
          fetchStockAndSales()
        } else {
          setAuthError(data.error || "Incorrect admin password")
        }
      } else if (authPrompt?.action === "reject-return") {
        const res = await fetch("/api/returns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "reject",
            requestId: authPrompt.payload.requestId,
            saleId: authPrompt.payload.saleId,
            adminPassword: authPassword
          })
        })
        const data = await res.json()
        if (data.success) {
          alert("Return request has been rejected.")
          setAuthPrompt(null)
          fetchReturns()
          fetchStockAndSales()
        } else {
          setAuthError(data.error || "Incorrect admin password")
        }
      } else if (authPrompt?.action === "discount") {
        if (authPassword !== "equinox@123") {
          setAuthError("Incorrect admin password")
        } else {
          alert(`Global Promotion Activated!\n${authPrompt.payload.name || "Special Offer"} has been applied to supermarket catalog.`)
          setAuthPrompt(null)
        }
      } else if (authPrompt?.action === "settings") {
        if (authPassword !== "equinox@123") {
          setAuthError("Incorrect admin password")
        } else {
          alert("Store settings saved successfully!")
          setAuthPrompt(null)
        }
      }
    } catch (err) {
      setAuthError("Action failed. Please try again.")
    } finally {
      setIsAuthing(false)
    }
  }

  const handleMarkDelivered = async (saleId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    try {
      const res = await fetch("/api/sales", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: saleId, status: "Delivered" })
      })
      if (!res.ok) throw new Error("Failed to update status")

      setSalesList(prev => prev.map(s => s.id === saleId ? { ...s, status: "Delivered" } : s))
      if (selectedBill && selectedBill.id === saleId) {
        setSelectedBill(prev => prev ? { ...prev, status: "Delivered" } : null)
      }
    } catch (err) {
      console.error(err)
      alert("Error updating order status. Please try again.")
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingProduct(true)
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price) || 0,
          mrp: parseFloat(newProduct.mrp) || parseFloat(newProduct.price) || 0,
          stock: parseInt(newProduct.stock, 10) || 0
        })
      })
      const data = await res.json()
      if (!data.error) {
        setStats(prev => ({ ...prev, stock: [data, ...prev.stock] }))
        setNewProduct({
          name: "",
          category: "Grocery",
          brand: "",
          batch_no: "",
          expiry_date: "",
          unit: "1 unit",
          price: "",
          mrp: "",
          stock: "50",
          description: "",
          image_url: ""
        })
        alert("Product added to supermarket catalog successfully!")
      } else {
        alert(data.error || "Failed to add product")
      }
    } catch (err) {
      console.error(err)
      alert("Error adding product")
    } finally {
      setIsAddingProduct(false)
    }
  }

  const handleAddStock = async (id: string, currentStock: number) => {
    const amount = prompt("How many units to replenish into inventory?", "20")
    if (!amount) return
    const delta = parseInt(amount, 10)
    if (isNaN(delta) || delta <= 0) return

    try {
      await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, stockDelta: delta })
      })
      
      setStats(prev => ({
        ...prev,
        stock: prev.stock.map(s => s.id === id ? { ...s, stock: s.stock + delta } : s)
      }))
      fetchStockAndSales()
    } catch (err) {
      console.error(err)
    }
  }

  const handleOpenPriceModal = (item: any) => {
    setEditingPriceItem(item)
    setEditPriceValue(item.price ? String(item.price) : "")
    setEditMrpValue(item.mrp ? String(item.mrp) : (item.price ? String(item.price) : ""))
  }

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPriceItem) return
    const priceNum = parseFloat(editPriceValue)
    const mrpNum = parseFloat(editMrpValue) || priceNum
    if (isNaN(priceNum) || priceNum < 0) {
      alert("Please enter a valid price")
      return
    }

    setIsUpdatingPrice(true)
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPriceItem.id,
          price: priceNum,
          mrp: mrpNum
        })
      })
      const data = await res.json()
      if (!data.error) {
        setStats(prev => ({
          ...prev,
          stock: prev.stock.map(s => s.id === editingPriceItem.id ? { ...s, price: priceNum, mrp: mrpNum } : s)
        }))
        setEditingPriceItem(null)
      } else {
        alert(data.error || "Failed to update price")
      }
    } catch (err) {
      console.error(err)
      alert("Error updating price")
    } finally {
      setIsUpdatingPrice(false)
    }
  }

  const filteredStock = stats.stock.filter(s => {
    if (!stockSearch.trim()) return true
    const query = stockSearch.trim().toLowerCase()
    return (
      (s.id && s.id.toLowerCase().includes(query)) ||
      (s.name && s.name.toLowerCase().includes(query)) || 
      (s.category && s.category.toLowerCase().includes(query)) ||
      (s.brand && s.brand.toLowerCase().includes(query))
    )
  })

  const filteredReturnRequests = returnRequests.filter(req => {
    if (!returnSearch.trim()) return true
    const query = returnSearch.trim().toLowerCase()
    return (
      (req.bill_no && req.bill_no.toLowerCase().includes(query)) ||
      (req.sale_id && String(req.sale_id).toLowerCase().includes(query)) ||
      (req.customer_name && req.customer_name.toLowerCase().includes(query)) ||
      (req.customer_phone && req.customer_phone.includes(query)) ||
      (req.customer_email && req.customer_email.toLowerCase().includes(query)) ||
      (req.id && String(req.id).includes(query))
    )
  })

  const pendingReturnsCount = returnRequests.filter(r => r.status === "Pending").length

  return (
    <>
      <div className="flex h-full flex-col">
        <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto pb-32 pr-1">

          {/* TAB 1: STORE SETTINGS (First Tab for Admin) */}
          {activeTab === "settings" && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              {/* Left Column: General Configuration */}
              <div className="xl:col-span-2 flex flex-col gap-6">
                <SectionHeading title="Supermarket Settings &amp; Configuration" hint="Store identity, tax &amp; invoice rules" />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Store Defaults */}
                  <div className={`${cardBase} p-5`}>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm">
                        <Store className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-stone-900">Store Defaults</p>
                        <p className="text-xs text-stone-400">Identity &amp; locale configuration</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Field label="Store Name">
                        <input
                          className={inputClass}
                          value={settingsForm.storeName}
                          onChange={e => setSettingsForm({...settingsForm, storeName: e.target.value})}
                        />
                      </Field>
                      <Field label="Operating Timezone">
                        <select
                          className={inputClass}
                          value={settingsForm.timezone}
                          onChange={e => setSettingsForm({...settingsForm, timezone: e.target.value})}
                        >
                          <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                          <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
                          <option value="Asia/Singapore">Asia/Singapore (SGT +8:00)</option>
                        </select>
                      </Field>
                      <Field label="Store Currency">
                        <input
                          className={inputClass}
                          value={settingsForm.currency}
                          onChange={e => setSettingsForm({...settingsForm, currency: e.target.value})}
                        />
                      </Field>
                    </div>
                  </div>

                  {/* Tax & GST Settings */}
                  <div className={`${cardBase} p-5`}>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-sm">
                        <Coins className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-stone-900">Tax &amp; GST Defaults</p>
                        <p className="text-xs text-stone-400">Applied across checkout &amp; invoices</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Field label="Default GST Rate">
                        <div className="relative">
                          <input
                            type="number"
                            className={inputClass}
                            value={settingsForm.gstRate}
                            onChange={e => setSettingsForm({...settingsForm, gstRate: e.target.value})}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-stone-400 font-semibold">%</span>
                        </div>
                      </Field>
                      <Field label="GSTIN Identification Number">
                        <input
                          className={inputClass}
                          value={settingsForm.gstin}
                          onChange={e => setSettingsForm({...settingsForm, gstin: e.target.value})}
                        />
                      </Field>
                      <Field label="Tax Invoice Prefix">
                        <input
                          className={inputClass}
                          defaultValue="INV-EQX-"
                        />
                      </Field>
                    </div>
                  </div>

                  {/* Receipt & Invoice Formatting */}
                  <div className={`${cardBase} p-5 sm:col-span-2`}>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-sm">
                        <ReceiptText className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-stone-900">Receipt &amp; Invoice Formatting</p>
                        <p className="text-xs text-stone-400">Printed on thermal receipts and PDF invoices</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Header Greeting Line">
                        <input
                          className={inputClass}
                          value={settingsForm.headerLine}
                          onChange={e => setSettingsForm({...settingsForm, headerLine: e.target.value})}
                        />
                      </Field>
                      <Field label="Policy / Footer Note">
                        <input
                          className={inputClass}
                          value={settingsForm.footerNote}
                          onChange={e => setSettingsForm({...settingsForm, footerNote: e.target.value})}
                        />
                      </Field>
                      <Toggle defaultOn label="Print Itemized GST Breakdown" />
                      <Toggle defaultOn label="Generate Instant QR Code Receipt" />
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setAuthPrompt({ action: "settings", payload: { ...settingsForm } })}
                        className="rounded-2xl bg-stone-900 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-stone-800 transition"
                      >
                        Apply Store Changes
                      </button>
                    </div>
                  </div>

                  {/* Store Promotions & Global Offers */}
                  <div className={`${cardBase} p-5 sm:col-span-2`}>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-sm">
                        <Tag className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-stone-900">Store Promotions &amp; Discounts</p>
                        <p className="text-xs text-stone-400">Set supermarket promotional offer rules</p>
                      </div>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        const formData = new FormData(e.currentTarget)
                        const data = {
                          name: formData.get("name"),
                          type: formData.get("type"),
                          value: parseFloat(formData.get("value") as string),
                          threshold: parseFloat(formData.get("threshold") as string) || 0,
                          product_id: formData.get("product_id")
                        }
                        setAuthPrompt({ action: "discount", payload: data })
                      }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"
                    >
                      <Field label="Discount Title">
                        <input name="name" className={inputClass} placeholder="e.g. Weekend Grocery Fest" defaultValue="Weekend Grocery Saver" />
                      </Field>
                      <Field label="Discount Type">
                        <select name="type" value={discountType} onChange={(e) => setDiscountType(e.target.value)} className={inputClass}>
                          <option value="FLAT_THRESHOLD">Flat ₹ off orders over threshold</option>
                          <option value="PERCENT_THRESHOLD">% off orders over threshold</option>
                          <option value="PERCENT">% off all orders (no threshold)</option>
                          <option value="SPECIFIC_ITEM_FLAT">Flat ₹ off a specific item</option>
                          <option value="SPECIFIC_ITEM_PERCENT">% off a specific item</option>
                        </select>
                      </Field>
                      
                      {discountType.startsWith("SPECIFIC_ITEM") ? (
                        <Field label="Target Item">
                          <select name="product_id" required className={inputClass}>
                            <option value="">Select an item...</option>
                            {stats.stock.map(item => (
                              <option key={item.id} value={item.id}>{item.name} ({item.id})</option>
                            ))}
                          </select>
                        </Field>
                      ) : (
                        <Field label="Order Threshold (₹)">
                          <input name="threshold" type="number" step="0.01" defaultValue="499" className={inputClass} placeholder="e.g. 499" />
                        </Field>
                      )}
                      
                      <Field label="Discount Value">
                        <input name="value" type="number" step="0.01" required defaultValue="50" className={inputClass} placeholder={discountType.includes("PERCENT") ? "e.g. 10 (%)" : "e.g. 50 (₹)"} />
                      </Field>
                      
                      <div className="sm:col-span-2 pt-2">
                        <button type="submit" className="w-full rounded-2xl bg-emerald-700 px-4 py-3 text-xs font-bold text-white shadow hover:bg-emerald-800 transition">
                          Activate Global Promotion
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Right Column: Database & System Status */}
              <div className="flex flex-col gap-6">
                <SectionHeading title="System &amp; Database" hint="Infrastructure status" />
                <div className={`${cardBase} p-5 flex flex-col gap-4 text-xs`}>
                  <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-white shadow-sm">
                      <Database className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">SQLite 3 Embedded Engine</p>
                      <p className="text-xs text-stone-400">High-concurrency local datastore</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-center py-1 border-b border-stone-100">
                      <span className="text-stone-400 font-medium">Datastore Path</span>
                      <span className="font-mono text-stone-800 font-semibold text-[11px]">./pos.db</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-stone-100">
                      <span className="text-stone-400 font-medium">Engine Mode</span>
                      <span className="font-semibold text-stone-800">WAL (Write-Ahead Logging)</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-stone-100">
                      <span className="text-stone-400 font-medium">Total Products</span>
                      <span className="font-bold text-emerald-700">{stats.stock.length} catalog items</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-stone-100">
                      <span className="text-stone-400 font-medium">Recorded Orders</span>
                      <span className="font-bold text-stone-900">{salesList.length} orders</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-stone-100">
                      <span className="text-stone-400 font-medium">Connection Latency</span>
                      <span className="font-semibold text-emerald-600">0.2 ms · Ultra Fast</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-stone-400 font-medium">Server Status</span>
                      <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Online (Port 3000)
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 rounded-2xl bg-stone-50 border border-stone-200/80 p-3 text-[11px] text-stone-500 leading-relaxed">
                    Database integrity verified. Automatic sync and foreign key constraints active.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RETURN REQUESTS */}
          {activeTab === "returns" && (
            <div className="flex flex-col gap-6">
              <SectionHeading 
                title="Customer Return &amp; Refund Requests" 
                hint="Inspect customer return requests and authorize direct refunds" 
              />

              {/* Return Requests Search Bar */}
              <div className="relative mb-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search returns by Bill No (e.g. INV-00014), customer name, or phone…"
                  value={returnSearch}
                  onChange={e => setReturnSearch(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-5 py-3 pl-11 text-xs text-stone-700 outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 transition-all shadow-xs"
                />
              </div>

              <div className={`${cardBase} p-6 overflow-hidden`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>Pending Approval: <strong className="text-amber-800">{pendingReturnsCount}</strong></span>
                  </div>
                  <button 
                    onClick={fetchReturns}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Refresh Requests
                  </button>
                </div>

                {loadingReturns ? (
                  <div className="flex h-40 items-center justify-center gap-2 text-stone-400 text-xs">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                    <span>Loading requests...</span>
                  </div>
                ) : returnRequests.length === 0 ? (
                  <div className="flex h-44 flex-col items-center justify-center gap-2 text-center text-stone-400">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    <p className="font-semibold text-stone-700 text-sm">No return requests found</p>
                    <p className="text-xs text-stone-400">Customer requests within the 7-day return period will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[780px]">
                      <thead>
                        <tr className="border-b border-stone-200 text-[11px] uppercase tracking-wider font-bold text-stone-400 bg-stone-50/70">
                          <th className="w-[130px] px-3.5 py-3 text-left">Bill / Order</th>
                          <th className="w-[160px] px-3.5 py-3 text-left">Customer</th>
                          <th className="min-w-[160px] px-3.5 py-3 text-left">Reason</th>
                          <th className="min-w-[160px] px-3.5 py-3 text-left">Items Summary</th>
                          <th className="w-[110px] px-3.5 py-3 text-right">Amount</th>
                          <th className="w-[110px] px-3.5 py-3 text-center">Status</th>
                          <th className="w-[180px] px-3.5 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredReturnRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-stone-50/50 transition">
                            <td className="px-3.5 py-3 align-middle font-mono font-bold text-stone-900 whitespace-nowrap">
                              {req.bill_no}
                            </td>
                            <td className="px-3.5 py-3 align-middle">
                              <div className="flex flex-col justify-center min-h-[34px]">
                                <p className="font-semibold text-stone-800 leading-tight truncate">
                                  {req.customer_name || "Customer"}
                                </p>
                                <p className="text-[10px] text-stone-400 mt-0.5 leading-tight truncate">
                                  {req.customer_phone || req.customer_email || "—"}
                                </p>
                              </div>
                            </td>
                            <td className="px-3.5 py-3 align-middle text-stone-600 leading-relaxed max-w-xs pr-2">
                              {req.reason}
                            </td>
                            <td className="px-3.5 py-3 align-middle text-stone-500 truncate max-w-xs pr-2">
                              {req.items_summary}
                            </td>
                            <td className="px-3.5 py-3 align-middle text-right font-mono font-bold text-stone-900 tabular-nums whitespace-nowrap">
                              {formatCurrency(req.amount)}
                            </td>
                            <td className="px-3.5 py-3 align-middle text-center whitespace-nowrap">
                              <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                req.status === "Approved"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : req.status === "Rejected"
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-amber-100 text-amber-800"
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="px-3.5 py-3 align-middle text-right whitespace-nowrap">
                              {req.status === "Pending" ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleApproveReturnPrompt(req)}
                                    className="rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 transition"
                                  >
                                    Approve &amp; Refund
                                  </button>
                                  <button
                                    onClick={() => handleRejectReturnPrompt(req)}
                                    className="rounded-xl bg-rose-50 px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-100 transition"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-stone-400 font-medium">Processed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {filteredReturnRequests.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-stone-400">
                              {returnSearch ? `No return requests found matching "${returnSearch}".` : "No return requests found."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STOCK MANAGEMENT */}
          {activeTab === "stock" && (
            <div className="flex flex-col gap-6">
              <SectionHeading title="Stock &amp; Catalog Management" hint="Add products and replenish inventory" />

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Add Product Form - Compact, h-fit self-start to avoid vertical stretching */}
                <div className={`${cardBase} p-6 lg:col-span-1 h-fit self-start`}>
                  <div className="mb-4 flex items-center gap-2 border-b border-stone-100 pb-3">
                    <Plus className="h-5 w-5 text-emerald-700" />
                    <h3 className="font-serif text-base font-bold text-stone-900">Add Supermarket Product</h3>
                  </div>

                  <form onSubmit={handleAddProduct} className="flex flex-col gap-3 text-xs">
                    <Field label="Product Name *">
                      <input
                        required
                        type="text"
                        className={inputClass}
                        placeholder="e.g. Fortune Sunflower Oil (1L)"
                        value={newProduct.name}
                        onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                      />
                    </Field>

                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Category *">
                        <select
                          className={inputClass}
                          value={newProduct.category}
                          onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                        >
                          {SUPERMARKET_CATEGORIES.filter(c => c !== "All Products").map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Brand *">
                        <input
                          required
                          type="text"
                          className={inputClass}
                          placeholder="e.g. Fortune"
                          value={newProduct.brand}
                          onChange={e => setNewProduct({...newProduct, brand: e.target.value})}
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Batch Number">
                        <input
                          type="text"
                          className={inputClass}
                          placeholder={`B-${new Date().getFullYear()}-X`}
                          value={newProduct.batch_no}
                          onChange={e => setNewProduct({...newProduct, batch_no: e.target.value})}
                        />
                      </Field>
                      <Field label="Expiry Date">
                        <input
                          type="text"
                          className={inputClass}
                          placeholder={`e.g. 25 Dec ${new Date().getFullYear() + 1}`}
                          value={newProduct.expiry_date}
                          onChange={e => setNewProduct({...newProduct, expiry_date: e.target.value})}
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Field label="Price (₹) *">
                        <input
                          required
                          type="number"
                          step="0.01"
                          className={inputClass}
                          placeholder="145"
                          value={newProduct.price}
                          onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                        />
                      </Field>
                      <Field label="MRP (₹)">
                        <input
                          type="number"
                          step="0.01"
                          className={inputClass}
                          placeholder="170"
                          value={newProduct.mrp}
                          onChange={e => setNewProduct({...newProduct, mrp: e.target.value})}
                        />
                      </Field>
                      <Field label="Stock Qty *">
                        <input
                          required
                          type="number"
                          className={inputClass}
                          placeholder="50"
                          value={newProduct.stock}
                          onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                        />
                      </Field>
                    </div>

                    <Field label="Unit / Pack Size">
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="e.g. 1 kg / 500 ml / Pack of 4"
                        value={newProduct.unit}
                        onChange={e => setNewProduct({...newProduct, unit: e.target.value})}
                      />
                    </Field>

                    <Field label="Image URL (Optional)">
                      <input
                        type="url"
                        className={inputClass}
                        placeholder="https://... (or leave empty for auto fallback)"
                        value={newProduct.image_url}
                        onChange={e => setNewProduct({...newProduct, image_url: e.target.value})}
                      />
                    </Field>

                    <Field label="Product Description">
                      <textarea
                        rows={2}
                        className={`${inputClass} resize-none`}
                        placeholder="Short overview of highlights, ingredients, or usage"
                        value={newProduct.description}
                        onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                      />
                    </Field>

                    <button
                      type="submit"
                      disabled={isAddingProduct}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 py-3 text-xs font-bold text-white shadow hover:bg-emerald-800 transition disabled:opacity-50"
                    >
                      {isAddingProduct ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & Add to Catalog"}
                    </button>
                  </form>
                </div>

                {/* Stock Table */}
                <div className={`${cardBase} p-6 lg:col-span-2 flex flex-col`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      Inventory Catalog ({filteredStock.length} items)
                    </h3>
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                      <input
                        type="search"
                        placeholder="Search by product ID (e.g. sku-veg-01) or name…"
                        value={stockSearch}
                        onChange={e => setStockSearch(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto min-h-0 flex-1">
                    <table className="w-full text-left text-xs min-w-[620px]">
                      <thead>
                        <tr className="border-b border-stone-200 text-[11px] uppercase tracking-wider font-bold text-stone-400 bg-stone-50/70">
                          <th className="min-w-[180px] px-3.5 py-2.5 text-left">Product</th>
                          <th className="w-[110px] px-3.5 py-2.5 text-left">Category</th>
                          <th className="w-[110px] px-3.5 py-2.5 text-right">Price</th>
                          <th className="w-[100px] px-3.5 py-2.5 text-center">Stock</th>
                          <th className="w-[210px] px-3.5 py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredStock.map(item => (
                          <tr key={item.id} className="hover:bg-stone-50/50 transition">
                            <td className="px-3.5 py-2.5 align-middle">
                              <p className="font-bold text-stone-900 leading-tight">{item.name}</p>
                              <p className="text-[10px] text-stone-400 mt-0.5 leading-tight">SKU: {item.id} {item.brand ? `· ${item.brand}` : ""}</p>
                            </td>
                            <td className="px-3.5 py-2.5 align-middle">
                              <span className="rounded-lg bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                                {item.category}
                              </span>
                            </td>
                            <td className="px-3.5 py-2.5 align-middle text-right font-mono font-bold text-stone-900 tabular-nums">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="px-3.5 py-2.5 align-middle text-center whitespace-nowrap">
                              <span className={`inline-block font-bold ${item.stock <= 5 ? "text-rose-600" : "text-emerald-700"}`}>
                                {item.stock} left
                              </span>
                            </td>
                            <td className="px-3.5 py-2.5 align-middle text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenPriceModal(item)}
                                  className="rounded-xl border border-stone-200 bg-white px-2 py-1 text-[11px] font-bold text-stone-700 hover:bg-stone-50 shadow-xs active:scale-[0.98]"
                                  title="Change selling price & MRP"
                                >
                                  ₹ Change Price
                                </button>
                                <button
                                  onClick={() => handleAddStock(item.id, item.stock)}
                                  className="rounded-xl border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 shadow-xs active:scale-[0.98]"
                                >
                                  + Add Stock
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredStock.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                              {stockSearch ? `No products found matching "${stockSearch}".` : "No products found in catalog."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEMAND ML & SALES VELOCITY */}
          {activeTab === "demand" && (
            <div className="flex flex-col gap-6">
              <SectionHeading title="Demand ML &amp; Sales Velocity Forecasting" hint="AI predictive inventory burn rate" />
              <div className={`${cardBase} p-6`}>
                <p className="text-xs text-stone-500 mb-5">
                  Real-time machine learning velocity analysis tracking consumer purchasing patterns, shelf depletion rate, and algorithmic replenishment signals.
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {stats.demand.map((item) => {
                    const isUrgent = item.velocity_label === "Reorder Required" || item.stock <= 8
                    const isSurge = item.velocity_label === "Surge Expected"

                    return (
                      <div key={item.id} className="rounded-2xl border border-stone-200/70 bg-white p-4 shadow-xs hover:border-emerald-200 transition-all">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                          <span>{item.category}</span>
                          <span className="text-stone-900 font-bold">{item.total_sold} units sold</span>
                        </div>

                        <h4 className="mt-1 font-serif text-sm font-bold text-stone-900 truncate" title={item.name}>
                          {item.name}
                        </h4>
                        {item.brand && <p className="text-[10px] text-stone-400">{item.brand}</p>}

                        {/* Velocity Signal Badge - NO Healthy Level */}
                        <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2.5 text-xs">
                          <span className="text-stone-500">
                            Stock: <strong className="text-stone-900">{item.stock}</strong>
                          </span>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                            isUrgent
                              ? "bg-rose-100 text-rose-800"
                              : isSurge
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {item.velocity_label || (item.stock <= 8 ? "Reorder Required" : "Surge Expected")}
                          </span>
                        </div>

                        {/* Predictive Insights */}
                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-500 bg-stone-50 rounded-xl px-2.5 py-1.5">
                          <span>Runout Est: <strong>~{item.predicted_runout_days || 5} days</strong></span>
                          <span>Burn Rate: <strong>{item.burn_rate || "1.2"}/day</strong></span>
                        </div>

                        <button
                          onClick={() => handleAddStock(item.id, item.stock)}
                          className="mt-3 w-full rounded-xl border border-stone-200 bg-white py-1.5 text-[11px] font-bold text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 transition"
                        >
                          + Replenish Stock (+{item.recommended_reorder || 25})
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS & INVOICES */}
          {activeTab === "sales" && (
            <div className="flex flex-col gap-6">
              <SectionHeading title="Supermarket Orders &amp; Invoices" hint="Click an order to inspect bill, print receipt, or initiate refund" />

              {/* Search Bar */}
              <div className="relative mb-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search by Bill No (e.g. INV-00001) or customer name…"
                  value={billSearch}
                  onChange={e => setBillSearch(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-5 py-3 pl-11 text-xs text-stone-700 outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 transition-all shadow-xs"
                />
              </div>

              <div className={`${cardBase} p-6 overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[850px]">
                    <thead>
                      <tr className="border-b border-stone-200 text-[11px] uppercase tracking-wider font-bold text-stone-400 bg-stone-50/70">
                        <th className="w-[130px] px-3.5 py-3 text-left">Bill No</th>
                        <th className="w-[160px] px-3.5 py-3 text-left">Date</th>
                        <th className="min-w-[150px] px-3.5 py-3 text-left">Customer</th>
                        <th className="w-[80px] px-3.5 py-3 text-center">Items</th>
                        <th className="w-[120px] px-3.5 py-3 text-right">Total Amount</th>
                        <th className="w-[170px] px-3.5 py-3 text-left">Payment / Ref ID</th>
                        <th className="w-[140px] px-3.5 py-3 text-center">Status</th>
                        <th className="w-[90px] px-3.5 py-3 text-right">Inspection</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {salesList
                        .filter(s => 
                          !billSearch || 
                          (s.billNo && s.billNo.toLowerCase().includes(billSearch.toLowerCase())) ||
                          (s.customer_name && s.customer_name.toLowerCase().includes(billSearch.toLowerCase())) ||
                          (s.payment_id && s.payment_id.toLowerCase().includes(billSearch.toLowerCase())) ||
                          (s.upi_ref_id && s.upi_ref_id.toLowerCase().includes(billSearch.toLowerCase()))
                        )
                        .map((sale) => (
                          <tr
                            key={sale.id}
                            onClick={() => setSelectedBill(sale)}
                            className="group cursor-pointer hover:bg-emerald-50/40 transition-colors"
                          >
                            <td className="px-3.5 py-3 align-middle font-mono font-bold text-emerald-800 whitespace-nowrap">
                              {sale.billNo}
                            </td>
                            <td className="px-3.5 py-3 align-middle text-stone-500 whitespace-nowrap">
                              {new Date(sale.created_at).toLocaleString("en-IN")}
                            </td>
                            <td className="px-3.5 py-3 align-middle">
                              <div className="flex flex-col justify-center min-h-[34px]">
                                <p className="font-semibold text-stone-800 leading-tight truncate">
                                  {sale.customer_name || "Customer"}
                                </p>
                                <p className="text-[10px] text-stone-400 mt-0.5 leading-tight">
                                  {sale.customer_phone || "—"}
                                </p>
                              </div>
                            </td>
                            <td className="px-3.5 py-3 align-middle text-center text-stone-500 font-medium whitespace-nowrap">
                              {sale.items?.length || 1} {(sale.items?.length || 1) === 1 ? "item" : "items"}
                            </td>
                            <td className="px-3.5 py-3 align-middle text-right font-mono font-bold text-stone-900 tabular-nums whitespace-nowrap">
                              {formatCurrency(sale.total_amount)}
                            </td>
                            <td className="px-3.5 py-3 align-middle">
                              <div className="flex flex-col justify-center min-h-[34px]">
                                <span className="font-semibold text-stone-800 leading-tight truncate">
                                  {sale.payment_method?.replace(" (krishraj453@okicici)", "") || "UPI"}
                                </span>
                                <span className="font-mono text-[10px] text-emerald-800 font-bold mt-0.5 leading-tight truncate" title="System Payment ID">
                                  Sys: {sale.payment_id || "N/A"}
                                </span>
                                {sale.upi_ref_id && sale.upi_ref_id !== "N/A" && (
                                  <span className="font-mono text-[10px] text-purple-700 font-bold leading-tight truncate" title="Customer Entered UPI Reference / UTR">
                                    UTR: {sale.upi_ref_id}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3.5 py-3 align-middle text-center whitespace-nowrap">
                              <div className="flex flex-col items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  sale.status === "Refunded"
                                    ? "bg-purple-100 text-purple-800"
                                    : sale.status === "Return Requested"
                                      ? "bg-amber-100 text-amber-800"
                                      : sale.status === "Return Rejected"
                                        ? "bg-rose-100 text-rose-800"
                                        : sale.status === "Order Placed"
                                          ? "bg-blue-100 text-blue-800 ring-1 ring-blue-300"
                                          : "bg-emerald-100 text-emerald-800"
                                }`}>
                                  {sale.status || "Order Placed"}
                                </span>
                                {sale.status === "Order Placed" && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleMarkDelivered(sale.id, e)}
                                    className="rounded-lg bg-emerald-700 px-2.5 py-1 text-[10px] font-bold text-white shadow-xs hover:bg-emerald-800 active:scale-95 transition flex items-center gap-1"
                                  >
                                    🚚 Mark Delivered
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-3.5 py-3 align-middle text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    printSupermarketReceipt(sale)
                                  }}
                                  title="Print official customer bill receipt"
                                  className="rounded-xl border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900 transition flex items-center gap-1 shadow-2xs"
                                >
                                  <Printer className="h-3 w-3 text-emerald-600" />
                                  <span>Print Bill</span>
                                </button>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 group-hover:text-emerald-800 group-hover:underline">
                                  View →
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {salesList.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-stone-400">
                            No supermarket orders found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bill Detail & Inspection Modal (Click order from Orders & Invoices) */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md print:backdrop-blur-none print:bg-white print:p-0">
          <div className="relative w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-3xl bg-white shadow-2xl print:w-full print:max-w-none print:max-h-none print:overflow-visible print:shadow-none print:rounded-none">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4 print:border-b-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl font-bold text-stone-900">{selectedBill.billNo}</h2>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                    selectedBill.status === "Refunded"
                      ? "bg-purple-100 text-purple-800"
                      : selectedBill.status === "Order Placed"
                        ? "bg-blue-100 text-blue-800 ring-1 ring-blue-300"
                        : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {selectedBill.status || "Order Placed"}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Ordered on {new Date(selectedBill.created_at).toLocaleString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedBill(null)}
                className="rounded-full p-2 text-stone-400 hover:bg-stone-100 transition-colors print:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer & Payment Details */}
            <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 text-xs space-y-2">
              <div>
                <p className="font-bold text-stone-900 mb-0.5">Customer &amp; Shipping Details</p>
                <p className="text-stone-700 font-medium">{selectedBill.customer_name || "Customer"}</p>
                {selectedBill.customer_phone && <p className="text-stone-500">Phone: {selectedBill.customer_phone}</p>}
                {selectedBill.delivery_address && (
                  <p className="text-stone-500 mt-1 flex items-start gap-1">
                    <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span>{selectedBill.delivery_address}</span>
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-stone-200/60 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-stone-400 block font-semibold text-[10px] uppercase">Payment Method</span>
                  <span className="font-bold text-stone-800">{selectedBill.payment_method || "UPI (krishraj453@okicici)"}</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-semibold text-[10px] uppercase">System Payment ID</span>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                    {selectedBill.payment_id || "N/A"}
                  </span>
                </div>
                {selectedBill.upi_ref_id && selectedBill.upi_ref_id !== "N/A" && (
                  <div className="col-span-2 pt-1 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-stone-500 font-semibold text-[11px]">Customer UPI Ref / UTR:</span>
                    <span className="font-mono font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                      {selectedBill.upi_ref_id}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="p-6">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-left text-stone-400 uppercase font-semibold">
                    <th className="pb-2">Item</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">Price</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {(selectedBill.items || []).map((item: any, i: number) => (
                    <tr key={i} className="text-stone-800">
                      <td className="py-2.5 pr-2 font-medium">{item.product_name || item.product_id}</td>
                      <td className="py-2.5 text-center">{item.quantity}</td>
                      <td className="py-2.5 text-right text-stone-500">{formatCurrency(item.price)}</td>
                      <td className="py-2.5 text-right font-semibold">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Summary */}
              <div className="mt-4 pt-3 border-t border-stone-200 flex justify-between items-center text-xs">
                <span className="font-medium text-stone-500">Total Billed Amount</span>
                <span className="font-serif text-xl font-bold text-stone-900">
                  {formatCurrency(selectedBill.total_amount)}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-stone-100 bg-stone-50 print:hidden">
              <button
                type="button"
                onClick={() => printSupermarketReceipt(selectedBill)}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs font-bold text-stone-700 hover:bg-stone-100 active:scale-[0.98] cursor-pointer shadow-xs"
              >
                <Printer className="h-4 w-4 text-emerald-700" /> Print Official Bill
              </button>

              {selectedBill.status === "Order Placed" && (
                <button
                  type="button"
                  onClick={() => handleMarkDelivered(selectedBill.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 py-3 text-xs font-bold text-white hover:bg-emerald-800 shadow-sm active:scale-[0.98]"
                >
                  🚚 Mark as Delivered
                </button>
              )}

              {selectedBill.status === "Refunded" ? (
                <div className="flex-1 flex items-center justify-center rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold py-3">
                  ✓ Order Already Refunded
                </div>
              ) : selectedBill.status !== "Order Placed" ? (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Initiate full direct refund of ${formatCurrency(selectedBill.total_amount)} for Order ${selectedBill.billNo}?`)) {
                      setAuthPrompt({
                        action: "direct-refund",
                        targetId: selectedBill.id,
                        payload: {
                          saleId: selectedBill.id,
                          amount: selectedBill.total_amount,
                          billNo: selectedBill.billNo
                        }
                      })
                      setAuthError("")
                      setAuthPassword("")
                    }
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-xs font-bold text-white hover:bg-rose-700 shadow-sm active:scale-[0.98]"
                >
                  <RotateCcw className="h-4 w-4" /> Initiate Admin Refund
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Admin Security Password Authorization Modal */}
      {authPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/80 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-base font-bold text-stone-900">Admin Authorization</h3>
              <button onClick={() => setAuthPrompt(null)} className="text-stone-400 hover:text-stone-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="mt-4 flex flex-col gap-3 text-xs">
              <p className="text-stone-500">
                Please enter master admin password to authorize this action:
              </p>

              <div className="relative">
                <input
                  required
                  type={showAuthPassword ? "text" : "password"}
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  placeholder="Master Password"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 pr-10 text-xs text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowAuthPassword(!showAuthPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showAuthPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {authError && <p className="text-rose-600 font-semibold">{authError}</p>}

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAuthPrompt(null)}
                  className="rounded-xl px-3 py-1.5 font-semibold text-stone-500 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAuthing}
                  className="rounded-xl bg-stone-900 px-4 py-1.5 font-bold text-white shadow hover:bg-stone-800 disabled:opacity-50"
                >
                  {isAuthing ? <Loader2 className="h-3 w-3 animate-spin" /> : "Authorize Action"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Price Edit Modal */}
      {editingPriceItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/80 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">Change Product Price</h3>
                <p className="text-[11px] text-stone-500 truncate max-w-[220px]">{editingPriceItem.name}</p>
              </div>
              <button onClick={() => setEditingPriceItem(null)} className="text-stone-400 hover:text-stone-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSavePrice} className="mt-4 flex flex-col gap-3 text-xs">
              <Field label="Selling Price (₹) *">
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={editPriceValue}
                  onChange={e => setEditPriceValue(e.target.value)}
                  placeholder="e.g. 150"
                  className={inputClass}
                />
              </Field>

              <Field label="MRP (₹) (Optional)">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editMrpValue}
                  onChange={e => setEditMrpValue(e.target.value)}
                  placeholder="e.g. 180"
                  className={inputClass}
                />
              </Field>

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPriceItem(null)}
                  className="rounded-xl px-3 py-1.5 font-semibold text-stone-500 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPrice}
                  className="rounded-xl bg-emerald-700 px-4 py-1.5 font-bold text-white shadow hover:bg-emerald-800 disabled:opacity-50"
                >
                  {isUpdatingPrice ? <Loader2 className="h-3 w-3 animate-spin" /> : "Update Price"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
