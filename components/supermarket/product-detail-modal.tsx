"use client"

import { useState, useEffect } from "react"
import { X, Calendar, Layers, Plus, Minus, ShoppingBag, Check } from "lucide-react"
import { formatCurrency, type Product } from "@/lib/pos-data"

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  quantityInCart = 0,
  onAddToCart,
  onIncrement,
  onDecrement,
  onSetQuantity
}: {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  quantityInCart?: number
  onAddToCart?: (p: Product, qty: number) => void
  onIncrement?: (id: string) => void
  onDecrement?: (id: string) => void
  onSetQuantity?: (p: Product, qty: number) => void
}) {
  const [localQty, setLocalQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (product) {
      if (quantityInCart > 0) {
        setLocalQty(quantityInCart)
      } else {
        setLocalQty(1)
      }
      setAdded(false)
    }
  }, [product, quantityInCart])

  if (!isOpen || !product) return null

  const isOutOfStock = product.stock <= 0
  const savings = product.mrp && product.mrp > product.price ? product.mrp - product.price : 0
  const discountPercent = product.mrp && product.mrp > product.price ? Math.round((savings / product.mrp) * 100) : 0

  const activeQty = quantityInCart > 0 ? quantityInCart : localQty

  const handleIncrement = () => {
    if (isOutOfStock) return
    const next = Math.min(product.stock, activeQty + 1)
    setLocalQty(next)
    if (quantityInCart > 0) {
      if (onIncrement) {
        onIncrement(product.id)
      } else if (onSetQuantity) {
        onSetQuantity(product, next)
      }
    }
  }

  const handleDecrement = () => {
    if (isOutOfStock) return
    const next = Math.max(quantityInCart > 0 ? 0 : 1, activeQty - 1)
    setLocalQty(next)
    if (quantityInCart > 0) {
      if (onDecrement) {
        onDecrement(product.id)
      } else if (onSetQuantity) {
        onSetQuantity(product, next)
      }
    }
  }

  const handleActionButton = () => {
    if (isOutOfStock) return

    if (quantityInCart > 0) {
      if (localQty !== quantityInCart && onSetQuantity) {
        onSetQuantity(product, localQty)
      }
      setAdded(true)
      setTimeout(() => {
        setAdded(false)
        onClose()
      }, 500)
    } else {
      if (onAddToCart) {
        onAddToCart(product, localQty)
      } else if (onSetQuantity) {
        onSetQuantity(product, localQty)
      }
      setAdded(true)
      setTimeout(() => {
        setAdded(false)
        onClose()
      }, 500)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-300">
      <div 
        className="relative flex flex-col md:flex-row w-full max-w-2xl overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-[0_30px_70px_rgba(0,0,0,0.2)] backdrop-blur-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-stone-100/80 text-stone-500 backdrop-blur-sm transition-all hover:bg-stone-200 hover:text-stone-800 active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Product Image Section */}
        <div className="relative md:w-1/2 bg-stone-50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-stone-100">
          {discountPercent > 0 && (
            <span className="absolute left-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md shadow-emerald-600/30">
              {discountPercent}% OFF
            </span>
          )}

          <div className="relative h-60 w-full overflow-hidden rounded-2xl bg-white shadow-inner flex items-center justify-center">
            <img
              src={product.image_url || "https://images.unsplash.com/photo-1584473457406-624048518851?w=600&auto=format&fit=crop&q=80"}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1584473457406-624048518851?w=600&auto=format&fit=crop&q=80"
              }}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px]">
            <span className="rounded-lg bg-stone-200/70 px-2.5 py-1 font-medium text-stone-600">
              SKU: {product.id.toUpperCase()}
            </span>
            {product.unit && (
              <span className="rounded-lg bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 border border-emerald-100">
                Pack: {product.unit}
              </span>
            )}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="flex md:w-1/2 flex-col p-6 sm:p-7 justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pr-12">
              <span className="rounded-full bg-stone-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-600 truncate max-w-[180px]">
                {product.category}
              </span>
              <span className={`text-[11px] font-semibold shrink-0 ${isOutOfStock ? "text-rose-600" : product.stock <= 5 ? "text-amber-600" : "text-emerald-700"}`}>
                {isOutOfStock ? "● Sold out" : product.stock <= 5 ? `● Only ${product.stock} left` : "● In Stock"}
              </span>
            </div>

            <h2 className="mt-2.5 font-serif text-2xl font-bold tracking-tight text-stone-900 leading-snug">
              {product.name}
            </h2>

            {product.brand && (
              <p className="mt-1 text-xs font-semibold text-stone-500">
                By <span className="text-stone-800">{product.brand}</span>
              </p>
            )}

            {/* Pricing Section */}
            <div className="mt-4 flex items-baseline gap-2.5">
              <span className="font-serif text-3xl font-extrabold text-stone-900">
                {formatCurrency(product.price)}
              </span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-sm font-medium text-stone-400 line-through">
                  {formatCurrency(product.mrp)}
                </span>
              )}
              {savings > 0 && (
                <span className="text-xs font-semibold text-emerald-600">
                  (Save {formatCurrency(savings)})
                </span>
              )}
            </div>

            {/* Specifications Grid */}
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-stone-200/80 bg-stone-50/70 p-3 text-xs">
              <div className="flex items-start gap-2">
                <Calendar className="h-3.5 w-3.5 text-stone-400 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-[10px] font-semibold uppercase text-stone-400">Best Before</span>
                  <span className="font-semibold text-stone-700">{product.expiry_date || "N/A"}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Layers className="h-3.5 w-3.5 text-stone-400 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-[10px] font-semibold uppercase text-stone-400">Batch Number</span>
                  <span className="font-semibold text-stone-700">{product.batch_no || "B-STANDARD"}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Description</h4>
              <p className="mt-1 text-xs leading-relaxed text-stone-600 max-h-24 overflow-y-auto">
                {product.description || "Fresh, high-quality supermarket item sourced directly from certified farms and trusted distributors."}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-stone-100">
            <div className="flex items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 p-1 shrink-0">
              <button
                type="button"
                disabled={(quantityInCart > 0 ? activeQty <= 0 : activeQty <= 1) || isOutOfStock}
                onClick={handleDecrement}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-stone-600 shadow-sm transition hover:bg-stone-100 disabled:opacity-40"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-bold text-stone-800">{activeQty}</span>
              <button
                type="button"
                disabled={activeQty >= product.stock || isOutOfStock}
                onClick={handleIncrement}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-stone-600 shadow-sm transition hover:bg-stone-100 disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleActionButton}
              className={`flex-1 min-w-0 flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
                added 
                  ? "bg-emerald-600 shadow-emerald-600/30" 
                  : isOutOfStock 
                    ? "bg-stone-300 cursor-not-allowed shadow-none" 
                    : quantityInCart > 0
                      ? "bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20"
                      : "bg-stone-900 hover:bg-stone-800 shadow-stone-900/20"
              }`}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4 shrink-0" /> <span className="truncate">{quantityInCart > 0 ? "Basket Updated!" : "Added to Basket!"}</span>
                </>
              ) : isOutOfStock ? (
                "Out of Stock"
              ) : quantityInCart > 0 ? (
                <>
                  <Check className="h-4 w-4 shrink-0" /> <span className="truncate">In Basket ({activeQty}) · {formatCurrency(product.price * activeQty)}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4 shrink-0" /> <span className="truncate">Add to Basket · {formatCurrency(product.price * activeQty)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
