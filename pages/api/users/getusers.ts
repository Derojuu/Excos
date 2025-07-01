// pages/api/users/getUser.ts

import { NextApiRequest, NextApiResponse } from "next"
import { getCurrentUser } from "@/app/actions/auth" // Replace with the correct path to the module

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const user = await getCurrentUser()

    if (user) {
      res.status(200).json(user)
    } else {
      res.status(404).json({ success: false, message: "User not found" })
    }
  } else {
    res.status(405).json({ success: false, message: "Method Not Allowed" })
  }
}
