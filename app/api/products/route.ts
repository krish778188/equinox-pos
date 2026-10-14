import { NextResponse } from "next/server"
import sqlite3 from "sqlite3"

export async function GET() {
  try {
    const db = new sqlite3.Database(process.env.DB_PATH || './pos.db')
    const products: any = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM Products ORDER BY category, name', (err, rows) => {
        if (err) return reject(err)
        resolve(rows)
      })
    })
    db.close()
    return NextResponse.json({ products })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, category, price, stock } = await request.json()
    // Generate a simple SKU
    const id = `sku-${Math.floor(1000 + Math.random() * 9000)}`
    
    const db = new sqlite3.Database(process.env.DB_PATH || './pos.db')
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO Products (id, name, category, price, stock) VALUES (?, ?, ?, ?, ?)',
        [id, name, category, price, stock],
        function(err) {
          if (err) return reject(err)
          resolve(null)
        }
      )
    })
    db.close()
    return NextResponse.json({ id, name, category, price, stock })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, stockDelta } = await request.json()
    const db = new sqlite3.Database(process.env.DB_PATH || './pos.db')
    
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE Products SET stock = stock + ? WHERE id = ?',
        [stockDelta, id],
        function(err) {
          if (err) return reject(err)
          resolve(null)
        }
      )
    })
    
    db.close()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 })
  }
}
