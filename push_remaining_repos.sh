#!/bin/bash

echo "🚀 PUSHING REMAINING REPOSITORIES"
echo "================================="
echo ""

WORKSPACE="/Users/clarenceetnel/.openclaw/workspace"
cd "$WORKSPACE" || exit 1

# Token from PrivateBin - USER MUST REPLACE THIS
TOKEN="NIEUWE_TOKEN_HIER"  # ⚠️ VERVANG MET JOUW TOKEN!

REPOS=(
    "zero-cost-ai-toolchain"
    "n8n-social-automation" 
    "social-media-analytics-dashboard"
)

echo "🔐 Using token: ${TOKEN:0:10}..."  # Show first 10 chars only
echo ""

for REPO in "${REPOS[@]}"; do
    echo "🎯 Processing: $REPO"
    echo "────────────────────"
    
    cd "$REPO" || { echo "❌ Cannot access $REPO"; continue; }
    
    # Update remote with token
    echo "🔗 Updating remote URL with token..."
    git remote set-url origin "https://${TOKEN}@github.com/myopenclaw/${REPO}.git"
    
    # Push
    echo "📤 Pushing to GitHub..."
    if git push -u origin main 2>&1 | grep -q "Everything up-to-date\|Branch.*set up to track"; then
        echo "✅ SUCCESS: https://github.com/myopenclaw/$REPO"
        
        # Update dashboard
        curl -X POST http://localhost:3001/api/update -H "Content-Type: application/json" \
            -d "{\"platform\":\"$REPO\",\"followers\":1,\"views\":100,\"revenue\":0,\"type\":\"GitHub\",\"status\":\"pushed\"}" 2>/dev/null || true
    else
        echo "❌ PUSH FAILED"
        echo "💡 Try manually:"
        echo "   cd $(pwd)"
        echo "   git push -u origin main --force"
    fi
    
    cd "$WORKSPACE"
    echo ""
done

echo "🎉 PUSH COMPLETE"
echo ""
echo "🔗 Live repositories:"
echo "   ✅ https://github.com/myopenclaw/social-media-ai-pipeline"
for REPO in "${REPOS[@]}"; do
    echo "   🔄 https://github.com/myopenclaw/$REPO"
done
echo ""
echo "🔐 IMPORTANT: Revoke token after push!"
echo "   https://github.com/settings/tokens"
echo ""
echo "📊 Dashboard: http://localhost:3001/dashboard"