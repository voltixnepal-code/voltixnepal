import * as admin from 'firebase-admin';

let app: admin.app.App | null = null;

export function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    return app;
  }

  // Graceful fallback for local development before admin keys are set
  return null;
}

export async function verifyIdToken(token: string) {
  const adminApp = getFirebaseAdmin();
  if (!adminApp) {
    // In local dev without credentials, decode safe token payload or return null
    return null;
  }
  try {
    return await adminApp.auth().verifyIdToken(token);
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return null;
  }
}
