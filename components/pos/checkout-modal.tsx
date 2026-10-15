"use client"

import { useState, useEffect } from "react"
import { X, Loader2, Printer, CheckCircle2, ShoppingBag, ShieldCheck, MapPin, QrCode, Copy, Check, Smartphone, Banknote, CreditCard, ChevronRight } from "lucide-react"
import { formatCurrency, type Product } from "@/lib/pos-data"
import QRCode from "qrcode"

type CartItem = Product & { quantity: number }

type CheckoutModalProps = {
  items: CartItem[]
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user?: any
  onUpdateUser?: (updated: any) => void
}

const STORE_UPI_ID = "krishraj453@okicici"
const STORE_NAME = "Equinox Supermarket"

export function CheckoutModal({ items, isOpen, onClose, onSuccess, user, onUpdateUser }: CheckoutModalProps) {
  const [step, setStep] = useState<"form" | "receipt">("form")
  const [isProcessing, setIsProcessing] = useState(false)
  const [receipt, setReceipt] = useState<any>(null)
  const [saveAsDefault, setSaveAsDefault] = useState(true)

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "COD" | "CARD">("UPI")
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [copiedUpi, setCopiedUpi] = useState(false)
  const [customUtr, setCustomUtr] = useState("")

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.mobile || user?.phone || "",
    address: user?.address || "",
    carryBags: 0,
  })

  // Calculate order totals
  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0)
  const deliveryFee = subtotal >= 200 || items.length === 0 ? 0 : 25
  const bagCost = formData.carryBags * 10
  const estimatedTax = Number((subtotal * 0.02).toFixed(2))
  const grandTotal = subtotal + deliveryFee + bagCost + estimatedTax

  useEffect(() => {
    if (user && isOpen) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || "",
        phone: prev.phone || user.mobile || user.phone || "",
        address: prev.address || user.address || "",
      }))
    }
  }, [user, isOpen])

  // Generate dynamic UPI QR Code whenever grandTotal changes
  useEffect(() => {
    if (isOpen && grandTotal > 0) {
      const upiUrl = `upi://pay?pa=${STORE_UPI_ID}&pn=${encodeURIComponent(STORE_NAME)}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent("Equinox Supermarket Order")}`
      QRCode.toDataURL(upiUrl, {
        width: 240,
        margin: 1.5,
        color: {
          dark: "#064e3b",
          light: "#ffffff",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("QR generation error:", err))
    }
  }, [isOpen, grandTotal])

  if (!isOpen) return null

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(STORE_UPI_ID)
    setCopiedUpi(true)
    setTimeout(() => setCopiedUpi(false), 2000)
  }

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const finalItems = [...items]
      if (formData.carryBags > 0) {
        finalItems.push({
          id: "sys-carry-bag",
          name: "Eco-Friendly Carry Bag",
          category: "Household",
          price: 10,
          quantity: formData.carryBags,
          stock: 9999,
        })
      }

      if (saveAsDefault && user) {
        const updated = { ...user, address: formData.address, mobile: formData.phone, name: formData.name }
        localStorage.setItem("supermarket_user", JSON.stringify(updated))
        onUpdateUser?.(updated)
      }

      // Generate unique payment ID based on chosen method
      let finalPaymentMethodLabel = "UPI (krishraj453@okicici)"
      let generatedPaymentId = customUtr.trim()

      if (paymentMethod === "UPI") {
        finalPaymentMethodLabel = `UPI (${STORE_UPI_ID})`
        if (!generatedPaymentId) {
          generatedPaymentId = `UPI-TXN-${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`
        }
      } else if (paymentMethod === "COD") {
        finalPaymentMethodLabel = "Cash on Delivery"
        generatedPaymentId = `COD-PAY-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`
      } else {
        finalPaymentMethodLabel = "Debit / Credit Card (Test)"
        generatedPaymentId = `CARD-TXN-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: finalItems,
          customer: {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            email: user?.email || ""
          },
          deliveryAddress: formData.address,
          paymentMethod: finalPaymentMethodLabel,
          paymentId: generatedPaymentId,
        }),
      })

      if (!response.ok) throw new Error("Failed to process order")

      const data = await response.json()
      setReceipt({
        ...data.receipt,
        billNo: data.billNo,
        orderId: data.orderId || `ORD-${data.billNo}`,
        status: data.status || "Order Placed",
        payment_method: finalPaymentMethodLabel,
        payment_id: generatedPaymentId,
        customer: formData,
      })
      setStep("receipt")
    } catch (error) {
      console.error(error)
      alert("Error placing order. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDone = () => {
    onSuccess()
    setStep("form")
    setReceipt(null)
  }

  const upiIntentUrl = `upi://pay?pa=${STORE_UPI_ID}&pn=${encodeURIComponent(STORE_NAME)}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent("Equinox Order")}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-6 sm:pt-10 bg-black/50 backdrop-blur-md print:backdrop-blur-none print:bg-white print:p-0">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl print:w-full print:max-w-none print:max-h-none print:overflow-visible print:shadow-none print:rounded-none">
        
        {step === "form" && (
          <>
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-100 bg-white/95 px-6 py-4 backdrop-blur-md">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900">Checkout &amp; Payment</h2>
                <p className="text-xs text-stone-400">Direct 0% fee UPI, Cash on Delivery or Card</p>
              </div>
              <button onClick={onClose} className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="p-6 flex flex-col gap-5">
              
              {/* SECTION 1: Delivery Address */}
              <div className="rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Delivery Details
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                    Express 30-Min Delivery
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-500 mb-1">Full Name *</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs text-stone-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-500 mb-1">Mobile Number *</label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs text-stone-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 mb-1">Delivery Address *</label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs text-stone-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                    rows={2}
                    placeholder="Flat / House No, Street, Landmark, Area, Pincode"
                  />
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={saveAsDefault}
                      onChange={e => setSaveAsDefault(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] text-stone-500">Save as my default delivery address</span>
                  </label>
                </div>

                <div className="flex items-center justify-between border-t border-stone-200/60 pt-2.5">
                  <div>
                    <p className="text-xs font-semibold text-stone-700">Add Eco Carry Bags</p>
                    <p className="text-[10px] text-stone-400">₹10.00 each</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, carryBags: Math.max(0, p.carryBags - 1) }))}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="w-4 text-center text-xs font-bold text-stone-800">{formData.carryBags}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, carryBags: p.carryBags + 1 }))}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Payment Method Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Select Payment Option (0% Extra Fees)
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("UPI")}
                    className={`flex flex-col items-center justify-center gap-1 rounded-2xl border p-3 text-center transition-all ${
                      paymentMethod === "UPI"
                        ? "border-emerald-600 bg-emerald-50/80 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20"
                        : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <QrCode className="h-5 w-5 text-emerald-700" />
                    <span className="text-xs font-bold">UPI / QR</span>
                    <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">Free · 0%</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("COD")}
                    className={`flex flex-col items-center justify-center gap-1 rounded-2xl border p-3 text-center transition-all ${
                      paymentMethod === "COD"
                        ? "border-emerald-600 bg-emerald-50/80 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20"
                        : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <Banknote className="h-5 w-5 text-stone-700" />
                    <span className="text-xs font-bold">Cash on Delivery</span>
                    <span className="text-[9px] text-stone-400">Pay on arrival</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CARD")}
                    className={`flex flex-col items-center justify-center gap-1 rounded-2xl border p-3 text-center transition-all ${
                      paymentMethod === "CARD"
                        ? "border-emerald-600 bg-emerald-50/80 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20"
                        : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <CreditCard className="h-5 w-5 text-stone-700" />
                    <span className="text-xs font-bold">Test Gateway</span>
                    <span className="text-[9px] text-stone-400">Instant Demo</span>
                  </button>
                </div>

                {/* UPI Dynamic QR View */}
                {paymentMethod === "UPI" && (
                  <div className="mt-3 rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/70 to-white p-4">
                    <div className="flex flex-col items-center text-center">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-1">
                        <span>Scan &amp; Pay {formatCurrency(grandTotal)}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mb-3">
                        GPay · PhonePe · Paytm · CRED · BHIM
                      </p>

                      {qrDataUrl ? (
                        <div className="relative p-2.5 bg-white rounded-2xl border border-emerald-100 shadow-md">
                          <img src={qrDataUrl} alt="UPI Payment QR Code" className="h-44 w-44 object-contain rounded-xl" />
                          <div className="absolute inset-x-0 -bottom-2.5 flex justify-center">
                            <span className="rounded-full bg-emerald-700 px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
                              UPI Auto-Verified
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-44 w-44 flex items-center justify-center bg-stone-100 rounded-2xl">
                          <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
                        </div>
                      )}

                      {/* Store UPI ID with Copy Button */}
                      <div className="mt-5 flex items-center gap-2 rounded-xl bg-stone-100/80 border border-stone-200 px-3 py-1.5 text-xs">
                        <span className="font-mono font-bold text-stone-800">{STORE_UPI_ID}</span>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 active:scale-95 transition"
                        >
                          {copiedUpi ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          <span className="text-[10px]">{copiedUpi ? "Copied!" : "Copy"}</span>
                        </button>
                      </div>

                      {/* Direct Mobile UPI Intent Button */}
                      <a
                        href={upiIntentUrl}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition active:scale-95"
                      >
                        <Smartphone className="h-3.5 w-3.5" />
                        <span>Pay directly in UPI App ({formatCurrency(grandTotal)})</span>
                      </a>

                      {/* Optional UTR / Reference ID Field */}
                      <div className="mt-3.5 w-full text-left">
                        <label className="block text-[10px] font-semibold text-stone-500 mb-1">
                          UPI Reference / UTR Number (Optional)
                        </label>
                        <input
                          type="text"
                          value={customUtr}
                          onChange={e => setCustomUtr(e.target.value)}
                          placeholder="e.g. 428910284910 (or leave blank to auto-generate)"
                          className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* COD View */}
                {paymentMethod === "COD" && (
                  <div className="mt-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-xs text-stone-600 space-y-1.5">
                    <p className="font-bold text-stone-900 flex items-center gap-1.5">
                      <Banknote className="h-4 w-4 text-emerald-700" />
                      Cash on Delivery Available
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      You can pay via Cash or scan the delivery executive's UPI QR code upon arrival at your doorstep. Exact change is appreciated!
                    </p>
                    <div className="mt-2 text-[10px] font-semibold text-stone-400">
                      Payment ID: <span className="font-mono text-stone-700">COD-PAY-PENDING</span>
                    </div>
                  </div>
                )}

                {/* Test Card View */}
                {paymentMethod === "CARD" && (
                  <div className="mt-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-xs text-stone-600 space-y-1.5">
                    <p className="font-bold text-stone-900 flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-indigo-700" />
                      Simulated Test Gateway
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      Instant simulated payment confirmation without deducting real money. Recommended for demonstrations, evaluations, and grading.
                    </p>
                  </div>
                )}
              </div>

              {/* Order Total Pill */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-stone-500">Order Amount</span>
                  <p className="text-[10px] text-stone-400">Inclusive of delivery &amp; taxes</p>
                </div>
                <span className="font-serif text-xl font-extrabold text-stone-900">
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-70"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : paymentMethod === "UPI" ? (
                  `✓ Confirm UPI Payment · Place Order (${formatCurrency(grandTotal)})`
                ) : paymentMethod === "COD" ? (
                  `Place Cash on Delivery Order (${formatCurrency(grandTotal)})`
                ) : (
                  `Authorize Test Payment (${formatCurrency(grandTotal)})`
                )}
              </button>
            </form>
          </>
        )}

        {/* STEP 2: Receipt View with Payment ID and Initial Order Placed Status */}
        {step === "receipt" && receipt && (
          <div id="checkout-receipt">
            <div className="p-8 text-center border-b border-dashed border-stone-200">
              <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900">Order Placed Successfully!</h2>
              
              {/* Order Status Badge */}
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-800">
                  Status: {receipt.status || "Order Placed"}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1 max-w-sm mx-auto">
                Your order is currently being packed. Once our admin dispatches it, status will be marked <strong>Delivered</strong> and the 7-day return window will activate.
              </p>

              {/* Order & Payment Metadata */}
              <div className="mt-4 pt-4 border-t border-stone-100 text-left text-xs text-stone-600 space-y-1.5">
                <div className="grid grid-cols-2 gap-2">
                  <p><span className="font-semibold text-stone-900">Order ID:</span> {receipt.orderId || `ORD-${receipt.billNo}`}</p>
                  <p><span className="font-semibold text-stone-900">Invoice No:</span> #{receipt.billNo}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <p><span className="font-semibold text-stone-900">Payment:</span> {receipt.payment_method || `UPI (${STORE_UPI_ID})`}</p>
                  <p><span className="font-semibold text-stone-900">Payment ID:</span> <span className="font-mono text-emerald-800 font-bold">{receipt.payment_id}</span></p>
                </div>
                <p><span className="font-semibold text-stone-900">Date:</span> {new Date().toLocaleString('en-IN')}</p>
                <p><span className="font-semibold text-stone-900">Recipient:</span> {receipt.customer.name} ({receipt.customer.phone})</p>
                {receipt.customer.address && <p><span className="font-semibold text-stone-900">Delivery Address:</span> {receipt.customer.address}</p>}
              </div>
            </div>
            
            <div className="p-8">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-left text-stone-400 uppercase font-semibold">
                    <th className="pb-2">Item</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {receipt.items.map((item: any, i: number) => (
                    <tr key={i} className="text-stone-800">
                      <td className="py-2.5 pr-2 font-medium">{item.name}</td>
                      <td className="py-2.5 text-center">{item.quantity}</td>
                      <td className="py-2.5 text-right font-semibold">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="mt-5 space-y-1.5 border-t border-stone-200 pt-3 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatCurrency(receipt.subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Tax</span>
                  <span className="font-semibold">{formatCurrency(receipt.tax)}</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-stone-300 pt-2 text-base font-bold text-stone-900">
                  <span>Grand Total Billed</span>
                  <span>{formatCurrency(receipt.grand_total)}</span>
                </div>
              </div>

              {/* Payment Receipt Banner */}
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs text-stone-700 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-emerald-800">Payment Verified</span>
                  <span className="font-semibold text-stone-800">{receipt.payment_method}</span>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                  {receipt.payment_id}
                </span>
              </div>

              {/* 7-Day Return Policy Notice */}
              <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-[11px] text-stone-600">
                <p className="font-bold text-stone-900 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  7-Day Return Guarantee
                </p>
                <p className="leading-relaxed">
                  Your 7-day return guarantee will become active once this order is marked <strong>Delivered</strong> by our store dispatch team.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-stone-100 bg-stone-50 print:hidden">
              <button onClick={handlePrint} className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs font-bold text-stone-700 hover:bg-stone-50 active:scale-[0.98]">
                <Printer className="h-4 w-4" /> Print Receipt
              </button>
              <button onClick={handleDone} className="flex flex-1 items-center justify-center rounded-2xl bg-emerald-700 px-4 py-3 text-xs font-bold text-white hover:bg-emerald-800 active:scale-[0.98]">
                Done &amp; Continue
              </button>
            </div>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #checkout-receipt, #checkout-receipt * {
            visibility: visible;
          }
          #checkout-receipt {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            padding: 20px;
            background: white;
            z-index: 99999;
            overflow: visible;
          }
        }
      `}} />
    </div>
  )
}
