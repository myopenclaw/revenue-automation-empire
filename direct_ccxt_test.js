// 🔍 Direct CCXT Test
const ccxt = require('ccxt');
require('dotenv').config({ path: require('os').homedir() + '/.mexc_credentials' });

async function test() {
  console.log('🔍 DIRECT CCXT TEST');
  console.log('===================\n');
  
  const mexc = new ccxt.mexc({
    apiKey: process.env.API_KEY,
    secret: process.env.API_SECRET,
    enableRateLimit: true
  });
  
  try {
    console.log('1. Fetching balance...');
    const balance = await mexc.fetchBalance();
    
    console.log('Full balance keys:', Object.keys(balance).length);
    console.log('Has USDT property:', 'USDT' in balance);
    console.log('Has info property:', 'info' in balance);
    
    console.log('\n2. USDT details:');
    console.log('USDT object:', JSON.stringify(balance.USDT, null, 2));
    
    console.log('\n3. SOL details:');
    console.log('SOL object:', JSON.stringify(balance.SOL, null, 2));
    
    console.log('\n4. Checking info field (raw API response):');
    if (balance.info && balance.info.balances) {
      console.log('Raw balances length:', balance.info.balances.length);
      
      // Find USDT in raw balances
      const usdtRaw = balance.info.balances.find(b => b.asset === 'USDT');
      const solRaw = balance.info.balances.find(b => b.asset === 'SOL');
      
      console.log('Raw USDT:', usdtRaw);
      console.log('Raw SOL:', solRaw);
    }
    
    console.log('\n5. Total value:');
    console.log('Total:', balance.total);
    console.log('Free:', balance.free);
    console.log('Used:', balance.used);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

test();