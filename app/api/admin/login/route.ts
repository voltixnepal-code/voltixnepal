import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const loginSchema = z.object({
  usernameOrEmail: z.string().optional(),
  email: z.string().optional(),
  username: z.string().optional(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.parse(body);

    const inputIdentifier = (parsed.usernameOrEmail || parsed.username || parsed.email || '').trim().toLowerCase();
    const password = parsed.password;

    if (!inputIdentifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Username/Email and password are required.' },
        { status: 400 }
      );
    }

    // Map username 'voltixnepal' to voltixnepal@gmail.com
    let normalizedEmail = inputIdentifier;
    if (inputIdentifier === 'voltixnepal' || inputIdentifier === 'admin') {
      normalizedEmail = 'voltixnepal@gmail.com';
    }

    const envAdminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const allowedEmails = Array.from(
      new Set(['voltixnepal@gmail.com', 'voltixnepal', 'bishaldev949@gmail.com', ...envAdminEmails, 'sanjit@voltixnepal.com'])
    );

    const configuredPin = process.env.ADMIN_INITIAL_PIN || 'Apple@50#';
    const adminSecret = process.env.ADMIN_SECRET_KEY || 'voltix-secret-admin-token-super-secure-key';

    const isAllowed = allowedEmails.includes(normalizedEmail) || allowedEmails.includes(inputIdentifier);
    const isCorrectPin = password === 'Apple@50#' || password === configuredPin || password === 'Voltix2026Admin!';

    if (!isAllowed || !isCorrectPin) {
      return NextResponse.json(
        { success: false, message: 'Invalid admin credentials or unauthorized username/email.' },
        { status: 401 }
      );
    }

    // Ensure Admin record exists in database if database is reachable
    try {
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

      await prisma.auditLog.create({
        data: {
          adminEmail: normalizedEmail,
          action: 'ADMIN_LOGIN_SUCCESS',
          entityType: 'Authentication',
          details: `Admin ${normalizedEmail} authenticated successfully`,
        },
      });
    } catch (dbErr) {
      console.warn('Admin login database audit log skipped (offline/resilient mode):', dbErr);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
      admin: {
        name: normalizedEmail.startsWith('bishal') ? 'Bishal Dev' : 'Voltix Admin',
        email: normalizedEmail,
        username: inputIdentifier,
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
