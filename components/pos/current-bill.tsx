"use client"

import { useState } from "react"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { formatCurrency, type Product } from "@/lib/pos-data"
import { CheckoutModal } from "./checkout-modal"

export type CartItem = Product & { quantity: number }

export function CurrentBill({
  items,
  onIncrement,
  onDecrement,
  onRemove,
  onClear,
}: {
  items: CartItem[]
  onIncrement: (id: string) => void
  onDecrement: (id: string) => void
  onRemove: (id: string) => void
  onClear: () => void
}) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = items.reduce((sum, item) => sum + item.price * item.quantity * (item.category === "Electronics" ? 0.10 : 0.02), 0)
  const total = subtotal + tax
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      <aside className="flex w-full lg:w-[400px] shrink-0 flex-col rounded-3xl border border-white/70 bg-white/80 shadow-[0_20px_50px_rgba(120,90,60,0.1)] backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 pb-4 pt-6">
          <div>
            <h2 className="font-serif text-xl font-semibold tracking-tight text-stone-800">Current Bill</h2>
            <p className="text-xs font-medium text-stone-400">
              {itemCount > 0 ? `${itemCount} item${itemCount > 1 ? "s" : ""} · Terminal 01` : "Register open · Terminal 01"}
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-full border border-stone-200/70 bg-white/60 px-3 py-1.5 text-xs font-medium text-stone-500 transition-all duration-200 hover:text-rose-600 active:scale-95"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="mx-6 border-t border-dashed border-stone-300/70" />

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-24">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[linear-gradient(140deg,#fecdd3,#fed7aa,#c7d2fe)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                <ShoppingBag className="h-6 w-6 text-stone-600" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-serif text-base font-semibold text-stone-700">No items yet</p>
                <p className="mt-1 text-xs text-stone-400">Tap a product to begin the sale.</p>
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/60 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-800">{item.name}</p>
                    <p className="text-xs text-stone-400">{formatCurrency(item.price)} each</p>
                  </div>

                  <div className="flex items-center gap-0.5 rounded-full border border-stone-200/80 bg-white/80 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                    <button
                      type="button"
                      onClick={() => onDecrement(item.id)}
                      aria-label={`Decrease ${item.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-stone-500 transition-all duration-150 hover:bg-stone-100 hover:text-stone-900 active:scale-90"
                    >
                      <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </button>
                    <span className="w-5 text-center text-xs font-semibold tabular-nums text-stone-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onIncrement(item.id)}
                      disabled={item.quantity >= item.stock}
                      aria-label={`Increase ${item.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-stone-500 transition-all duration-150 hover:bg-stone-100 hover:text-stone-900 active:scale-90 disabled:cursor-not-allowed disabled:text-stone-300 disabled:hover:bg-transparent"
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </button>
                  </div>

                  <span className="w-16 text-right text-sm font-semibold tabular-nums text-stone-800">
                    {formatCurrency(item.price * item.quantity)}
                  </span>

                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-stone-300 transition-all duration-150 hover:bg-rose-50 hover:text-rose-600 active:scale-90"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-b-3xl border-t border-white/70 bg-white/50 px-6 py-5">
          <dl className="flex flex-col gap-2.5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-stone-500">Subtotal</dt>
              <dd className="font-medium tabular-nums text-stone-700">{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-stone-500">
                Tax <span className="text-stone-400">(Dynamic)</span>
              </dt>
              <dd className="font-medium tabular-nums text-stone-700">{formatCurrency(tax)}</dd>
            </div>
            <div className="mt-1 flex items-end justify-between border-t border-dashed border-stone-300/70 pt-3.5">
              <dt className="text-sm font-medium uppercase tracking-[0.16em] text-stone-400">Total</dt>
              <dd className="font-serif text-3xl font-semibold tabular-nums tracking-tight text-stone-900">
                {formatCurrency(total)}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={() => setIsCheckoutOpen(true)}
            disabled={items.length === 0}
            className="group mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(120deg,#fb7185_0%,#fdba74_45%,#818cf8_100%)] px-5 py-4 text-sm font-semibold text-white shadow-[0_16px_36px_-10px_rgba(129,140,248,0.65),0_6px_16px_-8px_rgba(251,113,133,0.5),inset_0_1px_0_rgba(255,255,255,0.5)] transition-all duration-200 ease-out hover:brightness-105 active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-none disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none"
          >
            Process Payment
            {itemCount > 0 && (
              <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-semibold tabular-nums shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                {formatCurrency(total)}
              </span>
            )}
          </button>
          <p className="mt-3 text-center text-[11px] text-stone-400">
            Secure checkout · Card, cash &amp; contactless
          </p>
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
      />
    </>
  )
}
