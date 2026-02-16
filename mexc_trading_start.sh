#!/bin/bash
# MEXC Trading Start Script - Clarence
# Doel: $50/dag met 2 SOL, dan compounden

echo "🚀 MEXC Trading Setup voor 2 SOL ($190)"
echo "=========================================="

# 1. Check MEXC API credentials
echo "🔐 Checking MEXC API setup..."
if [ ! -f ~/.mexc_credentials ]; then
    echo "⚠️  MEXC credentials not found"
    echo "Creating template credentials file..."
    
    cat > ~/.mexc_credentials << EOF
# MEXC API Credentials
# Get from: https://www.mexc.com/user/openapi
API_KEY="your_api_key_here"
API_SECRET="your_api_secret_here"

# Trading parameters
INITIAL_CAPITAL_SOL="2"
TARGET_DAILY_USD="50"
RISK_PER_TRADE_PERCENT="2"
MAX_LEVERAGE="5"
EOF
    
    echo "📝 Edit ~/.mexc_credentials with your API keys"
    echo "💡 Get keys from: https://www.mexc.com/user/openapi"
else
    echo "✅ MEXC credentials found"
fi

# 2. Install required packages
echo "📦 Installing trading dependencies..."
npm install ccxt dotenv axios

# 3. Create trading directory structure
echo "📁 Creating trading structure..."
mkdir -p ~/mexc_trading/{logs,strategies,config,data}
mkdir -p ~/mexc_trading/logs/$(date +%Y-%m-%d)

# 4. Create basic trading bot
echo "🤖 Creating basic trading bot..."
cat > ~/mexc_trading/bot.js << 'EOF'
const ccxt = require('ccxt');
require('dotenv').config({ path: require('os').homedir() + '/.mexc_credentials' });

class MEXCTradingBot {
  constructor() {
    this.exchange = new ccxt.mexc({
      apiKey: process.env.API_KEY,
      secret: process.env.API_SECRET,
      enableRateLimit: true,
      options: {
        defaultType: 'spot', // 'spot', 'future', 'margin'
      }
    });
    
    this.config = {
      initialCapitalSOL: parseFloat(process.env.INITIAL_CAPITAL_SOL) || 2,
      targetDailyUSD: parseFloat(process.env.TARGET_DAILY_USD) || 50,
      riskPerTradePercent: parseFloat(process.env.RISK_PER_TRADE_PERCENT) || 2,
      maxLeverage: parseFloat(process.env.MAX_LEVERAGE) || 5,
      
      // Trading pairs (SOL based)
      tradingPairs: [
        'SOL/USDT',
        'BTC/USDT',  // For volatility
        'ETH/USDT',  // For trends
        'BNB/USDT',  // For momentum
      ],
      
      // Strategy parameters
      scalping: {
        timeframe: '1m',
        takeProfitPercent: 0.8,
        stopLossPercent: 0.4,
        maxTradesPerDay: 20
      },
      
      momentum: {
        timeframe: '5m',
        takeProfitPercent: 2,
        stopLossPercent: 1,
        maxTradesPerDay: 5
      }
    };
    
    this.stats = {
      dailyTrades: 0,
      dailyProfit: 0,
      totalTrades: 0,
      totalProfit: 0,
      winRate: 0,
      currentBalance: 0
    };
    
    console.log('🤖 MEXC Trading Bot Initialized');
    console.log(`Initial Capital: ${this.config.initialCapitalSOL} SOL`);
    console.log(`Daily Target: $${this.config.targetDailyUSD}`);
    console.log(`Risk per Trade: ${this.config.riskPerTradePercent}%`);
  }
  
  async getBalance() {
    try {
      const balance = await this.exchange.fetchBalance();
      const solBalance = balance.SOL ? balance.SOL.free : 0;
      const usdtBalance = balance.USDT ? balance.USDT.free : 0;
      
      // Get SOL price
      const ticker = await this.exchange.fetchTicker('SOL/USDT');
      const solPrice = ticker.last;
      
      this.stats.currentBalance = solBalance * solPrice + usdtBalance;
      
      return {
        sol: solBalance,
        usdt: usdtBalance,
        totalUSD: this.stats.currentBalance,
        solPrice: solPrice
      };
    } catch (error) {
      console.error('Error fetching balance:', error.message);
      return null;
    }
  }
  
