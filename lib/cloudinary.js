import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<Object>} Upload result
 */
export async function uploadFile(fileBuffer, fileName, folder = 'exam-complaints') {
  return new Promise((resolve, reject) => {
    const publicId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: folder,
        public_id: publicId,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        tags: ['exam-complaint', 'evidence'],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('Cloudinary upload success:', result.secure_url);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
          });
        }
      }
    ).end(fileBuffer);
  });
}

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteFile(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary delete result:', result);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
}

export default cloudinary;
