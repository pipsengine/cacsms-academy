import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/pricing', '/'] as const;

function isPublicPath(pathname: string) {
  return (
    PUBLIC_ROUTES.some((route) => route === '/' ? pathname === '/' : pathname === route || pathname.startsWith(`${route}/`)) ||
    pathname.startsWith('/legal')
  );
}

export const middleware = withAuth(
  function middleware(request: NextRequest & any) {
    const token = request.nextauth.token;
    const pathname = request.nextUrl.pathname;

    if (isPublicPath(pathname)) {
      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (isPublicPath(req.nextUrl.pathname)) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
