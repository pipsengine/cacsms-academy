import bcrypt from 'bcryptjs';

const storedHash = '$2b$10$VxfzyLaz7iQx/25Hl9u8Y.GORN8MwCTwqHvQc8kTamHPGBfc.ynDS';
const testPassword = 'Welcome123!';

async function test() {
  try {
    const match = await bcrypt.compare(testPassword, storedHash);
    console.log('Comparing "Welcome123!" against stored hash:', match);
    
    if (match) {
      console.log('✅ Password matches! Auth should work.');
    } else {
      console.log('❌ Password does NOT match. Something is wrong.');
      
      // Try re-hashing to see what we get
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('New hash generated:', newHash);
      const newMatch = await bcrypt.compare(testPassword, newHash);
      console.log('New hash matches:', newMatch);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

test().then(() => process.exit(0));
