import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const _ = request;
  return NextResponse.json(
    { error: 'Deprecated. Use NextAuth at /api/auth/[...nextauth].' },
    { status: 410 }
  );
}
