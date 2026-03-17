import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';

const authHandler = NextAuth(authOptions);

export { authHandler as GET, authHandler as POST };