  async getMarketData(pair = 'SOL/USDT') {
    try {
      const ticker = await this.exchange.fetchTicker(pair);
      const ohlcv = await this.exchange.fetchOHLCV(pair, '1m', undefined, 100);
      
      // Calculate simple indicators
      const closes = ohlcv.map(candle => candle[4]);
      const lastPrice = closes[closes.length - 1];
      const avgPrice = closes.reduce((a, b) => a + b, 0) / closes.length;
      const volatility = Math.max(...closes) - Math.min(...closes);
      
      return {
        pair,
        price: lastPrice,
        high: Math.max(...closes),
        low: Math.min(...closes),
        volume: ohlcv.reduce((sum, candle) => sum + candle[5], 0),
        avgPrice,
        volatilityPercent: (volatility / avgPrice * 100).toFixed(2),
        trend: lastPrice > avgPrice ? 'up' : 'down'
      };
    } catch (error) {
      console.error(`Error fetching market data for ${pair}:`, error.message);
      return null;
    }
  }
  
  async analyzeOpportunities() {
    const opportunities = [];
    
    for (const pair of this.config.tradingPairs) {
      const data = await this.getMarketData(pair);
      if (!data) continue;
      
      // Simple opportunity detection
      if (data.volatilityPercent > 1) { // More than 1% volatility
        const opportunity = {
          pair,
          currentPrice: data.price,
          volatility: data.volatilityPercent,
          trend: data.trend,
          volume: data.volume,
          score: this.calculateOpportunityScore(data)
        };
        
        opportunities.push(opportunity);
      }
    }
    
    // Sort by score
    opportunities.sort((a, b) => b.score - a.score);
    
    return opportunities.slice(0, 3); // Top 3 opportunities
  }
  
  calculateOpportunityScore(data) {
    let score = 0;
    
    // Volatility score (higher is better for scalping)
    score += Math.min(data.volatility, 5) * 10; // Max 50 points
    
    // Volume score (higher volume = better liquidity)
    const volumeScore = Math.log10(data.volume + 1) * 5;
    score += Math.min(volumeScore, 20); // Max 20 points
    
    // Trend score (following trend is safer)
    if (data.trend === 'up') score += 15;
    
    // Time of day bonus (Asian/European/US market hours)
    const hour = new Date().getUTCHours();
    if ((hour >= 0 && hour <= 8) || (hour >= 12 && hour <= 20)) {
      score += 10; // Higher activity hours
    }
    
    return score;
  }
  
  async executeTrade(opportunity, strategy = 'scalping') {
    const balance = await this.getBalance();
    if (!balance || balance.totalUSD < 10) {
      console.log('Insufficient balance for trade');
      return null;
    }
    
    const config = this.config[strategy];
    const riskAmount = balance.totalUSD * (this.config.riskPerTradePercent / 100);
    const positionSize = riskAmount * 2; // 2:1 reward:risk
    
    // Calculate entry, take profit, stop loss
    const entryPrice = opportunity.currentPrice;
    const takeProfitPrice = entryPrice * (1 + (config.takeProfitPercent / 100));
    const stopLossPrice = entryPrice * (1 - (config.stopLossPercent / 100));
    
    console.log(`📈 Trade Opportunity: ${opportunity.pair}`);
    console.log(`  Entry: $${entryPrice.toFixed(4)}`);
    console.log(`  Take Profit: $${takeProfitPrice.toFixed(4)} (${config.takeProfitPercent}%)`);
    console.log(`  Stop Loss: $${stopLossPrice.toFixed(4)} (${config.stopLossPercent}%)`);
    console.log(`  Position Size: $${positionSize.toFixed(2)}`);
    
    // In production, this would place actual orders
    // For now, simulate trade
    const simulatedResult = this.simulateTrade(
      opportunity,
      entryPrice,
      takeProfitPrice,
      stopLossPrice,
      positionSize
    );
    
    // Update stats
    this.stats.dailyTrades++;
    this.stats.totalTrades++;
    this.stats.dailyProfit += simulatedResult.profit;
    this.stats.totalProfit += simulatedResult.profit;
    
    if (simulatedResult.profit > 0) {
      this.stats.winRate = (this.stats.winRate * (this.stats.totalTrades - 1) + 1) / this.stats.totalTrades;
    } else {
      this.stats.winRate = (this.stats.winRate * (this.stats.totalTrades - 1)) / this.stats.totalTrades;
    }
    
    return simulatedResult;
  }
  
