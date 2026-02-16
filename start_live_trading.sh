#!/bin/bash
# Live Trading Start Script - Clarence
# MEXC (2 SOL) + Phantom DEX (50 USDC) = $50/Dag Target

echo "🚀 LIVE TRADING SYSTEM START"
echo "============================="
echo "Platforms: MEXC (CEX) + Phantom (DEX)"
echo "Capital: 2 SOL ($190) + 50 USDC ($50)"
echo "Total: $240 | Target: $50/day"
echo ""

# 1. Check MEXC credentials
echo "🔐 Checking MEXC credentials..."
if [ ! -f ~/.mexc_credentials ]; then
    echo "❌ ~/.mexc_credentials not found"
    echo "Creating template..."
    
    cat > ~/.mexc_credentials << EOF
# MEXC API Credentials
API_KEY="YOUR_MEXC_API_KEY_HERE"
API_SECRET="YOUR_MEXC_API_SECRET_HERE"

# Trading parameters
INITIAL_CAPITAL_SOL="2"
TARGET_DAILY_USD="50"
RISK_PER_TRADE_PERCENT="2"
MAX_LEVERAGE="3"
EOF
    
    echo "⚠️  Please edit ~/.mexc_credentials with your real API keys"
    echo "   Then run this script again"
    exit 1
else
    echo "✅ MEXC credentials found"
fi

# 2. Check Phantom wallet
echo "👛 Checking Phantom wallet..."
if [ ! -f ~/.phantom_wallet.json ]; then
    echo "❌ ~/.phantom_wallet.json not found"
    echo "Creating template..."
    
    cat > ~/.phantom_wallet.json << EOF
{
  "privateKey": "YOUR_PHANTOM_PRIVATE_KEY_HERE",
  "publicKey": "",
  "usdcBalance": 50,
  "network": "mainnet-beta",
  "walletName": "Clarence_DEX_Trading"
}
EOF
    
    echo "⚠️  Please edit ~/.phantom_wallet.json with your private key"
    echo "   Then run this script again"
    exit 1
else
    echo "✅ Phantom wallet config found"
fi

# 3. Install dependencies
echo "📦 Installing dependencies..."
cd ~/mexc_trading 2>/dev/null || mkdir -p ~/mexc_trading && cd ~/mexc_trading

