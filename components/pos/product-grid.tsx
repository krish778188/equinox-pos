"use client"

import { Search, Plus } from "lucide-react"
import { formatCurrency, type Product } from "@/lib/pos-data"

function stockBadge(stock: number) {
  if (stock === 0) {
    return { label: "Sold out", className: "bg-rose-100/70 text-rose-600 ring-rose-200/60" }
  }
  if (stock <= 6) {
    return { label: `${stock} left`, className: "bg-amber-100/70 text-amber-700 ring-amber-200/60" }
  }
  return { label: `${stock} in stock`, className: "bg-emerald-100/70 text-emerald-700 ring-emerald-200/60" }
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  const badge = stockBadge(product.stock)
  const disabled = product.stock === 0

  return (
    <div className="group flex flex-col rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_16px_40px_rgba(120,90,60,0.06)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(120,90,60,0.1)]">
      <div className="mb-4 flex items-start justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">
          {product.category}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset backdrop-blur-sm ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      <h3 className="font-serif text-lg font-semibold leading-snug tracking-tight text-stone-800">
        {product.name}
      </h3>
      <p className="mt-0.5 text-xs font-medium tracking-wide text-stone-400">{product.id.toUpperCase()}</p>

      <div className="mt-5 flex items-center justify-between">
        <span className="font-serif text-2xl font-semibold tracking-tight text-stone-800">
          {formatCurrency(product.price)}
        </span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAdd(product)}
          aria-label={`Add ${product.name} to bill`}
          className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_8px_20px_-8px_rgba(41,37,36,0.7),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-200 ease-out hover:bg-stone-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          Add
        </button>
      </div>
    </div>
  )
}

export function ProductGrid({
  products,
  query,
  onQueryChange,
  onAdd,
}: {
  products: Product[]
  query: string
  onQueryChange: (value: string) => void
  onAdd: (p: Product) => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search the catalog…"
          className="w-full rounded-full border border-white/70 bg-white/70 py-3.5 pl-12 pr-5 text-sm text-stone-800 shadow-[0_10px_30px_rgba(120,90,60,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] outline-none backdrop-blur-xl transition placeholder:text-stone-400 focus:border-indigo-200/70 focus:ring-4 focus:ring-indigo-100/50"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-32 pr-1">
        {products.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-3xl border border-dashed border-stone-300/70 text-sm text-stone-400">
            No products match “{query}”.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={onAdd} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