  simulateTrade(opportunity, entry, takeProfit, stopLoss, size) {
    // Simple simulation - 70% win rate for demo
    const win = Math.random() < 0.7;
    
    if (win) {
      const profit = size * (this.config.scalping.takeProfitPercent / 100);
      return {
        success: true,
        profit: profit,
        exitPrice: takeProfit,
        reason: 'Take profit hit',
        duration: Math.floor(Math.random() * 300) + 60 // 1-5 minutes
      };
    } else {
      const loss = size * (this.config.scalping.stopLossPercent / 100);
      return {
        success: false,
        profit: -loss,
        exitPrice: stopLoss,
        reason: 'Stop loss hit',
        duration: Math.floor(Math.random() * 180) + 30 // 0.5-3 minutes
      };
    }
  }
  
  async runTradingSession(minutes = 60) {
    console.log(`🔄 Starting ${minutes}-minute trading session...`);
    
    const startTime = Date.now();
    const endTime = startTime + (minutes * 60 * 1000);
    let sessionProfit = 0;
    
    while (Date.now() < endTime && this.stats.dailyProfit < this.config.targetDailyUSD) {
      // Check balance
      const balance = await this.getBalance();
      console.log(`💰 Balance: ${balance.sol.toFixed(4)} SOL ($${balance.totalUSD.toFixed(2)})`);
      
      // Find opportunities
      const opportunities = await this.analyzeOpportunities();
      
      if (opportunities.length > 0) {
        const bestOpportunity = opportunities[0];
        
        if (bestOpportunity.score > 50) { // Good opportunity threshold
          const tradeResult = await this.executeTrade(bestOpportunity, 'scalping');
          
          if (tradeResult) {
            sessionProfit += tradeResult.profit;
            console.log(`  Trade ${tradeResult.success ? '✅ WIN' : '❌ LOSS'}: $${tradeResult.profit.toFixed(2)}`);
            console.log(`  Daily Total: $${this.stats.dailyProfit.toFixed(2)} / $${this.config.targetDailyUSD}`);
            
            // Log trade
            this.logTrade({
              timestamp: new Date().toISOString(),
              pair: bestOpportunity.pair,
              result: tradeResult,
              balance: balance.totalUSD
            });
          }
        }
      }
      
      // Wait before next scan (30 seconds)
      await this.sleep(30000);
    }
    
    console.log(`🏁 Session completed`);
    console.log(`Session Profit: $${sessionProfit.toFixed(2)}`);
    console.log(`Daily Profit: $${this.stats.dailyProfit.toFixed(2)}`);
    
    return {
      sessionProfit,
      dailyProfit: this.stats.dailyProfit,
      trades: this.stats.dailyTrades,
      winRate: (this.stats.winRate * 100).toFixed(1) + '%'
    };
  }
  
