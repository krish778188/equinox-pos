import { NextResponse } from "next/server"
import sqlite3 from "sqlite3"

export async function GET() {
  try {
    const db = new sqlite3.Database(process.env.DB_PATH || './pos.db')
    const discounts: any = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM Discounts ORDER BY id DESC', (err, rows) => {
        if (err) return reject(err)
        resolve(rows)
      })
    })
    db.close()
    return NextResponse.json({ discounts })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch discounts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, type, value, threshold, product_id } = await request.json()
    const db = new sqlite3.Database(process.env.DB_PATH || './pos.db')
    
    // Deactivate all others first (optional rule, but standard for global store discounts)
    await new Promise((resolve) => {
      db.run('UPDATE Discounts SET active = 0', resolve)
    })

    const newDiscount = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO Discounts (name, type, value, threshold, active, product_id) VALUES (?, ?, ?, ?, 1, ?)',
        [name, type, value, threshold || 0, product_id || null],
        function(err) {
          if (err) return reject(err)
          resolve({ id: this.lastID, name, type, value, threshold, active: 1, product_id })
        }
      )
    })
    
    db.close()
    return NextResponse.json(newDiscount)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create discount" }, { status: 500 })
  }
}
