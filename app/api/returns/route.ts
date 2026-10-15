import { NextResponse } from 'next/server'
import { getDb, getDbPath } from '@/lib/db'

export async function GET() {
  try {
    const db = getDb()

    let requests = await new Promise<any[]>((resolve, reject) => {
      db.all(
        'SELECT * FROM ReturnRequests ORDER BY created_at DESC',
        (err, rows) => {
          if (err) return reject(err)
          resolve(rows || [])
        }
      )
    })

    if (!requests || requests.length === 0) {
      try {
        const initModule = require("../../../init-db.js")
        await initModule.initDb(getDbPath())
        requests = await new Promise<any[]>((resolve, reject) => {
          db.all(
            'SELECT * FROM ReturnRequests ORDER BY created_at DESC',
            (err, rows) => {
              if (err) return reject(err)
              resolve(rows || [])
            }
          )
        })
      } catch (e) {
        console.error("Auto-seed error in returns:", e)
      }
    }

    db.close()
    return NextResponse.json({ success: true, requests })
  } catch (error) {
    console.error("Fetch return requests error:", error)
    return NextResponse.json({ error: "Failed to fetch return requests" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action = "create" } = body

    const db = getDb()

    // 1. User submits return request
    if (action === "create" || action === "request") {
      const { saleId, billNo, customerName, customerPhone, customerEmail, amount, reason, itemsSummary } = body

      // Check if bill date is within 7 days
      const sale: any = await new Promise((resolve) => {
        db.get('SELECT created_at, status FROM Sales WHERE id = ?', [saleId], (err, row) => resolve(row))
      })

      if (!sale) {
        db.close()
        return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
      }

      const saleDate = new Date(sale.created_at || Date.now())
      const today = new Date()
      const diffDays = Math.floor((today.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays > 7) {
        db.close()
        return NextResponse.json({
          success: false,
          error: `Return window expired. Orders are only eligible for return within 7 days of delivery. This order is ${diffDays} days old.`
        }, { status: 400 })
      }

      await new Promise<void>((resolve, reject) => {
        db.run(
          `INSERT INTO ReturnRequests (sale_id, bill_no, customer_name, customer_phone, customer_email, items_summary, reason, amount, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
          [
            saleId,
            billNo || `INV-${saleId.toString().padStart(5, '0')}`,
            customerName || "Customer",
            customerPhone || "",
            customerEmail || "",
            itemsSummary || "All items in order",
            reason || "Customer requested refund",
            amount || 0
          ],
          (err) => {
            if (err) return reject(err)
            resolve()
          }
        )
      })

      // Update Sales status
      await new Promise<void>((resolve) => {
        db.run("UPDATE Sales SET status = 'Return Requested' WHERE id = ?", [saleId], () => resolve())
      })

      db.close()

      return NextResponse.json({
        success: true,
        message: "Your return request has been submitted successfully. It will be reviewed and approved by admin within 48 hours."
      })
    }

    // 2. Admin approves return request or initiates direct refund from orders
    if (action === "approve" || action === "direct-refund" || action === "return") {
      const { requestId, saleId, amount, adminPassword } = body

      // Verify admin password
      if (adminPassword !== "equinox@123") {
        db.close()
        return NextResponse.json({ success: false, error: "Incorrect admin password" }, { status: 401 })
      }

      // Restore stock for line items
      const lineItems: any[] = await new Promise((resolve) => {
        db.all('SELECT product_id, quantity FROM Line_Items WHERE sale_id = ?', [saleId], (err, rows) => resolve(rows || []))
      })

      const restoreStmt = db.prepare('UPDATE Products SET stock = stock + ? WHERE id = ?')
      for (const item of lineItems) {
        restoreStmt.run(item.quantity, item.product_id)
      }
      restoreStmt.finalize()

      // Mark ReturnRequest as Approved if exists
      if (requestId) {
        await new Promise<void>((resolve) => {
          db.run(
            "UPDATE ReturnRequests SET status = 'Approved', reviewed_at = CURRENT_TIMESTAMP WHERE id = ?",
            [requestId],
            () => resolve()
          )
        })
      } else {
        await new Promise<void>((resolve) => {
          db.run(
            "UPDATE ReturnRequests SET status = 'Approved', reviewed_at = CURRENT_TIMESTAMP WHERE sale_id = ?",
            [saleId],
            () => resolve()
          )
        })
      }

      // Mark Sale as Refunded
      await new Promise<void>((resolve) => {
        db.run("UPDATE Sales SET status = 'Refunded' WHERE id = ?", [saleId], () => resolve())
      })

      db.close()

      return NextResponse.json({
        success: true,
        message: `Refund of ₹${amount || 0} approved and processed successfully. Inventory restocked.`
      })
    }

    // 3. Admin rejects return request
    if (action === "reject") {
      const { requestId, saleId: providedSaleId, adminPassword } = body

      if (adminPassword !== "equinox@123") {
        db.close()
        return NextResponse.json({ success: false, error: "Incorrect admin password" }, { status: 401 })
      }

      let saleId = providedSaleId
      if (!saleId && requestId) {
        const row: any = await new Promise((resolve) => {
          db.get('SELECT sale_id FROM ReturnRequests WHERE id = ?', [requestId], (err, r) => resolve(r))
        })
        if (row) saleId = row.sale_id
      }

      await new Promise<void>((resolve) => {
        db.run("UPDATE ReturnRequests SET status = 'Rejected', reviewed_at = CURRENT_TIMESTAMP WHERE id = ?", [requestId], () => resolve())
      })

      if (saleId) {
        await new Promise<void>((resolve) => {
          db.run("UPDATE Sales SET status = 'Return Rejected' WHERE id = ?", [saleId], () => resolve())
        })
      }

      db.close()

      return NextResponse.json({
        success: true,
        message: "Return request rejected."
      })
    }

    db.close()
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Return request error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
