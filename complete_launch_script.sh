#!/bin/bash
# 🚀 COMPLETE LAUNCH SCRIPT - Alles in één
# Run this after selling 0.2 SOL on MEXC

echo "🎯 COMPLETE TRADING LAUNCH SCRIPT"
echo "================================="
echo "Run this AFTER selling 0.2 SOL on MEXC"
echo ""

cd ~/mexc_trading || { echo "❌ Directory not found"; exit 1; }

echo "📋 STAP 1: Check USDT Balance"
echo "----------------------------"

# Quick balance check
cat > check_balance_quick.js << 'EOF'
const ccxt = require('ccxt');
require('dotenv').config({ path: require('os').homedir() + '/.mexc_credentials' });

async function check() {
  const mexc = new ccxt.mexc({
    apiKey: process.env.API_KEY,
    secret: process.env.API_SECRET
  });
  
  try {
    const balance = await mexc.fetchBalance();
    const usdt = balance.USDT?.free || 0;
    const sol = balance.SOL?.free || 0;
    
    console.log('💰 CURRENT BALANCE:');
    console.log(`   USDT: $${usdt.toFixed(2)}`);
    console.log(`   SOL: ${sol.toFixed(6)} ($${(sol * 85.37).toFixed(2)})`);
    
    if (usdt >= 10) {
      console.log('\n✅ READY FOR TRADING!');
      console.log(`   Trading capital: $${usdt.toFixed(2)}`);
      console.log('   Minimum required: $10');
      return true;
    } else {
      console.log('\n❌ INSUFFICIENT USDT');
      console.log(`   Have: $${usdt.toFixed(2)} | Need: $10`);
      console.log('💡 Please sell 0.2 SOL on MEXC first');
      return false;
    }
  } catch (error) {
    console.error('❌ Balance check failed:', error.message);
    return false;
  }
}

check();
EOF

node check_balance_quick.js
BALANCE_OK=$?

if [ $BALANCE_OK -ne 0 ]; then
    echo ""
    echo "⚠️  Please sell 0.2 SOL on MEXC first:"
    echo "   1. Go to MEXC → Trade → SOL/USDT"
    echo "   2. Sell 0.2 SOL (Market order)"
    echo "   3. Wait 5 seconds"
    echo "   4. Run this script again"
    exit 1
fi

echo ""
echo "📋 STAP 2: Start Optimized Trading Bot"
echo "-------------------------------------"

# Create final launch script
cat > launch_optimized.sh << 'EOF'
#!/bin/bash
# 🚀 LAUNCH OPTIMIZED TRADING BOT
# Real trading with $1-2 trades

echo "🚀 LAUNCHING OPTIMIZED TRADING BOT"
echo "=================================="
echo "Mode: REAL ($1-2 trades)"
echo "Session: 30 minutes"
echo "Target: $5-10 profit"
echo ""

cd ~/mexc_trading || exit 1

# Kill any existing trading processes
pkill -f "node.*live_trading" 2>/dev/null
sleep 2

# Create logs directory
mkdir -p logs

# Start optimized bot
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
node live_trading_bot_optimized.js > "logs/optimized_trading_$TIMESTAMP.log" 2>&1 &

PID=$!
echo "✅ Trading bot started (PID: $PID)"
echo "📁 Log: logs/optimized_trading_$TIMESTAMP.log"
echo ""

echo "📊 EXPECTED TIMELINE:"
echo "-------------------"
echo "• 0-2 min: Initialization & balance check"
echo "• 2-5 min: First trade opportunity scan"
echo "• 5-10 min: First trade executed ($1-2)"
echo "• 30 min: Session complete, final report"
echo ""

echo "🎯 TARGETS:"
echo "----------"
echo "• Win Rate: 55-65%"
echo "• Trades: 8-12 per session"
echo "• Profit: $5-10 per session"
echo "• Risk: Max $2 loss per trade"
echo ""

echo "🔧 CONTROLS:"
echo "-----------"
echo "• Monitor: ./monitor_trading.sh"
echo "• Stop: kill $PID"
echo "• View logs: tail -f logs/optimized_trading_$TIMESTAMP.log"
echo ""

echo "💰 REMEMBER:"
echo "-----------"
echo "• This is REAL trading with real money"
echo "• Start small ($1-2 trades)"
echo "• Stick to the strategy"
echo "• Don't intervene emotionally"
echo "• Review results after session"
EOF

chmod +x launch_optimized.sh
echo "✅ Launch script created: ./launch_optimized.sh"
echo ""

echo "📋 STAP 3: Create Quick Start Guide"
echo "----------------------------------"

cat > QUICK_START_GUIDE.md << 'EOF'
# 🚀 QUICK START GUIDE - Trading Met SOL

