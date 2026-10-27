import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const db = getDb()

    const user: any = await new Promise((resolve) => {
      db.get(
        "SELECT id, name, email, wallet_balance FROM Users WHERE LOWER(email) = ?",
        [cleanEmail],
        (err, row) => resolve(row)
      )
    })

    if (!user) {
      db.close()
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const transactions: any[] = await new Promise((resolve) => {
      db.all(
        "SELECT id, amount, type, description, reference_id, created_at FROM WalletTransactions WHERE LOWER(user_email) = ? ORDER BY id DESC",
        [cleanEmail],
        (err, rows) => resolve(rows || [])
      )
    })

    db.close()

    return NextResponse.json(
      {
        success: true,
        wallet_balance: Number(user.wallet_balance || 0),
        transactions
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      }
    )
  } catch (error) {
    console.error("Wallet fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch wallet details" }, { status: 500 })
  }
}
