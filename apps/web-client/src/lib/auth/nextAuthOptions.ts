import type { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const hasDatabase = !!process.env.DATABASE_URL;
const authSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || process.env.SECRET || 'dev-cacsms-academy-secret';
if (!process.env.NEXTAUTH_URL) {
  (process.env as any).NEXTAUTH_URL = process.env.APP_URL || 'http://localhost:3000';
}

async function getPlanForUser(userId: string): Promise<'Scout' | 'Analyst' | 'Trader' | 'ProTrader'> {
  const sub = await prisma.subscription.findFirst({
    where: { userId, status: 'Active' },
    orderBy: { startDate: 'desc' },
  });
  if (!sub) return 'Scout';
  const validPlans = ['Scout', 'Analyst', 'Trader', 'ProTrader'] as const;
  if (validPlans.includes(sub.planType as any)) return sub.planType as typeof validPlans[number];
  // Legacy plan migration
  if (sub.planType === 'Free') return 'Scout';
  if (sub.planType === 'Professional') return 'Trader';
  if (sub.planType === 'Premium') return 'ProTrader';
  if (sub.planType === 'Institutional') return 'ProTrader';
  return 'Scout';
}

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  adapter: hasDatabase ? PrismaAdapter(prisma) : undefined,
  session: {
    strategy: 'jwt',
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
            if (!email || !password) {
              if (process.env.NODE_ENV !== 'production') {
                console.warn('[auth][credentials] rejected: missing email or password');
              }
              return null;
            }

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
              if (process.env.NODE_ENV !== 'production') {
                console.warn(`[auth][credentials] rejected: user not found for ${email}`);
              }
              return null;
            }

            if (!user.passwordHash) {
              if (process.env.NODE_ENV !== 'production') {
                console.warn(`[auth][credentials] rejected: passwordHash missing for ${email}`);
              }
              return null;
            }

            const ok = await bcrypt.compare(password, user.passwordHash);
            if (!ok) {
              if (process.env.NODE_ENV !== 'production') {
                console.warn(`[auth][credentials] rejected: password mismatch for ${email}`);
              }
              return null;
            }

            if (process.env.NODE_ENV !== 'production') {
              console.info(`[auth][credentials] success: ${email}`);
            }

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
    async jwt({ token, user }) {
      // On initial sign-in the `user` object is available; embed it into the token for future requests.
      if (user) {
        token.id = user.id;
        if (hasDatabase) {
          const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
          token.role = dbUser?.role ?? 'User';
          token.country = dbUser?.country ?? 'International';
          token.plan = await getPlanForUser(user.id);
        } else {
          token.role = 'User';
          token.country = 'International';
          token.plan = 'Scout';
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id ?? token.sub;
        (session.user as any).role = token.role ?? 'User';
        (session.user as any).country = token.country ?? 'International';
        (session.user as any).plan = token.plan ?? 'Scout';
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (user?.id) {
        await prisma.usageLog.create({
          data: {
            userId: user.id,
            featureName: 'login',
            usageType: 'auth',
          },
        });
      }
    },
  },
  pages: {
    signIn: '/login',
  },
};
