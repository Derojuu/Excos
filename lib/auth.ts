// lib/auth.ts
import bcryptjs from "bcryptjs"
import { parse } from "cookie"
import type { NextApiRequest } from "next"

interface Session {
  userId: string
  role: string
}

// Helper function to hash passwords
export async function hashPassword(password: string) {
  return bcryptjs.hash(password, 10)
}

// Helper function to compare passwords (for login)
export async function verifyPassword(plainPassword: string, hashedPassword: string) {
  return bcryptjs.compare(plainPassword, hashedPassword)
}

// Helper function to get session from role-specific cookies
export function getSessionFromRequest(req: NextApiRequest): Session | null {
  try {
    // For newer requests with headers.cookie
    if (req.headers.cookie) {
      const cookies = parse(req.headers.cookie)
      const adminSession = cookies.admin_session
      const studentSession = cookies.student_session
      const oldSession = cookies.session // Fallback for old sessions

      const sessionCookie = adminSession || studentSession || oldSession

      if (sessionCookie) {
        return JSON.parse(decodeURIComponent(sessionCookie))
      }
    }

    // For older requests using req.cookies
    if (req.cookies) {
      const adminSession = req.cookies.admin_session
      const studentSession = req.cookies.student_session
      const oldSession = req.cookies.session

      const sessionCookie = adminSession || studentSession || oldSession

      if (sessionCookie) {
        return typeof sessionCookie === 'string' 
          ? JSON.parse(sessionCookie)
          : sessionCookie
      }
    }

    return null
  } catch (error) {
    console.error("Error parsing session:", error)
    return null
  }
}

// Helper function to verify admin authentication
export function verifyAdminAuth(req: NextApiRequest): string | null {
  const session = getSessionFromRequest(req)
  
  if (!session || !session.userId || session.role !== 'admin') {
    return null
  }
  
  return session.userId
}

// Helper function to verify student authentication
export function verifyStudentAuth(req: NextApiRequest): string | null {
  const session = getSessionFromRequest(req)
  
  if (!session || !session.userId || session.role !== 'student') {
    return null
  }
  
  return session.userId
}

// Helper function to verify any user authentication
export function verifyUserAuth(req: NextApiRequest): { userId: string, role: string } | null {
  const session = getSessionFromRequest(req)
  
  if (!session || !session.userId || !session.role) {
    return null
  }
  
  return { userId: session.userId, role: session.role }
}


