import { NextResponse } from 'next/server'
import sqlite3 from 'sqlite3'

export async function GET() {
  try {
    const db = new sqlite3.Database(process.env.DB_PATH || './pos.db')

    // Safely add columns if they don't exist yet (for existing Render deployments)
    await new Promise<void>((resolve) => { db.run('ALTER TABLE Sales ADD COLUMN customer_name VARCHAR(255)', () => resolve()) })
    await new Promise<void>((resolve) => { db.run('ALTER TABLE Sales ADD COLUMN customer_phone VARCHAR(50)', () => resolve()) })

    const sales = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT id, total_amount, customer_name, customer_phone, created_at FROM Sales ORDER BY created_at DESC', (err, rows) => {
        if (err) return reject(err)
        resolve(rows)
      })
    })

    // Fetch line items with product names for each sale
    const salesWithItems = await Promise.all(sales.map(sale => new Promise<any>((resolve, reject) => {
      db.all(
        `SELECT li.product_id, li.quantity, p.name as product_name, p.price 
         FROM Line_Items li 
         LEFT JOIN Products p ON p.id = li.product_id 
         WHERE li.sale_id = ?`,
        [sale.id],
        (err, items) => {
          if (err) return reject(err)
          resolve({
            ...sale,
            billNo: `INV-${sale.id.toString().padStart(5, '0')}`,
            items
          })
        }
      )
    })))

    db.close()
    return NextResponse.json({ success: true, sales: salesWithItems })
  } catch (error) {
    console.error("Sales fetch error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
