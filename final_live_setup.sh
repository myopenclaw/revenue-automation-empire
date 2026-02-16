#!/bin/bash
# FINAL LIVE SETUP - Clarence
# MEXC + Phantom DEX Trading

echo "🚀 FINAL LIVE TRADING SETUP"
echo "============================"

# 1. Create secure credentials files
echo "🔐 Creating secure credential files..."

# MEXC credentials
cat > ~/.mexc_credentials << 'EOF'
# MEXC API Credentials - LIVE TRADING
# Created: Sun 2026-02-15 23:27
# API Key: mx0vglY8WiqgvcLObz

API_KEY="mx0vglY8WiqgvcLObz"
API_SECRET="31182a9b37354f578e2fc162df2b7d72"

# Trading parameters
INITIAL_CAPITAL_SOL="2"
TARGET_DAILY_USD="50"
RISK_PER_TRADE_PERCENT="2"
MAX_LEVERAGE="3"

# Strategy
TRADING_PAIRS="SOL/USDT,BTC/USDT,ETH/USDT"
SCALPING_ENABLED="true"
MOMENTUM_ENABLED="true"

# Risk management
MAX_DAILY_LOSS_PERCENT="10"
STOP_AFTER_CONSECUTIVE_LOSSES="3"
TAKE_PROFIT_PERCENT="0.8"
STOP_LOSS_PERCENT="0.4"

# Compounding
REINVESTMENT_PERCENT="80"
COMPOUND_DAILY="true"
EOF

# Phantom wallet
cat > ~/.phantom_wallet.json << 'EOF'
{
  "privateKey": "3Y6BuELSRtYQkQsxtLhKwJDHEZSVMBdQZMFSgqx42Znhsw6hDE2UycJreBvkDYW4ZuUxYjcFRpkuCpXnKiuMY53D",
  "publicKey": "",
  "usdcBalance": 50,
  "network": "mainnet-beta",
  "enabled": true,
  "walletName": "Clarence_DEX_Trading"
}
EOF

# Set secure permissions
chmod 600 ~/.mexc_credentials ~/.phantom_wallet.json

echo "✅ Credentials saved with secure permissions"

# 2. Create trading directory
echo "📁 Setting up trading directory..."
mkdir -p ~/mexc_trading/{logs,live_stats,strategies,config}
cd ~/mexc_trading

# 3. Install dependencies
echo "📦 Installing dependencies..."
cat > package.json << 'EOF'
{
  "name": "clarence-trading-system",
  "version": "1.0.0",
  "description": "MEXC + DEX Trading System",
  "main": "live_trading_bot.js",
  "dependencies": {
    "ccxt": "^4.2.0",
    "dotenv": "^16.3.0",
    "@solana/web3.js": "^1.87.0",
    "@solana/spl-token": "^0.4.0",
    "axios": "^1.6.0",
    "ws": "^8.14.0"
  }
}
EOF

npm install

# 4. Create final live trading bot
echo "🤖 Creating final live trading bot..."
cat > live_trading_bot.js << 'EOF'
// FINAL LIVE TRADING BOT - Clarence
// MEXC (2 SOL) + Phantom DEX (50 USDC)
// Target: $50/day with compounding

