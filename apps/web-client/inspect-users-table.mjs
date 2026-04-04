import { PrismaClient } from '@prisma/client';

process.env.DATABASE_URL = 'postgresql://cacsms:Adm1n.c0m@localhost:5432/db_cacsms?schema=public';
const prisma = new PrismaClient();

try {
  const users = await prisma.$queryRawUnsafe(`
    SELECT id, email, role, "firstName", "lastName", "createdAt"
    FROM users
    ORDER BY "createdAt" DESC
    LIMIT 20
  `);
  console.log(JSON.stringify({ count: users.length, users }, null, 2));

  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='users'
    ORDER BY ordinal_position
  `);
  console.log('COLUMNS');
  console.log(JSON.stringify(cols, null, 2));
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
