import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

process.env.DATABASE_URL = 'postgresql://cacsms:Adm1n.c0m@localhost:5432/db_cacsms?schema=public';
const prisma = new PrismaClient();

const email = 'admin@cacsms.com';
const nextPassword = 'Adm1n.c0m';

try {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT id, email, role, "passwordHash"
    FROM users
    WHERE LOWER(email) = LOWER('${email}')
    LIMIT 1
  `);

  if (!rows.length) {
    console.log('USER_NOT_FOUND');
    process.exit(1);
  }

  const user = rows[0];
  const hash = await bcrypt.hash(nextPassword, 10);

  await prisma.$executeRawUnsafe(`
    UPDATE users
    SET "passwordHash" = '${hash}', "updatedAt" = NOW()
    WHERE id = '${user.id}'
  `);

  const verifyRows = await prisma.$queryRawUnsafe(`
    SELECT id, email, role, "passwordHash"
    FROM users
    WHERE id = '${user.id}'
    LIMIT 1
  `);

  const verify = await bcrypt.compare(nextPassword, verifyRows[0].passwordHash ?? '');

  console.log(JSON.stringify({
    status: 'PASSWORD_RESET_OK',
    email: verifyRows[0].email,
    role: verifyRows[0].role,
    verify,
    hashLength: verifyRows[0].passwordHash?.length ?? 0
  }, null, 2));
} catch (error) {
  console.error(error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
