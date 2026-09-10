import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import sqlite3 from 'sqlite3'

const execAsync = promisify(exec)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items, customer, bags } = body
    
    const db = new sqlite3.Database(process.env.DB_PATH || './pos.db')

    // Fetch active discount
    const activeDiscount = await new Promise<any>((resolve) => {
      db.get('SELECT * FROM Discounts WHERE active = 1 ORDER BY id DESC LIMIT 1', (err, row) => {
        resolve(row || null)
      })
    })

    const payload = {
      items: items.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category
      })),
      discount: activeDiscount ? {
        name: activeDiscount.name,
        type: activeDiscount.type,
        value: activeDiscount.value,
        threshold: activeDiscount.threshold,
        product_id: activeDiscount.product_id
      } : null
    }

    const binaryPath = path.resolve(process.cwd(), 'backend', 'pos_backend')
    const { stdout, stderr } = await execAsync(`echo '${JSON.stringify(payload)}' | "${binaryPath}"`)

    if (stderr) {
      console.error("C++ Stderr:", stderr)
    }

    const result = JSON.parse(stdout)
    if (result.status === "success") {
      const grandTotal = result.receipt.grand_total

      const saleId = await new Promise<number>((resolve, reject) => {
        db.run(
          'INSERT INTO Sales (total_amount) VALUES (?)',
          [grandTotal],
          function (err) {
            if (err) return reject(err)
            resolve(this.lastID)
          }
        )
      })

      const stmt = db.prepare('INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, ?, ?)')
      for (const item of items) {
        stmt.run(saleId, item.id, item.quantity)
        
        // Deduct from stock
        db.run('UPDATE Products SET stock = stock - ? WHERE id = ?', [item.quantity, item.id])
      }
      stmt.finalize()

      db.close()
      
      result.receipt.bill_no = `INV-${saleId.toString().padStart(5, '0')}`
      if (customer) result.receipt.customer = customer
      if (bags) result.receipt.bags = bags

      return NextResponse.json(result)
    } else {
      return NextResponse.json({ error: "Checkout calculation failed" }, { status: 500 })
    }
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
