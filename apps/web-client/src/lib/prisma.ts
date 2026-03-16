import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const host = process.env.POSTGRES_HOST || 'localhost';
  const port = process.env.POSTGRES_PORT || '5432';
  const db = process.env.POSTGRES_DB;

  if (user && password && db) {
    (process.env as any).DATABASE_URL = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${db}?schema=public`;
  }
}

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
