// 🔍 Debug Balance Issue
const ccxt = require('ccxt');
require('dotenv').config({ path: require('os').homedir() + '/.mexc_credentials' });

async function debugBalance() {
  console.log('🔍 DEBUGGING BALANCE DISCREPANCY');
  console.log('================================\n');
  
  const mexc = new ccxt.mexc({
    apiKey: process.env.API_KEY,
    secret: process.env.API_SECRET,
    enableRateLimit: true
  });
  
  try {
    console.log('1. Fetching balance with ccxt directly...');
    const balance = await mexc.fetchBalance();
    
    console.log('Raw USDT balance object:');
    console.log(JSON.stringify(balance.USDT, null, 2));
    
    console.log('\n2. Checking structure...');
    console.log('USDT.free:', balance.USDT?.free);
    console.log('USDT.used:', balance.USDT?.used);
    console.log('USDT.total:', balance.USDT?.total);
    
    console.log('\n3. Checking all properties...');
    const usdtObj = balance.USDT || {};
    console.log('All USDT properties:');
    for (const [key, value] of Object.entries(usdtObj)) {
      console.log(`  ${key}: ${value}`);
    }
    
    console.log('\n4. Testing the tools function...');
    const tools = require('./mexc_spot_tools.js');
    const toolResult = await tools.mexc_spot_get_balance('USDT');
    console.log('Tool result:', JSON.stringify(toolResult, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugBalance();