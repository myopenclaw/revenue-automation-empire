// 🚀 SIMPLE TOMORROW TRADING PLAN
// Basic plan for 3 trades tomorrow

console.log('🚀 SIMPLE TOMORROW TRADING PLAN');
console.log('===============================\n');

// Fixed plan based on TOP_COINS
const TOMORROW_PLAN = {
  date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  
  trades: [
    {
      time: '9:00 AM',
      coin: 'SOL',
      symbol: 'SOLUSDT',
      amount: 5,
      type: 'market buy',
      command: './trade trade SOL 5 TR'
    },
    {
      time: '12:00 PM', 
      coin: 'XRP',
      symbol: 'XRPUSDT',
      amount: 5,
      type: 'market buy',
      command: './trade trade XRP 5 TR'
    },
    {
      time: '3:00 PM',
      coin: 'ADA',
      symbol: 'ADAUSDT',
      amount: 5,
      type: 'market buy',
      command: './trade trade ADA 5 TR'
    }
  ],
  
  risk_management: {
    total_risk: 15, // $5 × 3
    daily_target_pct: 3,
    daily_target_usd: 0.45, // $15 × 3%
    max_daily_loss_pct: 5,
    max_daily_loss_usd: 0.75, // $15 × 5%
    position_size_pct: 5 // 5% of $100 target
  },
  
  rules: [
    'Check regime conditions before each trade',
    'No trades if BTC 1H candle > 4%',
    'No trades during major news events',
    'Verify order execution with orderId',
    'Place TP orders after buy (8%/15%/25%)',
    'Set stop loss at -6%'
  ]
};

console.log('📅 DATE:', TOMORROW_PLAN.date);
console.log('');

console.log('🎯 3 TRADES FOR TOMORROW:');
console.log('='.repeat(40));

TOMORROW_PLAN.trades.forEach((trade, i) => {
  console.log(`\n${i+1}. ${trade.time} - ${trade.coin}`);
  console.log(`   Symbol: ${trade.symbol}`);
  console.log(`   Amount: $${trade.amount}`);
  console.log(`   Type: ${trade.type}`);
  console.log(`   Command: ${trade.command}`);
});

console.log('\n💰 RISK MANAGEMENT:');
console.log('-'.repeat(40));
console.log(`Total risk: $${TOMORROW_PLAN.risk_management.total_risk}`);
console.log(`Daily target: +${TOMORROW_PLAN.risk_management.daily_target_pct}% = +$${TOMORROW_PLAN.risk_management.daily_target_usd}`);
console.log(`Max daily loss: -${TOMORROW_PLAN.risk_management.max_daily_loss_pct}% = -$${TOMORROW_PLAN.risk_management.max_daily_loss_usd}`);
console.log(`Position size: ${TOMORROW_PLAN.risk_management.position_size_pct}% of capital`);

console.log('\n📊 CURRENT STATUS:');
console.log('-'.repeat(40));
console.log('• CEX Trading: Daily limit reached today (3/3)');
console.log('• SOL Position: 0.1167 SOL with TP orders active');
console.log('• TP Targets: +8%($91.98), +15%($97.94), +25%($106.46)');
console.log('• Current SOL: ~$85.44 (need +7.65% to first TP)');
console.log('• USDT Balance: ~$43.55');
console.log('• Total Value: ~$48.51');

console.log('\n🎯 COMPOUNDING PROGRESS:');
console.log('-'.repeat(40));
console.log('Current: $48.51');
console.log('Target: $100 (for 3% = $3/day)');
console.log('Days to $100: ~25 days at 3%/day');
console.log('Days to $50/day: ~120 days (4 months)');

console.log('\n🚀 EXECUTION CHECKLIST TOMORROW:');
console.log('-'.repeat(40));
TOMORROW_PLAN.rules.forEach((rule, i) => {
  console.log(`${i+1}. ${rule}`);
});

console.log('\n📋 QUICK COMMANDS FOR TOMORROW:');
console.log('-'.repeat(40));
console.log('1. Check balance: ./trade balance');
console.log('2. Check status: ./trade status');
console.log('3. Execute trade: ./trade trade SOL 5 TR');
console.log('4. Monitor TP: node simple_position_monitor.js');
console.log('5. Dashboard: node cex_performance_dashboard.js');

console.log('\n✅ PLAN READY FOR TOMORROW!');
console.log('\n💡 Tips:');
console.log('• Stick to the plan - no emotional trading');
console.log('• Small consistent wins compound over time');
console.log('• Risk management is more important than profits');
console.log('• Monitor both CEX and DEX opportunities');

console.log('\n🚀 TOMORROW\'S GOAL: $0.45 profit (3% of $15 risk)');