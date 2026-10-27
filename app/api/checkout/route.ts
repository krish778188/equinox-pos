import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import { getDb } from '@/lib/db'

const execAsync = promisify(exec)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items, customer, bags, discountCode, deliveryAddress, paymentMethod, paymentId, upiRefId, useWallet } = body

    const db = getDb()

    // 1. Fetch user's wallet balance if useWallet is requested
    let currentWalletBalance = 0
    const customerEmail = (customer?.email || "").trim().toLowerCase()
    if (useWallet && customerEmail) {
      const userRow: any = await new Promise((resolve) => {
        db.get('SELECT wallet_balance FROM Users WHERE LOWER(email) = ?', [customerEmail], (err, row) => resolve(row))
      })
      if (userRow && userRow.wallet_balance > 0) {
        currentWalletBalance = Number(userRow.wallet_balance)
      }
    }

    // Check if wallet covers 100% of order
    const rawItemsTotal = (items || []).reduce((acc: number, it: any) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0)
    const isFullyPaidByWallet = Boolean(useWallet && currentWalletBalance >= (rawItemsTotal * 1.05 + 40))

    // Ensure payment method
    let chosenMethod = isFullyPaidByWallet
      ? 'Equinox Wallet'
      : paymentMethod === 'Cash on Delivery'
        ? 'Cash on Delivery'
        : 'UPI (krishraj453@okicici)'
    const isUpi = chosenMethod.startsWith('UPI')

    // Compulsory UPI Reference ID validation (only if paying via UPI and not fully covered by wallet)
    if (!isFullyPaidByWallet && isUpi && (!upiRefId || !upiRefId.trim())) {
      db.close()
      return NextResponse.json({ 
        error: "UPI Reference / UTR Number is compulsory for UPI payments. Please complete the payment in your UPI app and enter the reference number." 
      }, { status: 400 })
    }

    const cleanUpiRefId = isUpi ? upiRefId.trim() : "N/A"
    const chosenId = paymentId || (
      isFullyPaidByWallet
        ? `EQX-WLT-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`
        : isUpi 
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
      let grandTotal = Number(result.receipt.grand_total || 0)
      let walletAmountUsed = 0

      // Apply wallet deduction if user requested and has balance
      if (useWallet && currentWalletBalance > 0 && customerEmail) {
        walletAmountUsed = Math.min(currentWalletBalance, grandTotal)
        grandTotal = Number(Math.max(0, grandTotal - walletAmountUsed).toFixed(2))

        if (grandTotal === 0) {
          chosenMethod = 'Equinox Wallet'
          chosenId = `EQX-WLT-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`
        } else {
          chosenMethod = `${chosenMethod} (+ Wallet ₹${walletAmountUsed.toFixed(2)})`
        }
      }

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

      // If wallet balance was used, deduct from Users and record transaction
      let remainingWalletBalance = currentWalletBalance
      if (walletAmountUsed > 0 && customerEmail) {
        remainingWalletBalance = Number(Math.max(0, currentWalletBalance - walletAmountUsed).toFixed(2))
        await new Promise<void>((resolve) => {
          db.run(
            'UPDATE Users SET wallet_balance = MAX(0, wallet_balance - ?) WHERE LOWER(email) = ?',
            [walletAmountUsed, customerEmail],
            () => resolve()
          )
        })

        await new Promise<void>((resolve) => {
          db.run(
            `INSERT INTO WalletTransactions (user_email, amount, type, description, reference_id) VALUES (?, ?, 'DEBIT', ?, ?)`,
            [
              customerEmail,
              walletAmountUsed,
              `Redeemed on Supermarket Order #${saleId}`,
              `ORD-${saleId}`
            ],
            () => resolve()
          )
        })
      }

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
      result.receipt.grand_total = grandTotal
      result.receipt.wallet_used = walletAmountUsed
      result.receipt.new_wallet_balance = remainingWalletBalance
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
        upiRefId: cleanUpiRefId,
        walletUsed: walletAmountUsed,
        newWalletBalance: remainingWalletBalance
      })
    } else {
      return NextResponse.json({ error: "Checkout calculation failed" }, { status: 500 })
    }
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
