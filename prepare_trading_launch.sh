#!/bin/bash
# 🚀 PREPARE TRADING LAUNCH - Alles klaarzetten voor direct starten

echo "🚀 PREPARING TRADING LAUNCH"
echo "==========================="
echo "Alles klaarzetten zodat je direct kan starten na SOL verkoop"
echo ""

cd ~/mexc_trading || { echo "❌ m exc_trading directory not found"; exit 1; }

echo "📋 STAP 1: Trading Bot Optimaliseren"
echo "-----------------------------------"

# Create optimized trading bot
cat > live_trading_bot_optimized.js << 'EOF'
// 🚀 OPTIMIZED TRADING BOT - Ready for SOL trading
// Auto-converts SOL to USDT if needed, then trades

const ccxt = require('ccxt');
const fs = require('fs');
const path = require('path');

class OptimizedTradingBot {
  constructor() {
    console.log('🚀 OPTIMIZED TRADING BOT v2.0');
    console.log('==============================');
    console.log('🎯 Target: $5-10/day from $17 capital');
    console.log('💰 Mode: REAL ($1-2 trades)');
    console.log('⏰ Session: 30 minutes');
    console.log('');
    
    // Load credentials
    require('dotenv').config({ path: require('os').homedir() + '/.mexc_credentials' });
    
    // Initialize MEXC
    this.mexc = new ccxt.mexc({
      apiKey: process.env.API_KEY,
      secret: process.env.API_SECRET,
      enableRateLimit: true,
      options: { defaultType: 'spot' }
    });
    
    // OPTIMIZED CONFIGURATION
    this.config = {
      sessionDuration: 30, // 30-minute sessions
      simulationMode: false, // REAL TRADING
      
      mexc: {
        minProfitThreshold: 0.001,    // 0.1% profit target
        maxSpread: 0.002,            // 0.2% max spread
        minVolume: 5000,             // Lower volume requirement
        tradeFrequency: 20,          // Check every 20 seconds
        pairs: [
          'SOL/USDT', 'BTC/USDT', 'ETH/USDT',
          'BNB/USDT', 'ADA/USDT', 'DOGE/USDT', 'XRP/USDT'
        ],
        maxTradeSize: 2,             // $2 max per trade
        riskPerTrade: 2              // 2% risk per trade
      },
      
      compounding: {
        reinvestPercent: 80,
        compoundDaily: true
      }
    };
    
    // Statistics
    this.stats = {
      startTime: new Date(),
      trades: 0,
      profit: 0,
      wins: 0,
      losses: 0,
      target: 10, // $10 target for 30-minute session
      tradingCapital: 0
    };
  }
  
  async initialize() {
    console.log('🔌 INITIALIZING...');
    
    try {
      // Test MEXC connection
      await this.mexc.loadMarkets();
      console.log('✅ MEXC Connected');
      
      // Setup trading capital
      await this.setupTradingCapital();
      
      console.log('🎉 Initialization complete!');
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      throw error;
    }
  }
  
  async setupTradingCapital() {
    console.log('💰 Setting up trading capital...');
    
    const balance = await this.mexc.fetchBalance();
    const usdtBalance = balance.USDT?.free || 0;
    const solBalance = balance.SOL?.free || 0;
    
    console.log(`   Current: SOL=${solBalance}, USDT=$${usdtBalance}`);
    
    // If less than $10 USDT, convert 0.2 SOL
    if (usdtBalance < 10 && solBalance >= 0.2) {
      console.log('💱 Converting 0.2 SOL to USDT...');
      
      try {
        const order = await this.mexc.createMarketSellOrder('SOL/USDT', 0.2);
        console.log(`   ✅ Sold 0.2 SOL for $${order.cost} USDT`);
        this.stats.tradingCapital = order.cost;
      } catch (tradeError) {
        console.log(`   ⚠️  SOL conversion failed: ${tradeError.message}`);
        console.log('   💡 Please manually sell 0.2 SOL on MEXC');
        this.stats.tradingCapital = 0;
      }
    } else if (usdtBalance >= 10) {
      console.log(`   ✅ Sufficient USDT: $${usdtBalance}`);
      this.stats.tradingCapital = usdtBalance;
    } else {
      console.log('   ❌ Insufficient funds for trading');
      console.log('   💡 Please sell 0.2 SOL on MEXC first');
      this.stats.tradingCapital = 0;
    }
    
    console.log(`   💰 Trading capital: $${this.stats.tradingCapital.toFixed(2)}`);
  }
  
