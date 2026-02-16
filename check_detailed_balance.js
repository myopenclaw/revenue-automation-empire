// 🔍 Detailed Balance Check
const ccxt = require('ccxt');
require('dotenv').config({ path: require('os').homedir() + '/.mexc_credentials' });

async function checkDetailedBalance() {
  console.log('🔍 DETAILED BALANCE CHECK');
  console.log('========================\n');
  
  const mexc = new ccxt.mexc({
    apiKey: process.env.API_KEY,
    secret: process.env.API_SECRET,
    enableRateLimit: true
  });
  
  try {
    const balance = await mexc.fetchBalance();
    
    console.log('📊 FULL BALANCE REPORT:');
    console.log('----------------------');
    
    // Show all balances with details
    for (const [asset, data] of Object.entries(balance)) {
      if (data.total > 0 || asset === 'USDT' || asset === 'SOL') {
        console.log(`${asset}:`);
        console.log(`  Free: ${data.free}`);
        console.log(`  Used: ${data.used}`);
        console.log(`  Total: ${data.total}`);
        console.log('');
      }
    }
    
    console.log('🎯 TRADING AVAILABILITY:');
    console.log('-----------------------');
    console.log(`USDT Available: $${balance.USDT?.free || 0}`);
    console.log(`SOL Available: ${balance.SOL?.free || 0} ($${(balance.SOL?.free || 0) * 85.37})`);
    
    // Check for open orders
    console.log('\n🔍 CHECKING FOR OPEN ORDERS...');
    try {
      const openOrders = await mexc.fetchOpenOrders();
      console.log(`Open orders: ${openOrders.length}`);
      
      if (openOrders.length > 0) {
        console.log('\n📋 OPEN ORDERS:');
        openOrders.forEach((order, i) => {
          console.log(`${i+1}. ${order.symbol} ${order.side} ${order.type}`);
          console.log(`   Amount: ${order.amount}, Price: ${order.price || 'market'}`);
          console.log(`   Filled: ${order.filled}, Status: ${order.status}`);
          console.log(`   Order ID: ${order.id}`);
          console.log('');
        });
      }
    } catch (orderError) {
      console.log('Could not fetch open orders:', orderError.message);
    }
    
  } catch (error) {
    console.error('❌ Balance check failed:', error.message);
  }
}

checkDetailedBalance();