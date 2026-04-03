import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  errorFormat: 'pretty',
});

process.env.DATABASE_URL = 'postgresql://cacsms:Adm1n.c0m@localhost:5432/db_cacsms?schema=public';

async function setTestPassword() {
  try {
    // Try a 15-character password
    const testPassword = 'TestPass12345678';  // 16 chars
    const hash = await bcrypt.hash(testPassword, 10);
    
    console.log('Original password:', testPassword);
    console.log('Password length:', testPassword.length);
    console.log('Generated hash:', hash);
    
    // Test bcrypt.compare locally first
    const compareResult = await bcrypt.compare(testPassword, hash);
    console.log('\nLocal bcrypt test:');
    console.log('  Password:', testPassword);
    console.log('  Compare result:', compareResult);
    
    // Update user
    const updated = await prisma.user.update({
      where: { email: 'admin@cacsms.com' },
      data: { passwordHash: hash },
    });
    
    console.log('\n✅ Updated admin@cacsms.com');
    console.log('Stored hash:', updated.passwordHash);
    
    // Query back and verify
    const user = await prisma.user.findUnique({
      where: { email: 'admin@cacsms.com' },
    });
    
    console.log('\nVerifying stored hash:');
    console.log('  Stored hash:', user?.passwordHash);
    console.log('  Hash length:', user?.passwordHash?.length);
    
    if (user?.passwordHash) {
      const verify = await bcrypt.compare(testPassword, user.passwordHash);
      console.log('  Compare after retrieval:', verify);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setTestPassword();
