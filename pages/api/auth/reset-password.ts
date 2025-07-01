import { getDb } from '@/lib/db'
import bcryptjs from 'bcryptjs'
import type { NextApiRequest, NextApiResponse } from 'next'

interface ResetPasswordRequestBody {
    token: string
    password: string
    userId: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') return res.status(405).end()
    const { token, userId, password }: ResetPasswordRequestBody = req.body

    const db = await getDb()
    const [rows] = await db.execute(
      "SELECT * FROM password_reset_tokens WHERE token = ? AND userId = ?",
      [token, userId]
    )

    if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ message: "Invalid or expired token" })
    }

    const record = rows[0] as any
    if (new Date(record.expiresAt) < new Date()) {
        return res.status(400).json({ message: "Token expired" })
    }

    const hashedPassword = await bcryptjs.hash(password, 12)
    await db.execute(
      `UPDATE users SET password = ?, passwordUpdatedAt = NOW(), updatedAt = NOW() WHERE id = ?`,
      [hashedPassword, userId]
    )

    await db.execute(
      "DELETE FROM password_reset_tokens WHERE token = ? AND userId = ?",
      [token, userId]
    )

    res.status(200).json({ message: "Password updated successfully" })
}