import { NextResponse } from 'next/server'
import sqlite3 from 'sqlite3'

export async function POST(req: Request) {
  try {
    const { saleId, amount, date } = await req.json()
    
    // Check if date is today
    const saleDate = new Date(date).toISOString().split('T')[0]
    const today = new Date().toISOString().split('T')[0]
    
    if (saleDate !== today) {
      return NextResponse.json({ success: false, error: "Returns can only be processed on the same day as the original bill." }, { status: 400 })
    }

    const db = new sqlite3.Database(process.env.DB_PATH || './pos.db')

    // Generate return code
    const returnCode = `RET-${saleId}-${Math.floor(1000 + Math.random() * 9000)}`

    // Create a discount that gives a flat threshold equivalent to the return amount
    // Value is the return amount, threshold is 0 (can be applied to any order)
    await new Promise<void>((resolve, reject) => {
      db.run(
        'INSERT INTO Discounts (name, type, value, threshold, active) VALUES (?, ?, ?, ?, ?)',
        [returnCode, 'FLAT_THRESHOLD', amount, 0, 1],
        (err) => {
          if (err) return reject(err)
          resolve()
        }
      )
    })

    db.close()
    
    return NextResponse.json({ success: true, returnCode })
  } catch (error) {
    console.error("Return error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
