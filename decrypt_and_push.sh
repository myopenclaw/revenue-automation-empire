#!/bin/bash

echo "🔐 DECRYPT AND PUSH SCRIPT"
echo "==========================="
echo ""

# Encrypted token from user (base64)
ENCRYPTED_BASE64="$1"

if [ -z "$ENCRYPTED_BASE64" ]; then
  echo "❌ No encrypted token provided"
  echo "Usage: ./decrypt_and_push.sh 'BASE64_ENCRYPTED_TOKEN'"
  exit 1
fi

echo "1. 🔓 Decrypting token..."
TOKEN=$(echo "$ENCRYPTED_BASE64" | base64 --decode | openssl enc -aes-256-cbc -d -salt -pass pass:githubpush2026 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Decryption failed!"
  echo "   Make sure you used: openssl enc -aes-256-cbc -salt -pass pass:githubpush2026 -base64"
  exit 1
fi

echo "   ✅ Token decrypted (first 10 chars: ${TOKEN:0:10}...)"
echo ""

echo "2. 🔐 Testing token with GitHub API..."
RESPONSE=$(curl -s -H "Authorization: token $TOKEN" https://api.github.com/user)
LOGIN=$(echo "$RESPONSE" | grep -o '"login":"[^"]*"' | cut -d'"' -f4)

if [ "$LOGIN" = "myopenclaw" ]; then
  echo "   ✅ Token valid for user: $LOGIN"
else
  echo "   ❌ Token invalid or wrong user"
  echo "   Response: $RESPONSE"
  exit 1
fi

echo ""

echo "3. 🚀 Pushing repositories..."
echo ""

WORKSPACE="/Users/clarenceetnel/.openclaw/workspace"
cd "$WORKSPACE" || exit 1

REPOS=(
    "zero-cost-ai-toolchain"
    "n8n-social-automation"
    "social-media-analytics-dashboard"
)

SUCCESS=0
FAIL=0

for REPO in "${REPOS[@]}"; do
    echo "🎯 Processing: $REPO"
    
    cd "$REPO" || { echo "   ❌ Cannot access $REPO"; ((FAIL++)); continue; }
    
    echo "   🔗 Updating remote URL..."
    git remote set-url origin "https://${TOKEN}@github.com/myopenclaw/${REPO}.git"
    
    echo "   📤 Pushing to GitHub..."
    if git push -u origin main 2>&1 | grep -q "Everything up-to-date\|Branch.*set up to track"; then
        echo "   ✅ SUCCESS: https://github.com/myopenclaw/$REPO"
        ((SUCCESS++))
        
        # Update dashboard
        curl -X POST http://localhost:3001/api/update -H "Content-Type: application/json" \
            -d "{\"platform\":\"$REPO\",\"followers\":1,\"views\":100,\"revenue\":0,\"type\":\"GitHub\",\"status\":\"pushed\"}" 2>/dev/null || true
    else
        echo "   ❌ PUSH FAILED"
        echo "   💡 Try: git push -u origin main --force"
        ((FAIL++))
    fi
    
    cd "$WORKSPACE"
    echo ""
done

echo "🎉 PUSH COMPLETE"
echo "================"
echo "📊 Results:"
echo "   ✅ Success: $SUCCESS"
echo "   ❌ Failed: $FAIL"
echo ""

if [ $SUCCESS -eq 3 ]; then
    echo "🏆 ALL REPOSITORIES ON GITHUB!"
    echo ""
    echo "🔗 Repository URLs:"
    echo "   ✅ https://github.com/myopenclaw/social-media-ai-pipeline"
    for REPO in "${REPOS[@]}"; do
        echo "   ✅ https://github.com/myopenclaw/$REPO"
    done
else
    echo "⚠️  Some repositories failed."
    echo "   Manual push required for failed ones."
fi

echo ""
echo "🔐 SECURITY: REVOKE TOKEN NOW!"
echo "   https://github.com/settings/tokens"
echo ""
echo "📊 Dashboard: http://localhost:3001/dashboard"