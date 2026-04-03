import { PrismaClient } from '@prisma/client';

process.env.DATABASE_URL = 'postgresql://cacsms:Adm1n.c0m@localhost:5432/db_cacsms?schema=public';

const prisma = new PrismaClient();

const email = 'admin@cacsms.com';

async function main() {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      passwordHash: true,
    },
  });

  if (!user) {
    console.log('USER_NOT_FOUND');
    return;
  }

  console.log('USER_FOUND');
  console.log(JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    hasPasswordHash: !!user.passwordHash,
    passwordHashLength: user.passwordHash ? user.passwordHash.length : 0,
    passwordHashPreview: user.passwordHash ? `${user.passwordHash.slice(0, 10)}...${user.passwordHash.slice(-8)}` : null,
  }, null, 2));
}

main()
  .catch((e) => {
    console.error('QUERY_ERROR');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