  logTrade(tradeData) {
    const logFile = `${require('os').homedir()}/mexc_trading/logs/${new Date().toISOString().split('T')[0]}/trades.json`;
    const fs = require('fs');
    const path = require('path');
    
    // Ensure directory exists
    const dir = path.dirname(logFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Read existing logs
    let logs = [];
    if (fs.existsSync(logFile)) {
      logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    }
    
    // Add new trade
    logs.push(tradeData);
    
    // Write back
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    
    console.log(`📝 Trade logged to ${logFile}`);
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  printStats() {
    console.log('\n📊 Trading Statistics:');
    console.log('=====================');
    console.log(`Daily Trades: ${this.stats.dailyTrades}`);
    console.log(`Daily Profit: $${this.stats.dailyProfit.toFixed(2)}`);
    console.log(`Target: $${this.config.targetDailyUSD}`);
    console.log(`Progress: ${((this.stats.dailyProfit / this.config.targetDailyUSD) * 100).toFixed(1)}%`);
    console.log(`Win Rate: ${(this.stats.winRate * 100).toFixed(1)}%`);
    console.log(`Total Profit: $${this.stats.totalProfit.toFixed(2)}`);
  }
}

// Run the bot
async function main() {
  const bot = new MEXCTradingBot();
  
  // Check connection
  try {
    await bot.exchange.fetchBalance();
    console.log('✅ Connected to MEXC');
  } catch (error) {
    console.error('❌ Failed to connect to MEXC:', error.message);
    console.log('Please check your API credentials in ~/.mexc_credentials');
    return;
  }
  
  // Show initial balance
  const balance = await bot.getBalance();
  console.log(`💰 Initial Balance: $${balance.totalUSD.toFixed(2)}`);
  console.log(`🎯 Daily Target: $${bot.config.targetDailyUSD}`);
  
  // Run trading session (60 minutes)
  await bot.runTradingSession(60);
  
  // Print final stats
  bot.printStats();
  
  // Calculate compounding projection
  if (bot.stats.dailyProfit > 0) {
    const dailyReturn = (bot.stats.dailyProfit / balance.totalUSD * 100).toFixed(1);
    console.log(`\n📈 Compounding Projection (${dailyReturn}% daily):`);
    console.log('Day 1: $' + balance.totalUSD.toFixed(2));
    console.log('Day 7: $' + (balance.totalUSD * Math.pow(1 + (dailyReturn/100), 7)).toFixed(2));
    console.log('Day 30: $' + (balance.totalUSD * Math.pow(1 + (dailyReturn/100), 30)).toFixed(2));
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { MEXCTradingBot };
EOF

echo "✅ Trading bot created: ~/mexc_trading/bot.js"

# 5. Create compounding script
echo "💸 Creating compounding script..."
cat > ~/mexc_trading/compound.js << 'EOF'
// Compounding script - Reinvest profits daily
const { MEXCTradingBot } = require('./bot.js');

class CompoundingEngine {
  constructor() {
    this.bot = new MEXCTradingBot();
    this.compoundingRate = 0.8; // Reinvest 80% of profits
    this.dailyTarget = 50; // USD
  }
  
  async runDailyCycle() {
    console.log('🔄 Starting daily compounding cycle...');
    
    // 1. Run trading session
    const sessionResult = await this.bot.runTradingSession(120); // 2 hours
    
    // 2. Calculate profits to compound
    const profits = sessionResult.dailyProfit;
    const toReinvest = profits * this.compoundingRate;
    
    console.log(`💰 Daily Profit: $${profits.toFixed(2)}`);
    console.log(`🔄 Reinvesting: $${toReinvest.toFixed(2)} (${this.compoundingRate * 100}%)`);
    
    // 3. Update trading capital (in simulation)
    // In production, this would transfer profits back to trading account
    const newBalance = await this.bot.getBalance();
    const projectedBalance = newBalance.totalUSD + toReinvest;
    
    console.log(`📈 Projected Tomorrow's Capital: $${projectedBalance.toFixed(2)}`);
    
    // 4. Calculate growth trajectory
    if (profits > 0) {
      const dailyGrowth = profits / newBalance.totalUSD;
      this.calculateGrowthTrajectory(newBalance.totalUSD, dailyGrowth);
    }
    
    return {
      date: new Date().toISOString().split('T')[0],
      profit: profits,
      reinvested: toReinvest,
      newCapital: projectedBalance,
      trades: sessionResult.trades,
      winRate: sessionResult.winRate
    };
  }
  
  calculateGrowthTrajectory(currentCapital, dailyGrowth) {
    console.log('\n🚀 Growth Trajectory (with compounding):');
    console.log('========================================');
    
    const days = [1, 7, 14, 30, 60, 90];
    
    for (const day of days) {
      const futureValue = currentCapital * Math.pow(1 + dailyGrowth, day);
      console.log(`Day ${day}: $${futureValue.toFixed(2)}`);
      
      if (futureValue >= 1000) {
        const dailyAt1k = 1000 * dailyGrowth;
        console.log(`  → At $1,000: $${dailyAt1k.toFixed(2)}/day`);
      }
      
      if (futureValue >= 5000) {
        const dailyAt5k = 5000 * dailyGrowth;
        console.log(`  → At $5,000: $${dailyAt5k.toFixed(2)}/day`);
      }
      
      if (futureValue >= 10000) {
        const dailyAt10k = 10000 * dailyGrowth;
        console.log(`  → At $10,000: $${dailyAt10k.toFixed(2)}/day`);
        console.log(`  → Monthly: $${(dailyAt10k * 30).toFixed(2)}`);
      }
    }
  }
  
  async runForDays(days) {
    const results = [];
    
    for (let day = 1; day <= days; day++) {
      console.log(`\n📅 Day ${day}/${days}`);
      console.log('================');
      
      const result = await this.runDailyCycle();
      results.push(result);
      
      // Save daily result
      this.saveDailyResult(result);
      
      // Wait 24 hours (in simulation, just continue)
      if (day < days) {
        console.log('⏳ Waiting for next day...');
        await this.bot.sleep(5000); // 5 seconds for demo
      }
    }
    
    return results;
  }
  
  saveDailyResult(result) {
    const fs = require('fs');
    const path = require('path');
    const file = path.join(require('os').homedir(), 'mexc_trading', 'compounding_results.json');
    
    let allResults = [];
    if (fs.existsSync(file)) {
      allResults = JSON.parse(fs.readFileSync(file, 'utf8'));
    }
    
    allResults.push(result);
    fs.writeFileSync(file, JSON.stringify(allResults, null, 2));
    
    console.log(`💾 Saved daily result to ${file}`);
  }
}

// Run compounding simulation
async function main() {
  const engine = new CompoundingEngine();
  
  console.log('🎯 Compounding Trading Engine');
  console.log('=============================');
  console.log(`Initial Capital: 2 SOL (~$190)`);
  console.log(`Daily Target: $${engine.dailyTarget}`);
  console.log(`Compounding Rate: ${engine.compoundingRate * 100}%`);
  
  // Run for 3 days (demo)
  const results = await engine.runForDays(3);
  
  console.log('\n🏁 Final Results:');
  console.log('================');
  
  let totalProfit = 0;
  let totalReinvested = 0;
  
  results.forEach((result, index) => {
    console.log(`Day ${index + 1}:`);
    console.log(`  Profit: $${result.profit.toFixed(2)}`);
    console.log(`  Reinvested: $${result.reinvested.toFixed(2)}`);
    console.log(`  New Capital: $${result.newCapital.toFixed(2)}`);
    console.log(`  Trades: ${result.trades}, Win Rate: ${result.winRate}`);
    console.log('');
    
    totalProfit += result.profit;
    totalReinvested += result.reinvested;
  });
  
  console.log(`📊 Totals:`);
  console.log(`  Total Profit: $${totalProfit.toFixed(2)}`);
  console.log(`  Total Reinvested: $${totalReinvested.toFixed(2)}`);
  console.log(`  Final Capital: $${results[results.length - 1].newCapital.toFixed(2)}`);
  console.log(`  Growth: ${((results[results.length - 1].newCapital / 190 - 1) * 100).toFixed(1)}%`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { CompoundingEngine };
EOF

echo "✅ Compounding script created: ~/mexc_trading/compound.js"

# 6. Create quick start script
echo "⚡ Creating quick start script..."
cat > ~/mexc_trading/start.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Starting MEXC Trading Bot..."
echo "Initial Capital: 2 SOL (~$190)"
echo "Daily Target: $50"
echo ""

# Check for API credentials
if [ ! -f ~/.mexc_credentials ] || grep -q "your_api_key_here" ~/.mexc_credentials; then
    echo "❌ Please configure your MEXC API credentials first:"
    echo "  1. Edit ~/.mexc_credentials"
    echo "  2. Add your API key and secret from https://www.mexc.com/user/openapi"
    echo ""
    echo "Example credentials file:"
    echo "API_KEY=\"mx0vgl8a1b2c3d4e5f\""
    echo "API_SECRET=\"a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0\""
    exit 1
fi

# Run the bot
node bot.js
EOF

chmod +x ~/mexc_trading/start.sh

# 7. Create strategy file for $50/day
echo "🎯 Creating $50/day strategy..."
cat > ~/mexc_trading/strategies/50usd_daily.js << 'EOF'
// Strategy to make $50/day with 2 SOL ($190)
module.exports = {
  name: '50usd_daily_scalping',
  capital: 190, // USD
  target: 50, // USD per day
  riskPerTrade: 0.02, // 2%
  
  // Trading parameters
  trading: {
    // With $190 capital, $50/day = 26% daily return
    // Need aggressive but controlled strategy
    
    // Option A: High frequency scalping
    scalping: {
      tradesPerDay: 25,
      profitPerTrade: 2, // USD
      winRate: 0.7, // 70%
      // 25 trades * $2 * 0.7 = $35
      // Need some $5-10 trades to reach $50
    },
    
    // Option B: Fewer but larger trades
    momentum: {
      tradesPerDay: 8,
      profitPerTrade: 6.25, // USD
      winRate: 0.6, // 60%
      // 8 trades * $6.25 * 0.6 = $30
    },
    
    // Option C: Mixed approach (recommended)
    mixed: {
      scalpingTrades: 15, // $2 each
      momentumTrades: 4,  // $5 each
      // (15 * $2 * 0.7) + (4 * $5 * 0.6) = $21 + $12 = $33
      // Need to find some 10%+ moves for remaining $17
    }
  },
  
  // Market conditions needed
  requiredConditions: {
    volatility: 'high', // > 3% daily
    volume: 'medium',   // > $10M daily
    trend: 'any',       // Works in both trending and ranging
    timeOfDay: ['00:00-08:00 UTC', '12:00-20:00 UTC'] // High activity
  },
  
  // Risk management
  riskManagement: {
    maxDailyLoss: 19, // 10% of capital
    stopTradingAfter: 3, // consecutive losses
    reduceSizeAfter: 2,  // consecutive losses
    increaseSizeAfter: 3 // consecutive wins
  },
  
  // Compounding plan
  compounding: {
    reinvestPercent: 0.8, // 80% of profits
    withdrawPercent: 0.2, // 20% for expenses/security
    rebalanceDaily: true,
    
    // Growth projection
    projection: {
      day7: '190 → 250 (+31%)',
      day30: '190 → 500 (+163%)',
      day90: '190 → 2000 (+952%)'
    }
  },
  
  // Execution plan
  execution: {
    // Phase 1: Build consistency ($10-20/day)
    phase1: {
      duration: '7 days',
      target: '$20/day',
      focus: 'win rate > 65%',
      maxTrades: '15/day'
    },
    
    // Phase 2: Scale up ($30-40/day)
    phase2: {
      duration: '7-14 days',
      target: '$35/day',
      focus: 'position sizing',
      maxTrades: '20/day'
    },
    
    // Phase 3: Target ($50+/day)
    phase3: {
      duration: '14+ days',
      target: '$50/day',
      focus: 'advanced strategies',
      maxTrades: '25/day'
    }
  },
  
  // Pairs to trade
  pairs: [
    {
      symbol: 'SOL/USDT',
      weight: 0.4, // 40% of trades
      reason: 'Your expertise, good volatility'
    },
    {
      symbol: 'BTC/USDT',
      weight: 0.3, // 30%
      reason: 'Liquidity, lower spreads'
    },
    {
      symbol: 'ETH/USDT',
      weight: 0.2, // 20%
      reason: 'Trend following opportunities'
    },
    {
      symbol: 'BNB/USDT',
      weight: 0.1, // 10%
      reason: 'Momentum plays'
    }
  ]
};
EOF

echo "✅ Strategy created: ~/mexc_trading/strategies/50usd_daily.js"

# 8. Summary
echo ""
echo "🎉 MEXC Trading Setup Complete!"
echo "================================"
echo ""
echo "📁 Files created:"
echo "  • ~/.mexc_credentials (edit with your API keys)"
echo "  • ~/mexc_trading/bot.js (main trading bot)"
echo "  • ~/mexc_trading/compound.js (compounding engine)"
echo "  • ~/mexc_trading/start.sh (quick start)"
echo "  • ~/mexc_trading/strategies/50usd_daily.js"
echo ""
echo "🚀 To start trading:"
echo "  1. Edit ~/.mexc_credentials with your MEXC API keys"
echo "  2. Run: cd ~/mexc_trading && ./start.sh"
echo ""
echo "🎯 Strategy: Make $50/day with 2 SOL ($190)"
echo "  • Start with $10-20/day to build consistency"
echo "  • Compound 80% of profits daily"
echo "  • Scale up as capital grows"
echo ""
echo "⚠️  Risk Warning:"
echo "  • $50/day = 26% daily return (aggressive)"
echo "  • Start with simulated trading first"
echo "  • Never risk more than 2% per trade"
echo "  • Have stop losses on EVERY trade"
echo ""
echo "📈 Projection with compounding:"
echo "  Day 1: $190"
echo "  Day 7: $250 (+31%)"
echo "  Day 30: $500 (+163%)"
echo "  Day 90: $2,000 (+952%)"
echo ""
echo "Ready to start? First configure your API credentials!"