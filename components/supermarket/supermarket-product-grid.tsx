"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Plus, Minus, Info, Sparkles, Filter, Check } from "lucide-react"
import { formatCurrency, SUPERMARKET_CATEGORIES, type Product } from "@/lib/pos-data"
import { ProductDetailModal } from "./product-detail-modal"

function getCategoryIcon(category: string) {
  switch (category) {
    case "Vegetables":
    case "Vegetables and Fruits":
    case "Vegetables & Fruits":
    case "Vegetable and Fruits": return "🥦🍎"
    case "Grocery": return "🌾"
    case "Snacks and Drinks": return "🥤"
    case "Beauty and Personal Care": return "✨"
    case "Household": return "🧼"
    case "Stationary": return "📚"
    case "Other":
    case "Others": return "🎁"
    default: return "🛒"
  }
}

export function SupermarketProductGrid({
  products,
  query,
  onQueryChange,
  selectedCategory,
  onSelectCategory,
  cart,
  onAddToCart,
  onIncrement,
  onDecrement,
  onSetQuantity
}: {
  products: Product[]
  query: string
  onQueryChange: (val: string) => void
  selectedCategory: string
  onSelectCategory: (cat: string) => void
  cart: { id: string; quantity: number }[]
  onAddToCart: (p: Product, qty: number) => void
  onIncrement: (id: string) => void
  onDecrement: (id: string) => void
  onSetQuantity?: (p: Product, qty: number) => void
}) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const gridScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (gridScrollRef.current) {
      gridScrollRef.current.scrollTop = 0
    }
  }, [selectedCategory])

  const handleCardClick = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Top Bar: Search and Category Pills */}
      <div className="sticky top-0 z-20 pb-4 pt-1 backdrop-blur-md">
        {/* Search Input */}
        <div className="relative mb-3.5">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search fresh vegetables, grocery, snacks, household, stationary..."
            className="w-full rounded-2xl border border-white/80 bg-white/80 py-3 pl-11 pr-4 text-sm text-stone-800 shadow-[0_10px_25px_rgba(40,30,20,0.04)] outline-none backdrop-blur-xl transition placeholder:text-stone-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100/50"
          />
        </div>

        {/* Category Pills Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {SUPERMARKET_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            const icon = getCategoryIcon(cat)
            const count = cat === "All Products" 
              ? (products || []).length 
              : (products || []).filter(p => (p?.category || "") === cat).length

            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`group flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20 ring-1 ring-emerald-600"
                    : "bg-white/80 text-stone-600 hover:bg-white hover:text-stone-900 shadow-sm border border-white/80"
                }`}
              >
                <span>{icon}</span>
                <span>{cat}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Products Grid */}
      <div ref={gridScrollRef} className="min-h-0 flex-1 overflow-y-auto pb-28 pr-1">
        {products.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-stone-300/80 bg-white/40 text-center p-6">
            <span className="text-3xl">🔍</span>
            <p className="font-serif text-base font-semibold text-stone-700">No items found</p>
            <p className="text-xs text-stone-400 max-w-sm">
              We couldn't find anything matching your search in “{selectedCategory}”. Try another keyword or browse all categories.
            </p>
            <button
              onClick={() => { onQueryChange(""); onSelectCategory("All Products"); }}
              className="mt-2 text-xs font-semibold text-emerald-700 underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {products.map((product) => {
              const inCartItem = cart.find((c) => c.id === product.id)
              const qtyInCart = inCartItem?.quantity || 0
              const isOutOfStock = product.stock <= 0
              const savings = product.mrp && product.mrp > product.price ? product.mrp - product.price : 0
              const discountPercent = product.mrp && product.mrp > product.price ? Math.round((savings / product.mrp) * 100) : 0

              return (
                <div
                  key={product.id}
                  onClick={() => handleCardClick(product)}
                  className="group relative flex flex-col justify-between rounded-3xl border border-white/80 bg-white/85 p-3.5 shadow-[0_12px_30px_rgba(40,30,20,0.05)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(40,30,20,0.1)] hover:border-emerald-200/80 cursor-pointer"
                >
                  {/* Discount Badge */}
                  {discountPercent > 0 && (
                    <span className="absolute left-3 top-3 z-10 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-extrabold uppercase text-white shadow-sm">
                      {discountPercent}% OFF
                    </span>
                  )}

                  {/* Top Image Container */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center">
                    <img
                      src={product.image_url || "https://images.unsplash.com/photo-1584473457406-624048518851?w=600&auto=format&fit=crop&q=80"}
                      alt={product.name}
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1584473457406-624048518851?w=600&auto=format&fit=crop&q=80"
                      }}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                        <span className="rounded-full bg-stone-800 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="mt-3 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-stone-400 font-semibold uppercase">
                        <span className="truncate">{product.brand || product.category}</span>
                        {product.unit && <span className="text-stone-500 font-normal shrink-0">{product.unit}</span>}
                      </div>

                      <h3 className="mt-1 font-serif text-sm font-bold text-stone-900 line-clamp-2 leading-snug group-hover:text-emerald-800 transition-colors">
                        {product.name}
                      </h3>

                      {product.expiry_date && product.expiry_date !== "N/A" && (
                        <p className="mt-1 text-[10px] font-medium text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 inline-block">
                          Exp: {product.expiry_date}
                        </p>
                      )}
                    </div>

                    {/* Price and Add to Cart Row */}
                    <div className="mt-3 flex items-center justify-between gap-1.5 pt-2 border-t border-stone-100" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-baseline gap-1 flex-wrap">
                          <span className="font-serif text-sm sm:text-base font-extrabold text-stone-900 truncate">
                            {formatCurrency(product.price)}
                          </span>
                          {product.mrp && product.mrp > product.price && (
                            <span className="text-[10px] text-stone-400 line-through truncate">
                              {formatCurrency(product.mrp)}
                            </span>
                          )}
                        </div>
                      </div>

                      {qtyInCart > 0 ? (
                        <div className="flex items-center rounded-xl bg-emerald-50 border border-emerald-200 p-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => onDecrement(product.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-xs hover:bg-emerald-100 transition shrink-0"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-emerald-900">
                            {qtyInCart}
                          </span>
                          <button
                            type="button"
                            disabled={qtyInCart >= product.stock}
                            onClick={() => onIncrement(product.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-xs hover:bg-emerald-100 transition disabled:opacity-40 shrink-0"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => onAddToCart(product, 1)}
                          className="shrink-0 flex items-center gap-1 rounded-xl bg-emerald-700 px-2.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-emerald-700/20 hover:bg-emerald-800 transition active:scale-95 disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none whitespace-nowrap"
                        >
                          <Plus className="h-3 w-3 shrink-0" strokeWidth={3} />
                          <span>ADD</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {(() => {
        const selectedCartItem = selectedProduct ? cart.find((c) => c.id === selectedProduct.id) : null
        const selectedQtyInCart = selectedCartItem?.quantity || 0

        return (
          <ProductDetailModal
            product={selectedProduct}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            quantityInCart={selectedQtyInCart}
            onAddToCart={onAddToCart}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onSetQuantity={onSetQuantity}
          />
        )
      })()}
    </div>
  )
}
