// pages/api/auth/register.ts

import { NextApiRequest, NextApiResponse } from "next"
import { registerStudent, registerAdmin } from "@/app/actions/auth"
import { hashPassword } from "@/lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, // Pass the plain password
      role,
      studentId,
      department,
      faculty,
      level,
      ...otherData 
    } = req.body

    // Remove password hashing from here
    // const hashedPassword = await hashPassword(password)

    let result
    if (role === "admin") {
      result = await registerAdmin({
        firstName,
        lastName,
        email,
        password, // Pass plain password
        ...otherData
      })
    } else {
      result = await registerStudent({
        firstName,
        lastName,
        email,
        password, // Pass plain password
        studentId,
        department,
        faculty,
        level,
        role: "student"
      })
    }

    if (result.success) {
      return res.status(200).json({
        ...result,
        redirectTo: "/login"
      })
    } else {
      return res.status(400).json(result)
    }
  } catch (error) {
    console.error("Registration error:", error)
    return res.status(500).json({ 
      success: false, 
      message: "Registration failed",
      error: error instanceof Error ? error.message : "An unknown error occurred"
    })
  }
}
