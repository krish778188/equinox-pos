import { NextResponse } from "next/server"
import sqlite3 from "@/lib/db"

export async function GET() {
  try {
    const db = new sqlite3.Database(process.env.DB_PATH || './pos.db')
    
    // Migrations for existing DBs
    await new Promise<void>(resolve => db.run('ALTER TABLE Employees ADD COLUMN phone VARCHAR(50)', () => resolve()))
    await new Promise<void>(resolve => db.run('ALTER TABLE Employees ADD COLUMN address TEXT', () => resolve()))
    await new Promise<void>(resolve => db.run('ALTER TABLE Employees ADD COLUMN id_type VARCHAR(50)', () => resolve()))
    await new Promise<void>(resolve => db.run('ALTER TABLE Employees ADD COLUMN govt_id VARCHAR(100)', () => resolve()))
    await new Promise<void>(resolve => db.run("ALTER TABLE Employees ADD COLUMN created_at TIMESTAMP DEFAULT '2026-09-10 00:00:00'", () => resolve()))

    const employees = await new Promise((resolve, reject) => {
      db.all('SELECT id, name, role, phone, address, id_type, govt_id, created_at, billed_customers as billedCustomers FROM Employees WHERE role != "Admin"', (err, rows) => {
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
    const { name, role, phone, address, idType, govtId } = await request.json()
    
    // Generate ID and Password
    const id = `USR-${Math.floor(1000 + Math.random() * 9000)}`
    const password = Math.random().toString(36).slice(-8)
    
    const db = new sqlite3.Database(process.env.DB_PATH || './pos.db')

    await new Promise<void>(resolve => db.run('ALTER TABLE Employees ADD COLUMN phone VARCHAR(50)', () => resolve()))
    await new Promise<void>(resolve => db.run('ALTER TABLE Employees ADD COLUMN address TEXT', () => resolve()))
    await new Promise<void>(resolve => db.run('ALTER TABLE Employees ADD COLUMN id_type VARCHAR(50)', () => resolve()))
    await new Promise<void>(resolve => db.run('ALTER TABLE Employees ADD COLUMN govt_id VARCHAR(100)', () => resolve()))
    await new Promise<void>(resolve => db.run("ALTER TABLE Employees ADD COLUMN created_at TIMESTAMP DEFAULT '2026-09-10 00:00:00'", () => resolve()))
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO Employees (id, name, role, password, phone, address, id_type, govt_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [id, name, role, password, phone, address, idType, govtId],
        function(err) {
          if (err) return reject(err)
          resolve(null)
        }
      )
    })
    
    db.close()
    return NextResponse.json({ id, name, role, password, phone, address, id_type: idType, govt_id: govtId, created_at: new Date().toISOString(), billedCustomers: 0 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}
