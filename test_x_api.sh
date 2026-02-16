#!/bin/bash
# 🐦 X.COM API TEST SCRIPT
# Test je X.com API credentials

echo "🧪 X.COM API TEST SCRIPT"
echo "========================"
echo ""

# Check if npm package is installed
if ! npm list -g twitter-api-v2 2>/dev/null | grep -q "twitter-api-v2"; then
    echo "📦 Installing twitter-api-v2..."
    npm install -g twitter-api-v2
fi

# Create test script
cat > test_x_complete.js << 'EOF'
const { TwitterApi } = require('twitter-api-v2');

// Load credentials from environment or config
const credentials = {
  appKey: process.env.X_API_KEY || '',
  appSecret: process.env.X_API_SECRET || '',
  accessToken: process.env.X_ACCESS_TOKEN || '',
  accessSecret: process.env.X_ACCESS_SECRET || '',
  bearerToken: process.env.X_BEARER_TOKEN || ''
};

console.log('🔐 Testing X.com API Credentials');
console.log('================================\n');

// Check which credentials we have
const hasFullOAuth = credentials.appKey && credentials.appSecret && 
                     credentials.accessToken && credentials.accessSecret;
const hasBearerOnly = credentials.bearerToken;

console.log('📋 Credentials Status:');
console.log(`   • App Key: ${credentials.appKey ? '✅' : '❌'}`);
console.log(`   • App Secret: ${credentials.appSecret ? '✅' : '❌'}`);
console.log(`   • Access Token: ${credentials.accessToken ? '✅' : '❌'}`);
console.log(`   • Access Secret: ${credentials.accessSecret ? '✅' : '❌'}`);
console.log(`   • Bearer Token: ${credentials.bearerToken ? '✅' : '❌'}`);
console.log(`   • Full OAuth: ${hasFullOAuth ? '✅' : '❌'}`);
console.log(`   • Bearer Only: ${hasBearerOnly ? '✅' : '❌'}\n`);

async function testFullOAuth() {
  console.log('🔄 Testing Full OAuth...');
  try {
    const client = new TwitterApi({
      appKey: credentials.appKey,
      appSecret: credentials.appSecret,
      accessToken: credentials.accessToken,
      accessSecret: credentials.accessSecret,
    });
    
    // Get user info
    const user = await client.v2.me();
    console.log(`   ✅ OAuth WORKS! User: @${user.data.username}`);
    console.log(`   📊 Name: ${user.data.name}`);
    console.log(`   🆔 ID: ${user.data.id}`);
    
    // Test tweet (optional - comment out if you don't want to tweet)
    console.log('\n   🐦 Testing tweet creation...');
    const tweet = await client.v2.tweet('🤖 Empire AI testing X.com API integration. This is an automated test.');
    console.log(`   ✅ Tweet created: https://x.com/user/status/${tweet.data.id}`);
    
    // Get rate limits
    const limits = await client.v2.rateLimitStatus('users, tweets');
    console.log(`   ⏱️  Rate limits: ${JSON.stringify(limits, null, 2)}`);
    
    return true;
  } catch (error) {
    console.log(`   ❌ OAuth Error: ${error.message}`);
    if (error.code === 89) {
      console.log('   💡 Invalid or expired token. Regenerate tokens.');
    } else if (error.code === 32) {
      console.log('   💡 Could not authenticate you. Check API keys.');
    } else if (error.code === 88) {
      console.log('   💡 Rate limit exceeded. Wait and try again.');
    }
    return false;
  }
}

async function testBearerToken() {
  console.log('\n🔄 Testing Bearer Token...');
  try {
    const client = new TwitterApi(credentials.bearerToken);
    
    // Get user info (requires OAuth for /me, so try search instead)
    console.log('   Testing with search...');
    const search = await client.v2.search('AI', { max_results: 1 });
    console.log(`   ✅ Bearer token WORKS! Found ${search.meta.result_count} results`);
    
    // Get rate limits
    const limits = await client.v2.rateLimitStatus();
    console.log(`   ⏱️  Rate limits available`);
    
    return true;
  } catch (error) {
    console.log(`   ❌ Bearer token Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  let oauthSuccess = false;
  let bearerSuccess = false;
  
  if (hasFullOAuth) {
    oauthSuccess = await testFullOAuth();
  } else {
    console.log('⚠️  Skipping OAuth test - missing credentials');
  }
  
  if (hasBearerOnly) {
    bearerSuccess = await testBearerToken();
  } else {
    console.log('⚠️  Skipping Bearer token test - missing token');
  }
  
  console.log('\n📊 TEST RESULTS:');
  console.log('===============');
  console.log(`   • OAuth Test: ${oauthSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   • Bearer Test: ${bearerSuccess ? '✅ PASS' : '❌ FAIL'}`);
  
  if (oauthSuccess || bearerSuccess) {
    console.log('\n🎉 SUCCESS! X.com API is working!');
    console.log('Next: Configure in OpenClaw and start social media agents.');
  } else {
    console.log('\n❌ FAILED! Check your credentials.');
    console.log('Get new API keys: https://developer.twitter.com');
  }
}

// Run tests
runTests().catch(console.error);
EOF

echo "📝 Test script created: test_x_complete.js"
echo ""
echo "🚀 HOW TO USE:"
echo "=============="
echo "1. Set your API keys as environment variables:"
echo "   export X_API_KEY='your_key'"
echo "   export X_API_SECRET='your_secret'"
echo "   export X_ACCESS_TOKEN='your_access_token'"
echo "   export X_ACCESS_SECRET='your_access_secret'"
echo "   export X_BEARER_TOKEN='your_bearer_token'"
echo ""
echo "2. Run the test:"
echo "   node test_x_complete.js"
echo ""
echo "3. Or create a .env file:"
echo "   cat > .env << EOF"
echo "   X_API_KEY=your_key"
echo "   X_API_SECRET=your_secret"
echo "   X_ACCESS_TOKEN=your_access_token"
echo "   X_ACCESS_SECRET=your_access_secret"
echo "   X_BEARER_TOKEN=your_bearer_token"
echo "   EOF"
echo ""
echo "4. Then run:"
echo "   node -r dotenv/config test_x_complete.js"
echo ""
echo "🔧 TROUBLESHOOTING:"
echo "=================="
echo "• Error 89: Invalid/expired token → Regenerate"
echo "• Error 32: Authentication failed → Check API keys"
echo "• Error 88: Rate limit exceeded → Wait 15 min"
echo "• Error 403: Permission denied → Enable Read & Write"
echo ""
echo "📚 RESOURCES:"
echo "============"
echo "• X.com Developer Portal: https://developer.twitter.com"
echo "• API Documentation: https://developer.twitter.com/en/docs"
echo "• Rate Limits: https://developer.twitter.com/en/docs/rate-limits"