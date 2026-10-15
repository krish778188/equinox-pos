import { NextResponse } from 'next/server'
import { getDb, getDbPath } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userEmail = searchParams.get('email')
    const userPhone = searchParams.get('phone')

    const db = getDb()

    let query = `
      SELECT 
        s.id, s.total_amount, s.customer_name, s.customer_phone, s.customer_email, s.delivery_address, s.status, s.payment_method, s.payment_id, s.created_at,
        rr.status as return_status, rr.reason as return_reason, rr.reviewed_at as return_reviewed_at
      FROM Sales s
      LEFT JOIN ReturnRequests rr ON rr.sale_id = s.id
    `
    const params: any[] = []

    if (userEmail || userPhone) {
      const conditions: string[] = []
      if (userEmail) {
        conditions.push('LOWER(s.customer_email) = LOWER(?)')
        params.push(userEmail)
      }
      if (userPhone) {
        conditions.push('s.customer_phone = ?')
        params.push(userPhone)
      }
      query += ` WHERE ${conditions.join(' OR ')}`
    }

    query += ' ORDER BY s.created_at DESC'

    let sales = await new Promise<any[]>((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) return reject(err)
        resolve(rows || [])
      })
    })

    if (!sales || sales.length === 0) {
      try {
        const initModule = require("../../../init-db.js")
        await initModule.initDb(getDbPath())
        sales = await new Promise<any[]>((resolve, reject) => {
          db.all(query, params, (err, rows) => {
            if (err) return reject(err)
            resolve(rows || [])
          })
        })
      } catch (e) {
        console.error("Auto-seed error in sales:", e)
      }
    }

    // Fetch line items with product names for each sale
    const salesWithItems = await Promise.all(
      sales.map(
        (sale) =>
          new Promise<any>((resolve, reject) => {
            db.all(
              `SELECT li.product_id, li.quantity, p.name as product_name, p.price, p.brand, p.image_url, p.unit
               FROM Line_Items li 
               LEFT JOIN Products p ON p.id = li.product_id 
               WHERE li.sale_id = ?`,
              [sale.id],
              (err, items) => {
                if (err) return reject(err)

                const saleDate = new Date(sale.created_at || Date.now())
                const returnDeadline = new Date(saleDate.getTime() + 7 * 24 * 60 * 60 * 1000)
                const now = new Date()
                const daysRemaining = Math.max(0, Math.ceil((returnDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
                // Customer can only return if the order has been delivered by admin!
                const isReturnEligible = daysRemaining > 0 && 
                  sale.status === 'Delivered' && 
                  sale.return_status !== 'Approved' && 
                  sale.return_status !== 'Pending' && 
                  sale.return_status !== 'Rejected'

                resolve({
                  ...sale,
                  billNo: `INV-${sale.id.toString().padStart(5, '0')}`,
                  orderId: `ORD-${new Date().getFullYear()}-${sale.id.toString().padStart(4, '0')}`,
                  lastReturnDate: returnDeadline.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }),
                  daysRemaining,
                  isReturnEligible,
                  items: items || []
                })
              }
            )
          })
      )
    )

    db.close()
    return NextResponse.json({ success: true, sales: salesWithItems })
  } catch (error) {
    console.error("Sales fetch error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 })
    }

    const db = getDb()
    await new Promise<void>((resolve, reject) => {
      db.run("UPDATE Sales SET status = ? WHERE id = ?", [status, id], function (err) {
        if (err) return reject(err)
        resolve()
      })
    })

    db.close()
    return NextResponse.json({ success: true, id, status })
  } catch (error) {
    console.error("Error updating sale status:", error)
    return NextResponse.json({ error: "Failed to update sale status" }, { status: 500 })
  }
}
