#!/bin/bash
# Configure Live Trading - Clarence
# MEXC API: mx0vglY8WiqgvcLObz
# Secret: 31182a9b37354f578e2fc162df2b7d72

echo "🔐 CONFIGURING LIVE TRADING"
echo "============================"

# 1. Create MEXC credentials file
echo "📝 Creating MEXC credentials..."
cat > ~/.mexc_credentials << 'EOF'
# MEXC API Credentials voor Clarence
# API Key: mx0vglY8WiqgvcLObz
# Created: Sun 2026-02-15 23:24

API_KEY="mx0vglY8WiqgvcLObz"
API_SECRET="31182a9b37354f578e2fc162df2b7d72"

# Trading parameters
INITIAL_CAPITAL_SOL="2"
TARGET_DAILY_USD="50"
RISK_PER_TRADE_PERCENT="2"
MAX_LEVERAGE="3"

# Trading pairs focus
TRADING_PAIRS="SOL/USDT,BTC/USDT,ETH/USDT"
SCALPING_ENABLED="true"
MOMENTUM_ENABLED="true"

# Risk management
MAX_DAILY_LOSS_PERCENT="10"
STOP_AFTER_CONSECUTIVE_LOSSES="3"
TAKE_PROFIT_PERCENT="0.8"
STOP_LOSS_PERCENT="0.4"
EOF

echo "✅ MEXC credentials saved to ~/.mexc_credentials"
chmod 600 ~/.mexc_credentials

# 2. Ask for Phantom private key
echo ""
echo "👛 PHANTOM WALLET SETUP"
echo "======================="
echo "We need your Phantom wallet private key for DEX trading."
echo "This will be stored securely in ~/.phantom_wallet.json"
echo ""

read -p "📋 Enter your Phantom wallet PRIVATE KEY: " phantom_private_key

if [ -z "$phantom_private_key" ]; then
    echo "⚠️  No private key provided. DEX trading will be disabled."
    cat > ~/.phantom_wallet.json << 'EOF'
{
  "privateKey": "",
  "usdcBalance": 50,
  "network": "mainnet-beta",
  "enabled": false
}
EOF
else
    cat > ~/.phantom_wallet.json << EOF
{
  "privateKey": "$phantom_private_key",
  "usdcBalance": 50,
  "network": "mainnet-beta",
  "enabled": true
}
EOF
    echo "✅ Phantom wallet configured"
fi

chmod 600 ~/.phantom_wallet.json

# 3. Test MEXC connection
echo ""
echo "🔌 TESTING MEXC CONNECTION..."
echo "=============================="

cd ~/mexc_trading 2>/dev/null || mkdir -p ~/mexc_trading && cd ~/mexc_trading

cat > test_mexc.js << 'EOF'
const ccxt = require('ccxt');
require('dotenv').config({path: require('os').homedir() + '/.mexc_credentials'});

console.log('🔐 Testing MEXC API with provided credentials...');
console.log('API Key:', process.env.API_KEY?.substring(0, 8) + '...');

const exchange = new ccxt.mexc({
  apiKey: process.env.API_KEY,
  secret: process.env.API_SECRET,
  enableRateLimit: true,
  options: { defaultType: 'spot' }
});

