import { NextRequest, NextResponse } from 'next/server';
import { generateR2PresignedUploadUrl, uploadToR2, MAX_VIDEO_UPLOAD_SIZE_BYTES, MAX_VIDEO_UPLOAD_SIZE_MB } from '@/lib/r2';
import { verifyAdminRequest } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin privileges required.' },
        { status: 401 }
      );
    }

    const contentTypeHeader = req.headers.get('content-type') || '';

    // Mode 1: Request a Pre-Signed Upload URL (Best for large 500MB videos direct to R2)
    if (contentTypeHeader.includes('application/json')) {
      const body = await req.json();
      const filename = body.filename || `video_${Date.now()}.mp4`;
      const contentType = body.contentType || 'video/mp4';
      const fileSize = Number(body.fileSize || 0);

      if (fileSize > MAX_VIDEO_UPLOAD_SIZE_BYTES) {
        return NextResponse.json(
          {
            success: false,
            message: `Video size exceeds maximum limit of ${MAX_VIDEO_UPLOAD_SIZE_MB}MB.`,
          },
          { status: 400 }
        );
      }

      const { uploadUrl, fileUrl, key } = await generateR2PresignedUploadUrl(filename, contentType);

      return NextResponse.json({
        success: true,
        mode: 'presigned_url',
        uploadUrl,
        fileUrl,
        key,
        maxSizeMb: MAX_VIDEO_UPLOAD_SIZE_MB,
      });
    }

    // Mode 2: Direct Multipart Form Data Upload
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided for upload.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_VIDEO_UPLOAD_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        {
          success: false,
          message: `Video "${file.name}" (${sizeMb} MB) exceeds maximum allowed limit of ${MAX_VIDEO_UPLOAD_SIZE_MB}MB.`,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadToR2(buffer, file.name, file.type || 'video/mp4');

    return NextResponse.json({
      success: true,
      mode: 'direct',
      message: 'Video successfully uploaded to Cloudflare R2 storage.',
      url: result.url,
      key: result.key,
      fileSizeBytes: result.sizeBytes,
    });
  } catch (error: any) {
    console.error('Cloudflare R2 upload error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to upload video to Cloudflare R2.',
      },
      { status: 500 }
    );
  }
}
