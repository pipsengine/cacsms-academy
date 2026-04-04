import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

process.env.DATABASE_URL = 'postgresql://cacsms:Adm1n.c0m@localhost:5432/db_cacsms?schema=public';
const prisma = new PrismaClient();

const email = 'admin@cacsms.com';
const nextPassword = 'Adm1n.c0m';

try {
  const hash = await bcrypt.hash(nextPassword, 10);

  const existing = await prisma.$queryRawUnsafe(`
    SELECT id, email, role, "passwordHash"
    FROM users
    WHERE LOWER(email)=LOWER('${email}')
    LIMIT 1
  `);

  if (existing.length) {
    await prisma.$executeRawUnsafe(`
      UPDATE users
      SET "passwordHash"='${hash}', "updatedAt"=NOW()
      WHERE id='${existing[0].id}'
    `);
  } else {
    const id = `admin-${randomUUID()}`;
    await prisma.$executeRawUnsafe(`
      INSERT INTO users (
        id, email, "passwordHash", role, "subscriptionTier", "subscriptionStatus", "isVerified", "kycStatus", "createdAt", "updatedAt", "accountType", "firstName", "lastName"
      ) VALUES (
        '${id}', '${email}', '${hash}', 'SUPER_ADMIN', 'FREE', 'ACTIVE', true, 'approved', NOW(), NOW(), 'CUSTOMER', 'Admin', 'User'
      )
    `);
  }

  const verifyRows = await prisma.$queryRawUnsafe(`
    SELECT id, email, role, "passwordHash"
    FROM users
    WHERE LOWER(email)=LOWER('${email}')
    LIMIT 1
  `);

  const verify = await bcrypt.compare(nextPassword, verifyRows[0].passwordHash ?? '');

  console.log(JSON.stringify({
    status: 'PASSWORD_SET',
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
