import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  errorFormat: 'pretty',
});

process.env.DATABASE_URL = 'postgresql://cacsms:Adm1n.c0m@localhost:5432/db_cacsms?schema=public';

async function resetPasswords() {
  try {
    // Use a simpler password for testing
    const testPassword = 'Passcode1!';
    const hash = await bcrypt.hash(testPassword, 10);
    
    console.log('Generated hash:', hash);
    
    // Update both users with the same password
    const updated = await prisma.user.updateMany({
      data: { passwordHash: hash },
    });
    
    console.log(`\n✅ Updated ${updated.count} users with new password`);
    console.log(`\nTest Credentials:`);
    console.log(`  Email: admin@cacsms.com`);
    console.log(`  Password: ${testPassword}`);
    console.log(`\n  OR`);
    console.log(`  Email: pipsengine@gmail.com`);
    console.log(`  Password: ${testPassword}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPasswords();
