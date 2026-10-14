export type Product = {
  id: string
  name: string
  category: string
  price: number
  stock: number
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value)
}
