#!/bin/bash

TOKEN="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"

echo "🔐 Testing token: ${TOKEN:0:20}..."
RESPONSE=$(curl -s -H "Authorization: token $TOKEN" https://api.github.com/user 2>/dev/null)

if echo "$RESPONSE" | grep -q '"login":"myopenclaw"'; then
  echo "✅ Token valid"
else
  echo "❌ Token invalid or error"
  echo "Response: $RESPONSE"
  exit 1
fi

echo ""
echo "🚀 Pushing repositories..."
echo ""

cd /Users/clarenceetnel/.openclaw/workspace || exit 1

REPOS=(
    "zero-cost-ai-toolchain"
    "n8n-social-automation"
    "social-media-analytics-dashboard"
)

for REPO in "${REPOS[@]}"; do
    echo "🎯 $REPO"
    
    cd "$REPO" || { echo "   ❌ Cannot access"; continue; }
    
    echo "   🔗 Updating remote..."
    git remote set-url origin "https://${TOKEN}@github.com/myopenclaw/${REPO}.git"
    
    echo "   📤 Pushing..."
    if git push -u origin main 2>&1 | grep -q "Everything up-to-date\|Branch.*set up to track"; then
        echo "   ✅ SUCCESS"
    else
        echo "   ❌ FAILED"
    fi
    
    cd ..
    echo ""
done

echo "📊 Dashboard: http://localhost:3001/dashboard"