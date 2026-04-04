import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AzureADProvider from 'next-auth/providers/azure-ad';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  passwordHash: string | null;
  role: string | null;
  country: string | null;
};

const hasDatabase = !!process.env.DATABASE_URL;
const authSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || process.env.SECRET;
if (!authSecret) {
  throw new Error('NEXTAUTH_SECRET (or JWT_SECRET/SECRET) must be configured');
}
if (!process.env.NEXTAUTH_URL) {
  (process.env as any).NEXTAUTH_URL = process.env.APP_URL || 'http://localhost:3000';
}

async function getPlanForUser(userId: string): Promise<'Scout' | 'Analyst' | 'Trader' | 'ProTrader'> {
  let sub: { planType: string } | null = null;
  try {
    sub = await prisma.subscription.findFirst({
      where: { userId, status: 'Active' },
      orderBy: { startDate: 'desc' },
      select: { planType: true },
    });
  } catch {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT "subscriptionTier"
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;
    const tier = rows[0]?.subscriptionTier;
    if (tier === 'PREMIUM') return 'ProTrader';
    if (tier === 'PROFESSIONAL') return 'Trader';
    return 'Scout';
  }
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

function mapRawUsersRow(row: any): AuthUser {
  const firstName = typeof row.firstName === 'string' ? row.firstName : null;
  const lastName = typeof row.lastName === 'string' ? row.lastName : null;
  const joinedName = [firstName, lastName].filter(Boolean).join(' ').trim();
  return {
    id: String(row.id),
    email: String(row.email),
    name: (typeof row.name === 'string' && row.name) || joinedName || null,
    image: (typeof row.image === 'string' && row.image) || (typeof row.avatarUrl === 'string' ? row.avatarUrl : null),
    passwordHash: typeof row.passwordHash === 'string' ? row.passwordHash : null,
    role: typeof row.role === 'string' ? row.role : null,
    country: typeof row.country === 'string' ? row.country : null,
  };
}

async function findAuthUserByEmail(email: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      passwordHash: user.passwordHash,
      role: user.role,
      country: user.country,
    };
  } catch {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT id, email, "passwordHash", role, "firstName", "lastName", "avatarUrl"
      FROM users
      WHERE LOWER(email) = LOWER(${email})
      LIMIT 1
    `;
    if (!rows.length) return null;
    return mapRawUsersRow(rows[0]);
  }
}

async function findAuthUserById(userId: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      passwordHash: user.passwordHash,
      role: user.role,
      country: user.country,
    };
  } catch {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT id, email, "passwordHash", role, "firstName", "lastName", "avatarUrl"
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;
    if (!rows.length) return null;
    return mapRawUsersRow(rows[0]);
  }
}

const microsoftClientId = process.env.MICROSOFT_CLIENT_ID || process.env.AZURE_AD_CLIENT_ID;
const microsoftClientSecret = process.env.MICROSOFT_CLIENT_SECRET || process.env.AZURE_AD_CLIENT_SECRET;
const microsoftTenantId = process.env.MICROSOFT_TENANT_ID || process.env.AZURE_AD_TENANT_ID || 'common';

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  adapter: hasDatabase ? PrismaAdapter(prisma) : undefined,
  session: {
    strategy: 'jwt',
  },
  providers: [
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
      : null,
    microsoftClientId && microsoftClientSecret
      ? AzureADProvider({
          clientId: microsoftClientId,
          clientSecret: microsoftClientSecret,
          tenantId: microsoftTenantId,
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
            console.log('[auth][credentials] attempt:', { email, hasPassword: !!password });
            
            if (!email || !password) {
              console.warn('[auth][credentials] rejected: missing email or password', { email, hasPassword: !!password });
              return null;
            }

            try {
              const user = await findAuthUserByEmail(email);
              
              if (!user) {
                console.warn(`[auth][credentials] rejected: user not found for ${email}`);
                return null;
              }

              console.log('[auth][credentials] user found:', { id: user.id, email: user.email, hasHash: !!user.passwordHash });

              if (!user.passwordHash) {
                console.warn(`[auth][credentials] rejected: passwordHash missing for ${email}`);
                return null;
              }

              const ok = await bcrypt.compare(password, user.passwordHash);
              console.log('[auth][credentials] bcrypt compare result:', { ok, email });
              
              if (!ok) {
                console.warn(`[auth][credentials] rejected: password mismatch for ${email}`);
                return null;
              }

              console.info(`[auth][credentials] success: ${email}`);
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
              };
            } catch (error) {
              console.error('[auth][credentials] error:', error instanceof Error ? error.message : String(error));
              return null;
            }
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
          const dbUser = await findAuthUserById(user.id);
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
        try {
          await prisma.usageLog.create({
            data: {
              userId: user.id,
              featureName: 'login',
              usageType: 'auth',
            },
          });
        } catch {
          // Do not fail sign-in if telemetry tables are unavailable in current DB.
        }
      }
    },
  },
  pages: {
    signIn: '/login',
  },
};
