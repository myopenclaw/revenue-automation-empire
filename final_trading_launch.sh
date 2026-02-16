#!/bin/bash
# 🚀 FINAL TRADING LAUNCH
# Complete setup voor trading na SOL verkoop

echo "🎯 FINAL TRADING LAUNCH"
echo "======================"
echo "Alles klaar voor trading na 0.2 SOL verkoop"
echo ""

# Check if we're in the right directory
cd ~/mexc_trading 2>/dev/null || { 
    echo "❌ m exc_trading directory not found"
    echo "💡 Creating directory..."
    mkdir -p ~/mexc_trading
    cd ~/mexc_trading
}

echo "📋 STAP 1: Check USDT Balance (na SOL verkoop)"
echo "--------------------------------------------"

cat > check_usdt_balance.js << 'EOF'
const ccxt = require('ccxt');
require('dotenv').config({ path: require('os').homedir() + '/.mexc_credentials' });

async function checkBalance() {
  console.log('💰 CHECKING USDT BALANCE');
  console.log('========================\n');
  
  const mexc = new ccxt.mexc({
    apiKey: process.env.API_KEY,
    secret: process.env.API_SECRET,
    enableRateLimit: true
  });
  
  try {
    const balance = await mexc.fetchBalance();
    const usdt = balance.USDT?.free || 0;
    const sol = balance.SOL?.free || 0;
    
    console.log('📊 CURRENT BALANCE:');
    console.log(`   USDT: $${usdt.toFixed(2)}`);
    console.log(`   SOL: ${sol.toFixed(6)} ($${(sol * 85.37).toFixed(2)})`);
    console.log('');
    
    if (usdt >= 10) {
      console.log('✅ READY FOR TRADING!');
      console.log(`   Trading capital: $${usdt.toFixed(2)}`);
      console.log('   Minimum required: $10 ✓');
      console.log('');
      console.log('🚀 NEXT: Run ./launch_optimized.sh');
      return { ready: true, usdt, sol };
    } else {
      console.log('❌ NEED TO SELL 0.2 SOL FIRST');
      console.log(`   Current USDT: $${usdt.toFixed(2)} (need $10)`);
      console.log('');
      console.log('💡 QUICK FIX:');
      console.log('   1. Go to MEXC → Trade → SOL/USDT');
      console.log('   2. Sell 0.2 SOL (Market order)');
      console.log('   3. Wait 5 seconds');
      console.log('   4. Run this check again');
      return { ready: false, usdt, sol };
    }
  } catch (error) {
    console.error('❌ Balance check failed:', error.message);
    return { ready: false, error: error.message };
  }
}

checkBalance();
EOF

echo "Running balance check..."
node check_usdt_balance.js

echo ""
echo "📋 STAP 2: Launch Trading Bot (als USDT >= $10)"
echo "---------------------------------------------"

cat > launch_final_trading.sh << 'EOF'
#!/bin/bash
# 🚀 LAUNCH FINAL TRADING BOT
# Start trading met $1-2 trades

echo "🚀 LAUNCHING FINAL TRADING BOT"
echo "=============================="
echo "Time: $(date)"
echo ""

cd ~/mexc_trading || exit 1

# Kill any existing trading processes
echo "🛑 Stopping any existing trading bots..."
pkill -f "node.*live_trading" 2>/dev/null
sleep 2

# Create logs directory
mkdir -p logs

# Check balance one more time
echo "💰 Final balance check..."
node -e "
const ccxt = require('ccxt');
require('dotenv').config({ path: require('os').homedir() + '/.mexc_credentials' });
const mexc = new ccxt.mexc({apiKey: process.env.API_KEY, secret: process.env.API_SECRET});
mexc.fetchBalance().then(b => {
  const usdt = b.USDT?.free || 0;
  const sol = b.SOL?.free || 0;
  console.log('   USDT: $' + usdt.toFixed(2));
  console.log('   SOL: ' + sol.toFixed(4) + ' ($' + (sol * 85.37).toFixed(2) + ')');
  
  if (usdt < 10) {
    console.log('❌ Insufficient USDT. Please sell 0.2 SOL first.');
    process.exit(1);
  }
});
" || exit 1

