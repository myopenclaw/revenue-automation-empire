// 🧪 Test MEXC Spot Tools
const tools = require('./mexc_spot_tools.js');

async function testTools() {
  console.log('🧪 TESTING MEXC SPOT TOOLS\n');
  
  try {
    // Test 1: Get Balance
    console.log('1. Testing mexc_spot_get_balance()');
    const balance = await tools.mexc_spot_get_balance();
    console.log('✅ Balance check:', balance.success ? 'SUCCESS' : 'FAILED');
    if (balance.success) {
      console.log('   USDT Balance:', balance.total_usdt);
      console.log('   Non-zero assets:', Object.keys(balance.balances || {}).length);
    } else {
      console.log('   Error:', balance.error);
    }
    console.log('');
    
    // Test 2: Get specific balance (USDT)
    console.log('2. Testing mexc_spot_get_balance("USDT")');
    const usdtBalance = await tools.mexc_spot_get_balance('USDT');
    console.log('✅ USDT balance:', usdtBalance.success ? 'SUCCESS' : 'FAILED');
    if (usdtBalance.success) {
      console.log('   Free USDT:', usdtBalance.free);
    }
    console.log('');
    
    // Test 3: Get SOL balance
    console.log('3. Testing mexc_spot_get_balance("SOL")');
    const solBalance = await tools.mexc_spot_get_balance('SOL');
    console.log('✅ SOL balance:', solBalance.success ? 'SUCCESS' : 'FAILED');
    if (solBalance.success) {
      console.log('   Free SOL:', solBalance.free);
    }
    console.log('');
    
    console.log('🎉 All balance tests completed!');
    console.log('\n⚠️  Note: Order placement tests require "TRADE NOW" confirmation');
    console.log('   Run with actual trade command to test place_order');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests
testTools();