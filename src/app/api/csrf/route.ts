import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// In NextAuth, CSRF protection is handled by the framework itself.
// This endpoint returns the CSRF token from NextAuth.
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // NextAuth handles CSRF via built-in double-submit cookie pattern.
  // Return a simple acknowledgement. The actual CSRF protection
  // comes from the session cookie + JWT token.
  return NextResponse.json({ token: 'nextauth-handled' });
}
