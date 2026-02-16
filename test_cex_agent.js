// 🧪 Test CEX Trading Agent
const CEXTradingAgent = require('./cex_trading_agent.js');

async function testAgent() {
  console.log('🧪 TESTING CEX TRADING AGENT\n');
  
  const agent = new CEXTradingAgent();
  
  try {
    // Test 1: Print status
    console.log('1. Testing agent status...');
    await agent.printStatus();
    console.log('');
    
    // Test 2: Check balance
    console.log('2. Testing balance check...');
    const balance = await agent.checkBalance();
    console.log('✅ Balance check completed');
    console.log('');
    
    // Test 3: Test trade simulation (SOL $5)
    console.log('3. Testing trade simulation (SOL $5)...');
    const tradeResult = await agent.trade('SOL', 5, false); // false = simulate
    console.log('✅ Trade simulation:', tradeResult.success ? 'SUCCESS' : 'FAILED');
    if (tradeResult.success) {
      console.log('   Symbol:', tradeResult.symbol);
      console.log('   Amount:', tradeResult.amount);
      console.log('   Price:', tradeResult.price);
      console.log('   Base amount:', tradeResult.baseAmount);
    }
    console.log('');
    
    // Test 4: Test regime check
    console.log('4. Testing regime check...');
    const regime = await agent.checkRegime();
    console.log('✅ Regime check:', regime.allowed ? 'ALLOWED' : 'BLOCKED');
    if (!regime.allowed) {
      console.log('   Reason:', regime.reason);
    }
    console.log('');
    
    // Test 5: Test coin validation
    console.log('5. Testing coin validation...');
    console.log('   SOL:', agent.validateCoin('SOL') ? 'VALID' : 'INVALID');
    console.log('   DOGE:', agent.validateCoin('DOGE') ? 'VALID' : 'INVALID');
    console.log('');
    
    // Test 6: Get performance summary
    console.log('6. Testing performance summary...');
    const perf = agent.getPerformanceSummary();
    console.log('✅ Performance summary generated');
    console.log('   Today PnL:', perf.today.pnl);
    console.log('   Today trades:', perf.today.trades);
    console.log('');
    
    console.log('🎉 All tests completed!');
    console.log('\n⚠️  Note: Actual trading requires:');
    console.log('   1. $100 capital deposit (current: $' + perf.capital.current + ')');
    console.log('   2. "TR" flag to execute trades');
    console.log('   3. Regime conditions met');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests
testAgent();