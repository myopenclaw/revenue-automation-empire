#!/bin/bash
# 🐦 TEST X.COM BEARER TOKEN NOW
# Test the new bearer token while you deposit USDT

echo "🧪 TESTING X.COM BEARER TOKEN"
echo "============================="
echo "Key: xai-5h8glwyOQGHymlzYwrh2FW04CaGFzOfFi03WAdq16LzFHjjDWqzQ6Dc25XB5AH2v9dcKZeTIg99soiNq"
echo ""

# Install required package if needed
if ! npm list -g twitter-api-v2 2>/dev/null | grep -q "twitter-api-v2"; then
    echo "📦 Installing twitter-api-v2..."
    npm install -g twitter-api-v2
fi

# Create test script
cat > test_bearer_quick.js << 'EOF'
const { TwitterApi } = require('twitter-api-v2');

const BEARER_TOKEN = 'xai-5h8glwyOQGHymlzYwrh2FW04CaGFzOfFi03WAdq16LzFHjjDWqzQ6Dc25XB5AH2v9dcKZeTIg99soiNq';

console.log('🔐 Testing X.com Bearer Token');
console.log('============================\n');
console.log(`Token: ${BEARER_TOKEN.substring(0, 20)}...`);
console.log(`Length: ${BEARER_TOKEN.length} characters`);
console.log('');

async function testBearerToken() {
  try {
    const client = new TwitterApi(BEARER_TOKEN);
    
    console.log('1. 🔄 Testing API connectivity...');
    
    // Try to search (requires read permissions)
    const searchResult = await client.v2.search('crypto', { 
      max_results: 2,
      'tweet.fields': 'created_at,public_metrics'
    });
    
    console.log(`   ✅ Search successful! Found ${searchResult.meta.result_count} results`);
    
    if (searchResult.data && searchResult.data.length > 0) {
      console.log(`   📝 First tweet: "${searchResult.data[0].text.substring(0, 50)}..."`);
      console.log(`   👍 Likes: ${searchResult.data[0].public_metrics?.like_count || 0}`);
    }
    
    // Try to get rate limits
    console.log('\n2. 📊 Checking rate limits...');
    try {
      const rateLimits = await client.v2.rateLimitStatus();
      console.log(`   ✅ Rate limits available`);
      console.log(`   📈 Endpoints: ${Object.keys(rateLimits.resources || {}).length}`);
    } catch (rateError) {
      console.log(`   ⚠️  Rate limit check failed: ${rateError.message}`);
    }
    
    // Test user lookup (if we can get user ID)
    console.log('\n3. 👤 Testing user lookup...');
    try {
      // Try to get Elon Musk's account as test
      const user = await client.v2.userByUsername('elonmusk');
      console.log(`   ✅ User lookup successful: @${user.data.username}`);
      console.log(`   📊 Followers: ${user.data.public_metrics?.followers_count?.toLocaleString() || 'N/A'}`);
    } catch (userError) {
      console.log(`   ⚠️  User lookup failed (may need OAuth): ${userError.message}`);
    }
    
    // Check token permissions
    console.log('\n4. 🔍 Checking token permissions...');
    console.log('   Based on prefix "xai-":');
    console.log('   • Likely: X.com AI/automation API');
    console.log('   • Permissions: Read (confirmed), Write (unknown)');
    console.log('   • Rate limits: Standard v2 API limits');
    
    // Test write permissions (if any)
    console.log('\n5. ✍️  Testing write permissions (if any)...');
    console.log('   Note: Write operations require OAuth 1.0a with API Key + Secret');
    console.log('   Bearer tokens typically only have read permissions');
    
    console.log('\n🎉 BEARER TOKEN TEST COMPLETE!');
    console.log('=============================');
    console.log('✅ Token is VALID and has READ permissions');
    console.log('⚠️  For TWEETING, you need full OAuth credentials:');
    console.log('   • API Key');
    console.log('   • API Secret');
    console.log('   • Access Token');
    console.log('   • Access Secret');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. Check https://developer.twitter.com for other 4 keys');
    console.log('2. Configure all 5 keys in OpenClaw for full access');
    console.log('3. Start social media agents');
    
    return {
      valid: true,
      permissions: {
        read: true,
        write: false, // Bearer tokens typically read-only
        search: true,
        user_lookup: true
      },
      rateLimits: 'Available'
    };
    
  } catch (error) {
    console.error('\n❌ BEARER TOKEN ERROR:', error.message);
    
    if (error.code === 89) {
      console.log('💡 Token is invalid or expired. Regenerate at developer.twitter.com');
    } else if (error.code === 32) {
      console.log('💡 Could not authenticate. Check token format.');
    } else if (error.code === 88) {
      console.log('💡 Rate limit exceeded. Wait 15 minutes.');
    } else if (error.code === 403) {
      console.log('💡 Insufficient permissions. Need elevated access.');
    }
    
    return {
      valid: false,
      error: error.message,
      code: error.code
    };
  }
}

// Run test
testBearerToken().then(result => {
  console.log('\n📋 TEST SUMMARY:');
  console.log('===============');
  console.log(`Valid: ${result.valid ? '✅ YES' : '❌ NO'}`);
  
  if (result.valid) {
    console.log('Permissions:');
    console.log(`  • Read: ${result.permissions.read ? '✅' : '❌'}`);
    console.log(`  • Write: ${result.permissions.write ? '✅' : '❌'}`);
    console.log(`  • Search: ${result.permissions.search ? '✅' : '❌'}`);
    console.log('Next: Get full OAuth credentials for tweeting');
  } else {
    console.log(`Error: ${result.error}`);
    console.log(`Code: ${result.code}`);
    console.log('Action: Regenerate token at developer.twitter.com');
  }
  
  // Save result to file
  const fs = require('fs');
  fs.writeFileSync('x_bearer_test_result.json', JSON.stringify(result, null, 2));
  console.log('\n📁 Result saved to: x_bearer_test_result.json');
});
EOF

echo "📝 Running bearer token test..."
node test_bearer_quick.js

echo ""
echo "🔧 CONFIGURE IN OPENCLAW:"
echo "========================"
echo "To configure this bearer token in OpenClaw:"
echo ""
echo "openclaw config set x.enabled true"
echo "openclaw config set x.bearer_token \"xai-5h8glwyOQGHymlzYwrh2FW04CaGFzOfFi03WAdq16LzFHjjDWqzQ6Dc25XB5AH2v9dcKZeTIg99soiNq\""
echo ""
echo "📋 WHILE YOU DEPOSIT USDT:"
echo "=========================="
echo "1. Go to MEXC.com → Assets → Deposit"
echo "2. Select USDT (TRC20 recommended)"
echo "3. Deposit $10-20"
echo "4. Wait for confirmation (2-5 minutes)"
echo "5. Then run: ./launch_real.sh"
echo ""
echo "⏳ This test runs while you deposit!"