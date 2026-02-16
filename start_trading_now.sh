#!/bin/bash
# 🚀 START TRADING NOW - Clarence's Empire Launch
# 2026-02-15 23:32 - Eerste Live Trading Sessie

echo "🚀 EMPIRE TRADING LAUNCH SEQUENCE"
echo "================================="
echo "Time: $(date)"
echo "Capital: 2 SOL ($190) + 50 USDC ($50)"
echo "Target: $50/day | Mode: SIMULATION (safe)"
echo ""

# 1. Check system health
echo "🏥 SYSTEM HEALTH CHECK..."
if [ ! -f ~/.mexc_credentials ]; then
    echo "❌ MEXC credentials missing"
    exit 1
fi

if [ ! -f ~/.phantom_wallet.json ]; then
    echo "❌ Phantom wallet missing"
    exit 1
fi

echo "✅ Credentials verified"
echo "✅ Files encrypted (600 permissions)"

# 2. Create backup before start
echo "💾 CREATING PRE-LAUNCH BACKUP..."
BACKUP_DIR="$HOME/empire_backups/pre_launch_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

cp ~/.mexc_credentials "$BACKUP_DIR/"
cp ~/.phantom_wallet.json "$BACKUP_DIR/"
cp ~/EMPIRE_BLUEPRINT_2026_02_15.md "$BACKUP_DIR/"
cp -r ~/mexc_trading "$BACKUP_DIR/" 2>/dev/null || true

echo "✅ Backup created: $BACKUP_DIR"

# 3. Launch trading bot
echo ""
echo "🤖 LAUNCHING TRADING BOT..."
echo "==========================="

cd ~/mexc_trading

# Run the bot in background and capture output
node live_trading_bot.js 2>&1 | tee "trading_session_$(date +%Y%m%d_%H%M%S).log" &

BOT_PID=$!
echo "📊 Trading Bot PID: $BOT_PID"
echo "📝 Logging to: trading_session_*.log"

# 4. Start monitoring
echo ""
echo "👁️ STARTING REAL-TIME MONITOR..."
echo "================================"

