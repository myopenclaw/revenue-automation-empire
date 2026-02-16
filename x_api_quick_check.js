// 🐦 X.COM API QUICK CHECK SCRIPT
// Test if you have working X.com API credentials

const fs = require('fs');
const path = require('path');
const { TwitterApi } = require('twitter-api-v2');

// Common locations to check
const locations = [
  '~/.twitter_keys',
  '~/.x_api',
  '~/.env',
  '~/.config/twitter.json',
  '~/.openclaw/config.yaml',
  process.cwd() + '/.env.local',
  process.cwd() + '/config.json'
];

console.log('🔍 X.COM API CREDENTIALS CHECK');
console.log('==============================\n');

// Function to extract API keys from text
function extractKeys(text) {
  const patterns = {
    api_key: /(?:api[_-]?key|consumer[_-]?key)[=:\s]+["']?([A-Za-z0-9]{25,})["']?/i,
    api_secret: /(?:api[_-]?secret|consumer[_-]?secret)[=:\s]+["']?([A-Za-z0-9]{25,})["']?/i,
    bearer_token: /(?:bearer[_-]?token)[=:\s]+["']?([A-Za-z0-9]{25,})["']?/i,
    access_token: /(?:access[_-]?token)[=:\s]+["']?([A-Za-z0-9]{25,})["']?/i,
    access_secret: /(?:access[_-]?secret)[=:\s]+["']?([A-Za-z0-9]{25,})["']?/i
  };

  const keys = {};
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match) keys[key] = match[1];
  }
  
  return keys;
}

// Check each location
locations.forEach(location => {
  const resolvedPath = location.replace('~', process.env.HOME);
  
  if (fs.existsSync(resolvedPath)) {
    console.log(`📁 Checking: ${location}`);
    
    try {
      const content = fs.readFileSync(resolvedPath, 'utf8');
      const keys = extractKeys(content);
      
      if (Object.keys(keys).length > 0) {
        console.log('   ✅ Found potential API keys:');
        Object.entries(keys).forEach(([key, value]) => {
          console.log(`      ${key}: ${value.substring(0, 10)}...`);
        });
        
        // Test the keys
        testKeys(keys);
      } else {
        console.log('   ❌ No API keys found in this file');
      }
    } catch (error) {
      console.log(`   ⚠️  Could not read file: ${error.message}`);
    }
  } else {
    console.log(`   📭 File not found: ${location}`);
  }
});

// Test if keys work
async function testKeys(keys) {
  console.log('\n🧪 Testing API keys...');
  
  // Need at least API key and secret
  if (!keys.api_key || !keys.api_secret) {
    console.log('   ⚠️  Need both API key and secret to test');
    return;
  }
  
  try {
    const client = new TwitterApi({
      appKey: keys.api_key,
      appSecret: keys.api_secret,
      accessToken: keys.access_token,
      accessSecret: keys.access_secret,
    });
    
    // Try to get user info
    const user = await client.v2.me();
    console.log(`   ✅ API WORKS! User: @${user.data.username}`);
    console.log(`   📊 User ID: ${user.data.id}`);
    
    // Try to get rate limits
    const rateLimits = await client.v2.rateLimitStatus();
    console.log(`   ⏱️  Rate limits available`);
    
    return true;
  } catch (error) {
    console.log(`   ❌ API Error: ${error.message}`);
    
    // Try with just bearer token
    if (keys.bearer_token) {
      console.log('\n   🔄 Trying with Bearer token only...');
      try {
        const bearerClient = new TwitterApi(keys.bearer_token);
        const user = await bearerClient.v2.me();
        console.log(`   ✅ Bearer token works! User: @${user.data.username}`);
        return true;
      } catch (bearerError) {
        console.log(`   ❌ Bearer token also failed: ${bearerError.message}`);
      }
    }
    
    return false;
  }
}

// Check environment variables
console.log('\n🌍 Checking environment variables...');
const envVars = process.env;
const envKeys = extractKeys(JSON.stringify(envVars));

if (Object.keys(envKeys).length > 0) {
  console.log('   ✅ Found API keys in environment:');
  Object.entries(envKeys).forEach(([key, value]) => {
    console.log(`      ${key}: ${value.substring(0, 10)}...`);
  });
  testKeys(envKeys);
} else {
  console.log('   ❌ No API keys in environment variables');
}

// Final recommendations
console.log('\n📋 RECOMMENDATIONS:');
console.log('==================');
console.log('1. If no API found: Create at https://developer.twitter.com');
console.log('2. Required permissions: Read & Write');
console.log('3. Save keys securely (encrypted file or password manager)');
console.log('4. Test with: node x_api_test.js');
console.log('5. Configure in OpenClaw: openclaw config set x.api_key "..."');

console.log('\n🚀 QUICK SETUP COMMANDS:');
console.log('=======================');
console.log('// 1. Install package');
console.log('npm install twitter-api-v2');
console.log('');
console.log('// 2. Create test file');
console.log('cat > test_x.js << EOF');
console.log('const { TwitterApi } = require("twitter-api-v2");');
console.log('const client = new TwitterApi({');
console.log('  appKey: "YOUR_API_KEY",');
console.log('  appSecret: "YOUR_API_SECRET",');
console.log('  accessToken: "YOUR_ACCESS_TOKEN",');
console.log('  accessSecret: "YOUR_ACCESS_SECRET"');
console.log('});');
console.log('// Test tweet');
console.log('client.v2.tweet("🤖 Testing X.com API").then(console.log);');
console.log('EOF');
console.log('');
console.log('// 3. Run test');
console.log('node test_x.js');