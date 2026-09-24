import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const MAX_VIDEO_UPLOAD_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB video limit strictly enforced
export const MAX_VIDEO_UPLOAD_SIZE_MB = 500;

const accountId = process.env.R2_ACCOUNT_ID || '';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
export const bucketName = process.env.R2_BUCKET_NAME || 'voltixnepal-videos';
export const publicDomain = process.env.R2_PUBLIC_DOMAIN || `https://${bucketName}.r2.cloudflarestorage.com`;

let r2ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!r2ClientInstance) {
    if (!accountId || !accessKeyId || !secretAccessKey) {
      console.warn('Cloudflare R2 credentials are not fully configured in environment variables.');
    }

    r2ClientInstance = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId || 'dummy_access_key',
        secretAccessKey: secretAccessKey || 'dummy_secret_key',
      },
    });
  }
  return r2ClientInstance;
}

export interface R2UploadResult {
  url: string;
  key: string;
  bucket: string;
  sizeBytes: number;
  contentType: string;
}

/**
 * Generate a pre-signed URL for direct client-to-R2 upload (ideal for 500MB videos)
 */
export async function generateR2PresignedUploadUrl(
  filename: string,
  contentType: string = 'video/mp4',
  expiresInSeconds: number = 3600
): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
  const client = getR2Client();
  const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `videos/${Date.now()}_${cleanName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  const fileUrl = publicDomain.endsWith('/')
    ? `${publicDomain}${key}`
    : `${publicDomain}/${key}`;

  return { uploadUrl, fileUrl, key };
}

/**
 * Upload a Buffer directly to Cloudflare R2
 */
export async function uploadToR2(
  fileBuffer: Buffer,
  filename: string,
  contentType: string = 'video/mp4'
): Promise<R2UploadResult> {
  const client = getR2Client();
  const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `videos/${Date.now()}_${cleanName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await client.send(command);

  const fileUrl = publicDomain.endsWith('/')
    ? `${publicDomain}${key}`
    : `${publicDomain}/${key}`;

  return {
    url: fileUrl,
    key,
    bucket: bucketName,
    sizeBytes: fileBuffer.length,
    contentType,
  };
}

/**
 * Delete a file from Cloudflare R2
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  try {
    const client = getR2Client();
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Failed to delete file from Cloudflare R2:', error);
    return false;
  }
}
