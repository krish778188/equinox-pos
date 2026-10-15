import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const identifier = (body.identifier || body.id || body.email || body.mobile || "").trim()
    const password = (body.password || "").trim()

    if (!identifier || !password) {
      return NextResponse.json({ success: false, error: "Please enter your email/mobile and password." }, { status: 400 })
    }

    const db = getDb()

    // 1. Check Users table first (by email, mobile, or id)
    const user: any = await new Promise((resolve) => {
      db.get(
        'SELECT id, name, email, mobile, role, address, password FROM Users WHERE (LOWER(email) = LOWER(?) OR mobile = ? OR id = ?)',
        [identifier, identifier, identifier],
        (err, row) => resolve(row)
      )
    })

    if (user && user.password === password) {
      db.close()
      const { password: _, ...cleanUser } = user
      return NextResponse.json({ success: true, user: cleanUser })
    }

    // 2. Fallback to Employees table (e.g. admin: equinox@123)
    const employee: any = await new Promise((resolve) => {
      db.get(
        'SELECT id, name, role FROM Employees WHERE (id = ? OR name = ?) AND password = ?',
        [identifier, identifier, password],
        (err, row) => resolve(row)
      )
    })

    db.close()

    if (employee) {
      return NextResponse.json({ success: true, user: employee })
    } else {
      return NextResponse.json({ success: false, error: "Invalid credentials. Please check your email/mobile and password." }, { status: 401 })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
