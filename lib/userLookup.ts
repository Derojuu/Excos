// lib/userLookup.ts

import { getDb } from "@/lib/db"

export async function getUserByEmailOrStudentId(email: string, studentId: string) {
  const db = await getDb()
  interface User {
    id: number
    email: string
    studentId: string
    role: string
    firstName: string
    lastName: string
    password: string
  }

  const result = await db.query<User[]>`
    SELECT id, email, studentId, role, firstName, lastName, password 
    FROM users 
    WHERE email = ${email} OR studentId = ${studentId}
  `
  const user = result[0]

  return user
}
