import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

export const middleware = withAuth(
  function middleware(request: NextRequest & any) {
    const token = request.nextauth.token;
    const pathname = request.nextUrl.pathname;

    // Allow public routes
    const publicRoutes = ['/login', '/register', '/landing', '/pricing', '/', '/api'];
    const isPublicRoute =
      publicRoutes.some(route => pathname === route || pathname.startsWith(route)) ||
      pathname.startsWith('/legal') ||
      pathname.startsWith('/api/auth');

    if (isPublicRoute) {
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
        const publicRoutes = ['/login', '/register', '/landing', '/pricing', '/', '/api'];
        const isPublicRoute =
          publicRoutes.some(route => req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route)) ||
          req.nextUrl.pathname.startsWith('/legal') ||
          req.nextUrl.pathname.startsWith('/api/auth');

        // Always allow public routes
        if (isPublicRoute) return true;

        // For protected routes, require token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
