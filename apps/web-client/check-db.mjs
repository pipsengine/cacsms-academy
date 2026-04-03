#!/usr/bin/env node

// Simple database check script
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Set up environment
process.env.NODE_ENV = 'development';
process.env.DATABASE_URL = 'postgresql://cacsms:Adm1n.c0m@localhost:5432/db_cacsms?schema=public';

// Import after env is set
const { prisma } = await import('./src/lib/prisma.ts');

try {
  console.log('\n========== DATABASE CHECK ==========\n');

  // Check User count
  const userCount = await prisma.user.count();
  console.log(`✓ Users in system: ${userCount}`);

  // Get users if any exist
  if (userCount > 0) {
    const users = await prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    console.log('\n--- User Details ---');
    users.forEach((u) => {
      console.log(`  • ${u.email} (${u.role}) - Created: ${u.createdAt.toISOString().split('T')[0]}`);
    });
  }

  // Check other model counts
  const [
    accountCount,
    sessionCount,
    subscriptionCount,
    usageLogCount,
    courseCount,
    contactCount,
  ] = await Promise.all([
    prisma.account.count(),
    prisma.session.count(),
    prisma.subscription.count(),
    prisma.usageLog.count(),
    prisma.courseEnrollment.count(),
    prisma.contactInquiry.count(),
  ]);

  console.log(`\n--- Other Records ---`);
  console.log(`  Accounts: ${accountCount}`);
  console.log(`  Sessions: ${sessionCount}`);
  console.log(`  Subscriptions: ${subscriptionCount}`);
  console.log(`  Usage Logs: ${usageLogCount}`);
  console.log(`  Course Enrollments: ${courseCount}`);
  console.log(`  Contact Inquiries: ${contactCount}`);

  console.log('\n✓ Database connection successful\n');
} catch (error) {
  console.error(`\n✗ Error: ${error.message}\n`);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
