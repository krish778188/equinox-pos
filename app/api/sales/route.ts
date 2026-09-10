import { NextResponse } from 'next/server'
import sqlite3 from 'sqlite3'

export async function GET() {
  try {
    const db = new sqlite3.Database(process.env.DB_PATH || './pos.db')
    
    const sales = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT id, total_amount, created_at FROM Sales ORDER BY created_at DESC', (err, rows) => {
        if (err) return reject(err)
        resolve(rows)
      })
    })
    
    db.close()
    
    // Format the billNo for the UI
    const formattedSales = sales.map(s => ({
      ...s,
      billNo: `INV-${s.id.toString().padStart(5, '0')}`
    }))

    return NextResponse.json({ success: true, sales: formattedSales })
  } catch (error) {
    console.error("Sales fetch error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
