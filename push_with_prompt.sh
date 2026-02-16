#!/bin/bash

echo "🚀 GITHUB PUSH WITH PROMPT"
echo "=========================="
echo ""

cd /Users/clarenceetnel/.openclaw/workspace || exit 1

REPOS=(
    "zero-cost-ai-toolchain"
    "n8n-social-automation"
    "social-media-analytics-dashboard"
)

echo "📋 Repositories to push:"
for REPO in "${REPOS[@]}"; do
    echo "   • $REPO"
done
echo ""

echo "🔐 GitHub Token Instructions:"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Create token with 'repo' scope (1 hour expiration)"
echo "3. Copy token"
echo ""
echo "Press Enter when you have token..."
read -r

echo ""
echo "📤 Starting push process..."
echo ""

for REPO in "${REPOS[@]}"; do
    echo "🎯 Pushing: $REPO"
    echo "────────────────────"
    
    cd "$REPO" || { echo "   ❌ Cannot access $REPO"; continue; }
    
    echo "   🔗 Updating remote URL..."
    echo "   ⚠️  Enter your GitHub token:"
    read -r TOKEN
    
    git remote set-url origin "https://${TOKEN}@github.com/myopenclaw/${REPO}.git"
    
    echo "   📤 Pushing..."
    if git push -u origin main 2>&1 | grep -q "Everything up-to-date\|Branch.*set up to track"; then
        echo "   ✅ SUCCESS: https://github.com/myopenclaw/$REPO"
        
        # Update dashboard
        curl -X POST http://localhost:3001/api/update -H "Content-Type: application/json" \
            -d "{\"platform\":\"$REPO\",\"followers\":1,\"views\":100,\"revenue\":0,\"type\":\"GitHub\",\"status\":\"pushed\"}" 2>/dev/null || true
    else
        echo "   ❌ PUSH FAILED"
        echo "   💡 Try: git push -u origin main --force"
    fi
    
    cd ..
    echo ""
done

echo "🎉 PUSH COMPLETE"
echo ""
echo "🔐 IMPORTANT: Revoke your GitHub token now!"
echo "   https://github.com/settings/tokens"
echo ""
echo "📊 Dashboard: http://localhost:3001/dashboard"