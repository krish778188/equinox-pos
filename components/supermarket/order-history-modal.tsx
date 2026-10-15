"use client"

import { useState, useEffect } from "react"
import { X, Package, Calendar, Clock, ChevronRight, Printer, AlertCircle, CheckCircle2, RotateCcw, ArrowLeft, Loader2, Download } from "lucide-react"
import { formatCurrency } from "@/lib/pos-data"

export function OrderHistoryModal({
  isOpen,
  onClose,
  user
}: {
  isOpen: boolean
  onClose: () => void
  user: any
}) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  
  // Return request form state
  const [isReturnPromptOpen, setIsReturnPromptOpen] = useState(false)
  const [returnReason, setReturnReason] = useState("Product quality not as expected")
  const [customReason, setCustomReason] = useState("")
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false)
  const [returnSuccessMsg, setReturnSuccessMsg] = useState("")
  const [returnErrorMsg, setReturnErrorMsg] = useState("")

  const fetchOrders = async () => {
    if (!user) return
    setLoading(true)
    try {
      const param = user.email ? `email=${encodeURIComponent(user.email)}` : `phone=${encodeURIComponent(user.mobile || "")}`
      const res = await fetch(`/api/sales?${param}`)
      const data = await res.json()
      if (data.success && data.sales) {
        setOrders(data.sales)
      }
    } catch (err) {
      console.error("Failed to fetch user orders:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchOrders()
      setSelectedOrder(null)
      setIsReturnPromptOpen(false)
      setReturnSuccessMsg("")
      setReturnErrorMsg("")

      // Real-time polling while order history is open
      const interval = setInterval(() => {
        if (!user) return
        const param = user.email ? `email=${encodeURIComponent(user.email)}` : `phone=${encodeURIComponent(user.mobile || "")}`
        fetch(`/api/sales?${param}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.sales) {
              setOrders(data.sales)
              setSelectedOrder(prev => prev ? (data.sales.find((s: any) => s.id === prev.id) || prev) : null)
            }
          })
          .catch(console.error)
      }, 3500)

      return () => clearInterval(interval)
    }
  }, [isOpen, user])

  const handleInitiateReturn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) return

    setIsSubmittingReturn(true)
    setReturnErrorMsg("")
    setReturnSuccessMsg("")

    const finalReason = returnReason === "Other" ? (customReason || "Customer requested return") : returnReason
    const itemsSummary = selectedOrder.items?.map((it: any) => `${it.product_name} (x${it.quantity})`).join(", ") || "All order items"

    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          saleId: selectedOrder.id,
          billNo: selectedOrder.billNo,
          customerName: user.name || selectedOrder.customer_name,
          customerPhone: user.mobile || selectedOrder.customer_phone,
          customerEmail: user.email || selectedOrder.customer_email,
          amount: selectedOrder.total_amount,
          reason: finalReason,
          itemsSummary
        })
      })

      const data = await res.json()
      if (data.success) {
        setReturnSuccessMsg(data.message || "Your return request has been submitted. It will be reviewed and approved by admin within 48 hours.")
        setIsReturnPromptOpen(false)
        // Refresh orders list
        await fetchOrders()
        // Update selected order status locally
        setSelectedOrder((prev: any) => prev ? { ...prev, status: "Return Requested", isReturnEligible: false } : null)
      } else {
        setReturnErrorMsg(data.error || "Failed to submit return request")
      }
    } catch (err) {
      setReturnErrorMsg("Error contacting server. Please try again.")
    } finally {
      setIsSubmittingReturn(false)
    }
  }

  const handlePrintReceipt = (order: any) => {
    const printWindow = window.open('', '', 'width=600,height=750')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Bill Receipt - ${order.billNo}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 25px; color: #1c1917; }
            .header { text-align: center; border-bottom: 2px dashed #d6d3d1; padding-bottom: 15px; margin-bottom: 15px; }
            .store-name { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
            .meta { font-size: 12px; color: #78716c; line-height: 1.5; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px; }
            th { text-align: left; border-bottom: 1px solid #e7e5e4; padding: 8px 4px; font-size: 11px; text-transform: uppercase; color: #78716c; }
            td { padding: 8px 4px; border-bottom: 1px solid #f5f5f4; }
            .total-row { font-size: 16px; font-weight: bold; border-top: 2px solid #1c1917; padding-top: 10px; }
            .footer { margin-top: 25px; text-align: center; font-size: 11px; color: #78716c; border-top: 1px dashed #d6d3d1; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="store-name">EQUINOX SUPERMARKET</div>
            <div class="meta">
              Order No: <strong>${order.orderId || order.billNo}</strong><br/>
              Invoice No: <strong>${order.billNo}</strong><br/>
              Status: <strong>${order.status || 'Order Placed'}</strong><br/>
              Payment Method: <strong>${order.payment_method || 'UPI (krishraj453@okicici)'}</strong><br/>
              Payment ID: <strong>${order.payment_id || 'N/A'}</strong><br/>
              Date: ${new Date(order.created_at).toLocaleString('en-IN')}<br/>
              Customer: ${order.customer_name || user?.name || "Shopper"}<br/>
              Delivery Address: ${order.delivery_address || "Home Delivery"}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th style="text-align:right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map((it: any) => `
                <tr>
                  <td>${it.product_name || "Item"}</td>
                  <td>${it.quantity}</td>
                  <td>₹${it.price}</td>
                  <td style="text-align:right">₹${it.price * it.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="display:flex; justify-content:space-between; margin-top:15px; font-size:14px;">
            <span>Subtotal</span>
            <span>₹${order.total_amount}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:6px; font-size:16px; font-weight:bold; border-top:1px solid #1c1917; padding-top:8px;">
            <span>Grand Total Paid</span>
            <span>₹${order.total_amount}</span>
          </div>
          <div class="footer">
            <p><strong>Return Policy:</strong> Returns accepted within 7 days of delivery.<br/>
            Eligible for return until: <strong>${order.lastReturnDate}</strong></p>
            <p>Thank you for shopping with Equinox Supermarket!</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all">
      <div 
        className="relative flex flex-col w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-[0_30px_70px_rgba(0,0,0,0.2)] backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <div className="flex items-center gap-3">
            {selectedOrder ? (
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Package className="h-5 w-5" />
              </div>
            )}
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {selectedOrder ? `Order ${selectedOrder.orderId}` : "My Order History"}
              </h3>
              <p className="text-xs text-stone-400">
                {selectedOrder ? `Billed on ${new Date(selectedOrder.created_at).toLocaleDateString('en-IN')}` : `${orders.length} past orders placed`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Feedback Alert */}
        {returnSuccessMsg && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{returnSuccessMsg}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex h-60 flex-col items-center justify-center gap-2 text-stone-400">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              <p className="text-xs font-medium">Loading your orders...</p>
            </div>
          ) : selectedOrder ? (
            /* Detailed Order View */
            <div className="flex flex-col gap-5">
              {/* Status and 7-day Return Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-stone-50/80 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-500">Status:</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                      selectedOrder.status === "Refunded" || selectedOrder.return_status === "Approved"
                        ? "bg-purple-100 text-purple-800"
                        : selectedOrder.status === "Return Requested" || selectedOrder.return_status === "Pending"
                          ? "bg-amber-100 text-amber-800"
                          : selectedOrder.status === "Return Rejected" || selectedOrder.return_status === "Rejected"
                            ? "bg-rose-100 text-rose-800"
                            : selectedOrder.status === "Order Placed"
                              ? "bg-blue-100 text-blue-800 ring-1 ring-blue-300"
                              : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {selectedOrder.status === "Refunded" || selectedOrder.return_status === "Approved"
                        ? "Return Accepted & Refunded"
                        : selectedOrder.status === "Return Requested" || selectedOrder.return_status === "Pending"
                          ? "Pending for Approval"
                          : selectedOrder.status === "Return Rejected" || selectedOrder.return_status === "Rejected"
                            ? "Return Rejected"
                            : (selectedOrder.status || "Order Placed")}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-stone-600 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-stone-400" />
                    <span>Return Policy: <strong>7 days from delivery date</strong></span>
                  </div>
                  <div className="text-xs text-stone-600 flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-3.5 w-3.5 text-stone-400" />
                    <span>
                      {selectedOrder.status === "Order Placed" ? (
                        <strong className="text-blue-800">Order placed and being packed. Return window starts once marked Delivered.</strong>
                      ) : selectedOrder.isReturnEligible ? (
                        <>Eligible for return until: <strong className="text-emerald-800">{selectedOrder.lastReturnDate}</strong> ({selectedOrder.daysRemaining} days left)</>
                      ) : selectedOrder.status === "Refunded" || selectedOrder.return_status === "Approved" ? (
                        <strong className="text-purple-800">Refund completed for this order</strong>
                      ) : selectedOrder.status === "Return Rejected" || selectedOrder.return_status === "Rejected" ? (
                        <strong className="text-rose-700">Return request was reviewed and rejected</strong>
                      ) : selectedOrder.status === "Return Requested" || selectedOrder.return_status === "Pending" ? (
                        <strong className="text-amber-800">Return request is pending admin review</strong>
                      ) : (
                        <>Last date of return was: <strong className="text-stone-700">{selectedOrder.lastReturnDate}</strong> (Expired)</>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handlePrintReceipt(selectedOrder)}
                    className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 shadow-sm hover:bg-stone-50 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Bill
                  </button>
                  {selectedOrder.isReturnEligible && !isReturnPromptOpen && (
                    <button
                      type="button"
                      onClick={() => setIsReturnPromptOpen(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-amber-500/20 hover:bg-amber-600 transition"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Initiate Refund
                    </button>
                  )}
                </div>
              </div>

              {/* Status Informational Banners */}
              {(selectedOrder.status === "Return Requested" || selectedOrder.return_status === "Pending") && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Your return and refund request is currently <strong>Pending for Approval</strong> by the store admin (reviewed within 48 hours).</span>
                </div>
              )}

              {(selectedOrder.status === "Refunded" || selectedOrder.return_status === "Approved") && (
                <div className="rounded-2xl border border-purple-200 bg-purple-50 p-3 text-xs text-purple-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                  <span>Return <strong>Accepted &amp; Refunded</strong>. Full refund of {formatCurrency(selectedOrder.total_amount)} has been approved.</span>
                </div>
              )}

              {(selectedOrder.status === "Return Rejected" || selectedOrder.return_status === "Rejected") && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>Return Request <strong>Rejected</strong> by store admin. This order is not eligible for refund.</span>
                </div>
              )}

              {selectedOrder.status === "Order Placed" && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Your order has been <strong>Placed and is being processed</strong>. Once delivered by admin, you can initiate a return or exchange within 7 days.</span>
                </div>
              )}

              {!selectedOrder.isReturnEligible && 
                selectedOrder.status !== "Refunded" && 
                selectedOrder.return_status !== "Approved" && 
                selectedOrder.status !== "Return Requested" && 
                selectedOrder.return_status !== "Pending" && 
                selectedOrder.status !== "Return Rejected" && 
                selectedOrder.return_status !== "Rejected" &&
                selectedOrder.status !== "Order Placed" && (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-500 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-stone-400 shrink-0" />
                  <span>The 7-day return window for this order has expired. Orders can only be returned within 7 days of delivery.</span>
                </div>
              )}

              {/* Return Request Drawer / Prompt */}
              {isReturnPromptOpen && (
                <form onSubmit={handleInitiateReturn} className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-serif text-sm font-bold text-amber-900">Initiate Return &amp; Refund Request</h4>
                    <button type="button" onClick={() => setIsReturnPromptOpen(false)} className="text-amber-700 hover:text-amber-900">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="mb-3 rounded-xl bg-white/80 p-3 border border-amber-200/60 text-xs text-amber-800 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">Important Return Notice:</p>
                      <p className="mt-0.5 text-amber-700">
                        Your return request will be reviewed and approved by admin <strong>within 48 hours</strong>. Upon approval, full refund of {formatCurrency(selectedOrder.total_amount)} will be issued.
                      </p>
                    </div>
                  </div>

                  <label className="flex flex-col gap-1 text-xs">
                    <span className="font-semibold text-stone-700">Reason for Return</span>
                    <select
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs text-stone-800 outline-none focus:ring-2 focus:ring-amber-300"
                    >
                      <option>Product quality not as expected</option>
                      <option>Received damaged or leaking packaging</option>
                      <option>Expired or near-expiry product</option>
                      <option>Incorrect item delivered</option>
                      <option>No longer needed</option>
                      <option>Other</option>
                    </select>
                  </label>

                  {returnReason === "Other" && (
                    <input
                      type="text"
                      required
                      placeholder="Please describe the issue..."
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs text-stone-800 outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  )}

                  {returnErrorMsg && (
                    <p className="mt-2 text-xs font-semibold text-rose-600">{returnErrorMsg}</p>
                  )}

                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsReturnPromptOpen(false)}
                      className="rounded-xl px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReturn}
                      className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-amber-700 disabled:opacity-50"
                    >
                      {isSubmittingReturn ? <Loader2 className="h-3 w-3 animate-spin" /> : "Submit Return Request"}
                    </button>
                  </div>
                </form>
              )}

              {/* Items in Order */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Items in this Order</h4>
                <div className="flex flex-col gap-2">
                  {selectedOrder.items?.map((it: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between rounded-2xl border border-stone-100 bg-stone-50/60 p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-xl bg-white border border-stone-200/60 flex items-center justify-center shrink-0">
                          {it.image_url ? (
                            <img
                              src={it.image_url}
                              alt={it.product_name}
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80"
                              }}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xs">🛒</span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900">{it.product_name || "Product"}</p>
                          <p className="text-[11px] text-stone-400">Qty: {it.quantity} · {formatCurrency(it.price)} each</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-stone-800">
                        {formatCurrency(it.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Breakdown */}
              <div className="rounded-2xl border border-stone-100 bg-white p-4 text-xs">
                <div className="flex justify-between py-1 text-stone-500">
                  <span>Order ID</span>
                  <span className="font-semibold text-stone-800">{selectedOrder.orderId}</span>
                </div>
                <div className="flex justify-between py-1 text-stone-500">
                  <span>Invoice Number</span>
                  <span className="font-semibold text-stone-800">{selectedOrder.billNo}</span>
                </div>
                <div className="flex justify-between py-1 text-stone-500">
                  <span>Payment Method</span>
                  <span className="font-semibold text-stone-800">{selectedOrder.payment_method || "UPI (krishraj453@okicici)"}</span>
                </div>
                {selectedOrder.payment_id && (
                  <div className="flex justify-between py-1 text-stone-500">
                    <span>Payment / UTR Ref ID</span>
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {selectedOrder.payment_id}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1 text-stone-500">
                  <span>Delivery Address</span>
                  <span className="font-medium text-stone-800 text-right max-w-xs">{selectedOrder.delivery_address || "Home Address"}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-stone-100 pt-2 text-sm font-bold text-stone-900">
                  <span>Total Paid</span>
                  <span>{formatCurrency(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>
          ) : orders.length === 0 ? (
            /* No Orders */
            <div className="flex h-60 flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
                <Package className="h-7 w-7" />
              </div>
              <p className="font-serif text-base font-bold text-stone-800">No orders placed yet</p>
              <p className="text-xs text-stone-400 max-w-xs">
                Your completed orders, receipts, and 7-day return options will appear here.
              </p>
            </div>
          ) : (
            /* Orders List with 7-Day Return Banner */
            <div className="flex flex-col gap-3">
              {/* 7-Day Return Policy Banner */}
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-3 text-xs text-emerald-950">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
                  <RotateCcw className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[12px] text-emerald-900">7-Day Return &amp; Refund Guarantee</p>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Orders delivered within the last 7 days are eligible for easy returns. Click on any order to view details, download bill, or initiate refund.
                  </p>
                </div>
              </div>

              {orders.map((order) => {
                const isRefunded = order.status === "Refunded" || order.return_status === "Approved"
                const isRequested = order.status === "Return Requested" || order.return_status === "Pending"
                const isRejected = order.status === "Return Rejected" || order.return_status === "Rejected"
                const isEligible = order.isReturnEligible

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-stone-100 bg-white p-4 shadow-xs transition-all hover:border-emerald-200 hover:shadow-md cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-50 border border-stone-100 text-stone-600 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition shrink-0">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-sm font-bold text-stone-900">{order.orderId || order.billNo}</span>
                          <span className={`rounded-full px-2 py-0.2 text-[10px] font-bold uppercase tracking-wider ${
                            isRefunded
                              ? "bg-purple-100 text-purple-800"
                              : isRequested
                                ? "bg-amber-100 text-amber-800"
                                : isRejected
                                  ? "bg-rose-100 text-rose-800"
                                  : order.status === "Order Placed"
                                    ? "bg-blue-100 text-blue-800 ring-1 ring-blue-300"
                                    : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {isRefunded
                              ? "Accepted"
                              : isRequested
                                ? "Pending for Approval"
                                : isRejected
                                  ? "Rejected"
                                  : (order.status || "Order Placed")}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {order.items?.length || 1} items</span>
                          {order.payment_id && (
                            <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/80">
                              Ref: {order.payment_id}
                            </span>
                          )}
                        </p>
                        
                        {/* 7-Day Return Eligibility Status */}
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          {isRefunded ? (
                            <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200/60">
                              Return Accepted &amp; Refunded
                            </span>
                          ) : isRequested ? (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/60">
                              Pending for Approval (Within 48h)
                            </span>
                          ) : isRejected ? (
                            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200/60">
                              Return Rejected by Admin
                            </span>
                          ) : order.status === "Order Placed" ? (
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                              Order Placed · Awaiting Dispatch
                            </span>
                          ) : isEligible ? (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                              Eligible for 7d Return ({order.daysRemaining}d left)
                            </span>
                          ) : (
                            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-500">
                              Return Window Expired (7d passed)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 shrink-0">
                      <span className="font-serif text-base font-extrabold text-stone-900">
                        {formatCurrency(order.total_amount)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-stone-400 group-hover:translate-x-0.5 group-hover:text-emerald-700 transition" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
