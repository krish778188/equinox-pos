"use client"

import { useState, useEffect } from "react"
import {
  Store,
  Coins,
  ReceiptText,
  Database,
  Server,
  Users,
  ChevronRight,
  Printer,
  X,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react"

// (keeping cardBase, SectionHeading, Field, inputClass, Toggle as is)
const cardBase =
  "rounded-3xl border border-white/70 bg-white/70 shadow-[0_20px_50px_rgba(120,90,60,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl"

function SectionHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between px-1">
      <h2 className="font-serif text-xl font-semibold tracking-tight text-stone-800">{title}</h2>
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

const inputClass =
  "w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-2.5 text-sm text-stone-700 shadow-[inset_0_1px_2px_rgba(120,90,60,0.06)] outline-none transition-all placeholder:text-stone-300 focus:border-indigo-200 focus:ring-4 focus:ring-indigo-100/70"

function Toggle({ defaultOn = false, label }: { defaultOn?: boolean; label: string }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setOn((v) => !v)}
      className="flex items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-left text-sm font-medium text-stone-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-all active:scale-[0.98]"
    >
      {label}
      <span
        className={[
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300",
          on ? "bg-[linear-gradient(120deg,#fb7185,#818cf8)]" : "bg-stone-200",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.2)] transition-all duration-300",
            on ? "left-[22px]" : "left-0.5",
          ].join(" ")}
        />
      </span>
    </button>
  )
}

const statusDot: Record<string, string> = {
  active: "bg-emerald-500",
  away: "bg-amber-400",
  offline: "bg-stone-300",
}

