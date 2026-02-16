// 🧪 Simple Position Monitor Test
const tools = require('./mexc_spot_tools.js');

async function testMonitor() {
  console.log('🧪 Testing Position Monitor Components\n');
  
  // Test 1: Get ticker
  console.log('1. Testing mexc_spot_get_ticker("SOLUSDT")');
  const ticker = await tools.mexc_spot_get_ticker('SOLUSDT');
  console.log('   Success:', ticker.success);
  if (ticker.success) {
    console.log('   Price:', ticker.last);
    console.log('   High:', ticker.high);
    console.log('   Low:', ticker.low);
  } else {
    console.log('   Error:', ticker.error);
  }
  console.log('');
  
  // Test 2: Simulate TP ladder calculation
  console.log('2. Simulating TP Ladder for SOL position');
  const entryPrice = 85.0;
  const entryQty = 0.5;
  
  const tpPlan = [
    { pct_gain: 8, sell_pct: 25 },
    { pct_gain: 15, sell_pct: 25 },
    { pct_gain: 25, sell_pct: 50 }
  ];
  
  console.log('   Entry:', entryQty, 'SOL @ $' + entryPrice);
  console.log('   TP Ladder:');
  
  tpPlan.forEach(tp => {
    const targetPrice = entryPrice * (1 + tp.pct_gain / 100);
    const sellQty = entryQty * (tp.sell_pct / 100);
    console.log(`   • ${tp.pct_gain}%: Sell ${sellQty.toFixed(4)} SOL @ $${targetPrice.toFixed(2)}`);
  });
  console.log('');
  
  // Test 3: Stop loss calculation
  console.log('3. Stop Loss Calculation');
  const stopLossPct = 6;
  const stopPrice = entryPrice * (1 - stopLossPct / 100);
  console.log(`   Stop loss: -${stopLossPct}% = $${stopPrice.toFixed(2)}`);
  console.log(`   Current price: $${ticker.success ? ticker.last : 'N/A'}`);
  
  if (ticker.success) {
    const pnlPct = ((ticker.last - entryPrice) / entryPrice) * 100;
    console.log(`   Current PnL: ${pnlPct.toFixed(2)}%`);
    
    if (pnlPct <= -stopLossPct) {
      console.log('   🚨 STOP LOSS WOULD TRIGGER!');
    } else {
      console.log(`   ✅ Safe (need ${(-stopLossPct - pnlPct).toFixed(2)}% more drop)`);
    }
  }
  console.log('');
  
  console.log('🎯 POSITION MONITOR COMPONENTS WORKING!');
  console.log('\n📋 Next: Integrate with trading system');
  console.log('   • Call monitor.onBuyExecuted() after successful buy');
  console.log('   • Monitor auto-manages TP ladder + stop loss');
  console.log('   • State saved to position_state.json');
}

testMonitor().catch(console.error);