// pages/api/auth/logout.ts

import { NextApiRequest, NextApiResponse } from "next"
import { serialize } from "cookie"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }
  try {
    // Clear both session cookies (admin and student)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      expires: new Date(0), // This will immediately expire the cookie
    }

    res.setHeader("Set-Cookie", [
      serialize("admin_session", "", cookieOptions),
      serialize("student_session", "", cookieOptions),
      serialize("session", "", cookieOptions), // Clear old session cookie too
    ])

    return res.status(200).json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    return res.status(500).json({ success: false, message: "Failed to logout" })
  }
}
