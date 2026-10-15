import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import { getDb } from '@/lib/db'

const execAsync = promisify(exec)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items, customer, bags, discountCode, deliveryAddress, paymentMethod, paymentId, upiRefId } = body

    const db = getDb()

    // Ensure payment method
    const chosenMethod = paymentMethod === 'Cash on Delivery' ? 'Cash on Delivery' : 'UPI (krishraj453@okicici)'
    const isUpi = chosenMethod.startsWith('UPI')

    // Compulsory UPI Reference ID validation
    if (isUpi && (!upiRefId || !upiRefId.trim())) {
      db.close()
      return NextResponse.json({ 
        error: "UPI Reference / UTR Number is compulsory for UPI payments. Please complete the payment in your UPI app and enter the reference number." 
      }, { status: 400 })
    }

    const cleanUpiRefId = isUpi ? upiRefId.trim() : "N/A"
    const chosenId = paymentId || (
      isUpi 
        ? `EQX-UPI-${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`
        : `EQX-COD-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`
    )

    // Fetch active discount
    let activeDiscount = null
    if (discountCode) {
      activeDiscount = await new Promise<any>((resolve) => {
        db.get('SELECT * FROM Discounts WHERE active = 1 AND name = ?', [discountCode], (err, row) => resolve(row || null))
      })
    } else {
      activeDiscount = await new Promise<any>((resolve) => {
        db.get('SELECT * FROM Discounts WHERE active = 1 AND name NOT LIKE "RET-%" ORDER BY id DESC LIMIT 1', (err, row) => resolve(row || null))
      })
    }

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
    let result: any = null

    try {
      const { stdout, stderr } = await execAsync(`echo '${JSON.stringify(payload)}' | "${binaryPath}"`)
      if (stderr) {
        console.error("C++ Stderr:", stderr)
      }
      result = JSON.parse(stdout)
    } catch (binErr) {
      console.warn("C++ Engine binary fallback to JS computation:", binErr)
      // Robust fallback calculation if binary is not compiled on current OS/arch
      const subtotal = items.reduce((acc: number, it: any) => acc + it.price * it.quantity, 0)
      const tax = items.reduce((acc: number, it: any) => acc + (it.price * it.quantity * (it.category === "Electronics" ? 0.10 : 0.02)), 0)
      let discountAmount = 0
      if (activeDiscount) {
        if (activeDiscount.type === "PERCENT") discountAmount = (subtotal * activeDiscount.value) / 100
        else if (activeDiscount.type === "FLAT_THRESHOLD" && subtotal >= activeDiscount.threshold) discountAmount = activeDiscount.value
      }
      const grandTotal = Math.max(0, subtotal + tax - discountAmount)
      result = {
        status: "success",
        receipt: {
          items: items.map((it: any) => ({
            id: it.id,
            name: it.name,
            price: it.price,
            quantity: it.quantity,
            subtotal: it.price * it.quantity,
            tax: Number((it.price * it.quantity * 0.02).toFixed(2)),
            total: Number((it.price * it.quantity * 1.02).toFixed(2))
          })),
          subtotal,
          tax: Number(tax.toFixed(2)),
          discount_amount: discountAmount,
          discount_name: activeDiscount?.name || "",
          grand_total: Number(grandTotal.toFixed(2))
        }
      }
    }

    if (result && result.status === "success") {
      const grandTotal = result.receipt.grand_total

      const saleId = await new Promise<number>((resolve, reject) => {
        db.run(
          `INSERT INTO Sales (total_amount, customer_name, customer_phone, customer_email, delivery_address, status, payment_method, payment_id, upi_ref_id)
           VALUES (?, ?, ?, ?, ?, 'Order Placed', ?, ?, ?)`,
          [
            grandTotal,
            customer?.name || "Shopper",
            customer?.phone || customer?.mobile || "",
            customer?.email || "",
            deliveryAddress || customer?.address || "Express Home Delivery",
            chosenMethod,
            chosenId,
            cleanUpiRefId
          ],
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
        db.run('UPDATE Products SET stock = MAX(0, stock - ?) WHERE id = ?', [item.quantity, item.id])
      }
      stmt.finalize()

      if (discountCode) {
        db.run('UPDATE Discounts SET active = 0 WHERE name = ?', [discountCode])
      }

      db.close()
      
      const billNo = `INV-${saleId.toString().padStart(5, '0')}`
      const orderId = `ORD-${new Date().getFullYear()}-${saleId.toString().padStart(4, '0')}`
      result.receipt.bill_no = billNo
      result.receipt.order_id = orderId
      result.receipt.status = 'Order Placed'
      result.receipt.payment_method = chosenMethod
      result.receipt.payment_id = chosenId
      result.receipt.upi_ref_id = cleanUpiRefId
      if (customer) result.receipt.customer = customer
      if (bags) result.receipt.bags = bags

      return NextResponse.json({
        ...result,
        billNo,
        orderId,
        saleId,
        status: 'Order Placed',
        paymentMethod: chosenMethod,
        paymentId: chosenId,
        upiRefId: cleanUpiRefId
      })
    } else {
      return NextResponse.json({ error: "Checkout calculation failed" }, { status: 500 })
    }
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
