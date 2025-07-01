import { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, File } from 'formidable'
import { Storage } from '@google-cloud/storage'
import fs from 'fs'
import path from 'path'
import { getSessionFromRequest } from '@/lib/auth'

export const config = {
  api: {
    bodyParser: false,
  },
}

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID || 'fast-ability-462909-u9',
  credentials: {
    client_email: process.env.GCLOUD_CLIENT_EMAIL,
    private_key: process.env.GCLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
})

const bucketName = process.env.GCLOUD_STORAGE_BUCKET || 'excos-bucket'
const bucket = storage.bucket(bucketName)

interface Session {
  userId: string
  role: string
}

interface UploadResponse {
  success: boolean
  url?: string
  message?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }
  try {
    // Check authentication using the helper function
    const session = getSessionFromRequest(req)
    
    if (!session || !session.userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' })
    }

    // Get upload type from query
    const { type } = req.query
    
    if (!type || (type !== 'profile' && type !== 'evidence')) {
      return res.status(400).json({ success: false, message: 'Invalid upload type' })
    }

    // Create temporary directory for processing uploads
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const form = new IncomingForm({
      uploadDir: tempDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    })

    // Define allowed file types
    const allowedFileTypes = type === 'profile' 
      ? ['.jpg', '.jpeg', '.png', '.gif']
      : ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx']

    form.on('fileBegin', (name, file) => {
      const ext = path.extname(file.originalFilename || '').toLowerCase()
      
      if (!allowedFileTypes.includes(ext)) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid file type. Allowed types: ${allowedFileTypes.join(', ')}` 
        })
      }

      // Generate unique filename for temp storage
      const timestamp = Date.now()
      const userId = session.userId
      const filename = `temp-${userId}-${timestamp}-${file.originalFilename}`
      file.filepath = path.join(tempDir, filename)
    })

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err)
        return res.status(400).json({ success: false, message: err.message })
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file

      if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' })
      }

      try {
        // Verify file was uploaded successfully
        if (!fs.existsSync(file.filepath)) {
          return res.status(500).json({ success: false, message: 'File upload failed' })
        }

        // Generate unique filename for GCS
        const timestamp = Date.now()
        const userId = session.userId
        const ext = path.extname(file.originalFilename || '')
        const gcsFileName = `${type}/${userId}-${timestamp}${ext}`        // Upload to Google Cloud Storage
        const fileUpload = bucket.file(gcsFileName)
        
        const stream = fileUpload.createWriteStream({
          metadata: {
            contentType: file.mimetype || 'application/octet-stream',
          },
          // Removed public: true to avoid legacy ACL issues
        })

        stream.on('error', (error) => {
          console.error('GCS upload error:', error)
          // Clean up temp file
          if (fs.existsSync(file.filepath)) {
            fs.unlinkSync(file.filepath)
          }
          return res.status(500).json({ success: false, message: 'Failed to upload to cloud storage' })
        })
        
        stream.on('finish', async () => {
          try {
            // Generate public URL (file will be accessible based on bucket permissions)
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${gcsFileName}`

            // Clean up temp file
            if (fs.existsSync(file.filepath)) {
              fs.unlinkSync(file.filepath)
            }

            console.log(`File uploaded successfully to GCS: ${gcsFileName}`)
            
            res.status(200).json({
              success: true,
              url: publicUrl,
              message: 'File uploaded successfully'
            })
          } catch (publicError) {
            console.error('Error making file public:', publicError)
            // Clean up temp file
            if (fs.existsSync(file.filepath)) {
              fs.unlinkSync(file.filepath)
            }
            return res.status(500).json({ success: false, message: 'Failed to make file public' })
          }
        })

        // Read temp file and pipe to GCS
        const readStream = fs.createReadStream(file.filepath)
        readStream.pipe(stream)

      } catch (error) {
        console.error('Error processing uploaded file:', error)
        
        // Clean up temp file if there was an error
        if (fs.existsSync(file.filepath)) {
          fs.unlinkSync(file.filepath)
        }
        
        res.status(500).json({ success: false, message: 'Failed to process uploaded file' })
      }
    })

  } catch (error) {
    console.error('Upload API error:', error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
