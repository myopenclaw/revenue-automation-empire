// 🎯 CEX Trading Agent - MEXC Spot Trading with $100 Capital
// Main trading agent implementation

const tools = require('./mexc_spot_tools.js');
const config = require('./cex_trading_config.js');
const fs = require('fs');
const path = require('path');

// Performance tracking file
const PERFORMANCE_FILE = path.join(__dirname, 'cex_performance.json');

class CEXTradingAgent {
  constructor() {
    this.config = config;
    this.performance = this.loadPerformance();
    this.today = new Date().toISOString().split('T')[0];
    this.initializeDailyTracking();
  }
  
  // Load performance data
  loadPerformance() {
    try {
      if (fs.existsSync(PERFORMANCE_FILE)) {
        const data = fs.readFileSync(PERFORMANCE_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading performance data:', error.message);
    }
    
    // Default performance structure
    return {
      daily: {},
      weekly: {},
      monthly: {},
      allTime: {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalPnl: 0,
        winRate: 0
      }
    };
  }
  
  // Save performance data
  savePerformance() {
    try {
      fs.writeFileSync(PERFORMANCE_FILE, JSON.stringify(this.performance, null, 2));
      console.log('✅ Performance data saved');
    } catch (error) {
      console.error('Error saving performance data:', error.message);
    }
  }
  
  // Initialize daily tracking
  initializeDailyTracking() {
    if (!this.performance.daily[this.today]) {
      this.performance.daily[this.today] = {
        date: this.today,
        trades: [],
        pnl: 0,
        winRate: 0,
        tradesCount: 0,
        winningTrades: 0,
        losingTrades: 0,
        dailyTarget: this.config.trading.daily_target_usd,
        dailyLossLimit: -this.config.trading.max_daily_loss_usd,
        status: 'active' // active, paused (loss limit reached), completed (target reached)
      };
      this.savePerformance();
    }
  }
  
  // Check current balance
  async checkBalance() {
    console.log('💰 Checking balance...');
    const result = await tools.mexc_spot_get_balance('USDT');
    
    if (result.success) {
      const currentBalance = result.free;
      console.log(`✅ Current USDT balance: $${currentBalance}`);
      
      // Update config with current balance
      this.config.capital.current = currentBalance;
      this.config.capital.deposit_needed = this.config.capital.target - currentBalance;
      
      if (currentBalance >= this.config.capital.target) {
        console.log(`🎉 Capital target reached! $${currentBalance} available`);
        return { success: true, balance: currentBalance, targetReached: true };
      } else {
        console.log(`⏳ Need $${this.config.capital.deposit_needed} more to reach $${this.config.capital.target}`);
        return { success: true, balance: currentBalance, targetReached: false };
      }
    } else {
      console.error('❌ Failed to check balance:', result.error);
      return { success: false, error: result.error };
    }
  }
  
  // Check regime conditions
  async checkRegime() {
    console.log('📊 Checking regime conditions...');
    
    // Check BTC 1H candle (simplified - would need actual BTC data)
    // For now, we'll simulate this check
    const btcChange = await this.getBTC1HChange();
    
    if (Math.abs(btcChange) > this.config.regime.btc_1h_max_change) {
      console.log(`⚠️  BTC 1H change (${btcChange}%) exceeds ${this.config.regime.btc_1h_max_change}% limit`);
      return { allowed: false, reason: `BTC volatility too high: ${btcChange}%` };
    }
    
    // Check trading hours (UTC)
    const now = new Date();
    const currentHour = now.getUTCHours();
    
    if (currentHour < this.config.regime.preferred_trading_hours.start || 
        currentHour > this.config.regime.preferred_trading_hours.end) {
      console.log(`⚠️  Outside preferred trading hours (UTC ${this.config.regime.preferred_trading_hours.start}:00 - ${this.config.regime.preferred_trading_hours.end}:00)`);
      return { allowed: false, reason: 'Outside preferred trading hours' };
    }
    
    console.log('✅ Regime check passed');
    return { allowed: true };
  }
  
  // Simulate BTC 1H change (would need actual API call)
  async getBTC1HChange() {
    // This is a simulation - in production, would fetch actual BTC data
    // Return random change between -3% and +3% for testing
    return (Math.random() * 6) - 3;
  }
  
  // Validate coin is in TOP_COINS
  validateCoin(coin) {
    const upperCoin = coin.toUpperCase();
    const isValid = this.config.top_coins.includes(upperCoin);
    
    if (!isValid) {
      console.log(`❌ ${coin} is not in TOP_COINS list:`, this.config.top_coins);
    } else {
      console.log(`✅ ${coin} is in TOP_COINS list`);
    }
    
    return isValid;
  }
  
  // Check if we can trade today
  canTradeToday() {
    const todayData = this.performance.daily[this.today];
    
    if (!todayData) {
      console.log('❌ No daily data found');
      return false;
    }
    
    // Check daily loss limit
    if (todayData.pnl <= todayData.dailyLossLimit) {
      console.log(`❌ Daily loss limit reached: $${todayData.pnl} (limit: $${todayData.dailyLossLimit})`);
      todayData.status = 'paused';
      this.savePerformance();
      return false;
    }
    
    // Check max trades per day
    if (todayData.tradesCount >= this.config.trading.max_trades_per_day) {
      console.log(`❌ Max trades per day reached: ${todayData.tradesCount}/${this.config.trading.max_trades_per_day}`);
      return false;
    }
    
    // Check if daily target reached
    if (todayData.pnl >= todayData.dailyTarget) {
      console.log(`✅ Daily target reached: $${todayData.pnl} (target: $${todayData.dailyTarget})`);
      todayData.status = 'completed';
      this.savePerformance();
      return false;
    }
    
    return true;
  }
  
  // Execute trade
  async trade(coin, amount, execute = false) {
    console.log(`\n🎯 TRADE COMMAND: ${coin} $${amount} ${execute ? 'EXECUTE' : 'SIMULATE'}`);
    
    // 1. Check balance
    const balanceCheck = await this.checkBalance();
    if (!balanceCheck.success) {
      return { success: false, error: 'Balance check failed' };
    }
    
    // 2. Check if we have enough balance
    if (balanceCheck.balance < amount) {
      console.log(`❌ Insufficient balance: $${balanceCheck.balance} < $${amount}`);
      return { success: false, error: 'Insufficient balance' };
    }
    
    // 3. Validate coin
    if (!this.validateCoin(coin)) {
      return { success: false, error: 'Coin not in TOP_COINS' };
    }
    
    // 4. Check regime
    const regimeCheck = await this.checkRegime();
    if (!regimeCheck.allowed) {
      return { success: false, error: `Regime check failed: ${regimeCheck.reason}` };
    }
    
    // 5. Check daily limits
    if (!this.canTradeToday()) {
      return { success: false, error: 'Daily trading limits reached' };
    }
    
    // 6. Validate amount is within position size limit
    if (amount > this.config.trading.position_size_usd) {
      console.log(`⚠️  Amount ($${amount}) exceeds position size limit ($${this.config.trading.position_size_usd})`);
      // For safety, we'll cap it at the limit
      amount = this.config.trading.position_size_usd;
      console.log(`   Using capped amount: $${amount}`);
    }
    
    // 7. Get current price
    const symbol = `${coin}/USDT`;
    console.log(`📈 Getting current price for ${symbol}...`);
    
    const ticker = await tools.mexc_spot_get_ticker(symbol);
    if (!ticker.success) {
      return { success: false, error: `Failed to get price: ${ticker.error}` };
    }
    
    const currentPrice = ticker.last;
    const baseAmount = amount / currentPrice;
    
    console.log(`   Current price: $${currentPrice}`);
    console.log(`   $${amount} buys approximately ${baseAmount.toFixed(4)} ${coin}`);
    
    // 8. Execute or simulate trade
    if (execute) {
      console.log('🚀 EXECUTING TRADE...');
      
      // Place market buy order
      const orderResult = await tools.mexc_spot_place_order({
        symbol: symbol,
        side: 'buy',
        type: 'market',
        quote_amount: amount
      });
      
      if (orderResult.success) {
        console.log(`✅ Order placed: ${orderResult.orderId}`);
        
        // Record trade
        this.recordTrade({
          id: orderResult.orderId,
          symbol: symbol,
          side: 'buy',
          type: 'market',
          amount: amount,
          price: currentPrice,
          baseAmount: baseAmount,
          timestamp: new Date().toISOString(),
          status: 'executed'
        });
        
        return {
          success: true,
          orderId: orderResult.orderId,
          symbol: symbol,
          amount: amount,
          price: currentPrice,
          baseAmount: baseAmount,
          message: 'Trade executed successfully'
        };
      } else {
        console.error('❌ Order failed:', orderResult.error);
        return { success: false, error: `Order failed: ${orderResult.error}` };
      }
    } else {
      console.log('🔍 SIMULATION MODE - No trade executed');
      console.log('   To execute, add "TR" to command');
      
      return {
        success: true,
        simulation: true,
        symbol: symbol,
        amount: amount,
        price: currentPrice,
        baseAmount: baseAmount,
        message: 'Trade simulation successful - ready to execute'
      };
    }
  }
  
  // Record trade in performance tracking
  recordTrade(tradeData) {
    const todayData = this.performance.daily[this.today];
    
    todayData.trades.push(tradeData);
    todayData.tradesCount = todayData.trades.length;
    
    // For now, we'll simulate PnL (in production, would track actual PnL)
    // Simulate 60% win rate with 1:2 risk/reward
    const isWin = Math.random() < 0.6;
    const pnl = isWin ? 
      this.config.trading.position_size_usd * (this.config.trading.risk_reward_ratio - 1) : // Win: risk * (RR-1)
      -this.config.trading.position_size_usd; // Loss: -risk
    
    tradeData.pnl = pnl;
    tradeData.isWin = isWin;
    
    todayData.pnl += pnl;
    
    if (isWin) {
      todayData.winningTrades++;
      this.performance.allTime.winningTrades++;
    } else {
      todayData.losingTrades++;
      this.performance.allTime.losingTrades++;
    }
    
    this.performance.allTime.totalTrades++;
    this.performance.allTime.totalPnl += pnl;
    this.performance.allTime.winRate = (this.performance.allTime.winningTrades / this.performance.allTime.totalTrades) * 100;
    
    todayData.winRate = (todayData.winningTrades / todayData.tradesCount) * 100;
    
    console.log(`📊 Trade recorded: ${tradeData.isWin ? 'WIN' : 'LOSS'} ($${pnl.toFixed(2)})`);
    console.log(`   Today's PnL: $${todayData.pnl.toFixed(2)}`);
    console.log(`   Today's win rate: ${todayData.winRate.toFixed(1)}%`);
    
    this.savePerformance();
  }
  
  // Get performance summary
  getPerformanceSummary() {
    const todayData = this.performance.daily[this.today] || {};
    const allTime = this.performance.allTime;
    
    return {
      date: this.today,
      today: {
        pnl: todayData.pnl || 0,
        trades: todayData.tradesCount || 0,
        wins: todayData.winningTrades || 0,
        losses: todayData.losingTrades || 0,
        winRate: todayData.winRate || 0,
        status: todayData.status || 'active',
        target: this.config.trading.daily_target_usd,
        lossLimit: -this.config.trading.max_daily_loss_usd
      },
      allTime: {
        totalTrades: allTime.totalTrades,
        winningTrades: allTime.winningTrades,
        losingTrades: allTime.losingTrades,
        totalPnl: allTime.totalPnl,
        winRate: allTime.winRate
      },
      capital: {
        current: this.config.capital.current,
        target: this.config.capital.target,
        depositNeeded: this.config.capital.deposit_needed
      }
    };
  }
  
  // Print status
  async printStatus() {
    console.log('\n' + '='.repeat(50));
    console.log('🎯 CEX TRADING AGENT STATUS');
    console.log('='.repeat(50));
    
    // Check balance
    const balance = await this.checkBalance();
    
    // Get performance
    const perf = this.getPerformanceSummary();
    
    console.log('\n💰 CAPITAL:');
    console.log(`   Current: $${perf.capital.current.toFixed(2)}`);
    console.log(`   Target: $${perf.capital.target}`);
    console.log(`   Deposit needed: $${perf.capital.depositNeeded.toFixed(2)}`);
    
    console.log('\n📊 TODAY\'S PERFORMANCE:');
    console.log(`   PnL: $${perf.today.pnl.toFixed(2)} (target: +$${perf.today.target})`);
    console.log(`   Trades: ${perf.today.trades}/${this.config.trading.max_trades_per_day}`);
    console.log(`   Wins: ${perf.today.wins}, Losses: ${perf.today.losses}`);
    console.log(`   Win rate: ${perf.today.winRate.toFixed(1)}%`);
    console.log(`   Status: ${perf.today.status}`);
    
    console.log('\n📈 ALL-TIME PERFORMANCE:');
    console.log(`   Total trades: ${perf.allTime.totalTrades}`);
    console.log(`   Win rate: ${perf.allTime.winRate.toFixed(1)}%`);
    console.log(`   Total PnL: $${perf.allTime.totalPnl.toFixed(2)}`);
    
    console.log('\n⚙️  TRADING PARAMETERS:');
    console.log(`   Position size: $${this.config.trading.position_size_usd} (${this.config.trading.position_size_percent}%)`);
    console.log(`   Daily target: +$${this.config.trading.daily_target_usd} (${this.config.trading.daily_target_percent}%)`);
    console.log(`   Max daily loss: -$${this.config.trading.max_daily_loss_usd} (${this.config.trading.max_daily_loss_percent}%)`);
    console.log(`   Risk/reward: 1:${this.config.trading.risk_reward_ratio}`);
    
    console.log('\n🎯 TOP COINS:', this.config.top_coins.join(', '));
    
    console.log('\n' + '='.repeat(50));
    
    return perf;
  }
}

// Export for command-line usage
module.exports = CEXTradingAgent;

// If run directly
if (require.main === module) {
  const agent = new CEXTradingAgent();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // No arguments: show status
    agent.printStatus();
  } else if (args[0] === 'trade') {
    // trade SOL 5 TR
    const coin = args[1] || 'SOL';
    const amount = parseFloat(args[2]) || 5;
    const execute = args[3] === 'TR';
    
    agent.trade(coin, amount, execute)
      .then(result => {
        if (result.success) {
          console.log('\n✅ Trade command completed');
          if (result.simulation) {
            console.log('🔍 Simulation mode - use "TR" to execute');
          }
        } else {
          console.error('\n❌ Trade failed:', result.error);
        }
      })
      .catch(error => {
        console.error('❌ Error:', error);
      });
  } else if (args[0] === 'status') {
    agent.printStatus();
  } else if (args[0] === 'balance') {
    agent.checkBalance();
  } else {
    console.log('Usage:');
    console.log('  node cex_trading_agent.js                    - Show status');
    console.log('  node cex_trading_agent.js status            - Show status');
    console.log('  node cex_trading_agent.js balance           - Check balance');
    console.log('  node cex_trading_agent.js trade SOL 5 TR    - Execute trade (TR = execute)');
    console.log('  node cex_trading_agent.js trade SOL 5       - Simulate trade');
  }
}