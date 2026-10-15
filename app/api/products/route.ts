import { NextResponse } from "next/server"
import { getDb, getDbPath } from "@/lib/db"

export async function GET() {
  try {
    const db = getDb()
    let products: any = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM Products ORDER BY category, name', (err, rows) => {
        if (err) return reject(err)
        resolve(rows || [])
      })
    })

    if (!products || products.length === 0) {
      try {
        const initModule = require("../../../init-db.js")
        await initModule.initDb(getDbPath())
        products = await new Promise((resolve, reject) => {
          db.all('SELECT * FROM Products ORDER BY category, name', (err, rows) => {
            if (err) return reject(err)
            resolve(rows || [])
          })
        })
      } catch (e) {
        console.error("Auto-seed error in GET /api/products:", e)
      }
    }

    db.close()
    return NextResponse.json({ products: products || [] })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      category,
      price,
      stock,
      brand,
      batch_no,
      expiry_date,
      description,
      image_url,
      unit,
      mrp
    } = body

    // Generate a clean SKU based on category
    const catCode = (category || 'itm').substring(0, 3).toLowerCase()
    const id = `sku-${catCode}-${Math.floor(1000 + Math.random() * 9000)}`

    // Fallback default image based on category if empty
    let finalImageUrl = image_url
    if (!finalImageUrl) {
      if (category === "Vegetables") finalImageUrl = "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80"
      else if (category === "Grocery") finalImageUrl = "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80"
      else if (category === "Snacks and Drinks") finalImageUrl = "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80"
      else if (category === "Beauty and Personal Care") finalImageUrl = "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80"
      else if (category === "Household") finalImageUrl = "https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?w=600&auto=format&fit=crop&q=80"
      else if (category === "Stationary") finalImageUrl = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"
      else finalImageUrl = "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80"
    }

    const db = getDb()
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO Products (id, name, category, price, stock, brand, batch_no, expiry_date, description, image_url, unit, mrp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          name,
          category,
          parseFloat(price) || 0,
          parseInt(stock, 10) || 0,
          brand || "Generic",
          batch_no || `B-${Math.floor(100 + Math.random() * 900)}`,
          expiry_date || "N/A",
          description || "High-quality supermarket product.",
          finalImageUrl,
          unit || "1 unit",
          parseFloat(mrp) || Math.round((parseFloat(price) || 0) * 1.2)
        ],
        function (err) {
          if (err) return reject(err)
          resolve(null)
        }
      )
    })
    db.close()
    return NextResponse.json({
      id,
      name,
      category,
      price: parseFloat(price) || 0,
      stock: parseInt(stock, 10) || 0,
      brand,
      batch_no,
      expiry_date,
      description,
      image_url: finalImageUrl,
      unit,
      mrp
    })
  } catch (error) {
    console.error("Add product error:", error)
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, stockDelta, price, mrp } = await request.json()
    const db = getDb()

    if (price !== undefined) {
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE Products 
           SET price = ?, 
               mrp = CASE WHEN ? IS NOT NULL THEN ? ELSE mrp END 
           WHERE id = ?`,
          [
            parseFloat(price),
            mrp !== undefined && mrp !== null ? parseFloat(mrp) : null,
            mrp !== undefined && mrp !== null ? parseFloat(mrp) : null,
            id
          ],
          function (err) {
            if (err) return reject(err)
            resolve(null)
          }
        )
      })
    }

    if (stockDelta !== undefined) {
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE Products SET stock = stock + ? WHERE id = ?',
          [parseInt(stockDelta, 10), id],
          function (err) {
            if (err) return reject(err)
            resolve(null)
          }
        )
      })
    }

    db.close()
    return NextResponse.json({ success: true, message: "Product updated successfully" })
  } catch (error) {
    console.error("Product update error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}
