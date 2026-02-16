// 🚀 CEX TRADING PLAN FOR TOMORROW
// Planning 3 trades for daily compounding

const fs = require('fs');
const path = require('path');
const tools = require('./mexc_spot_tools.js');

console.log('🚀 CEX TRADING PLAN FOR TOMORROW');
console.log('================================\n');

// Configuration
const CONFIG = {
  DAILY_TRADE_LIMIT: 3,
  TRADE_SIZE_USD: 5,
  DAILY_TARGET_PCT: 3,
  TOP_COINS: ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'AVAX', 'LINK'],
  
  // Files
  STATE_FILE: path.join(__dirname, 'trading_state.json'),
  PLAN_FILE: path.join(__dirname, 'tomorrow_plan.json')
};

class TomorrowPlan {
  constructor() {
    this.state = this.loadState();
    console.log('📊 Current Status:');
    console.log('   Trades today:', this.state.trades_today || 0);
    console.log('   Daily limit:', CONFIG.DAILY_TRADE_LIMIT);
    console.log('   Trade size: $' + CONFIG.TRADE_SIZE_USD);
    console.log('');
  }
  
  loadState() {
    try {
      if (fs.existsSync(CONFIG.STATE_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG.STATE_FILE, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading state:', error.message);
    }
    return { trades_today: 0 };
  }
  
  async getMarketAnalysis() {
    console.log('🔍 Analyzing market conditions...');
    
    const analysis = {};
    
    // Check each TOP_COIN
    for (const coin of CONFIG.TOP_COINS.slice(0, 5)) { // Check first 5
      const symbol = coin === 'BTC' ? 'BTCUSDT' : 
                     coin === 'ETH' ? 'ETHUSDT' : 
                     coin + 'USDT';
      
      try {
        const ticker = await tools.mexc_spot_get_ticker(symbol);
        if (ticker.success) {
          analysis[coin] = {
            price: ticker.last,
            change_24h: ((ticker.last - ticker.open) / ticker.open * 100).toFixed(2),
            high_24h: ticker.high,
            low_24h: ticker.low,
            volume: ticker.volume
          };
        }
      } catch (error) {
        console.log(`   ⚠️  ${coin}: ${error.message}`);
      }
      
      // Small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return analysis;
  }
  
  async createTradingPlan() {
    console.log('🎯 Creating tomorrow\'s trading plan...\n');
    
    // Get market analysis
    const market = await this.getMarketAnalysis();
    
    // Analyze for best opportunities
    const opportunities = [];
    
    for (const [coin, data] of Object.entries(market)) {
      // Simple scoring system
      let score = 50; // Base score
      
      // Volume score (higher is better)
      if (data.volume > 1000000) score += 20;
      else if (data.volume > 100000) score += 10;
      
      // Price change score (moderate movement is good)
      const change = parseFloat(data.change_24h);
      if (Math.abs(change) < 5) score += 15; // Stable
      else if (change > -10 && change < 10) score += 10; // Reasonable range
      
      // Price range score (tight range is good)
      const rangePct = ((data.high_24h - data.low_24h) / data.low_24h * 100);
      if (rangePct < 10) score += 15; // Tight range
      
      opportunities.push({
        coin,
        symbol: coin === 'BTC' ? 'BTCUSDT' : coin === 'ETH' ? 'ETHUSDT' : coin + 'USDT',
        price: data.price,
        change_24h: data.change_24h,
        volume: data.volume,
        score
      });
    }
    
    // Sort by score (highest first)
    opportunities.sort((a, b) => b.score - a.score);
    
    // Select top 3 for tomorrow
    const tomorrowTrades = opportunities.slice(0, 3);
    
    console.log('📋 TOMORROW\'S TRADING PLAN:');
    console.log('='.repeat(40));
    
    tomorrowTrades.forEach((trade, i) => {
      console.log(`\n${i+1}. ${trade.coin} (Score: ${trade.score}/100)`);
      console.log(`   Symbol: ${trade.symbol}`);
      console.log(`   Price: $${trade.price}`);
      console.log(`   24h Change: ${trade.change_24h}%`);
      console.log(`   Volume: $${trade.volume.toLocaleString()}`);
      console.log(`   Trade: $${CONFIG.TRADE_SIZE_USD} market buy`);
      console.log(`   Command: ./trade trade ${trade.coin} ${CONFIG.TRADE_SIZE_USD} TR`);
    });
    
    console.log('\n💰 RISK MANAGEMENT:');
    console.log('-'.repeat(40));
    console.log(`Total risk: $${(CONFIG.TRADE_SIZE_USD * 3).toFixed(2)} (3 trades × $${CONFIG.TRADE_SIZE_USD})`);
    console.log(`Daily target: +${CONFIG.DAILY_TARGET_PCT}% = +$${(CONFIG.TRADE_SIZE_USD * 3 * CONFIG.DAILY_TARGET_PCT / 100).toFixed(2)}`);
    console.log(`Max daily loss: -${CONFIG.DAILY_TARGET_PCT * 1.67}% = -$${(CONFIG.TRADE_SIZE_USD * 3 * CONFIG.DAILY_TARGET_PCT * 1.67 / 100).toFixed(2)}`);
    
    console.log('\n🎯 EXECUTION PLAN:');
    console.log('-'.repeat(40));
    console.log('9:00 AM: First trade');
    console.log('12:00 PM: Second trade');
    console.log('3:00 PM: Third trade');
    console.log('(Adjust based on market conditions)');
    
    console.log('\n📊 CURRENT POSITIONS:');
    console.log('-'.repeat(40));
    
    // Check SOL position
    try {
      const solBalance = await tools.mexc_spot_get_balance('SOL');
      if (solBalance.success && solBalance.free > 0) {
        const ticker = await tools.mexc_spot_get_ticker('SOLUSDT');
        if (ticker.success) {
          console.log(`SOL Position: ${solBalance.free.toFixed(4)} SOL ($${(solBalance.free * ticker.last).toFixed(2)})`);
          console.log(`   Current: $${ticker.last.toFixed(2)}`);
          console.log(`   TP targets: +8%($${(ticker.last * 1.08).toFixed(2)}), +15%($${(ticker.last * 1.15).toFixed(2)}), +25%($${(ticker.last * 1.25).toFixed(2)})`);
          console.log(`   Stop loss: -6% = $${(ticker.last * 0.94).toFixed(2)}`);
        }
      }
    } catch (error) {
      console.log('   Could not check SOL position:', error.message);
    }
    
    // Save plan
    const plan = {
      created: new Date().toISOString(),
      for_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      trades: tomorrowTrades,
      risk_management: {
        total_risk: CONFIG.TRADE_SIZE_USD * 3,
        daily_target_pct: CONFIG.DAILY_TARGET_PCT,
        daily_target_usd: CONFIG.TRADE_SIZE_USD * 3 * CONFIG.DAILY_TARGET_PCT / 100,
        max_daily_loss_pct: CONFIG.DAILY_TARGET_PCT * 1.67
      }
    };
    
    fs.writeFileSync(CONFIG.PLAN_FILE, JSON.stringify(plan, null, 2));
    
    console.log('\n✅ PLAN SAVED TO:', CONFIG.PLAN_FILE);
    console.log('\n🚀 READY FOR TOMORROW!');
    console.log('\n💡 Reminder:');
    console.log('   • Check regime conditions before trading');
    console.log('   • Verify balance before each trade');
    console.log('   • Monitor TP orders for existing positions');
    console.log('   • Stick to the plan - no emotional trading!');
  }
}

// Main function
async function main() {
  console.log('🎯 PLANNING TOMORROW\'S CEX TRADES');
  console.log('==================================\n');
  
  const planner = new TomorrowPlan();
  await planner.createTradingPlan();
  
  console.log('\n📋 QUICK START TOMORROW:');
  console.log('1. Run: ./trade status (check balance)');
  console.log('2. Run: node tomorrow_trading_plan.js (review plan)');
  console.log('3. Execute trades at planned times');
  console.log('4. Monitor performance with dashboard');
  
  console.log('\n✅ Tomorrow\'s trading plan is ready!');
}

main().catch(console.error);