import { NextResponse } from "next/server"
import sqlite3 from "sqlite3"

export async function POST(request: Request) {
  try {
    const { name, email, mobile, password, address } = await request.json()

    if (!name || !email || !mobile || !password) {
      return NextResponse.json({ success: false, error: "Please fill in all required fields (Name, Email, Mobile, Password)" }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanMobile = mobile.trim()

    const db = new sqlite3.Database(process.env.DB_PATH || './pos.db')

    // Check if email or mobile already registered
    const existing = await new Promise<any>((resolve) => {
      db.get('SELECT id FROM Users WHERE email = ? OR mobile = ?', [cleanEmail, cleanMobile], (err, row) => {
        resolve(row)
      })
    })

    if (existing) {
      db.close()
      return NextResponse.json({ success: false, error: "An account with this email or mobile number already exists." }, { status: 400 })
    }

    const newUser: any = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO Users (name, email, mobile, password, role, address) VALUES (?, ?, ?, ?, 'user', ?)`,
        [name.trim(), cleanEmail, cleanMobile, password, address ? address.trim() : ""],
        function (err) {
          if (err) return reject(err)
          resolve({
            id: this.lastID,
            name: name.trim(),
            email: cleanEmail,
            mobile: cleanMobile,
            role: 'user',
            address: address ? address.trim() : ""
          })
        }
      )
    })

    db.close()

    return NextResponse.json({
      success: true,
      message: "Account created successfully! Welcome to Equinox Supermarket.",
      user: newUser
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ success: false, error: "Failed to create account" }, { status: 500 })
  }
}
