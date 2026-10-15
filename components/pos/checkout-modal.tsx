"use client"

import { useState, useEffect } from "react"
import { X, Loader2, Printer, CheckCircle2, ShoppingBag, ShieldCheck, MapPin } from "lucide-react"
import { formatCurrency, type Product } from "@/lib/pos-data"

type CartItem = Product & { quantity: number }

type CheckoutModalProps = {
  items: CartItem[]
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user?: any
  onUpdateUser?: (updated: any) => void
}

export function CheckoutModal({ items, isOpen, onClose, onSuccess, user, onUpdateUser }: CheckoutModalProps) {
  const [step, setStep] = useState<"form" | "receipt">("form")
  const [isProcessing, setIsProcessing] = useState(false)
  const [receipt, setReceipt] = useState<any>(null)
  const [saveAsDefault, setSaveAsDefault] = useState(true)
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.mobile || user?.phone || "",
    address: user?.address || "",
    carryBags: 0,
  })

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

  if (!isOpen) return null

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

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items: finalItems,
          customer: {
            name: formData.name,
            phone: formData.phone,
            address: formData.address
          },
          deliveryAddress: formData.address
        }),
      })

      if (!response.ok) throw new Error("Failed to process order")
      
      const data = await response.json()
      setReceipt({
        ...data.receipt,
        billNo: data.billNo,
        orderId: data.orderId || `ORD-${data.billNo}`,
        customer: formData
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-10 bg-black/40 backdrop-blur-md print:backdrop-blur-none print:bg-white print:p-0">
      <div className="relative w-full max-w-md max-h-[88vh] overflow-y-auto rounded-3xl bg-white shadow-2xl print:w-full print:max-w-none print:max-h-none print:overflow-visible print:shadow-none print:rounded-none">
        
        {step === "form" && (
          <>
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900">Delivery &amp; Checkout</h2>
                <p className="text-xs text-stone-400">Confirm delivery address and contact details</p>
              </div>
              <button onClick={onClose} className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleProcessPayment} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-2.5 text-sm text-stone-800 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10" placeholder="e.g. Rahul Sharma" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Mobile Number</label>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-2.5 text-sm text-stone-800 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10" placeholder="+91 98765 43210" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Delivery Address
                  </label>
                  <span className="text-[10px] text-stone-400">Editable</span>
                </div>
                <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-2.5 text-sm text-stone-800 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 resize-none" rows={2} placeholder="Flat / House No, Apartment, Street, City" />
                <label className="flex items-center gap-2 cursor-pointer mt-0.5">
                  <input
                    type="checkbox"
                    checked={saveAsDefault}
                    onChange={e => setSaveAsDefault(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] font-medium text-stone-500">Save as my default delivery address</span>
                </label>
              </div>
              
              <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-stone-50/60 p-3.5">
                <div>
                  <p className="text-sm font-semibold text-stone-800">Add Eco Carry Bags</p>
                  <p className="text-xs text-stone-500">₹10.00 each</p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setFormData(p => ({...p, carryBags: Math.max(0, p.carryBags - 1)}))} className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 font-bold">-</button>
                  <span className="w-4 text-center text-sm font-bold text-stone-800">{formData.carryBags}</span>
                  <button type="button" onClick={() => setFormData(p => ({...p, carryBags: p.carryBags + 1}))} className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 font-bold">+</button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-70"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Place Supermarket Order"}
              </button>
            </form>
          </>
        )}

        {step === "receipt" && receipt && (
          <div id="checkout-receipt">
            <div className="p-8 text-center border-b border-dashed border-stone-200">
              <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900">Order Placed Successfully!</h2>
              <p className="text-xs text-emerald-700 font-semibold mt-1">Equinox Supermarket · Express Delivery</p>
              <div className="mt-4 pt-4 border-t border-stone-100 text-left text-xs text-stone-600 space-y-1">
                <p><span className="font-semibold text-stone-900">Order ID:</span> {receipt.orderId || `ORD-${receipt.billNo}`}</p>
                <p><span className="font-semibold text-stone-900">Invoice No:</span> #{receipt.billNo}</p>
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
                  <span>Grand Total Paid</span>
                  <span>{formatCurrency(receipt.grand_total)}</span>
                </div>
              </div>

              {/* 7-Day Return Policy Notice */}
              <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-[11px] text-stone-600">
                <p className="font-bold text-stone-900 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  7-Day Return Guarantee
                </p>
                <p className="leading-relaxed">
                  You can initiate a return or refund for this order directly from your <strong>Order History</strong> tab within 7 days of delivery.
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