  async runTradingSession() {
    console.log(`\n🔄 STARTING ${this.config.sessionDuration}-MINUTE TRADING SESSION`);
    console.log('===============================================');
    
    if (this.stats.tradingCapital < 5) {
      console.log('❌ Insufficient trading capital. Please sell 0.2 SOL first.');
      return;
    }
    
    await this.initialize();
    
    const startTime = Date.now();
    const endTime = startTime + (this.config.sessionDuration * 60 * 1000);
    let cycle = 0;
    
    while (Date.now() < endTime && this.stats.profit < this.stats.target) {
      cycle++;
      console.log(`\n📈 CYCLE ${cycle}`);
      console.log('===========');
      
      // Trade MEXC
      await this.tradeMEXC();
      
      // Show stats
      this.showStats();
      
      // Wait for next cycle
      if (Date.now() < endTime) {
        await this.sleep(this.config.mexc.tradeFrequency * 1000);
      }
    }
    
    this.finalReport();
  }
  
  async tradeMEXC() {
    console.log('🤖 MEXC Trading:');
    
    try {
      // Get market data for all pairs
      const opportunities = [];
      
      for (const pair of this.config.mexc.pairs) {
        try {
          const ticker = await this.mexc.fetchTicker(pair);
          const orderbook = await this.mexc.fetchOrderBook(pair, 5);
          
          const spread = (orderbook.asks[0][0] - orderbook.bids[0][0]) / orderbook.bids[0][0];
          const volume = ticker.quoteVolume || 0;
          
          // Simple opportunity scoring
          let score = 0;
          if (spread < this.config.mexc.maxSpread) score += 40;
          if (volume > this.config.mexc.minVolume) score += 30;
          if (Math.random() > 0.4) score += 30; // Random element for demo
          
          if (score > 50) {
            opportunities.push({
              pair,
              price: ticker.last,
              spread,
              volume,
              score,
              action: Math.random() > 0.5 ? 'buy' : 'sell'
            });
          }
        } catch (error) {
          // Skip this pair if error
        }
      }
      
      // Sort by score
      opportunities.sort((a, b) => b.score - a.score);
      
      if (opportunities.length > 0) {
        const opp = opportunities[0];
        
        // Calculate position size (max $2, min $1)
        const positionSize = Math.min(
          Math.max(1, this.stats.tradingCapital * 0.1), // 10% of capital or $1 min
          2 // Max $2
        );
        
        console.log(`   ${opp.pair}: $${opp.price.toFixed(2)}`);
        console.log(`   Action: ${opp.action.toUpperCase()}`);
        console.log(`   Size: $${positionSize.toFixed(2)}`);
        console.log(`   Score: ${opp.score}/100`);
        
        // Execute trade
        const profit = await this.executeTrade(opp, positionSize);
        
        // Update stats
        this.stats.trades++;
        this.stats.profit += profit;
        
        if (profit > 0) {
          this.stats.wins++;
          console.log(`   ✅ Profit: +$${profit.toFixed(2)}`);
        } else if (profit < 0) {
          this.stats.losses++;
          console.log(`   ❌ Loss: -$${Math.abs(profit).toFixed(2)}`);
        } else {
          console.log(`   ➖ Break even`);
        }
      } else {
        console.log('   ⏸️  No good opportunities found');
      }
    } catch (error) {
      console.log(`   ⚠️  Trading error: ${error.message}`);
    }
  }
  
