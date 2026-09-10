import { NextResponse } from "next/server"
import sqlite3 from "sqlite3"

export async function GET() {
  try {
    const db = new sqlite3.Database(process.env.DB_PATH || './pos.db')
    
    const employees = await new Promise((resolve, reject) => {
      db.all('SELECT id, name, role, billed_customers as billedCustomers FROM Employees WHERE role != "Admin"', (err, rows) => {
        if (err) return reject(err)
        resolve(rows)
      })
    })
    
    db.close()
    return NextResponse.json({ employees })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, role } = await request.json()
    
    // Generate ID and Password
    const id = `USR-${Math.floor(1000 + Math.random() * 9000)}`
    const password = Math.random().toString(36).slice(-8)
    
    const db = new sqlite3.Database(process.env.DB_PATH || './pos.db')
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO Employees (id, name, role, password) VALUES (?, ?, ?, ?)',
        [id, name, role, password],
        function(err) {
          if (err) return reject(err)
          resolve(null)
        }
      )
    })
    
    db.close()
    return NextResponse.json({ id, name, role, password, billedCustomers: 0 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}
