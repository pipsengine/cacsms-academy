import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { isPublicRoute } from './src/lib/auth/redirects';

export const middleware = withAuth(
  function middleware(request: NextRequest & any) {
    const token = request.nextauth.token;
    const pathname = request.nextUrl.pathname;

    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    // If accessing a protected route without authentication, redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // All protected routes are accessible
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Always allow public routes
        if (isPublicRoute(req.nextUrl.pathname)) return true;

        // For protected routes, require token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
