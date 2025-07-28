import { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, File } from 'formidable'
import { uploadFile } from '@/lib/cloudinary'
import fs from 'fs'
import path from 'path'
import { getSessionFromRequest } from '@/lib/auth'

export const config = {
  api: {
    bodyParser: false,
  },
}

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
  
  console.log('Upload API called with type:', req.query.type)
  
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
    })    // Define allowed file types
    const allowedFileTypes = type === 'profile' 
      ? ['.jpg', '.jpeg', '.png', '.gif']
      : ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx']

    form.on('fileBegin', (name, file) => {
      const ext = path.extname(file.originalFilename || '').toLowerCase()
      
      if (!allowedFileTypes.includes(ext)) {
        console.error(`Invalid file type: ${ext}. Allowed types: ${allowedFileTypes.join(', ')}`)
        return
      }      // Generate unique filename for temp storage
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

      console.log('Files received:', Object.keys(files))
      console.log('Fields received:', Object.keys(fields))

      const file = Array.isArray(files.file) ? files.file[0] : files.file

      if (!file) {
        console.log('No file found in upload')
        return res.status(400).json({ success: false, message: 'No file uploaded' })
      }

      console.log('File details:', {
        originalFilename: file.originalFilename,
        size: file.size,
        mimetype: file.mimetype,
        filepath: file.filepath
      })

      // Validate file type again
      const ext = path.extname(file.originalFilename || '').toLowerCase()
      if (!allowedFileTypes.includes(ext)) {
        console.log(`File type validation failed: ${ext}`)
        return res.status(400).json({ 
          success: false, 
          message: `Invalid file type: ${ext}. Allowed types: ${allowedFileTypes.join(', ')}` 
        })
      }

      try {
        // Verify file was uploaded successfully
        if (!fs.existsSync(file.filepath)) {
          return res.status(500).json({ success: false, message: 'File upload failed' })        }
        
        // Generate unique filename for Cloudinary
        const timestamp = Date.now()
        const userId = session.userId
        const ext = path.extname(file.originalFilename || '')
        const folder = type === 'profile' ? 'profile-pics' : 'evidence'
        
        // Read the file buffer
        const fileBuffer = fs.readFileSync(file.filepath)

        try {
          // Upload to Cloudinary
          const uploadResult = await uploadFile(fileBuffer, file.originalFilename || 'file', folder) as any

          // Clean up temp file
          if (fs.existsSync(file.filepath)) {
            fs.unlinkSync(file.filepath)
          }

          console.log(`File uploaded successfully to Cloudinary: ${uploadResult.url}`)
          
          res.status(200).json({
            success: true,
            url: uploadResult.url,
            message: 'File uploaded successfully'
          })

        } catch (uploadError: any) {
          console.error('Cloudinary upload error:', uploadError)
          // Clean up temp file
          if (fs.existsSync(file.filepath)) {
            fs.unlinkSync(file.filepath)
          }
          return res.status(500).json({ 
            success: false, 
            message: `Failed to upload to Cloudinary: ${uploadError.message || uploadError}` 
          })
        }

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
