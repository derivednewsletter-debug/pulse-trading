import { NextResponse } from 'next/server';

/**
 * Sign-out is handled by NextAuth at POST /api/auth/signout.
 * This catch-all route redirects to home if hit directly.
 */
export async function POST() {
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'));
}
