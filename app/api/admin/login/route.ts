import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const envAdminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const allowedEmails = Array.from(
      new Set(['voltixnepal@gmail.com', 'bishaldev949@gmail.com', ...envAdminEmails, 'sanjeet@voltixnepal.com'])
    );

    const configuredPin = process.env.ADMIN_INITIAL_PIN || 'Voltix2026Admin!';
    const adminSecret = process.env.ADMIN_SECRET_KEY || 'voltix-secret-admin-token-super-secure-key';

    const normalizedEmail = email.toLowerCase().trim();
    const isAllowedEmail = allowedEmails.includes(normalizedEmail);
    const isCorrectPin = password === configuredPin;

    if (!isAllowedEmail || !isCorrectPin) {
      return NextResponse.json(
        { success: false, message: 'Invalid admin credentials or unauthorized email.' },
        { status: 401 }
      );
    }

    // Ensure Admin record exists in database
    await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: { role: 'ADMIN' },
      create: {
        name: normalizedEmail.startsWith('bishal') ? 'Bishal Dev' : 'Voltix Admin',
        email: normalizedEmail,
        phone: '+977 9825870047',
        role: 'ADMIN',
      },
    });

    // Record login audit log
    await prisma.auditLog.create({
      data: {
        adminEmail: normalizedEmail,
        action: 'ADMIN_LOGIN_SUCCESS',
        entityType: 'Authentication',
        details: `Admin ${normalizedEmail} authenticated successfully`,
      },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
      admin: {
        name: normalizedEmail.startsWith('bishal') ? 'Bishal Dev' : 'Voltix Admin',
        email: normalizedEmail,
        role: 'ADMIN',
      },
      token: adminSecret,
    });

    // Set secure HTTP-only session cookie
    response.cookies.set('voltix_admin_session', adminSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid input fields' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
