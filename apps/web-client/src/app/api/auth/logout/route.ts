import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Deprecated. Use NextAuth at /api/auth/signout.' },
    { status: 410 }
  );
}
