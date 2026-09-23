import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const syncSchema = z.object({
  firebaseUid: z.string().optional(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firebaseUid, name, email, phone } = syncSchema.parse(body);

    const configuredAdmin = process.env.ADMIN_EMAIL || 'sanjeet@voltixnepal.com';
    const isAdmin = email.toLowerCase() === configuredAdmin.toLowerCase();

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        phone: phone || undefined,
        firebaseUid: firebaseUid || undefined,
        role: isAdmin ? 'ADMIN' : undefined,
      },
      create: {
        firebaseUid,
        name,
        email,
        phone: phone || null,
        role: isAdmin ? 'ADMIN' : 'CUSTOMER',
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
