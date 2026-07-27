import { NextResponse } from 'next/server';

/**
 * This route handles OAuth callback redirects from NextAuth.
 * NextAuth manages the actual OAuth flow via /api/auth/callback/:provider,
 * so this catch-all simply redirects to the home page.
 */
export async function GET() {
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'));
}

export async function POST() {
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'));
}
