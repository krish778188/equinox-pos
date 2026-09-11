"use client"

import { useState } from "react"
import { X, Loader2, Printer } from "lucide-react"
import { formatCurrency, type Product } from "@/lib/pos-data"

type CartItem = Product & { quantity: number }

type CheckoutModalProps = {
  items: CartItem[]
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CheckoutModal({ items, isOpen, onClose, onSuccess }: CheckoutModalProps) {
  const [step, setStep] = useState<"form" | "receipt">("form")
  const [isProcessing, setIsProcessing] = useState(false)
  const [receipt, setReceipt] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    carryBags: 0,
    discountCode: "",
  })

  if (!isOpen) return null

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    try {
      const finalItems = [...items]
      if (formData.carryBags > 0) {
        finalItems.push({
          id: "sys-carry-bag",
          name: "Carry Bag",
          category: "Accessories",
          price: 10, // INR 10
          quantity: formData.carryBags,
          stock: 9999,
        })
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items: finalItems,
          discountCode: formData.discountCode,
          customer: {
            name: formData.name,
            phone: formData.phone,
            address: formData.address
          }
        }),
      })

      if (!response.ok) throw new Error("Failed to process payment")
      
      const data = await response.json()
      setReceipt({
        ...data.receipt,
        billNo: data.billNo,
        customer: formData
      })
      setStep("receipt")
    } catch (error) {
      console.error(error)
      alert("Error processing payment.")
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
    setFormData({ name: "", phone: "", address: "", carryBags: 0, discountCode: "" })
    setReceipt(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-10 bg-stone-900/40 backdrop-blur-sm print:backdrop-blur-none print:bg-white print:p-0">
      <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl bg-white shadow-2xl print:w-full print:max-w-none print:max-h-none print:overflow-visible print:shadow-none print:rounded-none">
        
        {step === "form" && (
          <>
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <h2 className="font-serif text-xl font-semibold text-stone-800">Checkout Details</h2>
              <button onClick={onClose} className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleProcessPayment} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-600">Customer Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/10" placeholder="John Doe" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-600">Phone Number</label>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/10" placeholder="+91 98765 43210" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-600">Address (Optional)</label>
                <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/10 resize-none" rows={2} placeholder="123 Main St..." />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-600">Discount / Return Code (Optional)</label>
                <input type="text" value={formData.discountCode} onChange={e => setFormData({...formData, discountCode: e.target.value})} className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/10" placeholder="e.g. RET-1234" />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-stone-200 p-4">
                <div>
                  <p className="text-sm font-medium text-stone-800">Add Carry Bags</p>
                  <p className="text-xs text-stone-500">₹10.00 each</p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setFormData(p => ({...p, carryBags: Math.max(0, p.carryBags - 1)}))} className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">-</button>
                  <span className="w-4 text-center text-sm font-medium">{formData.carryBags}</span>
                  <button type="button" onClick={() => setFormData(p => ({...p, carryBags: p.carryBags + 1}))} className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">+</button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isProcessing}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-stone-800 px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-stone-700 active:scale-[0.98] disabled:opacity-70"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm & Pay"}
              </button>
            </form>
          </>
        )}

        {step === "receipt" && receipt && (
          <div id="checkout-receipt">
            <div className="p-8 text-center border-b border-dashed border-stone-200">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-800">Equinox POS</h2>
              <p className="text-sm text-stone-500 mt-1">123 Retail Avenue, Tech District</p>
              <p className="text-sm text-stone-500">Phone: +91 800 555 0199</p>
              <div className="mt-4 pt-4 border-t border-stone-100 text-left">
                <p className="text-sm"><span className="font-medium text-stone-800">Bill No:</span> #{receipt.billNo}</p>
                <p className="text-sm"><span className="font-medium text-stone-800">Date:</span> {new Date().toLocaleString()}</p>
                <p className="text-sm mt-2"><span className="font-medium text-stone-800">Customer:</span> {receipt.customer.name}</p>
                <p className="text-sm"><span className="font-medium text-stone-800">Phone:</span> {receipt.customer.phone}</p>
                {receipt.customer.address && <p className="text-sm"><span className="font-medium text-stone-800">Address:</span> {receipt.customer.address}</p>}
              </div>
            </div>
            
            <div className="p-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left text-stone-500">
                    <th className="pb-2 font-medium">Item</th>
                    <th className="pb-2 font-medium text-center">Qty</th>
                    <th className="pb-2 font-medium text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {receipt.items.map((item: any, i: number) => (
                    <tr key={i} className="text-stone-800">
                      <td className="py-3 pr-2">{item.name}</td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="mt-6 space-y-2 border-t border-stone-200 pt-4 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(receipt.subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Tax</span>
                  <span>{formatCurrency(receipt.tax)}</span>
                </div>
                {receipt.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount {receipt.discount_name ? `(${receipt.discount_name})` : ''}</span>
                    <span>-{formatCurrency(receipt.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-dashed border-stone-300 pt-3 text-lg font-bold text-stone-900">
                  <span>Total</span>
                  <span>{formatCurrency(receipt.grand_total)}</span>
                </div>
              </div>
              
              <div className="mt-8 text-center text-xs text-stone-400">
                Thank you for shopping with us!
              </div>

              {/* Terms & Conditions */}
              <div className="mt-6 border-t border-dashed border-stone-200 pt-5">
                <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-3">Terms & Conditions</p>
                <ol className="list-decimal list-inside space-y-1.5 text-[10px] text-stone-400 leading-relaxed">
                  <li>Items can be returned or exchanged within <strong className="text-stone-500">7 days</strong> of purchase with the original receipt.</li>
                  <li>Products must be unused, undamaged, and in their original packaging for a valid return.</li>
                  <li>Refunds will be issued as a store credit code redeemable on your next purchase.</li>
                  <li>Electronics and perishable goods are <strong className="text-stone-500">non-returnable</strong> once opened.</li>
                  <li>Equinox POS is not responsible for damage caused by misuse or improper handling.</li>
                  <li>Prices are inclusive of applicable taxes. All sales are subject to availability.</li>
                  <li>For support, contact us at support@equinoxpos.com or visit our store.</li>
                </ol>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-stone-100 bg-stone-50 print:hidden">
              <button onClick={handlePrint} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 active:scale-[0.98]">
                <Printer className="h-4 w-4" /> Print Receipt
              </button>
              <button onClick={handleDone} className="flex flex-1 items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-[0.98]">
                Done
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
