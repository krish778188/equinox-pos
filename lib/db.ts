import sqlite3 from "sqlite3"
import path from "path"
import fs from "fs"

import { syncSampleDatesInDb } from "./date-utils"

let isInitialized = false

export function getDbPath(): string {
  if (process.env.DB_PATH) return process.env.DB_PATH

  const cwdDb = path.resolve(process.cwd(), "pos.db")
  if (fs.existsSync(cwdDb)) return cwdDb

  const rootDb = path.resolve(__dirname, "..", "pos.db")
  if (fs.existsSync(rootDb)) return rootDb

  return cwdDb
}

export function getDb(): sqlite3.Database {
  const dbPath = getDbPath()
  const db = new sqlite3.Database(dbPath)

  if (!isInitialized) {
    isInitialized = true
    db.get("SELECT count(*) as count FROM Products", (err, row: any) => {
      if (err || !row || row.count < 30) {
        console.log("Database uninitialized or empty. Auto-seeding catalog & sample orders at", dbPath)
        try {
          const initModule = require("../init-db.js")
          initModule.initDb(dbPath).catch((e: any) => console.error("Auto-init error:", e))
        } catch (e) {
          console.error("Auto-init require error:", e)
        }
      } else {
        syncSampleDatesInDb(db).catch(() => {})
      }
    })
  }

  return db
}
