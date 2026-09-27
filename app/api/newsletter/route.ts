import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendNewsletterWelcomeEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body?.email?.toLowerCase()?.trim();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Save subscriber to Prisma DB if model exists
    try {
      await prisma.newsletterSubscriber.upsert({
        where: { email },
        update: {},
        create: { email },
      });
    } catch (dbErr) {
      console.warn('DB newsletter subscribe warning:', dbErr);
    }

    // Fetch settings for email footer/phone info
    let settings: any = null;
    try {
      settings = await prisma.websiteSettings.findUnique({
        where: { id: 'default_settings' },
      });
    } catch {}

    // Send real welcome email via SMTP
    const emailRes = await sendNewsletterWelcomeEmail(email, settings);

    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully! Welcome email sent to your inbox.',
      emailSent: emailRes.success,
    });
  } catch (error: any) {
    console.error('Newsletter API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process newsletter subscription' },
      { status: 500 }
    );
  }
}
