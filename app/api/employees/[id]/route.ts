import { NextResponse } from "next/server"
import sqlite3 from "@/lib/db"

export async function DELETE(request: Request, context: any) {
  try {
    const { id } = await context.params
    const db = new sqlite3.Database(process.env.DB_PATH || './pos.db')
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM Employees WHERE id = ?', [id], function(err) {
        if (err) return reject(err)
        resolve(null)
      })
    })
    
    db.close()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 })
  }
}
