import { sendResponseNotification } from "@/lib/email"

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { userEmail, examName, responseText, adminName, complaintId } = req.body;
  await sendResponseNotification(userEmail, { examName, responseText, adminName, complaintId });
  res.status(200).json({ message: "Notification sent" });
}