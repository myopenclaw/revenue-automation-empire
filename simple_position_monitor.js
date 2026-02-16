// 🚀 SIMPLE POSITION MONITOR
// For the SOL position just bought

const fs = require('fs');
const path = require('path');
const tools = require('./mexc_spot_tools.js');

console.log('🚀 STARTING POSITION MONITOR FOR SOL');
console.log('====================================\n');

// Position details from the trade
const POSITION = {
  symbol: 'SOLUSDT',
  entry_price: 85.11,
  entry_qty: 0.058,
  entry_time: new Date().toISOString()
};

console.log('📊 POSITION DETAILS:');
console.log('  Symbol:', POSITION.symbol);
console.log('  Entry:', POSITION.entry_qty.toFixed(4), 'SOL @ $' + POSITION.entry_price.toFixed(2));
console.log('  Entry value: $' + (POSITION.entry_qty * POSITION.entry_price).toFixed(2));
console.log('  Time:', POSITION.entry_time);
console.log('');

// TP Ladder configuration
const TP_PLAN = [
  { pct_gain: 8, sell_pct: 25, target_price: null, sell_qty: null },
  { pct_gain: 15, sell_pct: 25, target_price: null, sell_qty: null },
  { pct_gain: 25, sell_pct: 50, target_price: null, sell_qty: null }
];

// Calculate TP targets
console.log('🎯 TP LADDER CALCULATION:');
TP_PLAN.forEach((tp, i) => {
  tp.target_price = POSITION.entry_price * (1 + tp.pct_gain / 100);
  tp.sell_qty = POSITION.entry_qty * (tp.sell_pct / 100);
  console.log(`  TP${i+1}: +${tp.pct_gain}% → Sell ${tp.sell_qty.toFixed(4)} SOL @ $${tp.target_price.toFixed(2)}`);
});

// Stop loss calculation
const STOP_LOSS_PCT = 6;
const stop_price = POSITION.entry_price * (1 - STOP_LOSS_PCT / 100);
console.log(`\n🛑 STOP LOSS: -${STOP_LOSS_PCT}% = $${stop_price.toFixed(2)}`);
console.log('');

// Check current price
async function checkPrice() {
  console.log('🔍 Checking current price...');
  const ticker = await tools.mexc_spot_get_ticker('SOLUSDT');
  
  if (ticker.success) {
    const current = ticker.last;
    const pnl_pct = ((current - POSITION.entry_price) / POSITION.entry_price) * 100;
    
    console.log('  Current price: $' + current.toFixed(2));
    console.log('  PnL: ' + pnl_pct.toFixed(2) + '%');
    console.log('  Value: $' + (POSITION.entry_qty * current).toFixed(2));
    
    // Check stop loss
    if (pnl_pct <= -STOP_LOSS_PCT) {
      console.log('\n🚨 STOP LOSS TRIGGERED!');
      console.log('  ' + pnl_pct.toFixed(2) + '% <= -' + STOP_LOSS_PCT + '%');
      console.log('  Would execute market sell...');
    } else {
      console.log('  Stop loss: ' + (-STOP_LOSS_PCT - pnl_pct).toFixed(2) + '% away');
    }
    
    // Check TP targets
    console.log('\n🎯 TP TARGETS:');
    TP_PLAN.forEach((tp, i) => {
      const tp_pct = ((tp.target_price - current) / current) * 100;
      console.log(`  TP${i+1}: ${tp_pct.toFixed(2)}% to go ($${tp.target_price.toFixed(2)})`);
    });
    
  } else {
    console.log('  ❌ Error getting price:', ticker.error);
  }
}

// Place TP orders
async function placeTPOrders() {
  console.log('\n📤 PLACING TP ORDERS...');
  
  for (let i = 0; i < TP_PLAN.length; i++) {
    const tp = TP_PLAN[i];
    
    console.log(`\n  TP${i+1}: +${tp.pct_gain}% ($${tp.target_price.toFixed(2)})`);
    console.log(`    Sell ${tp.sell_qty.toFixed(4)} SOL`);
    
    try {
      const orderResult = await tools.mexc_spot_place_order({
        symbol: 'SOLUSDT',
        side: 'sell',
        type: 'limit',
        base_qty: tp.sell_qty,
        price: tp.target_price
      });
      
      if (orderResult.success) {
        console.log(`    ✅ Order placed: ${orderResult.orderId}`);
      } else {
        console.log(`    ❌ Failed: ${orderResult.error}`);
      }
    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
    }
    
    // Small delay between orders
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Main function
async function main() {
  console.log('1. Checking current market conditions...');
  await checkPrice();
  
  console.log('\n2. Would you like to place TP orders now?');
  console.log('   [Y] Yes, place all TP orders');
  console.log('   [N] No, just monitor');
  console.log('   [S] Skip, I\'ll do it manually');
  console.log('');
  
  // For now, just show what would happen
  console.log('💡 For automatic TP placement, we need to:');
  console.log('   • Add this to the trading agent');
  console.log('   • Or run this script after each buy');
  console.log('');
  
  console.log('📋 NEXT STEPS:');
  console.log('   1. Integrate Position Monitor with trading agent');
  console.log('   2. Auto-place TP orders after successful buys');
  console.log('   3. Auto-monitor for stop loss triggers');
  console.log('   4. Save position state to file');
  console.log('');
  
  console.log('✅ POSITION MONITOR READY FOR INTEGRATION');
}

// Run
main().catch(console.error);