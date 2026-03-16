import type { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const hasDatabase = !!process.env.DATABASE_URL;
const authSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

async function getPlanForUser(userId: string): Promise<'Free' | 'Professional' | 'Premium'> {
  const sub = await prisma.subscription.findFirst({
    where: { userId, status: 'Active' },
    orderBy: { startDate: 'desc' },
  });
  if (!sub) return 'Free';
  if (sub.planType === 'Professional' || sub.planType === 'Premium') return sub.planType;
  return 'Free';
}

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  adapter: hasDatabase ? PrismaAdapter(prisma) : undefined,
  session: {
    strategy: hasDatabase ? 'database' : 'jwt',
  },
  providers: [
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? GitHubProvider({
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        })
      : null,
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
      : null,
    hasDatabase
      ? CredentialsProvider({
          name: 'Email',
          credentials: {
            email: { label: 'Email', type: 'email' },
            password: { label: 'Password', type: 'password' },
          },
          async authorize(credentials) {
            const email = credentials?.email?.toLowerCase().trim();
            const password = credentials?.password;
            if (!email || !password) return null;

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user?.passwordHash) return null;
            const ok = await bcrypt.compare(password, user.passwordHash);
            if (!ok) return null;

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            };
          },
        })
      : null,
  ].filter(Boolean) as NextAuthOptions['providers'],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
        if (hasDatabase) {
          const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
          (session.user as any).role = dbUser?.role || 'User';
          (session.user as any).country = dbUser?.country || 'International';
          (session.user as any).plan = await getPlanForUser(user.id);
        } else {
          (session.user as any).role = 'User';
          (session.user as any).country = 'International';
          (session.user as any).plan = 'Free';
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