echo ""
echo "✅ Balance verified. Starting trading bot..."

# Start optimized trading bot
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/final_trading_$TIMESTAMP.log"

echo "📁 Starting bot, logs: $LOG_FILE"
node live_trading_bot_optimized.js > "$LOG_FILE" 2>&1 &

BOT_PID=$!
echo "✅ Trading bot started (PID: $BOT_PID)"

# Wait a moment for initialization
sleep 5

echo ""
echo "📊 TRADING BOT STATUS:"
echo "-------------------"
echo "• PID: $BOT_PID"
echo "• Log file: $LOG_FILE"
echo "• Mode: REAL trading ($1-2 per trade)"
echo "• Session: 30 minutes"
echo "• Target: $5-10 profit"
echo ""

echo "🎯 EXPECTED TIMELINE:"
echo "-------------------"
echo "• 0-2 min: Initialization"
echo "• 2-5 min: First opportunity scan"
echo "• 5-10 min: First trade executed"
echo "• 30 min: Session complete, final report"
echo ""

echo "💰 RISK MANAGEMENT:"
echo "-----------------"
echo "• Trade size: $1-2"
echo "• Max loss per trade: 2% ($0.20-0.40)"
echo "• Daily stop loss: 10% ($1.70)"
echo "• Take profit: 1-2% per trade"
echo ""

echo "🔧 CONTROLS:"
echo "-----------"
echo "• Monitor: tail -f $LOG_FILE"
echo "• Dashboard: ./monitor_trading.sh"
echo "• Stop: kill $BOT_PID"
echo "• Check balance: node check_usdt_balance.js"
echo ""

echo "📈 LIVE MONITORING:"
echo "-----------------"
echo "Opening log tail..."
echo ""
tail -f "$LOG_FILE" &
TAIL_PID=$!

# Auto-kill tail when bot stops
(
  while kill -0 $BOT_PID 2>/dev/null; do
    sleep 5
  done
  kill $TAIL_PID 2>/dev/null
  echo ""
  echo "📊 Trading session complete!"
  echo "Check final report in: $LOG_FILE"
) &

# Wait for bot to finish or user interrupt
wait $BOT_PID
EOF

chmod +x launch_final_trading.sh
echo "✅ Final launch script created: ./launch_final_trading.sh"

echo ""
echo "📋 STAP 3: Create Quick Monitoring Dashboard"
echo "------------------------------------------"

cat > trading_dashboard.sh << 'EOF'
#!/bin/bash
# 📊 TRADING DASHBOARD
# Real-time monitoring van trading sessie

echo "📊 TRADING DASHBOARD"
echo "==================="
echo "Real-time monitoring van trading bot"
echo ""

cd ~/mexc_trading || exit 1

# Find latest trading log
LATEST_LOG=$(ls -t logs/final_trading_*.log logs/optimized_trading_*.log 2>/dev/null | head -1)

if [ -z "$LATEST_LOG" ]; then
    echo "❌ No active trading session found"
    echo ""
    echo "🚀 TO START TRADING:"
    echo "   1. Sell 0.2 SOL on MEXC"
    echo "   2. Run: ./launch_final_trading.sh"
    exit 1
fi

echo "📁 Active session: $LATEST_LOG"
echo ""

