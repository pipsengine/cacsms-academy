import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setPasswordsForUsers() {
  try {
    // Default password for both users (they should change this on first login)
    const defaultPassword = 'Welcome123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Update both restored users with password hashes
    const updateAdmin = prisma.user.update({
      where: { email: 'admin@cacsms.com' },
      data: { passwordHash: hashedPassword },
    });

    const updatePips = prisma.user.update({
      where: { email: 'pipsengine@gmail.com' },
      data: { passwordHash: hashedPassword },
    });

    const results = await Promise.all([updateAdmin, updatePips]);

    console.log('\n✅ Passwords set successfully!\n');
    console.log('Restored Users - Login Credentials:');
    console.log('─'.repeat(50));
    results.forEach((user, idx) => {
      console.log(`\nUser ${idx + 1}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Temporary Password: ${defaultPassword}`);
      console.log(`  ⚠️  Please change this password after first login`);
    });
    console.log('\n' + '─'.repeat(50));
    console.log('\n✅ Users are now ready to log in!\n');

  } catch (error) {
    console.error('Error setting passwords:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setPasswordsForUsers();
