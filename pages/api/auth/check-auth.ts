import { NextApiRequest, NextApiResponse } from "next"
import { parse } from "cookie"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }
  try {
    const cookies = parse(req.headers.cookie || "")
    
    // Check for role-specific session cookies
    const adminSession = cookies.admin_session
    const studentSession = cookies.student_session
    const oldSession = cookies.session // Fallback for old sessions

    let sessionCookie = adminSession || studentSession || oldSession

    if (!sessionCookie) {
      return res.status(401).json({ message: "Not authenticated" })
    }

    const session = JSON.parse(decodeURIComponent(sessionCookie))
    
    if (!session?.userId || !session?.role) {
      return res.status(401).json({ message: "Invalid session" })
    }

    return res.status(200).json({
      userId: session.userId,
      role: session.role,
    })

  } catch (error) {
    console.error("Auth check error:", error)
    return res.status(500).json({ message: "Authentication failed" })
  }
}