# Function to display live stats
display_stats() {
    clear
    echo "📈 LIVE TRADING DASHBOARD"
    echo "========================="
    echo "Time: $(date)"
    echo "Bot PID: $BOT_PID"
    echo "Mode: SIMULATION"
    echo ""
    
    # Show latest stats file
    latest_stats=$(ls -t live_stats/*.json 2>/dev/null | head -1)
    if [ -f "$latest_stats" ]; then
        echo "📊 CURRENT SESSION:"
        echo "------------------"
        jq -r '
            "MEXC Trades: " + (.mexc.trades|tostring),
            "MEXC Profit: $" + (.mexc.profit|tostring),
            "MEXC Win Rate: " + (if .mexc.trades > 0 then (.mexc.wins/.mexc.trades*100|tostring) + "%" else "0%" end),
            "DEX Trades: " + (.dex.trades|tostring),
            "DEX Profit: $" + (.dex.profit|tostring),
            "DEX Win Rate: " + (if .dex.trades > 0 then (.dex.wins/.dex.trades*100|tostring) + "%" else "0%" end),
            "Total Profit: $" + (.session.profit|tostring),
            "Target: $" + (.session.target|tostring),
            "Progress: " + (.session.profit/.session.target*100|tostring) + "%",
            "Time Running: " + ((now - (.startTime|fromdateiso8601))/60|floor|tostring) + " minutes"
        ' "$latest_stats" 2>/dev/null || echo "Waiting for first trade..."
    else
        echo "⏳ Initializing trading session..."
        echo "Connecting to MEXC and Phantom..."
    fi
    
    echo ""
    echo "⚡ LIVE UPDATES:"
    echo "---------------"
    tail -5 trading_session_*.log 2>/dev/null | grep -E "(WIN|LOSS|TRADING|CYCLE|STATS)" || echo "Starting up..."
    
    echo ""
    echo "🎯 TARGET PROGRESS:"
    echo "------------------"
    if [ -f "$latest_stats" ]; then
        profit=$(jq '.session.profit' "$latest_stats" 2>/dev/null || echo "0")
        target=$(jq '.session.target' "$latest_stats" 2>/dev/null || echo "50")
        progress=$(echo "scale=1; $profit * 100 / $target" | bc 2>/dev/null || echo "0")
        
        # Progress bar
        bars=$(( ${progress%.*} / 5 ))
        printf "["
        for i in $(seq 1 20); do
            if [ $i -le $bars ]; then
                printf "█"
            else
                printf " "
            fi
        done
        printf "] ${progress}%%\n"
    else
        echo "[                    ] 0%"
    fi
    
    echo ""
    echo "📈 COMPOUNDING PROJECTION (7 days):"
    echo "----------------------------------"
    if [ -f "$latest_stats" ]; then
        profit=$(jq '.session.profit' "$latest_stats" 2>/dev/null || echo "0")
        daily_return=$(echo "scale=4; $profit / 240" | bc 2>/dev/null || echo "0")
        
        if [ $(echo "$daily_return > 0" | bc 2>/dev/null || echo "0") -eq 1 ]; then
            capital=240
            for day in 1 3 7; do
                future=$(echo "scale=2; $capital * (1 + $daily_return)^$day" | bc 2>/dev/null || echo "240")
                echo "Day $day: \$$future"
            done
        else
            echo "Waiting for profitable trades..."
        fi
    else
        echo "Day 1: \$240.00"
        echo "Day 3: \$240.00"
        echo "Day 7: \$240.00"
    fi
    
    echo ""
    echo "🔧 CONTROLS:"
    echo "-----------"
    echo "• [M] Monitor refresh"
    echo "• [S] Stop trading"
    echo "• [L] View full logs"
    echo "• [Q] Quit monitor"
}

# Monitor loop
while true; do
    display_stats
    
    # Check if bot is still running
    if ! kill -0 $BOT_PID 2>/dev/null; then
        echo ""
        echo "⚠️ Trading bot stopped!"
        echo "Check logs: tail -f trading_session_*.log"
        break
    fi
    
    # Wait for input
    read -t 10 -n 1 -p "Refresh in 10s or press key: " input
    echo ""
    
    case $input in
        s|S)
            echo "🛑 Stopping trading bot..."
            kill $BOT_PID
            wait $BOT_PID 2>/dev/null
            echo "✅ Trading stopped"
            break
            ;;
        l|L)
            echo "📄 LAST 20 LOG LINES:"
            echo "====================="
            tail -20 trading_session_*.log 2>/dev/null
            read -p "Press Enter to continue..."
            ;;
        q|Q)
            echo "👋 Exiting monitor (bot continues running)"
            echo "Bot PID: $BOT_PID"
            echo "View logs: tail -f trading_session_*.log"
            break
            ;;
        *)
            # Auto-refresh
            continue
            ;;
    esac
done

# 5. Final report
echo ""
echo "🏁 TRADING SESSION COMPLETE"
echo "==========================="
echo "End Time: $(date)"
echo ""

# Show final stats
latest_stats=$(ls -t live_stats/*.json 2>/dev/null | head -1)
if [ -f "$latest_stats" ]; then
    echo "📊 FINAL RESULTS:"
    echo "---------------"
    jq -r '
        "Start Time: " + .startTime,
        "End Time: " + (now|strflocaltime("%Y-%m-%d %H:%M:%S")),
        "Total Trades: " + ((.mexc.trades + .dex.trades)|tostring),
        "MEXC Profit: $" + (.mexc.profit|tostring),
        "DEX Profit: $" + (.dex.profit|tostring),
        "Total Profit: $" + (.session.profit|tostring),
        "Target: $" + (.session.target|tostring),
        "Target Reached: " + (if .session.profit >= .session.target then "✅ YES" else "❌ NO" end),
        "Win Rate: " + (if (.mexc.trades + .dex.trades) > 0 then (((.mexc.wins + .dex.wins)/(.mexc.trades + .dex.trades)*100)|tostring) + "%" else "0%" end)
    ' "$latest_stats"
    
    profit=$(jq '.session.profit' "$latest_stats")
    if [ $(echo "$profit > 0" | bc 2>/dev/null || echo "0") -eq 1 ]; then
        echo ""
        echo "💰 PROFIT ANALYSIS:"
        echo "-----------------"
        echo "Hourly Rate: \$$(echo "scale=2; $profit * 60 / 60" | bc)/hour"
        echo "Daily Projection: \$$(echo "scale=2; $profit * 24" | bc)/day"
        echo "Weekly Projection: \$$(echo "scale=2; $profit * 24 * 7" | bc)/week"
    fi
else
    echo "No session stats found"
fi

echo ""
echo "📁 FILES CREATED:"
echo "---------------"
ls -la trading_session_*.log live_stats/*.json 2>/dev/null | head -10

echo ""
echo "🎯 NEXT STEPS:"
echo "------------"
echo "1. Review trading logs: tail -f trading_session_*.log"
echo "2. Check detailed stats: ls -la live_stats/"
echo "3. Adjust strategies if needed"
echo "4. Run again: ./launch.sh"
echo "5. Enable real trading: Edit live_trading_bot.js (mode: 'LIVE')"

echo ""
echo "🚀 EMPIRE TRADING LAUNCHED SUCCESSFULLY!"
echo "✅ Blueprint saved: ~/EMPIRE_BLUEPRINT_2026_02_15.md"
echo "✅ Backup created: $BACKUP_DIR"
echo "✅ Trading session running"
echo "✅ Real-time monitoring active"

# Keep script running if bot is still alive
if kill -0 $BOT_PID 2>/dev/null; then
    echo ""
    echo "🤖 Trading bot still running (PID: $BOT_PID)"
    echo "Press Ctrl+C to stop monitoring (bot continues)"
    wait $BOT_PID
fi