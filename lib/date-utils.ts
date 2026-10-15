/**
 * Utility functions for dynamic dates and shelf-life calculations across the Equinox POS system.
 * Ensures that product expiry dates, demo sales, invoices, and return requests are dynamically
 * anchored to the date the app is opened/used (e.g., advancing 1 month when opened 1 month later).
 */

export const BASELINE_DATE = new Date("2026-10-15T00:00:00.000Z")

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function parseDateStr(str: string | null | undefined): Date | null {
  if (!str || str === "N/A" || str.trim() === "") return null
  const parts = str.trim().split(/\s+/)
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10)
    const month = MONTH_NAMES.indexOf(parts[1])
    const year = parseInt(parts[2], 10)
    if (!isNaN(day) && month !== -1 && !isNaN(year)) {
      return new Date(Date.UTC(year, month, day))
    }
  }
  const d = new Date(str)
  return isNaN(d.getTime()) ? null : d
}

export function formatDateStr(date: Date): string {
  const d = date.getUTCDate().toString().padStart(2, "0")
  const m = MONTH_NAMES[date.getUTCMonth()]
  const y = date.getUTCFullYear()
  return `${d} ${m} ${y}`
}

/**
 * Returns a dynamic expiry date anchored to the current execution date.
 * If the application is opened 1 month later, all dates automatically shift by 1 month,
 * preserving each product's exact intended shelf life!
 */
export function getDynamicExpiryDate(
  originalStr: string | null | undefined,
  currentDate: Date = new Date()
): string {
  if (!originalStr || originalStr === "N/A" || originalStr.trim() === "") return "N/A"
  const origDate = parseDateStr(originalStr)
  if (!origDate) return originalStr

  const diffMs = origDate.getTime() - BASELINE_DATE.getTime()
  const targetDate = new Date(currentDate.getTime() + diffMs)
  return formatDateStr(targetDate)
}

/**
 * Automatically synchronizes demo orders, return requests, and catalog expiry dates
 * in SQLite whenever the app is opened on a future date.
 */
export async function syncSampleDatesInDb(db: any): Promise<void> {
  return new Promise((resolve) => {
    // Check if sample sales exist
    db.all(
      "SELECT id, created_at, customer_email FROM Sales WHERE customer_email = 'user@equinox.com' ORDER BY id ASC",
      async (err: any, rows: any[]) => {
        if (err || !rows || rows.length === 0) {
          return resolve()
        }

        const now = new Date()
        const firstOrder = rows[0]
        if (!firstOrder || !firstOrder.created_at) {
          return resolve()
        }

        const firstOrderDate = new Date(firstOrder.created_at)
        const expectedDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
        const driftHours = Math.abs((expectedDate.getTime() - firstOrderDate.getTime()) / (1000 * 60 * 60))

        // If drift is more than 6 hours, re-anchor demo dates
        if (driftHours > 6) {
          const d2 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().replace("T", " ").substring(0, 19)
          const d4 = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().replace("T", " ").substring(0, 19)
          const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().replace("T", " ").substring(0, 19)
          const d14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().replace("T", " ").substring(0, 19)
          const d28 = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().replace("T", " ").substring(0, 19)

          const demoDates = [d2, d4, d7, d14, d28]

          for (let i = 0; i < rows.length; i++) {
            const targetDate = demoDates[i] || new Date(now.getTime() - (30 + i * 5) * 24 * 60 * 60 * 1000).toISOString().replace("T", " ").substring(0, 19)
            db.run("UPDATE Sales SET created_at = ? WHERE id = ?", [targetDate, rows[i].id])
            db.run("UPDATE ReturnRequests SET created_at = ? WHERE sale_id = ?", [targetDate, rows[i].id])
          }

          // Also update Priya Patel's demo order
          db.run("UPDATE Sales SET created_at = ? WHERE customer_email = 'priya@example.com'", [d2])
          db.run("UPDATE ReturnRequests SET created_at = ? WHERE customer_email = 'priya@example.com'", [d2])

          // Update reviewed_at for refunded order
          if (rows[2]) {
            db.run("UPDATE ReturnRequests SET reviewed_at = ? WHERE sale_id = ?", [d4, rows[2].id])
          }
        }

        resolve()
      }
    )
  })
}
