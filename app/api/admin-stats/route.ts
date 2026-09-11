import { NextResponse } from "next/server"
import sqlite3 from "@/lib/db"

export async function GET() {
  try {
    const db = new sqlite3.Database(process.env.DB_PATH || './pos.db')
    
    const stock: any = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM Products ORDER BY category, name', (err, rows) => {
        if (err) return reject(err)
        resolve(rows)
      })
    })

    const demand: any = await new Promise((resolve, reject) => {
      const query = `
        SELECT 
          p.id, p.name, p.category, p.price, p.stock,
          COALESCE(SUM(l.quantity), 0) as total_sold
        FROM Products p
        LEFT JOIN Line_Items l ON p.id = l.product_id
        GROUP BY p.id
        ORDER BY total_sold DESC
        LIMIT 10
      `
      db.all(query, (err, rows) => {
        if (err) return reject(err)
        resolve(rows)
      })
    })
    
    db.close()
    return NextResponse.json({ stock, demand })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
