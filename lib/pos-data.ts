export type Product = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  brand?: string
  batch_no?: string
  expiry_date?: string
  description?: string
  image_url?: string
  unit?: string
  mrp?: number
}

export const SUPERMARKET_CATEGORIES = [
  "All Products",
  "Vegetables and Fruits",
  "Grocery",
  "Snacks and Drinks",
  "Beauty and Personal Care",
  "Household",
  "Stationary",
  "Other",
] as const

export type SupermarketCategory = typeof SUPERMARKET_CATEGORIES[number]

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value)
}
