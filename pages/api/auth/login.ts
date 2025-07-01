import { NextApiRequest, NextApiResponse } from "next"
import { serialize } from "cookie"
import { loginUser } from "@/app/actions/auth"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const { email, password, role } = req.body
    console.log("Login request received:", { email, role })

    // Validate inputs
    if (!email || !password || !role) {
      console.log("Missing required fields:", { 
        hasEmail: !!email, 
        hasPassword: !!password, 
        hasRole: !!role 
      })
      return res.status(400).json({        success: false,
        message: "Missing required fields"
      })
    }

    const result = await loginUser(email, password, role)
    console.log("Login result:", result)

    if (result.success && result.user) {
      // Clear all existing sessions and set the new session
      const sessionData = {
        userId: result.user.id,
        role: result.user.role
      }

      const cookiesToSet = [
        // Clear any existing sessions
        serialize('admin_session', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 0
        }),
        serialize('student_session', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 0
        }),
        serialize('session', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 0
        }),
        // Set the new session
        serialize('session', JSON.stringify(sessionData), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })
      ]

      res.setHeader("Set-Cookie", cookiesToSet)

      return res.status(200).json(result)
    } else {
      return res.status(400).json(result)
    }
  } catch (error) {
    console.error("Login handler error:", error)
    return res.status(500).json({
      success: false,
      message: "Login failed"
    })
  }
}