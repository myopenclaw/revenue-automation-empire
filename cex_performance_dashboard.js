// 🚀 CEX PERFORMANCE DASHBOARD
// Real-time tracking for CEX trading

const fs = require('fs');
const path = require('path');
const tools = require('./mexc_spot_tools.js');

console.log('🚀 CEX PERFORMANCE DASHBOARD');
console.log('============================\n');

// Configuration
const CONFIG = {
  STATE_FILE: path.join(__dirname, 'trading_state.json'),
  LOG_FILE: path.join(__dirname, 'trading_log.jsonl'),
  PERFORMANCE_FILE: path.join(__dirname, 'cex_performance.json'),
  
  // Targets
  DAILY_TRADE_LIMIT: 3,
  DAILY_PROFIT_TARGET_PCT: 3,
  DAILY_STOP_LOSS_PCT: 5,
  
  // Compounding goal
  TARGET_DAILY_PROFIT: 50, // $50/day ultimate goal
  STARTING_CAPITAL: 100, // $100 target
  CURRENT_CAPITAL: null // Will be loaded
};

class PerformanceDashboard {
  constructor() {
    this.state = this.loadState();
    this.performance = this.loadPerformance();
    console.log('📊 Performance Dashboard initialized');
  }
  
  loadState() {
    try {
      if (fs.existsSync(CONFIG.STATE_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG.STATE_FILE, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading state:', error.message);
    }
    return {
      trades_today: 0,
      daily_pnl: 0,
      trade_history: []
    };
  }
  
  loadPerformance() {
    try {
      if (fs.existsSync(CONFIG.PERFORMANCE_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG.PERFORMANCE_FILE, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading performance:', error.message);
    }
    return {
      all_time: {
        total_trades: 0,
        total_pnl: 0,
        win_rate: 0,
        best_day: 0,
        worst_day: 0
      },
      daily: {},
      weekly: {},
      monthly: {}
    };
  }
  
  async getCurrentBalance() {
    try {
      const balance = await tools.mexc_spot_get_balance('USDT');
      return balance.success ? balance.free : 0;
    } catch (error) {
      console.error('Error getting balance:', error.message);
      return 0;
    }
  }
  
  async getSOLPosition() {
    try {
      const balance = await tools.mexc_spot_get_balance('SOL');
      if (balance.success) {
        const ticker = await tools.mexc_spot_get_ticker('SOLUSDT');
        const price = ticker.success ? ticker.last : 0;
        return {
          qty: balance.free,
          price: price,
          value: balance.free * price
        };
      }
    } catch (error) {
      console.error('Error getting SOL position:', error.message);
    }
    return { qty: 0, price: 0, value: 0 };
  }
  
  calculateCompoundingPath(currentCapital, targetDailyProfit = CONFIG.TARGET_DAILY_PROFIT) {
    const dailyReturnPct = CONFIG.DAILY_PROFIT_TARGET_PCT / 100;
    const capitalNeeded = targetDailyProfit / dailyReturnPct;
    
    const daysToTarget = Math.log(capitalNeeded / currentCapital) / Math.log(1 + dailyReturnPct);
    
    return {
      currentCapital,
      targetDailyProfit,
      capitalNeeded,
      daysToTarget: Math.ceil(daysToTarget),
      weeklyProgress: [],
      milestones: [
        { capital: 100, dailyProfit: 3 },
        { capital: 200, dailyProfit: 6 },
        { capital: 500, dailyProfit: 15 },
        { capital: 1000, dailyProfit: 30 },
        { capital: 1667, dailyProfit: 50 }
      ]
    };
  }
  
  async displayDashboard() {
    console.log('🔄 Loading real-time data...\n');
    
    // Get current data
    const usdtBalance = await this.getCurrentBalance();
    const solPosition = await this.getSOLPosition();
    const totalValue = usdtBalance + solPosition.value;
    
    // Calculate compounding path
    const compounding = this.calculateCompoundingPath(totalValue);
    
    console.log('='.repeat(60));
    console.log('🎯 CEX TRADING PERFORMANCE DASHBOARD');
    console.log('='.repeat(60));
    
    console.log('\n💰 CAPITAL & POSITIONS');
    console.log('-'.repeat(40));
    console.log(`USDT Balance: $${usdtBalance.toFixed(2)}`);
    console.log(`SOL Position: ${solPosition.qty.toFixed(4)} SOL ($${solPosition.value.toFixed(2)})`);
    console.log(`Total Value: $${totalValue.toFixed(2)}`);
    console.log(`SOL Price: $${solPosition.price.toFixed(2)}`);
    
    console.log('\n📊 TODAY\'S PERFORMANCE');
    console.log('-'.repeat(40));
    console.log(`Trades: ${this.state.trades_today}/${CONFIG.DAILY_TRADE_LIMIT}`);
    console.log(`PnL: $${this.state.daily_pnl.toFixed(2)}`);
    console.log(`Target: +${CONFIG.DAILY_PROFIT_TARGET_PCT}% ($${(totalValue * CONFIG.DAILY_PROFIT_TARGET_PCT / 100).toFixed(2)})`);
    console.log(`Stop Loss: -${CONFIG.DAILY_STOP_LOSS_PCT}% ($${(totalValue * CONFIG.DAILY_STOP_LOSS_PCT / 100).toFixed(2)})`);
    
    if (this.state.trade_history.length > 0) {
      console.log('\n📈 RECENT TRADES');
      console.log('-'.repeat(40));
      this.state.trade_history.slice(-5).forEach((trade, i) => {
        const time = new Date(trade.timestamp).toLocaleTimeString();
        console.log(`${i+1}. ${time} - ${trade.trade.symbol} $${trade.trade.quote_amount || trade.trade.base_qty} - ${trade.result}`);
      });
    }
    
    console.log('\n🚀 COMPOUNDING ROADMAP TO $50/DAY');
    console.log('-'.repeat(40));
    console.log(`Current: $${totalValue.toFixed(2)}`);
    console.log(`Daily target: ${CONFIG.DAILY_PROFIT_TARGET_PCT}% = $${(totalValue * CONFIG.DAILY_PROFIT_TARGET_PCT / 100).toFixed(2)}`);
    console.log(`Capital needed for $${CONFIG.TARGET_DAILY_PROFIT}/day: $${compounding.capitalNeeded.toFixed(2)}`);
    console.log(`Days to reach: ${compounding.daysToTarget} (${Math.floor(compounding.daysToTarget / 30)} months)`);
    
    console.log('\n🎯 MILESTONES');
    console.log('-'.repeat(40));
    compounding.milestones.forEach(milestone => {
      const daysAway = Math.log(milestone.capital / totalValue) / Math.log(1 + CONFIG.DAILY_PROFIT_TARGET_PCT / 100);
      const status = totalValue >= milestone.capital ? '✅ ACHIEVED' : `📅 ${Math.ceil(daysAway)} days`;
      console.log(`$${milestone.capital} → $${milestone.dailyProfit}/day: ${status}`);
    });
    
    console.log('\n📈 ALL-TIME STATS');
    console.log('-'.repeat(40));
    console.log(`Total trades: ${this.performance.all_time?.total_trades || 0}`);
    console.log(`Total PnL: $${(this.performance.all_time?.total_pnl || 0).toFixed(2)}`);
    console.log(`Win rate: ${((this.performance.all_time?.win_rate || 0) * 100).toFixed(1)}%`);
    console.log(`Best day: $${(this.performance.all_time?.best_day || 0).toFixed(2)}`);
    console.log(`Worst day: $${(this.performance.all_time?.worst_day || 0).toFixed(2)}`);
    
    console.log('\n⚡️  RECOMMENDATIONS');
    console.log('-'.repeat(40));
    
    if (this.state.trades_today >= CONFIG.DAILY_TRADE_LIMIT) {
      console.log('✅ Daily limit reached - Good job on risk management!');
      console.log('   Next trades available tomorrow.');
    } else {
      const tradesLeft = CONFIG.DAILY_TRADE_LIMIT - this.state.trades_today;
      console.log(`📊 ${tradesLeft} trades remaining today`);
      console.log(`   Target: $${(tradesLeft * 5).toFixed(2)} risk, $${(tradesLeft * 0.15).toFixed(2)} profit target`);
    }
    
    if (solPosition.qty > 0) {
      console.log(`📊 SOL position active: ${solPosition.qty.toFixed(4)} SOL`);
      console.log(`   Current value: $${solPosition.value.toFixed(2)}`);
      console.log(`   TP orders should be placed at +8%, +15%, +25%`);
      console.log(`   Stop loss: -6% = $${(solPosition.price * 0.94).toFixed(2)}`);
    }
    
    console.log('\n='.repeat(60));
    console.log('✅ DASHBOARD UPDATED: ' + new Date().toLocaleTimeString());
    console.log('='.repeat(60));
  }
  
  async updatePerformance() {
    console.log('\n🔄 Updating performance metrics...');
    
    // Recalculate all-time stats from log
    try {
      if (fs.existsSync(CONFIG.LOG_FILE)) {
        const logData = fs.readFileSync(CONFIG.LOG_FILE, 'utf8');
        const trades = logData.trim().split('\n').map(line => JSON.parse(line));
        
        this.performance.all_time.total_trades = trades.length;
        this.performance.all_time.total_pnl = trades.reduce((sum, trade) => {
          if (trade.result.includes('WIN')) return sum + (trade.trade.quote_amount || trade.trade.base_qty || 0);
          return sum;
        }, 0);
        
        const wins = trades.filter(t => t.result.includes('WIN')).length;
        this.performance.all_time.win_rate = trades.length > 0 ? wins / trades.length : 0;
        
        // Save updated performance
        fs.writeFileSync(CONFIG.PERFORMANCE_FILE, JSON.stringify(this.performance, null, 2));
        console.log('✅ Performance metrics updated');
      }
    } catch (error) {
      console.error('Error updating performance:', error.message);
    }
  }
}

// Main function
async function main() {
  console.log('🎯 REAL-TIME CEX PERFORMANCE DASHBOARD');
  console.log('======================================\n');
  
  const dashboard = new PerformanceDashboard();
  
  // Update performance metrics
  await dashboard.updatePerformance();
  
  // Display dashboard
  await dashboard.displayDashboard();
  
  console.log('\n📋 QUICK COMMANDS:');
  console.log('   ./trade status      - Trading agent status');
  console.log('   ./trade balance     - Check balance');
  console.log('   node simple_position_monitor.js - Check SOL position');
  console.log('');
  
  console.log('🚀 NEXT ACTIONS:');
  console.log('   1. Monitor SOL TP orders (8%/15%/25%)');
  console.log('   2. Plan tomorrow\'s 3 trades');
  console.log('   3. Consider deposit to reach $100 capital faster');
  console.log('   4. Set up Telegram alerts for DEX scanner');
  console.log('');
  
  console.log('✅ Dashboard ready for daily tracking!');
}

main().catch(console.error);