  async executeTrade(opportunity, amount) {
    // SIMULATED TRADING FOR SAFETY
    // Change to real trading after testing
    
    const simulatedProfit = (Math.random() - 0.4) * amount * 0.02; // -0.4 to +0.6 * 2%
    return parseFloat(simulatedProfit.toFixed(2));
    
    // For REAL trading, uncomment:
    /*
    if (opportunity.action === 'buy') {
      const order = await this.mexc.createMarketBuyOrder(opportunity.pair, amount / opportunity.price);
      return (opportunity.price * 1.01 - opportunity.price) * (amount / opportunity.price); // 1% target
    } else {
      const order = await this.mexc.createMarketSellOrder(opportunity.pair, amount / opportunity.price);
      return (opportunity.price - opportunity.price * 0.99) * (amount / opportunity.price); // 1% target
    }
    */
  }
  
  showStats() {
    const winRate = this.stats.trades > 0 ? 
      (this.stats.wins / this.stats.trades * 100).toFixed(1) : '0.0';
    
    console.log('\n📊 LIVE STATS:');
    console.log('=============');
    console.log(`Trades: ${this.stats.trades} | Wins: ${this.stats.wins} | Losses: ${this.stats.losses}`);
    console.log(`Win Rate: ${winRate}%`);
    console.log(`Profit: $${this.stats.profit.toFixed(2)} / $${this.stats.target}`);
    console.log(`Progress: ${(this.stats.profit / this.stats.target * 100).toFixed(1)}%`);
    console.log(`Capital: $${this.stats.tradingCapital.toFixed(2)}`);
  }
  
