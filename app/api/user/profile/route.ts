import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { email, name, mobile, address, currentPassword, newPassword } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const db = getDb()

    // Find the user first
    const user: any = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM Users WHERE email = ?`, [cleanEmail], (err, row) => {
        if (err) return reject(err)
        resolve(row)
      })
    })

    if (!user) {
      db.close()
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        db.close()
        return NextResponse.json({ success: false, error: "Current password is required to change password" }, { status: 400 })
      }
      if (user.password !== currentPassword) {
        db.close()
        return NextResponse.json({ success: false, error: "Incorrect current password" }, { status: 401 })
      }
      if (newPassword.length < 4) {
        db.close()
        return NextResponse.json({ success: false, error: "New password must be at least 4 characters" }, { status: 400 })
      }
    }

    const updatedName = typeof name === "string" && name.trim() ? name.trim() : user.name
    const updatedMobile = typeof mobile === "string" ? mobile.trim() : user.mobile
    const updatedAddress = typeof address === "string" ? address.trim() : user.address
    const updatedPassword = newPassword ? newPassword : user.password

    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE Users SET name = ?, mobile = ?, address = ?, password = ? WHERE email = ?`,
        [updatedName, updatedMobile, updatedAddress, updatedPassword, cleanEmail],
        function (err) {
          if (err) return reject(err)
          resolve()
        }
      )
    })

    db.close()

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: updatedName,
        email: cleanEmail,
        mobile: updatedMobile,
        address: updatedAddress,
        role: user.role
      }
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 })
  }
}