export function AdminPortal({ loggedInUser }: { loggedInUser?: any }) {
  const [localStaff, setLocalStaff] = useState<any[]>([])
  const [newEmployee, setNewEmployee] = useState({ name: "", role: "Cashier" })
  const [activeTab, setActiveTab] = useState<"settings" | "users" | "stock" | "demand" | "sales">("settings")
  const [isProcessing, setIsProcessing] = useState(false)
  const [credentialsPDF, setCredentialsPDF] = useState<any>(null)

  const [stats, setStats] = useState<{ stock: any[], demand: any[] }>({ stock: [], demand: [] })
  
  const [newProduct, setNewProduct] = useState({ name: "", category: "Staples", price: "", stock: "" })
  const [isAddingProduct, setIsAddingProduct] = useState(false)

  // Auth Prompt State
  const [authPrompt, setAuthPrompt] = useState<{ action: "add" | "remove" | "discount", targetId?: string, payload?: any } | null>(null)
  const [authPassword, setAuthPassword] = useState("")
  const [showAuthPassword, setShowAuthPassword] = useState(false)
  const [authError, setAuthError] = useState("")
  const [isAuthing, setIsAuthing] = useState(false)
  const [discountType, setDiscountType] = useState("FLAT_THRESHOLD")

  const [salesList, setSalesList] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/employees").then(res => res.json()).then(data => {
      if(data.employees) {
        setLocalStaff(data.employees.map((e: any) => ({
            ...e,
            initials: e.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0,2),
            status: "offline",
            accent: "linear-gradient(140deg,#bbf7d0,#a7f3d0,#bae6fd)",
          })))
        }
      })
    fetch("/api/sales").then(res => res.json()).then(data => {
      if(data.sales) setSalesList(data.sales)
    })

    fetch("/api/admin-stats")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setStats({ stock: data.stock || [], demand: data.demand || [] })
        }
      })
  }, [])

  const executeAddEmployee = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmployee)
      })
      const data = await res.json()
      
      const initials = data.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0,2)
      setLocalStaff([...localStaff, {
        ...data,
        initials,
        status: "offline",
        accent: "linear-gradient(140deg,#bbf7d0,#a7f3d0,#bae6fd)",
      }])
      
      setCredentialsPDF(data)
      setNewEmployee({ name: "", role: "Cashier" })
    } catch (err) {
      console.error(err)
      alert("Error adding employee")
    } finally {
      setIsProcessing(false)
      setAuthPrompt(null)
      setAuthPassword("")
    }
  }

  const executeRemoveEmployee = async (id: string) => {
    try {
      await fetch(`/api/employees/${id}`, { method: "DELETE" })
      setLocalStaff(localStaff.filter(s => s.id !== id))
    } catch (err) {
      console.error(err)
    } finally {
      setAuthPrompt(null)
      setAuthPassword("")
    }
  }

  const executeReturn = async (payload: any) => {
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if(data.success) {
        alert(`Return Approved! Discount Code for customer: ${data.returnCode}\nAmount: ${payload.amount}`)
      } else {
        alert(data.error || "Failed to process return")
      }
    } catch(e) {
      alert("Error processing return")
    } finally {
      setAuthPrompt(null)
      setAuthPassword("")
    }
  }

  const executeAddDiscount = async (payload: any) => {
    try {
      const res = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if(res.ok) alert("Discount Activated Successfully!")
    } catch(e) {
      alert("Error saving discount")
    } finally {
      setAuthPrompt(null)
      setAuthPassword("")
    }
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError("")
    setIsAuthing(true)

    try {
      // Re-authenticate the logged-in admin
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: loggedInUser.id, password: authPassword })
      })
      const data = await res.json()
      
      if (data.success) {
        if (authPrompt?.action === "add") {
          await executeAddEmployee()
        } else if (authPrompt?.action === "remove" && authPrompt.targetId) {
          await executeRemoveEmployee(authPrompt.targetId)
        } else if (authPrompt?.action === "discount" && authPrompt.payload) {
          await executeAddDiscount(authPrompt.payload)
        } else if (authPrompt?.action === "return" && authPrompt.payload) {
          await executeReturn(authPrompt.payload)
        }
      } else {
        setAuthError("Incorrect password")
      }
    } catch (err) {
      setAuthError("Auth error")
    } finally {
      setIsAuthing(false)
    }
  }

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmployee.name) return
    setAuthPrompt({ action: "add" })
  }

  const handleRemoveEmployee = (id: string) => {
    setAuthPrompt({ action: "remove", targetId: id })
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingProduct(true)
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProduct.name,
          category: newProduct.category,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock, 10)
        })
      })
      const data = await res.json()
      if (!data.error) {
        setStats(prev => ({ ...prev, stock: [...prev.stock, data] }))
        setNewProduct({ name: "", category: "Staples", price: "", stock: "" })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsAddingProduct(false)
    }
  }

  const handleAddStock = async (id: string, currentStock: number) => {
    const amount = prompt("How many items to add to stock?", "10")
    if (!amount) return
    const delta = parseInt(amount, 10)
    if (isNaN(delta)) return

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
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
    <div className="flex h-full flex-col">
      <div className="mb-6 flex gap-2 border-b border-stone-200 pb-2">
        {(["settings", "users", "stock", "demand", "sales"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold capitalize transition-all ${activeTab === tab ? "border-b-2 border-indigo-600 text-indigo-700" : "text-stone-500 hover:text-stone-800"}`}
          >
            {tab === "settings" ? "General Settings" : tab === "users" ? "User Management" : tab === "stock" ? "Stock Management" : tab === "sales" ? "Sales & Returns" : "Demand ML"}
          </button>
        ))}
      </div>
      
      <div className="min-h-0 flex-1 overflow-y-auto pb-32 pr-1">
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            {/* General Settings */}
            <section className="xl:col-span-2">
              <SectionHeading title="General Settings" hint="System defaults" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className={`${cardBase} p-5`}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(140deg,#fb7185,#fdba74)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                      <Store className="h-[18px] w-[18px]" strokeWidth={2} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">Store Defaults</p>
                      <p className="text-xs text-stone-400">Identity & locale</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Field label="Store name">
                      <input className={inputClass} defaultValue="Equinox" />
                    </Field>
                    <Field label="Timezone">
                      <select className={inputClass} defaultValue="Asia/Kolkata">
                        <option>Asia/Kolkata</option>
                        <option>Asia/Dubai</option>
                        <option>Asia/Singapore</option>
                      </select>
                    </Field>
                  </div>
                </div>

                <div className={`${cardBase} p-5`}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(140deg,#fdba74,#818cf8)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                      <Coins className="h-[18px] w-[18px]" strokeWidth={2} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">Tax (GST)</p>
                      <p className="text-xs text-stone-400">Applied at checkout</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Field label="Default GST rate">
                      <div className="relative">
                        <input className={inputClass} defaultValue="5" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-stone-400">%</span>
                      </div>
                    </Field>
                    <Field label="GSTIN">
                      <input className={inputClass} defaultValue="29ABCDE1234F1Z5" />
                    </Field>
                  </div>
                </div>

                <div className={`${cardBase} p-5 sm:col-span-2`}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(140deg,#818cf8,#c7d2fe)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                      <ReceiptText className="h-[18px] w-[18px]" strokeWidth={2} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">Receipt Formatting</p>
                      <p className="text-xs text-stone-400">What prints at the bottom of every sale</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Header line">
                      <input className={inputClass} defaultValue="Thanks for visiting Equinox" />
                    </Field>
                    <Field label="Footer note">
                      <input className={inputClass} defaultValue="Returns accepted within 14 days" />
                    </Field>
                    <Toggle defaultOn label="Show itemized tax" />
                    <Toggle defaultOn label="Print QR receipt" />
                  </div>
                </div>

                {/* Discounts */}
                <div className={`${cardBase} p-5 sm:col-span-2`}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(140deg,#34d399,#10b981)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                      <Coins className="h-[18px] w-[18px]" strokeWidth={2} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">Store Promotions & Discounts</p>
                      <p className="text-xs text-stone-400">Set global discount rules</p>
                    </div>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      const data = {
                        name: formData.get('name'),
                        type: formData.get('type'),
                        value: parseFloat(formData.get('value') as string),
                        threshold: parseFloat(formData.get('threshold') as string) || 0,
                        product_id: formData.get('product_id')
                      }
                      setAuthPrompt({ action: "discount", payload: data })
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <Field label="Discount Name (Optional)">
                      <input name="name" className={inputClass} placeholder="e.g. Summer Sale" />
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
                        <input name="threshold" type="number" step="0.01" defaultValue="0" className={inputClass} placeholder="e.g. 2000" />
                      </Field>
                    )}
                    
                    <Field label="Discount Value">
                      <input name="value" type="number" step="0.01" required className={inputClass} placeholder={discountType.includes("PERCENT") ? "e.g. 10 (%)" : "e.g. 500 (₹)"} />
                    </Field>
                    
                    <div className="sm:col-span-2">
                      <button type="submit" className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-indigo-700 active:scale-[0.98]">
                        Activate Global Discount
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </section>

            {/* Database & API Settings */}
            <section>
              <SectionHeading title="Database & API" hint="Connections" />
              <div className={`${cardBase} p-5`}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(140deg,#0f172a,#334155)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                    <Database className="h-[18px] w-[18px]" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">PostgreSQL</p>
                    <p className="text-xs text-stone-400">Primary datastore</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Field label="Host">
                    <input className={inputClass} defaultValue="localhost" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Port">
                      <input className={inputClass} defaultValue="5432" />
                    </Field>
                    <Field label="Database">
                      <input className={inputClass} defaultValue="ledger_pos" />
                    </Field>
                  </div>
                  <Field label="User">
                    <input className={inputClass} defaultValue="pos_admin" />
                  </Field>
                  <Field label="Password">
                    <input type="password" className={inputClass} defaultValue="supersecret" />
                  </Field>
                </div>

                <div className="my-5 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(140deg,#059669,#34d399)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                    <Server className="h-[18px] w-[18px]" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">C++ Crow API</p>
                    <p className="text-xs text-stone-400">Forecast engine</p>
                  </div>
                </div>
                <Field label="Simulation endpoint">
                  <input className={inputClass} defaultValue="localhost:8080/api/simulate" />
                </Field>

                <button
                  type="button"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(120deg,#fb7185_0%,#fdba74_45%,#818cf8_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-8px_rgba(129,140,248,0.6),inset_0_1px_0_rgba(255,255,255,0.5)] transition-all active:scale-[0.98]"
                >
                  Test & Save Connection
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === "users" && (
          <div className="flex flex-col gap-4">
            {/* User Management */}
            <section className="w-full">
              <SectionHeading title="User Management" hint={`${localStaff.length} team members`} />
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div className="lg:col-span-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {localStaff.map((member: any) => (
                    <div
                      key={member.id}
                      className={`${cardBase} group flex flex-col gap-4 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_60px_rgba(120,90,60,0.12)]`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-stone-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                            style={{ background: member.accent }}
                          >
                            {member.initials}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${statusDot[member.status]}`}
                            aria-hidden
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-stone-800">{member.name}</p>
                          <p className="truncate text-xs text-stone-400">ID: {member.id}</p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="rounded-full bg-stone-100/90 px-2.5 py-0.5 text-[11px] font-medium text-stone-600">
                              {member.role}
                            </span>
                            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {member.billedCustomers} Billed
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end pt-2 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => handleRemoveEmployee(member.id)}
                          className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-all hover:bg-rose-100 active:scale-[0.96]"
                        >
                          Remove User
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className={`${cardBase} p-5 h-fit`}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(140deg,#818cf8,#c7d2fe)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                      <Users className="h-[18px] w-[18px]" strokeWidth={2} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">Add Employee</p>
                      <p className="text-xs text-stone-400">Onboard a new team member</p>
                    </div>
                  </div>
                  <form onSubmit={handleAddEmployee} className="flex flex-col gap-3">
                    <Field label="Full Name">
                      <input required value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} className={inputClass} placeholder="Jane Doe" />
                    </Field>
                    <Field label="Role">
                      <select value={newEmployee.role} onChange={e => setNewEmployee({...newEmployee, role: e.target.value})} className={inputClass}>
                        <option>Cashier</option>
                        <option>Store Manager</option>
                        <option>Inventory Clerk</option>
                      </select>
                    </Field>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="mt-3 flex w-full justify-center gap-2 rounded-2xl bg-stone-800 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-stone-700 active:scale-[0.98] disabled:opacity-70"
                    >
                      {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "stock" && (
          <div className="flex flex-col gap-6">
            <SectionHeading title="Stock Management" hint="Current inventory levels" />
            <div className={`${cardBase} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 bg-white/50 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
                      <th className="px-6 py-4">Item ID</th>
                      <th className="px-6 py-4">Product Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 text-right">Price</th>
                      <th className="px-6 py-4 text-center">In Stock</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white/40">
                    {stats.stock.map((item, i) => (
                      <tr key={i} className="transition-colors hover:bg-white/60">
                        <td className="whitespace-nowrap px-6 py-4 font-mono text-stone-500">{item.id}</td>
                        <td className="px-6 py-4 font-medium text-stone-800">{item.name}</td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-stone-100/90 px-2.5 py-0.5 text-[11px] font-medium text-stone-600">
                            {item.category}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-stone-700">₹{item.price}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.stock > 20 ? "bg-emerald-50 text-emerald-700" :
                            item.stock > 5 ? "bg-amber-50 text-amber-700" :
                            "bg-rose-50 text-rose-700"
                          }`}>
                            {item.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleAddStock(item.id, item.stock)}
                            className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 transition-all hover:bg-indigo-100 active:scale-[0.96]"
                          >
                            + Stock
                          </button>
                        </td>
                      </tr>
                    ))}
                    {stats.stock.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-stone-400">No stock data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <SectionHeading title="Add New Product" hint="Expand your catalog" />
            <form onSubmit={handleAddProduct} className={`${cardBase} p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end`}>
              <Field label="Product Name">
                <input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className={inputClass} placeholder="Apples" />
              </Field>
              <Field label="Category">
                <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className={inputClass}>
                  <option>Staples</option>
                  <option>Pulses</option>
                  <option>Oils</option>
                  <option>Dairy</option>
                  <option>Snacks</option>
                  <option>Beverages</option>
                  <option>Electronics</option>
                  <option>Perishables</option>
                </select>
              </Field>
              <Field label="Price (₹)">
                <input required type="number" step="0.01" min="0" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className={inputClass} placeholder="0.00" />
              </Field>
              <Field label="Initial Stock">
                <input required type="number" min="0" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className={inputClass} placeholder="10" />
              </Field>
              <button
                type="submit"
                disabled={isAddingProduct}
                className="flex w-full justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-70 h-[46px]"
              >
                {isAddingProduct ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Product"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "demand" && (
          <div className="flex flex-col gap-4">
            <SectionHeading title="Demand ML" hint="High demand items ordered by total sold" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.demand.map((item, i) => (
                <div key={i} className={`${cardBase} p-5 flex flex-col gap-2 relative overflow-hidden group`}>
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(251,113,133,0.1),transparent_70%)] blur-xl group-hover:bg-[radial-gradient(circle,rgba(251,113,133,0.2),transparent_70%)] transition-colors" />
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-stone-800 line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-stone-400 font-mono mt-0.5">{item.id}</p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold shadow-sm border border-indigo-100">
                      #{i + 1}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Total Sold</p>
                      <p className="text-xl font-bold text-stone-800">{item.total_sold}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Current Stock</p>
                      <p className={`text-sm font-semibold ${item.stock < 10 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {item.stock}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {stats.demand.length === 0 && (
                <div className={`${cardBase} p-8 text-center text-stone-400 col-span-full`}>
                  No sales data available yet for Demand ML analysis.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "sales" && (
          <div className="grid grid-cols-1 gap-5">
            <section>
              <SectionHeading title="Sales & Returns" hint="Process returns & issue credits" />
              <div className={`${cardBase} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-stone-50 text-stone-500 font-medium">
                      <tr>
                        <th className="px-6 py-4">Bill No</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Total Amount</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {salesList.map((sale) => (
                        <tr key={sale.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-medium text-stone-800">{sale.billNo}</td>
                          <td className="px-6 py-4 text-stone-600">{new Date(sale.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 font-semibold text-emerald-600">₹{sale.total_amount.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setAuthPrompt({ action: "return", payload: { saleId: sale.id, amount: sale.total_amount, date: sale.created_at } })}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                            >
                              Process Return
                            </button>
                          </td>
                        </tr>
                      ))}
                      {salesList.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-stone-400">No sales history found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>

    {credentialsPDF && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm print:backdrop-blur-none print:bg-white print:p-0">
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl print:w-full print:max-w-none print:shadow-none print:rounded-none">
          <div id="credentials-pdf" className="p-8 text-center bg-white">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
              <Users className="h-8 w-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-800">Welcome to Equinox!</h2>
            <p className="mt-2 text-stone-600">
              Congratulations <span className="font-semibold text-stone-800">{credentialsPDF.name}</span>, you are hired!
            </p>
            <p className="text-sm text-stone-500 mb-6">Here are your secure login credentials. Please keep them safe.</p>
            
            <div className="bg-stone-50 rounded-xl p-6 text-left border border-stone-200">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">Employee ID</p>
                <p className="font-mono text-lg font-medium text-stone-800">{credentialsPDF.id}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">Password</p>
                <p className="font-mono text-lg font-medium text-stone-800">{credentialsPDF.password}</p>
              </div>
            </div>

            <p className="mt-6 text-xs text-stone-400">Login at the main portal with your Employee ID.</p>
          </div>

          <div className="flex gap-3 p-6 border-t border-stone-100 bg-stone-50 print:hidden">
            <button onClick={() => window.print()} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 active:scale-[0.98]">
              <Printer className="h-4 w-4" /> Print PDF
            </button>
            <button onClick={() => setCredentialsPDF(null)} className="flex flex-1 items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-[0.98]">
              Done
            </button>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * { visibility: hidden; }
            #credentials-pdf, #credentials-pdf * { visibility: visible; }
            #credentials-pdf { position: fixed; left: 0; top: 0; width: 100%; height: 100%; padding: 40px; background: white; z-index: 99999; overflow: visible; }
          }
        `}} />
      </div>
    )}
    {authPrompt && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
        <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl p-6">
          <button onClick={() => setAuthPrompt(null)} className="absolute right-4 top-4 text-stone-400 hover:text-stone-600">
            <X className="h-5 w-5" />
          </button>
          <div className="mb-4">
            <h3 className="font-serif text-xl font-semibold text-stone-800">Admin Authorization</h3>
            <p className="text-sm text-stone-500 mt-1">
              Please enter your password to confirm this action.
            </p>
          </div>
          {authError && <div className="mb-4 rounded-xl bg-rose-50 p-3 text-center text-sm font-medium text-rose-600">{authError}</div>}
          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <input
                required
                type={showAuthPassword ? "text" : "password"}
                autoFocus
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className={`${inputClass} pr-12`}
                placeholder="Admin Password"
              />
              <button
                type="button"
                onClick={() => setShowAuthPassword(!showAuthPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
              >
                {showAuthPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={isAuthing}
              className="flex w-full justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-70"
            >
              {isAuthing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Action"}
            </button>
          </form>
        </div>
      </div>
    )}

    </>
  )
}
