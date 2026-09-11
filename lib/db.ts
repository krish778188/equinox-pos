import { createClient } from '@libsql/client'
import sqlite3 from 'sqlite3'

const tursoUrl = process.env.TURSO_DATABASE_URL
const tursoToken = process.env.TURSO_AUTH_TOKEN

let client: any = null
if (tursoUrl && tursoToken) {
  client = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  })
}

export class Database {
  private db: any
  
  constructor(path: string) {
    if (!client) {
      this.db = new sqlite3.Database(path)
    }
  }

  async get(sql: string, paramsOrCallback: any, callback?: any) {
    const params = typeof paramsOrCallback === 'function' ? [] : paramsOrCallback
    const cb = typeof paramsOrCallback === 'function' ? paramsOrCallback : callback

    if (client) {
      try {
        const result = await client.execute({ sql, args: params })
        cb(null, result.rows[0])
      } catch (e) {
        cb(e, null)
      }
    } else {
      this.db.get(sql, params, cb)
    }
  }

  async all(sql: string, paramsOrCallback: any, callback?: any) {
    const params = typeof paramsOrCallback === 'function' ? [] : paramsOrCallback
    const cb = typeof paramsOrCallback === 'function' ? paramsOrCallback : callback
    
    if (client) {
      try {
        const result = await client.execute({ sql, args: params })
        cb(null, result.rows)
      } catch (e) {
        cb(e, null)
      }
    } else {
      this.db.all(sql, params, cb)
    }
  }

  async run(sql: string, paramsOrCallback?: any, callback?: any) {
    const params = typeof paramsOrCallback === 'function' ? [] : (paramsOrCallback || [])
    const cb = typeof paramsOrCallback === 'function' ? paramsOrCallback : callback

    if (client) {
      try {
        const result = await client.execute({ sql, args: params })
        if (cb) {
          cb.call({ lastID: Number(result.lastInsertRowid), changes: result.rowsAffected }, null)
        }
      } catch (e) {
        if (cb) cb(e)
      }
    } else {
      this.db.run(sql, params, cb)
    }
  }

  prepare(sql: string) {
    if (client) {
      return {
        run: async (...args: any[]) => {
          try {
            await client.execute({ sql, args })
          } catch (e) {
            console.error(e)
          }
        },
        finalize: () => {}
      }
    } else {
      return this.db.prepare(sql)
    }
  }

  close() {
    if (!client) {
      this.db.close()
    }
  }
}

export default {
  Database
}
