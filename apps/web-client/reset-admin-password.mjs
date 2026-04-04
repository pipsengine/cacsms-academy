import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

process.env.DATABASE_URL = 'postgresql://cacsms:Adm1n.c0m@localhost:5432/db_cacsms?schema=public';

const prisma = new PrismaClient();
const email = 'admin@cacsms.com';
const nextPassword = 'Adm1n.c0m';

try {
  const hash = await bcrypt.hash(nextPassword, 10);
  const updated = await prisma.user.update({
    where: { email },
    data: { passwordHash: hash },
  });

  const verify = await bcrypt.compare(nextPassword, updated.passwordHash ?? '');
  console.log(JSON.stringify({
    updatedEmail: updated.email,
    hasHash: !!updated.passwordHash,
    hashLength: updated.passwordHash?.length ?? 0,
    verify,
  }, null, 2));
} catch (error) {
  console.error(error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
