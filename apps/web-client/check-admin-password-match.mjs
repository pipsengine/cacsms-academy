import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

process.env.DATABASE_URL = 'postgresql://cacsms:Adm1n.c0m@localhost:5432/db_cacsms?schema=public';
const prisma = new PrismaClient();

const email = 'admin@cacsms.com';
const candidates = ['TestPass12345678', 'Passcode1!', 'Passcode1', 'Adm1n.c0m', 'Welcome123!'];

async function main() {
  const user = await prisma.user.findUnique({ where: { email }, select: { passwordHash: true } });
  if (!user?.passwordHash) {
    console.log('NO_HASH');
    return;
  }

  for (const candidate of candidates) {
    const ok = await bcrypt.compare(candidate, user.passwordHash);
    console.log(`${candidate} => ${ok}`);
  }
}

main().finally(async () => prisma.$disconnect());