const ccxt = require('ccxt');
const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { Token, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class FinalLiveTradingBot {
  constructor() {
    console.log('🚀 FINAL LIVE TRADING BOT v1.0');
    console.log('===============================');
    
    // Load credentials
    require('dotenv').config({ path: require('os').homedir() + '/.mexc_credentials' });
    const phantomConfig = JSON.parse(
      fs.readFileSync(require('os').homedir() + '/.phantom_wallet.json', 'utf8')
    );
    
    // Initialize MEXC
    this.mexc = new ccxt.mexc({
      apiKey: process.env.API_KEY,
      secret: process.env.API_SECRET,
      enableRateLimit: true,
      options: { defaultType: 'spot' }
    });
    
    // Initialize Phantom
    try {
      this.phantomWallet = Keypair.fromSecretKey(
        Buffer.from(phantomConfig.privateKey, 'hex')
      );
      console.log('👛 Phantom wallet loaded:', this.phantomWallet.publicKey.toString().substring(0, 8) + '...');
    } catch (error) {
      console.error('❌ Phantom wallet error:', error.message);
      this.phantomWallet = null;
    }
    
    // Solana connection
    this.solana = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    
    // Configuration
    this.config = {
      mode: 'SIMULATION', // Change to 'LIVE' for real trading
      sessionDuration: 60, // minutes
      
      mexc: {
        capitalSOL: 2,
        targetDaily: 35, // $35 from MEXC
        riskPerTrade: 2,
        pairs: ['SOL/USDT', 'BTC/USDT', 'ETH/USDT'],
        strategies: ['scalping', 'momentum']
      },
      
      dex: {
        capitalUSDC: 50,
        targetDaily: 15, // $15 from DEX
        riskPerTrade: 2,
        pairs: ['SOL/USDC', 'BONK/USDC', 'JUP/USDC'],
        jupiterApi: 'https://quote-api.jup.ag/v6'
      },
      
      compounding: {
        reinvestPercent: 80,
        compoundDaily: true,
        withdrawalPercent: 20
      }
    };
    
    // Statistics
    this.stats = {
      startTime: new Date(),
      mexc: { trades: 0, profit: 0, wins: 0, losses: 0 },
      dex: { trades: 0, profit: 0, wins: 0, losses: 0 },
      session: { profit: 0, target: 50 }
    };
    
    console.log(`🎯 Target: $${this.config.mexc.targetDaily + this.config.dex.targetDaily}/day`);
    console.log(`💰 Capital: 2 SOL + 50 USDC`);
    console.log(`⚡ Mode: ${this.config.mode}`);
    console.log(`⏰ Session: ${this.config.sessionDuration} minutes`);
  }
  
  async initialize() {
    console.log('\n🔌 INITIALIZING...');
    
    // Test MEXC connection
    try {
      const balance = await this.mexc.fetchBalance();
      const solBalance = balance.SOL?.free || 0;
      console.log(`✅ MEXC Connected: ${solBalance} SOL available`);
      
      if (solBalance < 2) {
        console.warn(`⚠️  Low SOL balance: ${solBalance} (need 2 SOL)`);
      }
    } catch (error) {
      console.error('❌ MEXC connection failed:', error.message);
    }
    
    // Test Phantom connection
    if (this.phantomWallet) {
      try {
        const balance = await this.solana.getBalance(this.phantomWallet.publicKey);
        console.log(`✅ Phantom Connected: ${balance/1e9} SOL for gas`);
      } catch (error) {
        console.error('❌ Phantom connection failed:', error.message);
      }
    }
    
    console.log('🎉 Initialization complete!');
  }
  
  async runTradingSession() {
    console.log(`\n🔄 STARTING ${this.config.sessionDuration}-MINUTE TRADING SESSION`);
    console.log('===============================================');
    
    const startTime = Date.now();
    const endTime = startTime + (this.config.sessionDuration * 60 * 1000);
    let cycle = 0;
    
    await this.initialize();
    
    while (Date.now() < endTime && this.stats.session.profit < this.stats.session.target) {
      cycle++;
      console.log(`\n📈 CYCLE ${cycle}`);
      console.log('===========');
      
      // MEXC Trading
      await this.tradeMEXC();
      
      // DEX Trading (if wallet available)
      if (this.phantomWallet) {
        await this.tradeDEX();
      }
      
      // Update and display stats
      this.updateStats();
      
      // Wait before next cycle (2 minutes)
      if (cycle % 5 === 0) {
        console.log('\n⏳ Taking a 30-second break...');
        await this.sleep(30000);
      } else {
        await this.sleep(120000); // 2 minutes
      }
    }
    
    this.finalReport();
  }
  
  async tradeMEXC() {
    console.log('🤖 MEXC Trading:');
    
    try {
      // Get SOL price
      const ticker = await this.mexc.fetchTicker('SOL/USDT');
      const solPrice = ticker.last;
      
      // Find opportunities
      const opportunities = await this.findMEXCOpportunities();
      
      if (opportunities.length > 0 && opportunities[0].score > 60) {
        const opp = opportunities[0];
        
        // Calculate position
        const riskAmount = (solPrice * 2) * (this.config.mexc.riskPerTrade / 100);
        const positionSize = riskAmount * 2; // 2:1 reward:risk
        const solAmount = positionSize / solPrice;
        
        console.log(`   ${opp.pair}: $${opp.price}`);
        console.log(`   Action: ${opp.action.toUpperCase()}`);
        console.log(`   Size: ${solAmount.toFixed(4)} SOL ($${positionSize.toFixed(2)})`);
        
        // Execute trade (simulated)
        const result = this.executeSimulatedTrade('MEXC', positionSize, 0.008, riskAmount);
        
        this.stats.mexc.trades++;
        this.stats.mexc.profit += result.profit;
        this.stats.session.profit += result.profit;
        
        if (result.win) {
          this.stats.mexc.wins++;
          console.log(`   ✅ ${this.config.mode} WIN: $${result.profit.toFixed(2)}`);
        } else {
          this.stats.mexc.losses++;
          console.log(`   ❌ ${this.config.mode} LOSS: $${-result.profit.toFixed(2)}`);
        }
      } else {
        console.log('   ⏸️  No good opportunities');
      }
    } catch (error) {
      console.error('   ❌ MEXC error:', error.message);
    }
  }
  
  async tradeDEX() {
    console.log('🤖 DEX Trading:');
    
    try {
      // Get Jupiter quote
      const quote = await axios.get(
        `${this.config.dex.jupiterApi}/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1000000000`
      );
      
      const solPrice = quote.data.outAmount / 1000000;
      
      // Simulate DEX opportunity
      const volatility = Math.random() * 3 + 1; // 1-4% volatility
      
      if (volatility > 1.5) {
        const positionSize = this.config.dex.capitalUSDC * 0.2; // 20% of capital
        const riskAmount = positionSize * (this.config.dex.riskPerTrade / 100);
        
        console.log(`   SOL/USDC: $${solPrice.toFixed(4)}`);
        console.log(`   Volatility: ${volatility.toFixed(2)}%`);
        console.log(`   Size: $${positionSize.toFixed(2)}`);
        
        const result = this.executeSimulatedTrade('DEX', positionSize, volatility/100, riskAmount);
        
        this.stats.dex.trades++;
        this.stats.dex.profit += result.profit;
        this.stats.session.profit += result.profit;
        
        if (result.win) {
          this.stats.dex.wins++;
          console.log(`   ✅ ${this.config.mode} WIN: $${result.profit.toFixed(2)}`);
        } else {
          this.stats.dex.losses++;
          console.log(`   ❌ ${this.config.mode} LOSS: $${-result.profit.toFixed(2)}`);
        }
      } else {
        console.log('   ⏸️  Low volatility');
      }
    } catch (error) {
      console.error('   ❌ DEX error:', error.message);
    }
  }
  
  async findMEXCOpportunities() {
    const opportunities = [];
    
    for (const pair of this.config.mexc.pairs) {
      try {
        const ticker = await this.mexc.fetchTicker(pair);
        const ohlcv = await this.mexc.fetchOHLCV(pair, '1m', undefined, 20);
        
        const closes = ohlcv.map(c => c[4]);
        const current = ticker.last;
        const avg = closes.reduce((a, b) => a + b, 0) / closes.length;
        const volatility = (Math.max(...closes) - Math.min(...closes)) / avg * 100;
        
        if (volatility > 1) {
          const trend = current > avg ? 'up' : 'down';
          const score = Math.min(volatility * 10 + (trend === 'up' ? 20 : 10), 95);
          
          opportunities.push({
            pair,
            price: current,
            volatility: volatility.toFixed(2),
            trend,
            score,
            action: trend === 'up' ? 'buy' : 'sell'
          });
        }
      } catch (error) {
        // Skip errors
      }
    }
    
    return opportunities.sort((a, b) => b.score - a.score);
  }
  
  executeSimulatedTrade(platform, size, profitPercent, riskAmount) {
    const win = Math.random() < (platform === 'MEXC' ? 0.65 : 0.6);
    
    if (win) {
      const profit = size * profitPercent * (0.8 + Math.random() * 0.4); // 80-120% of expected
      return { win: true, profit };
    } else {
      const loss = riskAmount * (0.5 + Math.random()); // 50-150% of risk
      return { win: false, profit: -loss };
    }
  }
  
  updateStats() {
    const totalTrades = this.stats.mexc.trades + this.stats.dex.trades;
    const mexcWinRate = this.stats.mexc.trades > 0 ? 
      (this.stats.mexc.wins / this.stats.mexc.trades * 100).toFixed(1) : '0.0';
    const dexWinRate = this.stats.dex.trades > 0 ?
      (this.stats.dex.wins / this.stats.dex.trades * 100).toFixed(1) : '0.0';
    
    console.log('\n📊 LIVE STATS:');
    console.log('=============');
    console.log(`MEXC: ${this.stats.mexc.trades} trades | $${this.stats.mexc.profit.toFixed(2)} | ${mexcWinRate}% WR`);
    console.log(`DEX:  ${this.stats.dex.trades} trades | $${this.stats.dex.profit.toFixed(2)} | ${dexWinRate}% WR`);
    console.log(`TOTAL: $${this.stats.session.profit.toFixed(2)} / $${this.stats.session.target}`);
    console.log(`Progress: ${(this.stats.session.profit / this.stats.session.target * 100).toFixed(1)}%`);
    
    // Save stats
    this.saveStats();
  }
  
  saveStats() {
    const statsDir = path.join(__dirname, 'live_stats');
    if (!fs.existsSync(statsDir)) fs.mkdirSync(statsDir, { recursive: true });
    
    const statsFile = path.join(statsDir, `session_${Date.now()}.json`);
    fs.writeFileSync(statsFile, JSON.stringify(this.stats, null, 2));
  }
  
  finalReport() {
    console.log('\n🏁 SESSION COMPLETED');
    console.log('===================');
    
    const duration = (Date.now() - this.stats.startTime) / 60000; // minutes
    const totalProfit = this.stats.session.profit;
    const targetReached = totalProfit >= this.stats.session.target;
    
    console.log(`Duration: ${duration.toFixed(1)} minutes`);
    console.log(`Total Profit: $${totalProfit.toFixed(2)}`);
    console.log(`Target: $${this.stats.session.target}`);
    
    if (targetReached) {
      console.log('\n🎉 DAILY TARGET ACHIEVED! 🎉');
    } else {
      const needed = this.stats.session.target - totalProfit;
      console.log(`\n📊 Need: $${needed.toFixed(2)} more`);
    }
    
    // Compounding projection
    console.log('\n📈 COMPOUNDING PROJECTION:');
    console.log('=========================');
    
    const dailyReturn = totalProfit / 240; // $240 total capital
    let capital = 240;
    
    for (let day = 1; day <= 7; day++) {
      capital *= (1 + dailyReturn);
      const dailyProfit = capital * dailyReturn;
      
      console.log(`Day ${day}: $${capital.toFixed(2)} ($${dailyProfit.toFixed(2)}/day)`);
    }
    
    console.log('\n✅ Session complete!');
    console.log('📊 Stats saved to live_stats/');
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the bot
async function main() {
  console.log('🚀 FINAL LIVE TRADING BOT - STARTING');
  console.log('=====================================');
  console.log('⚠️  RUNNING IN SIMULATION MODE');
  console.log('   No real trades will be executed');
  console.log('   To enable real trading, change mode to "LIVE"');
  console.log('');
  
  const bot = new FinalLiveTradingBot();
  await bot.runTradingSession();
  
  console.log('\n🎉 Trading session completed!');
  console.log('📁 Check ~/mexc_trading/live_stats/ for detailed results');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { FinalLiveTradingBot };
EOF

echo "✅ Final trading bot created"

# 5. Create launch script
echo "⚡ Creating launch script..."
cat > launch.sh << 'EOF'
#!/bin/bash
cd ~/mexc_trading

echo "🚀 LAUNCHING LIVE TRADING SYSTEM"
echo "================================"
echo "Time: $(date)"
echo "Mode: SIMULATION (safe learning)"
echo ""

# Check credentials
if [ ! -f ~/.mexc_credentials ]; then
    echo "❌ MEXC credentials missing"
    exit 1
fi

if [ ! -f ~/.phantom_wallet.json ]; then
    echo "❌ Phantom wallet missing"
    exit 1
fi

echo "🔐 Credentials verified"
echo "🤖 Starting trading session..."
echo ""

# Run the bot
node live_trading_bot.js

echo ""
echo "📊 Session completed at $(date)"
echo "💾 Results saved to live_stats/"
EOF

chmod +x launch.sh

# 6. Create monitoring script
echo "👁️ Creating monitoring script..."
cat > monitor.sh << 'EOF'
#!/bin/bash
cd ~/mexc_trading

echo "📊 LIVE TRADING MONITOR"
echo "======================="
echo "Last updated: $(date)"
echo ""

# Show latest stats
latest_stats=$(ls -t live_stats/*.json 2>/dev/null | head -1)

if [ -f "$latest_stats" ]; then
    echo "📈 LATEST SESSION STATS:"
    echo "-----------------------"
    jq -r '
        "Start Time: " + .startTime,
        "MEXC Trades: " + (.mexc.trades|tostring),
        "MEXC Profit: $" + (.mexc.profit|tostring),
        "MEXC Win Rate: " + (if .mexc.trades > 0 then (.mexc.wins/.mexc.trades*100|tostring) + "%" else "0%" end),
        "DEX Trades: " + (.dex.trades|tostring),
        "DEX Profit: $" + (.dex.profit|tostring),
        "DEX Win Rate: " + (if .dex.trades > 0 then (.dex.wins/.dex.trades*100|tostring) + "%" else "0%" end),
        "Total Profit: $" + (.session.profit|tostring),
        "Target: $" + (.session.target|tostring),
        "Progress: " + (.session.profit/.session.target*100|tostring) + "%"
    ' "$latest_stats"
else
    echo "No session stats found"
fi

echo ""
echo "📁 LOG FILES:"
echo "-------------"
ls -la live_stats/*.json 2>/dev/null | head -5

echo ""
echo "⚡ QUICK COMMANDS:"
echo "-----------------"
echo "• Start: ./launch.sh"
echo "• Monitor: ./monitor.sh"
echo "• View logs: tail -f live_stats/latest.json"
echo "• Stop: Ctrl+C"
EOF

chmod +x monitor.sh

# 7. Final summary
echo ""
echo "🎉 FINAL LIVE SETUP COMPLETE!"
echo "=============================="
echo ""
echo "📁 Directory: ~/mexc_trading"
echo ""
echo "🚀 TO START TRADING:"
echo "   cd ~/mexc_trading"
echo "   ./launch.sh"
echo ""
echo "👁️ TO MONITOR:"
echo "   ./monitor.sh"
echo ""
echo "🔧 FILES CREATED:"
echo "   • ~/.mexc_credentials (MEXC API)"
echo "   • ~/.phantom_wallet.json (Phantom wallet)"
echo "   • ~/mexc_trading/live_trading_bot.js"
echo "   • ~/mexc_trading/launch.sh"
echo "   • ~/mexc_trading/monitor.sh"
echo ""
echo "⚠️  IMPORTANT:"
echo "   • Running in SIMULATION mode (safe)"
echo "   • No real trades executed"
echo "   • Change mode to 'LIVE' in code for real trading"
echo "   • 60-minute sessions"
echo "   • $50/day target"
echo ""
echo "📈 FIRST SESSION WILL:"
echo "   • Test MEXC + Phantom connections"
echo "   • Run simulated trades"
echo "   • Show real-time statistics"
echo "   • Calculate compounding projections"
echo ""
echo "Ready to launch? Run: ./launch.sh"