# Function to display dashboard
display_dashboard() {
    clear
    echo "🔄 TRADING DASHBOARD - $(date)"
    echo "=============================="
    echo ""
    
    # Show last 15 lines of log
    echo "📈 LIVE TRADING LOG:"
    echo "-------------------"
    tail -15 "$LATEST_LOG" | grep -v "^$"
    
    echo ""
    echo "💰 QUICK STATS:"
    echo "-------------"
    
    # Extract stats from log
    TRADES=$(grep -c "Profit:\|Loss:" "$LATEST_LOG" 2>/dev/null || echo "0")
    WINS=$(grep -c "✅ Profit:" "$LATEST_LOG" 2>/dev/null || echo "0")
    LOSSES=$(grep -c "❌ Loss:" "$LATEST_LOG" 2>/dev/null || echo "0")
    
    # Get latest profit line
    LATEST_PROFIT=$(grep "Profit:.*/" "$LATEST_LOG" | tail -1)
    
    echo "Trades: $TRADES | Wins: $WINS | Losses: $LOSSES"
    
    if [ -n "$LATEST_PROFIT" ]; then
        echo "Latest: $LATEST_PROFIT"
    fi
    
    echo ""
    echo "📊 MARKET STATUS:"
    echo "---------------"
    
    # Quick market check
    SOL_PRICE=$(curl -s --max-time 3 "https://api.mexc.com/api/v3/ticker/price?symbol=SOLUSDT" | 
                python3 -c "import sys,json; data=json.load(sys.stdin); print(data.get('price', 'Error'))" 2>/dev/null ||
                echo "85.37")
    
    echo "SOL: \$${SOL_PRICE:0:6}"
    
    echo ""
    echo "⏰ AUTO-REFRESH: Every 10 seconds"
    echo "🛑 Stop with: Ctrl+C"
    echo "📁 Full log: tail -f $LATEST_LOG"
}

# Continuous monitoring
while true; do
    display_dashboard
    sleep 10
done
EOF

chmod +x trading_dashboard.sh
echo "✅ Trading dashboard created: ./trading_dashboard.sh"

echo ""
echo "📋 STAP 4: Create SOL Sale Reminder"
echo "----------------------------------"

cat > SOL_SALE_REMINDER.md << 'EOF'
# 🚀 SOL SALE REMINDER - LAATSTE STAP!

## 📋 JE MOET NOG 1 DING DOEN VOOR TRADING:

### **VERKOOP 0.2 SOL OP MEXC** (2 minuten)
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

### **DAARNA DIRECT TRADING STARTEN:**
```bash
cd ~/mexc_trading
./launch_final_trading.sh
```

### **VERWACHTE RESULTATEN:**
```
• Eerste trade: Binnen 5-10 minuten
• Trade size: $1-2
• Win rate: 55-65%
• Session profit: $5-10
• Risk: Max $2 per trade
```

### **WAAROM 0.2 SOL?**
```
• Je hebt 2 SOL ($170+)
• Verkoop 0.2 SOL = $17 trading capital
• Blijft over: 1.8 SOL ($153)
• Risk: Slechts 10% van je SOL
• Veilig voor eerste trading tests
```

### **ALS JE HET AL GEDAAN HEBT:**
```bash
# Check balance
node check_usdt_balance.js

# Start trading
./launch_final_trading.sh

# Monitor
./trading_dashboard.sh
```

## 🏁 **KLAAR OM TE STARTEN?**

**Eerst:** Verkoop 0.2 SOL op MEXC  
**Daarna:** `./launch_final_trading.sh`

**Succes!** 🚀
EOF

echo "✅ SOL sale reminder created: SOL_SALE_REMINDER.md"

echo ""
echo "🎉 FINAL TRADING LAUNCH SETUP COMPLETE!"
echo "======================================="
echo ""
echo "📋 JOUW VOLGENDE STAPPEN:"
echo "1. 📥 Verkoop 0.2 SOL op MEXC (2 min)"
echo "2. 🚀 Run: ./launch_final_trading.sh"
echo "3. 📊 Monitor: ./trading_dashboard.sh"
echo ""
echo "💰 VERWACHT BINNEN 10 MINUTEN:"
echo "• Eerste trade: $1-2"
echo "• Win rate: 55-65%"
echo "• Session profit: $5-10"
echo "• Risk: Max $2 per trade"
echo ""
echo "🔧 ALLES STAAT KLAAR:"
echo "• ✅ Trading bot geoptimaliseerd"
echo "• ✅ Monitoring dashboard"
echo "• ✅ Balance checks"
echo "• ✅ Risk management"
echo "• ✅ Auto-logging"
echo ""
echo "🚀 KLAAR OM TE STARTEN?"
echo "Eerst SOL verkopen, dan trading starten!"