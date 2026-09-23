import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, MAX_UPLOAD_SIZE_BYTES, MAX_UPLOAD_SIZE_MB } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('file') as File[];
    const folder = (formData.get('folder') as string) || 'voltixnepal/media';

    if (!files || files.length === 0) {
      // Check if a single 'files' parameter was passed
      const singleFile = formData.get('file') as File | null;
      if (!singleFile) {
        return NextResponse.json(
          { success: false, error: 'No file provided for upload.' },
          { status: 400 }
        );
      }
      files.push(singleFile);
    }

    const uploadedResults = [];

    for (const file of files) {
      if (!file || typeof file === 'string') continue;

      // 1. Strict size check: 95MB limit (videos and all files must be < 95MB)
      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" (${sizeInMb} MB) exceeds the maximum allowed upload limit of ${MAX_UPLOAD_SIZE_MB}MB. Please select a file under 95MB.`,
          },
          { status: 400 }
        );
      }

      // 2. Read array buffer & convert to node Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Determine resource type hint based on MIME type
      let resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto';
      if (file.type.startsWith('image/')) {
        resourceType = 'image';
      } else if (file.type.startsWith('video/')) {
        resourceType = 'video';
      }

      // 3. Upload to Cloudinary
      const result = await uploadToCloudinary(buffer, {
        folder,
        filename: file.name,
        resourceType,
      });

      uploadedResults.push({
        url: result.secure_url,
        secure_url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
        size_mb: (result.bytes / (1024 * 1024)).toFixed(2),
        width: result.width,
        height: result.height,
        duration: result.duration,
        original_filename: file.name,
      });
    }

    if (uploadedResults.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid files were processed.' },
        { status: 400 }
      );
    }

    // Return single result if 1 file uploaded, or array if multiple
    if (uploadedResults.length === 1) {
      return NextResponse.json({
        success: true,
        message: 'File successfully uploaded to Cloudinary storage.',
        ...uploadedResults[0],
      });
    }

    return NextResponse.json({
      success: true,
      message: `${uploadedResults.length} files successfully uploaded to Cloudinary storage.`,
      files: uploadedResults,
    });
  } catch (error: any) {
    console.error('Cloudinary API upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to upload media to Cloudinary storage.',
      },
      { status: 500 }
    );
  }
}
