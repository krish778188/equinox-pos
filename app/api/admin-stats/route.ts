import { NextResponse } from "next/server"
import sqlite3 from "sqlite3"

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
          p.id, p.name, p.category, p.brand, p.price, p.stock, p.unit,
          COALESCE(SUM(l.quantity), 0) as total_sold
        FROM Products p
        LEFT JOIN Line_Items l ON p.id = l.product_id
        GROUP BY p.id
        ORDER BY total_sold DESC, p.stock ASC
        LIMIT 24
      `
      db.all(query, (err, rows: any[]) => {
        if (err) return reject(err)
        const enriched = (rows || []).map((item, idx) => {
          const sold = item.total_sold || 0
          const stock = item.stock || 0
          
          let velocity_label = "Consistent Volume"
          let velocity_badge_color = "amber"
          let predicted_runout_days = Math.max(2, Math.round(stock / (Math.max(1, sold) * 1.5)))

          if (stock <= 8) {
            velocity_label = "Reorder Required"
            velocity_badge_color = "rose"
            predicted_runout_days = Math.max(1, Math.round(stock / 2))
          } else if (sold >= 3 || idx < 4) {
            velocity_label = "Surge Expected"
            velocity_badge_color = "emerald"
          } else if (sold >= 1 || idx < 10) {
            velocity_label = "High Velocity"
            velocity_badge_color = "teal"
          } else {
            velocity_label = "Fast-Moving Stock"
            velocity_badge_color = "blue"
          }

          const recommended_reorder = Math.max(20, Math.round((50 - stock) / 5) * 5)

          return {
            ...item,
            total_sold: sold,
            velocity_label,
            velocity_badge_color,
            predicted_runout_days,
            recommended_reorder,
            burn_rate: (Math.max(0.8, (sold * 1.2) + (50 - stock) * 0.08)).toFixed(1)
          }
        })
        resolve(enriched)
      })
    })
    
    db.close()
    return NextResponse.json({ stock, demand })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
