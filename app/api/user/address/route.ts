import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { email, address } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    const cleanAddress = typeof address === "string" ? address.trim() : ""
    const db = getDb()

    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE Users SET address = ? WHERE email = ?`,
        [cleanAddress, email.trim().toLowerCase()],
        function (err) {
          if (err) return reject(err)
          resolve()
        }
      )
    })

    db.close()

    return NextResponse.json({
      success: true,
      message: "Delivery address updated successfully",
      address: cleanAddress
    })
  } catch (error) {
    console.error("Address update error:", error)
    return NextResponse.json({ success: false, error: "Failed to update address" }, { status: 500 })
  }
}
