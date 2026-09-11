import { NextResponse } from "next/server"
import sqlite3 from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { id, password } = await request.json()
    
    // We already have admin hardcoded in pos-data, but we've also added it to SQLite.
    const db = new sqlite3.Database(process.env.DB_PATH || './pos.db')
    
    const employee: any = await new Promise((resolve, reject) => {
      db.get('SELECT id, name, role FROM Employees WHERE id = ? AND password = ?', [id, password], (err, row) => {
        if (err) return reject(err)
        resolve(row)
      })
    })
    
    db.close()
    
    if (employee) {
      return NextResponse.json({ success: true, user: employee })
    } else {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
