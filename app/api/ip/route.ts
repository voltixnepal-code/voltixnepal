import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');

  let ip = cfConnectingIp || realIp || (forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1');

  // If local IPv6 loopback
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1';
  }

  return NextResponse.json({
    ip,
    success: true,
  });
}
