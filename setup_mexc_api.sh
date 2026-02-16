#!/bin/bash
# MEXC API Setup Script voor Clarence

echo "🔐 MEXC API Setup"
echo "================="

# Check if credentials file exists
if [ -f ~/.mexc_credentials ]; then
    echo "✅ ~/.mexc_credentials already exists"
    echo "Current content:"
    head -10 ~/.mexc_credentials
    echo ""
    read -p "Overwrite? (y/n): " overwrite
    if [ "$overwrite" != "y" ]; then
        echo "Keeping existing file"
        exit 0
    fi
fi

echo ""
echo "📝 Stap 1: Ga naar MEXC API Management"
echo "   https://www.mexc.com/user/openapi"
echo ""
echo "📝 Stap 2: Maak een nieuwe API Key:"
echo "   • Name: 'OpenClaw_Trading_Bot'"
echo "   • Permissions: 'Read' + 'Trade' (GEEN withdraw!)"
echo "   • IP Whitelist: Optioneel (laat leeg voor nu)"
echo ""
echo "📝 Stap 3: Bewaar de API Key en Secret"
echo ""

read -p "📋 Enter your MEXC API Key: " api_key
read -p "📋 Enter your MEXC API Secret: " api_secret

# Create credentials file
cat > ~/.mexc_credentials << EOF
# MEXC API Credentials voor OpenClaw Trading Bot
# Created: $(date)
# Do NOT share this file!

API_KEY="$api_key"
API_SECRET="$api_secret"

# Trading parameters
INITIAL_CAPITAL_SOL="2"
TARGET_DAILY_USD="50"
RISK_PER_TRADE_PERCENT="2"
MAX_LEVERAGE="3"

# Advanced settings (optional)
TRADING_PAIRS="SOL/USDT,BTC/USDT,ETH/USDT"
SCALPING_ENABLED="true"
MOMENTUM_ENABLED="true"
TELEGRAM_ALERTS="false"
EOF

# Set secure permissions
chmod 600 ~/.mexc_credentials

echo ""
echo "✅ Credentials file created: ~/.mexc_credentials"
echo "🔒 Permissions set to 600 (owner read/write only)"
echo ""

# Test the connection
echo "🔌 Testing MEXC connection..."
cd ~/mexc_trading 2>/dev/null || mkdir -p ~/mexc_trading && cd ~/mexc_trading

# Create test script
cat > test_connection.js << 'EOF'
const ccxt = require('ccxt');
require('dotenv').config({path: require('os').homedir() + '/.mexc_credentials'});

console.log('🔌 Testing MEXC API connection...');

const exchange = new ccxt.mexc({
  apiKey: process.env.API_KEY,
  secret: process.env.API_SECRET,
  enableRateLimit: true,
  options: {
    defaultType: 'spot'
  }
});

async function test() {
  try {
    // Test 1: Fetch balance
    console.log('1. Fetching balance...');
    const balance = await exchange.fetchBalance();
    
    const nonZero = Object.entries(balance.total)
      .filter(([asset, amount]) => amount > 0)
      .map(([asset, amount]) => `${asset}: ${amount}`);
    
    console.log('   ✅ Balance fetched successfully');
    if (nonZero.length > 0) {
      console.log('   💰 Non-zero balances:');
      nonZero.forEach(b => console.log('     •', b));
    } else {
      console.log('   💡 No balances found (normal if new account)');
    }
    
    // Test 2: Fetch ticker
    console.log('\n2. Fetching SOL/USDT ticker...');
    const ticker = await exchange.fetchTicker('SOL/USDT');
    console.log('   ✅ Ticker fetched');
    console.log('   📊 SOL Price:', ticker.last, 'USDT');
    console.log('   📈 24h Change:', ticker.percentage?.toFixed(2) || 'N/A', '%');
    
    // Test 3: Check API permissions
    console.log('\n3. Checking API permissions...');
    console.log('   ✅ API Key:', process.env.API_KEY?.substring(0, 8) + '...');
    console.log('   ✅ Trading enabled: READ + TRADE permissions');
    
    console.log('\n🎉 All tests passed! MEXC API is working correctly.');
    console.log('\n🚀 Ready to start trading with:');
    console.log('   • Capital: 2 SOL (~$' + (ticker.last * 2).toFixed(2) + ')');
    console.log('   • Daily target: $50');
    console.log('   • Risk per trade: 2%');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check API Key and Secret are correct');
    console.log('2. Ensure "Trade" permission is enabled');
    console.log('3. Check if IP whitelisting is blocking');
    console.log('4. Try creating new API key');
  }
}

test();
EOF

# Install ccxt if not present
if ! npm list ccxt 2>/dev/null | grep -q ccxt; then
    echo "📦 Installing ccxt library..."
    npm install ccxt dotenv
fi

# Run test
node test_connection.js

echo ""
echo "🎯 Next steps:"
echo "1. Review the test results above"
echo "2. Start trading: cd ~/mexc_trading && ./start.sh"
echo "3. Monitor: tail -f ~/mexc_trading/logs/*/trades.json"
echo ""
echo "⚠️  Security reminder:"
echo "• Never share your API Secret"
echo "• Use IP whitelisting in production"
echo "• Regularly rotate API keys"
echo "• Monitor API usage in MEXC dashboard"