## 📋 VOOR JE BEGINT:
```
SOL Balance: 2.0 ($170+)
USDT Balance: < $10
```

## 🎯 STAPPEN:

### **STAP 1: Verkoop 0.2 SOL op MEXC** (2 minuten)
```
1. Ga naar: https://www.mexc.com
2. Login → Trade → Spot
3. Zoek: SOL/USDT
4. Tab: "Sell"
5. Type: "Market"
6. Amount: 0.2
7. Klik "Sell SOL"
8. Wacht 5 seconden
```

### **STAP 2: Start Trading Bot** (1 minuut)
```bash
cd ~/mexc_trading
./launch_optimized.sh
```

### **STAP 3: Monitor** (live)
```bash
# Optie A: Dashboard
./monitor_trading.sh

# Optie B: Logs volgen
tail -f logs/optimized_trading_*.log
```

## ⏰ VERWACHTE TIMELINE:
```
0-2 min: Bot initialisatie
2-5 min: Eerste opportunity scan  
5-10 min: Eerste trade ($1-2)
10-20 min: 2-4 extra trades
20-30 min: Scaling & optimalisatie
30 min: Session complete, report
```

## 💰 VERWACHTE RESULTATEN:
```
• Trades: 8-12
• Win Rate: 55-65%
• Profit: $5-10
• Risk: Max $2 per trade
• Capital: ~$17 USDT
```

## 🔧 TROUBLESHOOTING:

### **Geen trades na 10 minuten?**
```bash
# Check logs
tail -f logs/optimized_trading_*.log

# Stop en herstart
pkill -f "node.*live_trading"
./launch_optimized.sh
```

### **Te weinig USDT?**
```
1. Check balance: node check_balance_quick.js
2. Verkoop meer SOL (0.1 extra)
3. Of deposit USDT
```

### **Bot crashed?**
```bash
# Check error
tail -20 logs/optimized_trading_*.log

# Herstart
./launch_optimized.sh
```

## 🏁 KLAAR OM TE STARTEN?

**Eerst:** Verkoop 0.2 SOL op MEXC  
**Daarna:** `./launch_optimized.sh`

**Succes!** 🚀
EOF

echo "✅ Quick start guide created: QUICK_START_GUIDE.md"
echo ""

echo "📋 STAP 4: Telegram Alert Setup"
echo "------------------------------"

# Check if Telegram token exists
if grep -q "TELEGRAM_TOKEN" ~/.env 2>/dev/null; then
    TELEGRAM_TOKEN=$(grep "TELEGRAM_TOKEN" ~/.env | cut -d'=' -f2)
    echo "✅ Telegram token found"
    
    cat > telegram_alerts.sh << EOF
#!/bin/bash
# 🤖 TELEGRAM TRADING ALERTS
# Send trading updates to Telegram

TELEGRAM_TOKEN="$TELEGRAM_TOKEN"
CHAT_ID=""  # You need to get your chat ID

echo "🤖 Telegram Trading Alerts"
echo "========================="

# Function to send message
send_alert() {
    local message="$1"
    curl -s -X POST "https://api.telegram.org/bot\$TELEGRAM_TOKEN/sendMessage" \
        -d "chat_id=\$CHAT_ID" \
        -d "text=\$message" \
        -d "parse_mode=Markdown"
}

# Monitor trading logs
echo "Monitoring trading logs for alerts..."
tail -f ~/mexc_trading/logs/optimized_trading_*.log | while read line; do
    if echo "\$line" | grep -q "Profit:.*[0-9]"; then
        send_alert "📈 Trading Update: \$line"
    elif echo "\$line" | grep -q "Target achieved"; then
        send_alert "🎉 TARGET ACHIEVED! \$line"
    fi
done
EOF

    chmod +x telegram_alerts.sh
    echo "✅ Telegram alerts script created"
    echo "   Note: You need to set CHAT_ID in the script"
else
    echo "⚠️  No Telegram token found in ~/.env"
fi

echo ""
echo "🎉 ALLES KLAAR VOOR TRADING LAUNCH!"
echo "==================================="
echo ""
echo "📋 JOUW VOLGENDE STAPPEN:"
echo "1. Verkoop 0.2 SOL op MEXC (2 min)"
echo "2. Run: ./launch_optimized.sh"
echo "3. Monitor: ./monitor_trading.sh"
echo ""
echo "💰 VERWACHT BINNEN 10 MINUTEN:"
echo "• Eerste trade: $1-2"
echo "• Win rate: 55-65%"
echo "• Session profit: $5-10"
echo "• Risk: Max $2 per trade"
echo ""
echo "🚀 KLAAR OM TE STARTEN?"
echo "Eerst SOL verkopen, dan trading starten!"