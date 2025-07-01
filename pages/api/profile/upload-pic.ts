import { Storage } from "@google-cloud/storage"
import type { NextApiRequest, NextApiResponse } from "next"

const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GCLOUD_CLIENT_EMAIL,
    private_key: process.env.GCLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
})

const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET!)

interface UploadPicRequestBody {
    fileName: string
    fileType: string
}

interface UploadPicResponse {
    url: string
    publicUrl: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<UploadPicResponse | void>
) {
    if (req.method !== "POST") return res.status(405).end()
    const { fileName, fileType }: UploadPicRequestBody = req.body
    const blob = bucket.file(`profile-pics/${Date.now()}-${fileName}`)
    const [url]: [string] = await blob.getSignedUrl({
        version: "v4",
        action: "write",
        expires: Date.now() + 10 * 60 * 1000,
        contentType: fileType,
    })
    const publicUrl: string = `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    res.status(200).json({ url, publicUrl })
}