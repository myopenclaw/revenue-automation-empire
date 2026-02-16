// 🧪 Test Fixed Tool
const tools = require('./mexc_spot_tools.js');

async function test() {
  console.log('🧪 Testing fixed tool...\n');
  
  // Test 1: Get USDT balance
  console.log('1. Testing mexc_spot_get_balance("USDT")');
  const result = await tools.mexc_spot_get_balance('USDT');
  console.log('Result:', JSON.stringify(result, null, 2));
  
  // Test 2: Get all balances
  console.log('\n2. Testing mexc_spot_get_balance()');
  const allResult = await tools.mexc_spot_get_balance();
  console.log('Success:', allResult.success);
  console.log('Total USDT:', allResult.total_usdt);
  console.log('Non-zero assets:', Object.keys(allResult.balances || {}).length);
  
  // Test 3: Get SOL balance
  console.log('\n3. Testing mexc_spot_get_balance("SOL")');
  const solResult = await tools.mexc_spot_get_balance('SOL');
  console.log('SOL free:', solResult.free);
}

test().catch(console.error);