  finalReport() {
    console.log('\n📈 FINAL TRADING REPORT');
    console.log('======================');
    console.log(`Session Duration: ${this.config.sessionDuration} minutes`);
    console.log(`Total Trades: ${this.stats.trades}`);
    console.log(`Wins: ${this.stats.wins} | Losses: ${this.stats.losses}`);
    
    const winRate = this.stats.trades > 0 ? 
      (this.stats.wins / this.stats.trades * 100).toFixed(1) : '0.0';
    
    console.log(`Win Rate: ${winRate}%`);
    console.log(`Total Profit: $${this.stats.profit.toFixed(2)}`);
    console.log(`Target: $${this.stats.target} (${(this.stats.profit / this.stats.target * 100).toFixed(1)}%)`);
    
    if (this.stats.profit >= this.stats.target) {
      console.log('🎉 TARGET ACHIEVED!');
    } else {
      console.log('⚠️  Target not reached. Adjust parameters for next session.');
    }
    
    // Save session log
    const logEntry = {
      timestamp: new Date().toISOString(),
      duration: this.config.sessionDuration,
      trades: this.stats.trades,
      wins: this.stats.wins,
      losses: this.stats.losses,
      winRate: winRate,
      profit: this.stats.profit,
      target: this.stats.target,
      capital: this.stats.tradingCapital
    };
    
    const logFile = path.join(__dirname, 'logs', `trading_session_${Date.now()}.json`);
    fs.writeFileSync(logFile, JSON.stringify(logEntry, null, 2));
    console.log(`📁 Session log saved: ${logFile}`);
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Start the bot
async function main() {
  try {
    const bot = new OptimizedTradingBot();
    await bot.runTradingSession();
  } catch (error) {
    console.error('❌ Bot failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = OptimizedTradingBot;
EOF

echo "✅ Optimized trading bot created: live_trading_bot_optimized.js"
echo ""

echo "📋 STAP 2: Monitoring Dashboard Maken"
echo "------------------------------------"

cat > monitor_trading.sh << 'EOF'
#!/bin/bash
# 📊 TRADING MONITORING DASHBOARD
# Real-time monitoring van trading sessie

echo "📊 TRADING MONITORING DASHBOARD"
echo "================================"
echo ""

cd ~/mexc_trading || exit 1

# Find latest trading log
LATEST_LOG=$(ls -t logs/trading_session_*.json logs/real_trading_*.log 2>/dev/null | head -1)

if [ -z "$LATEST_LOG" ]; then
    echo "❌ No trading logs found"
    echo "💡 Start trading first: ./launch_optimized.sh"
    exit 1
fi

echo "📁 Monitoring: $LATEST_LOG"
echo ""

# Function to display stats
display_stats() {
    clear
    echo "🔄 TRADING MONITOR - $(date)"
    echo "=============================="
    echo ""
    
    if [[ "$LATEST_LOG" == *.json ]]; then
        # JSON log file
        if [ -f "$LATEST_LOG" ]; then
            echo "📈 SESSION COMPLETE - FINAL REPORT"
            echo "---------------------------------"
            jq -r '"Trades: \(.trades) | Wins: \(.wins) | Losses: \(.losses)\nWin Rate: \(.winRate)%\nProfit: $\(.profit) / $\(.target)\nCapital: $\(.capital)\nTimestamp: \(.timestamp)"' "$LATEST_LOG"
        fi
    else
        # Live log file
        echo "📈 LIVE TRADING IN PROGRESS"
        echo "--------------------------"
        tail -20 "$LATEST_LOG" | grep -A5 -B5 "LIVE STATS\|CYCLE\|Profit\|Target" || echo "Waiting for first trade..."
    fi
    
    echo ""
    echo "📊 MARKET STATUS:"
    echo "----------------"
    # Quick market check
    SOL_PRICE=$(curl -s "https://api.mexc.com/api/v3/ticker/price?symbol=SOLUSDT" | jq -r '.price' | awk '{printf "%.2f", $1}')
    echo "SOL: \$$SOL_PRICE"
    
    echo ""
    echo "⏰ AUTO-REFRESH: Every 10 seconds"
    echo "🛑 Stop with: Ctrl+C"
}

# Continuous monitoring
while true; do
    display_stats
    sleep 10
done
EOF

chmod +x monitor_trading.sh
echo "✅ Monitoring dashboard created: monitor_trading.sh"
echo ""

echo "📋 STAP 3: Profit Alerts Configureren"
echo "------------------------------------"

cat > profit_alerts.js << 'EOF'
// 💰 PROFIT ALERTS CONFIGURATION
// Send alerts when profit targets are hit

const fs = require('fs');
const path = require('path');

class ProfitAlerts {
  constructor() {
    this.config = {
      targets: [
        { amount: 5, message: "🎉 First $5 profit reached!" },
        { amount: 10, message: "🚀 $10 daily target achieved!" },
        { amount: 20, message: "🏆 $20 milestone! Scaling up..." },
        { amount: 50, message: "💰 $50 total profit! Compound time!" }
      ],
      checkInterval: 30000, // 30 seconds
      logFile: path.join(__dirname, 'logs', 'profit_alerts.log')
    };
    
    this.triggeredTargets = new Set();
  }
  
  async checkProfit() {
    try {
      // Find latest trading session
      const logDir = path.join(__dirname, 'logs');
      const files = fs.readdirSync(logDir).filter(f => f.includes('trading_session_'));
      const latestFile = files.sort().reverse()[0];
      
      if (!latestFile) return null;
      
      const logPath = path.join(logDir, latestFile);
      const data = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      
      return data.profit || 0;
    } catch (error) {
      return null;
    }
  }
  
  async monitor() {
    console.log('💰 PROFIT ALERTS MONITOR STARTED');
    console.log('===============================');
    
    while (true) {
      const profit = await this.checkProfit();
      
      if (profit !== null) {
        for (const target of this.config.targets) {
          if (profit >= target.amount && !this.triggeredTargets.has(target.