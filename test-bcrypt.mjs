import bcrypt from 'bcryptjs';

// Test bcrypt directly
const testPassword = 'Welcome123!';

async function testBcrypt() {
  try {
    const hash1 = await bcrypt.hash(testPassword, 10);
    console.log('Hash generated:', hash1);
    
    const match1 = await bcrypt.compare(testPassword, hash1);
    console.log('Match test 1 (should be true):', match1);
    
    const match2 = await bcrypt.compare('wrongpassword', hash1);
    console.log('Match test 2 (should be false):', match2);
    
    console.log('\n✅ Bcrypt working correctly');
  } catch (error) {
    console.error('❌ Bcrypt error:', error);
  }
}

testBcrypt().then(() => process.exit(0));
