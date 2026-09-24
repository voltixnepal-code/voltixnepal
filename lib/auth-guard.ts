import { NextRequest } from 'next/server';
import { verifyIdToken } from './firebase-admin';

export interface AdminAuthResult {
  isAdmin: boolean;
  email?: string;
  error?: string;
}

export const AUTHORIZED_ADMIN_EMAILS = [
  'voltixnepal@gmail.com',
  'bishaldev949@gmail.com',
];

export async function verifyAdminRequest(req: NextRequest): Promise<AdminAuthResult> {
  const adminSecret = process.env.ADMIN_SECRET_KEY || 'voltix-secret-admin-token-super-secure-key';
  const envAdminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const allowedAdmins = Array.from(
    new Set([...AUTHORIZED_ADMIN_EMAILS, ...envAdminEmails, 'sanjit@voltixnepal.com'])
  );

  // 1. Check for Admin Session Cookie
  const sessionCookie = req.cookies.get('voltix_admin_session')?.value;
  if (sessionCookie && sessionCookie === adminSecret) {
    return { isAdmin: true, email: allowedAdmins[0] };
  }

  // 2. Check for Bearer token (Firebase ID Token or Custom Secret)
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1].trim();

    if (token === adminSecret) {
      return { isAdmin: true, email: allowedAdmins[0] };
    }

    // Attempt Firebase Admin ID token verification
    const decodedToken = await verifyIdToken(token);
    if (decodedToken && decodedToken.email) {
      const userEmail = decodedToken.email.toLowerCase();
      const isAuthorized =
        allowedAdmins.includes(userEmail) ||
        decodedToken.admin === true ||
        decodedToken.role === 'ADMIN';

      if (isAuthorized) {
        return { isAdmin: true, email: userEmail };
      }
    }
  }

  return { isAdmin: false, error: 'Unauthorized: Admin privileges required.' };
}