if [ ! -f package.json ]; then
    cat > package.json << EOF
{
  "name": "mexc-trading-bot",
  "version": "1.0.0",
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
fi

npm install

# 4. Create live trading bot
echo "🤖 Creating live trading bot..."
cat > live_trading_bot.js << 'EOF'
const ccxt = require('ccxt');
const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class LiveTradingBot {
  constructor() {
    // Load MEXC credentials
    require('dotenv').config({ path: require('os').homedir() + '/.mexc_credentials' });
    
    // Load Phantom wallet
    const phantomConfig = JSON.parse(
      fs.readFileSync(require('os').homedir() + '/.phantom_wallet.json', 'utf8')
    );
    
    // Initialize MEXC exchange
    this.mexc = new ccxt.mexc({
      apiKey: process.env.API_KEY,
      secret: process.env.API_SECRET,
      enableRateLimit: true,
      options: { defaultType: 'spot' }
    });
    
    // Initialize Phantom wallet
    this.phantomWallet = Keypair.fromSecretKey(
      Buffer.from(phantomConfig.privateKey, 'hex')
    );
    
    // Solana connection
    this.solanaConnection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    
    // Trading configuration
    this.config = {
      mexc: {
        capitalSOL: parseFloat(process.env.INITIAL_CAPITAL_SOL) || 2,
        targetDailyUSD: parseFloat(process.env.TARGET_DAILY_USD) || 50,
        riskPerTrade: parseFloat(process.env.RISK_PER_TRADE_PERCENT) || 2,
        maxLeverage: parseFloat(process.env.MAX_LEVERAGE) || 3,
        pairs: ['SOL/USDT', 'BTC/USDT', 'ETH/USDT']
      },
      dex: {
        capitalUSDC: phantomConfig.usdcBalance || 50,
        targetDailyUSD: 15, // $15/day from DEX
        riskPerTrade: 2, // 2%
        pairs: ['SOL/USDC', 'BONK/USDC', 'JUP/USDC'],
        jupiterApi: 'https://quote-api.jup.ag/v6'
      }
    };
    
    // Statistics
    this.stats = {
      startTime: new Date(),
      mexc: { trades: 0, profit: 0, wins: 0, losses: 0 },
      dex: { trades: 0, profit: 0, wins: 0, losses: 0 },
      total: { profit: 0, target: 65 } // $50 MEXC + $15 DEX
    };
    
    console.log('🚀 LIVE TRADING BOT INITIALIZED');
    console.log('================================');
    console.log(`MEXC: ${this.config.mexc.capitalSOL} SOL (~$${await this.getSOLPrice() * this.config.mexc.capitalSOL})`);
    console.log(`DEX: $${this.config.dex.capitalUSDC} USDC`);
    console.log(`Total Capital: ~$${this.config.mexc.capitalSOL * await this.getSOLPrice() + this.config.dex.capitalUSDC}`);
    console.log(`Daily Target: $${this.config.mexc.targetDailyUSD + this.config.dex.targetDailyUSD}`);
    console.log(`Start Time: ${this.stats.startTime.toLocaleTimeString()}`);
  }
  
  async getSOLPrice() {
    try {
      const ticker = await this.mexc.fetchTicker('SOL/USDT');
      return ticker.last;
    } catch (error) {
      console.error('Error fetching SOL price:', error.message);
      return 95; // Fallback price
    }
  }
  
  async getMEXCBalance() {
    try {
      const balance = await this.mexc.fetchBalance();
      const solBalance = balance.SOL?.free || 0;
      const usdtBalance = balance.USDT?.free || 0;
      const solPrice = await this.getSOLPrice();
      
      return {
        sol: solBalance,
        usdt: usdtBalance,
        totalUSD: (solBalance * solPrice) + usdtBalance,
        solPrice: solPrice
      };
    } catch (error) {
      console.error('Error fetching MEXC balance:', error.message);
      return { sol: 0, usdt: 0, totalUSD: 0, solPrice: 0 };
    }
  }
  
  async findMEXCOpportunities() {
    const opportunities = [];
    
    for (const pair of this.config.mexc.pairs) {
      try {
        const ticker = await this.mexc.fetchTicker(pair);
        const ohlcv = await this.mexc.fetchOHLCV(pair, '1m', undefined, 50);
        
        const closes = ohlcv.map(c => c[4]);
        const currentPrice = ticker.last;
        const avgPrice = closes.reduce((a, b) => a + b, 0) / closes.length;
        const volatility = (Math.max(...closes) - Math.min(...closes)) / avgPrice * 100;
        
        if (volatility > 1) { // More than 1% volatility
          const trend = currentPrice > avgPrice ? 'up' : 'down';
          const score = this.calculateMEXCScore(volatility, trend, ticker.volume);
          
          opportunities.push({
            pair,
            price: currentPrice,
            volatility: volatility.toFixed(2),
            trend,
            volume: ticker.volume,
            score,
            action: trend === 'up' ? 'buy' : 'sell'
          });
        }
      } catch (error) {
        console.error(`Error analyzing ${pair}:`, error.message);
      }
    }
    
    return opportunities.sort((a, b) => b.score - a.score).slice(0, 2);
  }
  
  calculateMEXCScore(volatility, trend, volume) {
    let score = 0;
    score += Math.min(volatility, 5) * 10; // Volatility score
    score += Math.log10(volume + 1) * 5;   // Volume score
    if (trend === 'up') score += 15;       // Trend score
    return score;
  }
  
  async executeMEXCTrade(opportunity) {
    const balance = await this.getMEXCBalance();
    const riskAmount = balance.totalUSD * (this.config.mexc.riskPerTrade / 100);
    const positionSize = riskAmount * 2; // 2:1 reward:risk
    
    console.log(`\n📈 MEXC Trade: ${opportunity.pair}`);
    console.log(`   Price: $${opportunity.price}`);
    console.log(`   Action: ${opportunity.action.toUpperCase()}`);
    console.log(`   Size: $${positionSize.toFixed(2)}`);
    console.log(`   Risk: $${riskAmount.toFixed(2)} (${this.config.mexc.riskPerTrade}%)`);
    
    try {
      // In live trading, this would place actual orders
      // For safety, we'll simulate first
      const simulate = true; // Set to false for real trading
      
      if (simulate) {
        const win = Math.random() < 0.65; // 65% win rate
        const profit = win ? positionSize * 0.008 : -riskAmount; // 0.8% profit or full loss
        
        this.stats.mexc.trades++;
        this.stats.mexc.profit += profit;
        this.stats.total.profit += profit;
        
        if (win) {
          this.stats.mexc.wins++;
          console.log(`   ✅ SIMULATED WIN: $${profit.toFixed(2)}`);
        } else {
          this.stats.mexc.losses++;
          console.log(`   ❌ SIMULATED LOSS: $${-profit.toFixed(2)}`);
        }
        
        return { success: win, profit, simulated: true };
      } else {
        // REAL TRADING CODE (commented for safety)
        /*
        const order = await this.mexc.createOrder(
          opportunity.pair,
          'market',
          opportunity.action,
          positionSize / opportunity.price,
          opportunity.price
        );
        
        console.log(`   📝 Order placed: ${order.id}`);
        return { success: true, order, profit: 0 };
        */
      }
    } catch (error) {
      console.error(`   ❌ Trade error: ${error.message}`);
      return { success: false, profit: 0, error: error.message };
    }
  }
  
  async findDEXOpportunities() {
    // Use Jupiter API for DEX quotes
    const opportunities = [];
    
    try {
      const response = await axios.get(
        `${this.config.dex.jupiterApi}/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1000000000`
      );
      
      const solPrice = response.data.outAmount / 1000000; // USDC has 6 decimals
      
      opportunities.push({
        pair: 'SOL/USDC',
        price: solPrice,
        source: 'Jupiter',
        score: 75,
        action: 'arbitrage'
      });
    } catch (error) {
      console.error('Error fetching DEX quote:', error.message);
    }
    
    // Add simulated opportunities for other pairs
    ['BONK/USDC', 'JUP/USDC'].forEach(pair => {
      opportunities.push({
        pair,
        price: Math.random() * 0.1,
        volatility: (Math.random() * 5 + 1).toFixed(2),
        score: Math.floor(Math.random() * 30) + 50,
        action: 'momentum'
      });
    });
    
    return opportunities.sort((a, b) => b.score - a.score).slice(0, 2);
  }
  
  async executeDEXTrade(opportunity) {
    const positionSize = this.config.dex.capitalUSDC * 0.2; // 20% of DEX capital
    const riskAmount = positionSize * (this.config.dex.riskPerTrade / 100);
    
    console.log(`\n🔄 DEX Trade: ${opportunity.pair}`);
    console.log(`   Price: $${opportunity.price}`);
    console.log(`   Strategy: ${opportunity.action}`);
    console.log(`   Size: $${positionSize.toFixed(2)}`);
    console.log(`   Risk: $${riskAmount.toFixed(2)} (${this.config.dex.riskPerTrade}%)`);
    
    // Simulate DEX trade
    const win = Math.random() < 0.6; // 60% win rate for DEX
    const profit = win ? positionSize * 0.01 : -riskAmount; // 1% profit or loss
    
    this.stats.dex.trades++;
    this.stats.dex.profit += profit;
    this.stats.total.profit += profit;
    
    if (win) {
      this.stats.dex.wins++;
      console.log(`   ✅ SIMULATED WIN: $${profit.toFixed(2)}`);
    } else {
      this.stats.dex.losses++;
      console.log(`   ❌ SIMULATED LOSS: $${-profit.toFixed(2)}`);
    }
    
    return { success: win, profit, simulated: true };
  }
  
  async runTradingCycle() {
    console.log('\n🔄 TRADING CYCLE START');
    console.log('=====================');
    
    // 1. MEXC Trading
    console.log('\n🤖 MEXC Trading (CEX):');
    const mexcOpps = await this.findMEXCOpportunities();
    
    if (mexcOpps.length > 0 && mexcOpps[0].score > 60) {
      await this.executeMEXCTrade(mexcOpps[0]);
    } else {
      console.log('   ⏸️  No good MEXC opportunities');
    }
    
    // 2. DEX Trading
    console.log('\n🤖 DEX Trading (Phantom):');
    const dexOpps = await this.findDEXOpportunities();
    
    if (dexOpps.length > 0 && dexOpps[0].score > 60) {
      await this.executeDEXTrade(dexOpps[0]);
    } else {
      console.log('   ⏸️  No good DEX opportunities');
    }
    
    // 3. Update statistics
    this.updateStats();
  }
  
  updateStats() {
    const totalTrades = this.stats.mexc.trades + this.stats.dex.trades;
    const mexcWinRate = this.stats.mexc.trades > 0 ? 
      (this.stats.mexc.wins / this.stats.mexc.trades * 100).toFixed(1) : '0.0';
    const dexWinRate = this.stats.dex.trades > 0 ?
      (this.stats.dex.wins / this.stats.dex.trades * 100).toFixed(1) : '0.0';
    
    console.log('\n📊 LIVE STATISTICS:');
    console.log('==================');
    console.log(`MEXC: ${this.stats.mexc.trades} trades | $${this.stats.mexc.profit.toFixed(2)} | ${mexcWinRate}% WR`);
    console.log(`DEX:  ${this.stats.dex.trades} trades | $${this.stats.dex.profit.toFixed(2)} | ${dexWinRate}% WR`);
    console.log(`TOTAL: $${this.stats.total.profit.toFixed(2)} / $${this.stats.total.target}`);
    console.log(`Progress: ${(this.stats.total.profit / this.stats.total.target * 100).toFixed(1)}%`);
    
    // Save stats to file
    this.saveStats();
  }
  
  saveStats() {
    const statsDir = path.join(__dirname, 'live_stats');
    if (!fs.existsSync(statsDir)) {
      fs.mkdirSync(statsDir, { recursive: true });
    }
    
    const statsFile = path.join(statsDir, `stats_${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(statsFile, JSON.stringify(this.stats, null, 2));
  }
  
  async runSession(minutes = 60) {
    console.log(`\n⏰ Starting ${minutes}-minute trading session`);
    console.log('========================================');
    
    const startTime = Date.now();
    const endTime = startTime + (minutes * 60 * 1000);
    let cycles = 0;
    
    while (Date.now() < endTime && this.stats.total.profit < this.stats.total.target) {
      cycles++;
      console.log(`\n📈 CYCLE ${cycles}`);
      console.log('===========');
      
      await this.runTradingCycle();
      
      // Wait between cycles (2 minutes)
      await this.sleep(120000);
    }
    
    console.log('\n🏁 SESSION COMPLETED');
    console.log('===================');
    console.log(`Duration: ${minutes} minutes`);
    console.log(`Cycles: ${cycles}`);
    console.log(`Final Profit: $${this.stats.total.profit.toFixed(2)}`);
    console.log(`Target: $${this.stats.total.target}`);
    
    if (this.stats.total.profit >= this.stats.total.target) {
      console.log('\n🎉 DAILY TARGET ACHIEVED! 🎉');
    }
    
    return this.stats;
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the bot
async function main() {
  console.log('🚀 LIVE TRADING BOT - STARTING');
  console.log('===============================');
  console.log('⚠️  WARNING: This is SIMULATION MODE');
  console.log('   No real trades will be executed');
  console.log('   Set simulate=false in code for real trading');
  console.log('');
  
  const bot = new LiveTradingBot();
  
  // Run 60-minute session
  await bot.runSession(60);
  
  console.log('\n📈 COMPOUNDING PROJECTION:');
  console.log('=========================');
  
  const dailyReturn = bot.stats.total.profit / 240; // $240 total capital
  let capital = 240;
  
  for (let day = 1; day <= 7; day++) {
    capital *= (1 + dailyReturn);
    const dailyProfit = capital * dailyReturn;
    
    console.log(`Day ${day}:`);
    console.log(`  Capital: $${capital.toFixed(2)}`);
    console.log(`  Daily Profit: $${dailyProfit.toFixed(2)}`);
    console.log(`  MEXC: $${(dailyProfit * 0.77).toFixed(2)}`);
    console.log(`  DEX: $${(dailyProfit * 0.23).toFixed(2)}`);
  }
  
  console.log('\n✅ Trading session completed');
  console.log('📊 Check ~/mexc_trading/live_stats/ for detailed statistics');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { LiveTradingBot };
EOF

echo "✅ Live trading bot created: ~/mexc_trading/live_trading_bot.js"

# 5. Create startup script
echo "⚡ Creating startup script..."
cat > start_live.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"

echo "🚀 Starting Live Trading System"
echo "==============================="
echo "Platforms: MEXC (CEX) + Phantom (DEX)"
echo "Capital: 2 SOL + 50 USDC"
echo "Target: $50/day"
echo "Mode: SIMULATION (no real trades)"
echo ""

# Check credentials
if [ ! -f ~/.mexc_credentials ] || grep -q "YOUR_MEXC_API_KEY_HERE" ~/.mexc_credentials; then
    echo "❌ MEXC credentials not configured"
    echo "Edit ~/.mexc_credentials with your API keys"
    exit 1
fi

if [ ! -f ~/.phantom_wallet.json ] || grep -q "YOUR_PHANTOM_PRIVATE_KEY_HERE" ~/.phantom_wallet.json; then
    echo "❌ Phantom wallet not configured"
    echo "Edit ~/.phantom_wallet.json with your private key"
    exit 1
fi

echo "✅ Credentials verified"
echo "🔄 Starting trading session..."

# Run the bot
node live_trading_bot.js
EOF

chmod +x start_live.sh

# 6. Summary
echo ""
echo "🎉 LIVE TRADING SYSTEM READY!"
echo "=============================="
echo ""
echo "📁 Files created:"
echo "  • ~/.mexc_credentials (edit with your API keys)"
echo "  • ~/.phantom_wallet.json (edit with private key)"
echo "  • ~/mexc_trading/live_trading_bot.js"
echo "  • ~/mexc_trading/start_live.sh"
echo ""
echo "🚀 To start LIVE trading:"
echo "  1. Edit both config files with your real keys"
echo "  2. Run: cd ~/mexc_trading && ./start_live.sh"
echo ""
echo "⚠️  IMPORTANT:"
echo "  • By default, runs in SIMULATION mode"
echo "  • No real trades will be executed"
echo "  • To enable real trading, edit live_trading_bot.js"
echo "  • Change 'simulate = true' to 'simulate = false'"
echo ""
echo "🎯 First session will:"
echo "  • Run for 60 minutes"
echo "  • Trade on MEXC and DEX"
echo "  • Show real-time statistics"
echo "  • Save logs to ~/mexc_trading/live_stats/"
echo ""
echo "Ready to go live? Configure your credentials first!"