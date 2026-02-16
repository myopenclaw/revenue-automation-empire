#!/bin/bash
# 🔄 AUTO-FALLBACK MONITOR
# Monitor Ollama API, fallback to DeepSeek if down

echo "🔄 AUTO-FALLBACK MONITOR"
echo "======================="
echo "Monitoring Ollama API, auto-switching to DeepSeek if needed"
echo ""

OLLAMA_HEALTH="http://localhost:3000/v1/health"
FAILURE_COUNT=0
MAX_FAILURES=3
CURRENT_PROVIDER="ollama"

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Check Ollama health
    if curl -s --max-time 5 "$OLLAMA_HEALTH" | grep -q "healthy"; then
        if [ "$CURRENT_PROVIDER" != "ollama" ]; then
            echo "[$TIMESTAMP] ✅ Ollama restored, switching back from DeepSeek"
            CURRENT_PROVIDER="ollama"
            FAILURE_COUNT=0
        fi
    else
        FAILURE_COUNT=$((FAILURE_COUNT + 1))
        echo "[$TIMESTAMP] ⚠️  Ollama check failed ($FAILURE_COUNT/$MAX_FAILURES)"
        
        if [ $FAILURE_COUNT -ge $MAX_FAILURES ] && [ "$CURRENT_PROVIDER" = "ollama" ]; then
            echo "[$TIMESTAMP] 🚨 Switching to DeepSeek backup"
            CURRENT_PROVIDER="deepseek"
            
            # Send alert (you can add Telegram/email here)
            echo "ALERT: Switched to DeepSeek backup API" > /tmp/api_fallback_alert.txt
        fi
    fi
    
    # Display status
    echo -ne "[$TIMESTAMP] Provider: $CURRENT_PROVIDER | Failures: $FAILURE_COUNT\r"
    
    sleep 60  # Check every minute
done