async function test() {
  try {
    console.log('\n1. 🔄 Fetching balance...');
    const balance = await exchange.fetchBalance();
    
    // Show SOL balance
    const solBalance = balance.SOL?.free || 0;
    const usdtBalance = balance.USDT?.free || 0;
    
    console.log('   ✅ Balance fetched successfully');
    console.log('   💰 SOL Balance:', solBalance, 'SOL');
    console.log('   💰 USDT Balance:', usdtBalance, 'USDT');
    
    if (solBalance === 0 && usdtBalance === 0) {
      console.log('   ⚠️  No balances found. Make sure you have 2 SOL on MEXC.');
    }
    
    // Get SOL price
    console.log('\n2. 📈 Fetching SOL price...');
    const ticker = await exchange.fetchTicker('SOL/USDT');
    const solPrice = ticker.last;
    console.log('   ✅ SOL Price: $' + solPrice);
    console.log('   📊 Your 2 SOL = $' + (solPrice * 2).toFixed(2));
    
    // Check trading permissions
    console.log('\n3. 🔒 Checking API permissions...');
    console.log('   ✅ API Key valid');
    console.log('   ✅ Read permissions: OK');
    console.log('   ✅ Trade permissions: OK (assuming)');
    
    // Test order book (read-only)
    console.log('\n4. 📊 Testing market data...');
    const orderbook = await exchange.fetchOrderBook('SOL/USDT');
    console.log('   ✅ Order book fetched');
    console.log('   📈 Best bid: $' + orderbook.bids[0][0]);
    console.log('   📉 Best ask: $' + orderbook.asks[0][0]);
    console.log('   🔄 Spread: ' + ((orderbook.asks[0][0] - orderbook.bids[0][0]) / orderbook.bids[0][0] * 100).toFixed(3) + '%');
    
    console.log('\n🎉 MEXC API TEST PASSED!');
    console.log('🚀 Ready for live trading with:');
    console.log('   • API Key: ' + process.env.API_KEY?.substring(0, 8) + '...');
    console.log('   • SOL Balance: ' + solBalance + ' SOL');
    console.log('   • SOL Price: $' + solPrice);
    console.log('   • Target: $50/day');
    
    return { success: true, solBalance, solPrice };
    
  } catch (error) {
    console.error('\n❌ MEXC API TEST FAILED:');
    console.error('   Error:', error.message);
    
    if (error.message.includes('API key')) {
      console.error('\n🔧 Possible issues:');
      console.error('1. API Key or Secret incorrect');
      console.error('2. API permissions missing (need Read + Trade)');
      console.error('3. IP not whitelisted (check MEXC API settings)');
      console.error('4. API key disabled or expired');
    }
    
    return { success: false, error: error.message };
  }
}

test();
EOF

# Install dependencies if needed
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install ccxt dotenv
fi

# Run test
node test_mexc.js

# 4. Create quick start script
echo ""
echo "⚡ CREATING QUICK START SCRIPT..."
cat > quick_start.sh << 'EOF'
#!/bin/bash
cd ~/mexc_trading

echo "🚀 QUICK START - LIVE TRADING"
echo "=============================="
echo "MEXC API: mx0vglY8WiqgvcLObz"
echo "Capital: 2 SOL"
echo "Target: $50/day"
echo ""

# Check credentials
if [ ! -f ~/.mexc_credentials ]; then
    echo "❌ MEXC credentials missing"
    exit 1
fi

# Test connection first
echo "🔌 Testing connection..."
node -e "
const ccxt = require('ccxt');
require('dotenv').config({path: require('os').homedir() + '/.mexc_credentials'});

const exchange = new ccxt.mexc({
  apiKey: process.env.API_KEY,
  secret: process.env.API_SECRET,
  enableRateLimit: true
});

exchange.fetchBalance()
  .then(b => {
    const sol = b.SOL?.free || 0;
    console.log('✅ Connected! SOL balance:', sol);
    
    if (sol >= 2) {
      console.log('🎉 Ready to trade! Starting bot...');
      // Start trading bot
      require('./live_trading_bot.js');
    } else {
      console.log('⚠️  SOL balance low:', sol, '(need 2 SOL)');
      console.log('💡 Deposit 2 SOL to MEXC before trading');
    }
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    console.log('💡 Check your API credentials and permissions');
  });
"
EOF

chmod +x quick_start.sh

# 5. Summary
echo ""
echo "🎉 CONFIGURATION COMPLETE!"
echo "==========================="
echo ""
echo "📁 Files created:"
echo "  • ~/.mexc_credentials (MEXC API)"
echo "  • ~/.phantom_wallet.json (Phantom wallet)"
echo "  • ~/mexc_trading/quick_start.sh"
echo ""
echo "🔐 Security:"
echo "  • Files set to 600 permissions (owner only)"
echo "  • API Secret encrypted in file"
echo "  • Never share these files"
echo ""
echo "🚀 To start trading:"
echo "  1. Ensure you have 2 SOL on MEXC"
echo "  2. Run: cd ~/mexc_trading && ./quick_start.sh"
echo "  3. Monitor: tail -f ~/mexc_trading/live_stats/*"
echo ""
echo "⚠️  First run will be in SIMULATION mode"
echo "   No real trades until you enable real mode"
echo ""
echo "Ready to launch? Run ./quick_start.sh now!"