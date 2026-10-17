"use client"

import { useState } from "react"
import { Minus, Plus, Trash2, ShoppingBag, Zap, ShieldCheck, Tag, ArrowRight, MapPin } from "lucide-react"
import { formatCurrency, type Product } from "@/lib/pos-data"
import { CheckoutModal } from "@/components/pos/checkout-modal"

export type CartItem = Product & { quantity: number }

export function SupermarketCart({
  items,
  onIncrement,
  onDecrement,
  onRemove,
  onClear,
  user,
  onUpdateUser,
  onChangeAddress
}: {
  items: CartItem[]
  onIncrement: (id: string) => void
  onDecrement: (id: string) => void
  onRemove: (id: string) => void
  onClear: () => void
  user: any
  onUpdateUser?: (updated: any) => void
  onChangeAddress?: () => void
}) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const safeItems = items || []
  const subtotal = safeItems.reduce((sum, item) => sum + (Number(item?.price) || 0) * (Number(item?.quantity) || 1), 0)
  const mrpTotal = safeItems.reduce((sum, item) => sum + (Number(item?.mrp) || (Number(item?.price) || 0) * 1.2) * (Number(item?.quantity) || 1), 0)
  const savings = Math.max(0, mrpTotal - subtotal)
  
  const deliveryFee = safeItems.length === 0 || subtotal >= 200 ? 0 : 35
  const handlingFee = safeItems.length === 0 ? 0 : 5
  const tax = safeItems.reduce((sum, item) => sum + (Number(item?.price) || 0) * (Number(item?.quantity) || 1) * 0.02, 0)
  const grandTotal = subtotal + deliveryFee + handlingFee + tax
  const itemCount = safeItems.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0)

  return (
    <>
      <aside className="flex w-full lg:w-[380px] shrink-0 flex-col rounded-3xl border border-white/80 bg-white/85 shadow-[0_20px_50px_rgba(40,30,20,0.06)] backdrop-blur-2xl">
        {/* Basket Header */}
        <div className="flex items-center justify-between px-5 pb-3.5 pt-5 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold tracking-tight text-stone-900">My Basket</h2>
              <p className="text-[11px] font-medium text-stone-400">
                {itemCount > 0 ? `${itemCount} item${itemCount > 1 ? "s" : ""} added` : "Empty basket"}
              </p>
            </div>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-full border border-stone-200/80 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-stone-500 hover:text-rose-600 transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* Delivering To Pill */}
        {user?.address ? (
          <div className="mx-4 mt-3 flex items-center gap-2 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 px-3 py-2 text-[11px] text-emerald-900 shadow-xs">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <MapPin className="h-4 w-4 text-emerald-700 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[10px] uppercase tracking-wider text-emerald-700">Delivering To</p>
                <p className="truncate font-semibold text-emerald-950" title={user.address}>
                  {user.address}
                </p>
              </div>
            </div>
            {onChangeAddress && (
              <button
                type="button"
                onClick={onChangeAddress}
                className="shrink-0 rounded-xl bg-white/90 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold text-emerald-800 hover:bg-emerald-700 hover:text-white transition cursor-pointer shadow-2xs"
              >
                Change
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onChangeAddress}
            className="mx-4 mt-3 flex items-center justify-between rounded-2xl bg-amber-50/90 border border-amber-200/90 px-3 py-2 text-[11px] text-amber-950 hover:bg-amber-100/90 transition shadow-xs text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <MapPin className="h-4 w-4 text-amber-700 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-[10px] uppercase tracking-wider text-amber-700">Delivering To</p>
                <p className="font-semibold text-amber-900">No address added</p>
              </div>
            </div>
            <span className="ml-2 rounded-xl bg-white border border-amber-200 px-2.5 py-1 text-[10px] font-bold text-amber-800 group-hover:bg-amber-700 group-hover:text-white transition shrink-0 shadow-2xs">
              + Add Address
            </span>
          </button>
        )}

        {/* Items List */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-3 pb-24">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-stone-50 border border-stone-100 text-stone-300">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <div>
                <p className="font-serif text-base font-bold text-stone-800">Your basket is empty</p>
                <p className="mt-1 text-xs text-stone-400 max-w-[200px]">
                  Explore farm fresh vegetables, daily groceries &amp; snacks to get started!
                </p>
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="group flex items-center gap-3 rounded-2xl border border-stone-100 bg-white/90 p-2.5 shadow-xs transition-all hover:border-emerald-200"
                >
                  <div className="h-12 w-12 overflow-hidden rounded-xl bg-stone-50 border border-stone-100 shrink-0 flex items-center justify-center">
                    <img
                      src={item.image_url || "https://images.unsplash.com/photo-1584473457406-624048518851?w=200&auto=format&fit=crop&q=80"}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1584473457406-624048518851?w=200&auto=format&fit=crop&q=80"
                      }}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-stone-900 leading-tight">{item.name}</p>
                    <p className="text-[10px] font-medium text-stone-400 mt-0.5">
                      {formatCurrency(item.price)} {item.unit ? `· ${item.unit}` : ""}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center rounded-xl bg-stone-50 border border-stone-200/80 p-0.5">
                    <button
                      type="button"
                      onClick={() => onDecrement(item.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-stone-600 shadow-xs hover:bg-stone-100 transition active:scale-90"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-stone-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={item.quantity >= item.stock}
                      onClick={() => onIncrement(item.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-stone-600 shadow-xs hover:bg-stone-100 transition active:scale-90 disabled:opacity-40"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <span className="w-14 text-right text-xs font-extrabold text-stone-900">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bottom Bill Summary */}
        <div className="rounded-b-3xl border-t border-stone-100 bg-white/95 px-5 py-4">
          <div className="flex flex-col gap-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span className="text-stone-400">Item Total</span>
              <span className="font-semibold text-stone-800">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Delivery Fee</span>
              {items.length === 0 ? (
                <span className="font-semibold text-stone-500">₹0.00</span>
              ) : subtotal >= 200 ? (
                <span className="font-bold text-emerald-700">FREE</span>
              ) : (
                <span className="font-semibold text-stone-800">{formatCurrency(deliveryFee)}</span>
              )}
            </div>
            {items.length > 0 && subtotal < 200 && (
              <p className="text-[10px] text-emerald-700 bg-emerald-50 rounded px-2 py-0.5">
                Add {formatCurrency(200 - subtotal)} more for FREE delivery!
              </p>
            )}
            <div className="flex justify-between">
              <span className="text-stone-400">Taxes &amp; Packaging</span>
              <span className="font-semibold text-stone-800">{formatCurrency(tax + handlingFee)}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50/70 rounded p-1 text-[11px]">
                <span>Total Savings</span>
                <span>-{formatCurrency(savings)}</span>
              </div>
            )}
            <div className="mt-1 flex items-baseline justify-between border-t border-dashed border-stone-200 pt-2">
              <span className="font-bold text-stone-900 text-sm">To Pay</span>
              <span className="font-serif text-2xl font-extrabold text-stone-900">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCheckoutOpen(true)}
            disabled={items.length === 0}
            className="mt-3.5 flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/25 transition-all hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-200 disabled:from-stone-200 disabled:to-stone-200 disabled:text-stone-400 disabled:shadow-none"
          >
            <span>Proceed to Checkout</span>
            <div className="flex items-center gap-1.5">
              <span>{formatCurrency(grandTotal)}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>
          
          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Safe &amp; contactless delivery · Easy 7-day returns</span>
          </div>
        </div>
      </aside>

      <CheckoutModal
        items={items}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => {
          setIsCheckoutOpen(false)
          onClear()
        }}
        user={user}
        onUpdateUser={onUpdateUser}
      />
    </>
  )
}
