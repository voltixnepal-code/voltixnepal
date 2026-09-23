import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

// Configure Cloudinary server-side SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'scmeiafw',
  api_key: process.env.CLOUDINARY_API_KEY || '967765172758764',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'ZIWtPqDACV4-cDkySQCMH_9A1u0',
  secure: true,
});

export const MAX_UPLOAD_SIZE_BYTES = 95 * 1024 * 1024; // 95 MB limit strictly enforced
export const MAX_UPLOAD_SIZE_MB = 95;

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  original_filename: string;
}

/**
 * Upload a Buffer to Cloudinary
 * Automatically handles images, videos, raw files, and documents
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  options: {
    folder?: string;
    filename?: string;
    resourceType?: 'auto' | 'image' | 'video' | 'raw';
  } = {}
): Promise<CloudinaryUploadResult> {
  const { folder = 'voltixnepal/media', filename, resourceType = 'auto' } = options;

  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    };

    if (filename) {
      // Clean filename for public_id prefix
      uploadOptions.public_id = `${filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}`;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload returned empty response'));
        }

        resolve({
          url: result.url,
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format || '',
          resource_type: result.resource_type,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
          duration: result.duration,
          original_filename: result.original_filename || filename || 'file',
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Delete a media asset from Cloudinary
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
) {
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Failed to delete asset from Cloudinary:', error);
    throw error;
  }
}

export default cloudinary;
