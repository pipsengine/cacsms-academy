import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  // Get all tables
  const tables = await prisma.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema='public' 
    ORDER BY table_name
  `;

  console.log('\n=== DATABASE TABLES ===');
  console.log(JSON.stringify(tables, null, 2));

  // Get user count
  const userCount = await prisma.user.count();
  console.log(`\n=== USER COUNT ===`);
  console.log(`Total users: ${userCount}`);

  // Get all users (basic info)
  if (userCount > 0) {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, country: true, createdAt: true }
    });
    console.log(`\n=== USERS ===`);
    console.log(JSON.stringify(users, null, 2));
  }

  // Get subscription count
  const subscriptionCount = await prisma.subscription.count();
  console.log(`\n=== SUBSCRIPTION COUNT ===`);
  console.log(`Total subscriptions: ${subscriptionCount}`);

  // Get other model counts
  const counts = await Promise.all([
    prisma.account.count(),
    prisma.session.count(),
    prisma.usageLog.count(),
    prisma.courseEnrollment.count(),
    prisma.priceListEntry.count().catch(() => 0),
  ]);

  console.log(`\n=== RECORD COUNTS ===`);
  console.log(`Accounts: ${counts[0]}`);
  console.log(`Sessions: ${counts[1]}`);
  console.log(`Usage Logs: ${counts[2]}`);
  console.log(`Course Enrollments: ${counts[3]}`);
  console.log(`Price Entries: ${counts[4]}`);

} catch (error) {
  console.error('Error:', error.message);
} finally {
  await prisma.$disconnect();
}
