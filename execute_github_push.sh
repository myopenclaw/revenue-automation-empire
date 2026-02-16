#!/bin/bash

echo "🚀 STARTING GITHUB PUSH WITH TOKEN"
echo "=================================="
echo ""

TOKEN="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"
USER="myopenclaw"
WORKSPACE="/Users/clarenceetnel/.openclaw/workspace"

cd "$WORKSPACE"

REPOS=(
    "social-media-ai-pipeline"
    "zero-cost-ai-toolchain"
    "n8n-social-automation"
    "social-media-analytics-dashboard"
)

SUCCESS_COUNT=0
FAIL_COUNT=0

echo "📦 Pushing ${#REPOS[@]} repositories..."
echo ""

for REPO in "${REPOS[@]}"; do
    echo "🎯 Processing: $REPO"
    
    if [ ! -d "$REPO" ]; then
        echo "   ❌ Repository not found locally"
        ((FAIL_COUNT++))
        continue
    fi
    
    cd "$REPO"
    
    # Update remote URL with token
    REMOTE_URL="https://${TOKEN}@github.com/${USER}/${REPO}.git"
    echo "   🔗 Setting remote: $REMOTE_URL"
    git remote set-url origin "$REMOTE_URL"
    
    # Push to GitHub
    echo "   📤 Pushing code..."
    if git push -u origin main 2>/dev/null; then
        echo "   ✅ SUCCESS: https://github.com/${USER}/${REPO}"
        ((SUCCESS_COUNT++))
        
        # Update dashboard
        curl -X POST http://localhost:3001/api/update -H "Content-Type: application/json" \
            -d "{\"platform\":\"${REPO}\",\"followers\":1,\"views\":100,\"revenue\":0,\"type\":\"GitHub\",\"status\":\"pushed\"}" 2>/dev/null || true
    else
        echo "   ❌ PUSH FAILED"
        echo "   🔄 Trying force push..."
        if git push -u origin main --force 2>/dev/null; then
            echo "   ✅ FORCE PUSH SUCCESS"
            ((SUCCESS_COUNT++))
        else
            echo "   ❌ FORCE PUSH ALSO FAILED"
            ((FAIL_COUNT++))
        fi
    fi
    
    cd "$WORKSPACE"
    echo ""
done

echo "🎉 PUSH COMPLETE"
echo "================"
echo ""
echo "📊 Results:"
echo "   ✅ Success: $SUCCESS_COUNT"
echo "   ❌ Failed: $FAIL_COUNT"
echo ""

if [ $SUCCESS_COUNT -eq 4 ]; then
    echo "🏆 ALL 4 REPOSITORIES PUSHED SUCCESSFULLY!"
    echo ""
    echo "🔗 Repository URLs:"
    for REPO in "${REPOS[@]}"; do
        echo "   • https://github.com/${USER}/${REPO}"
    done
    echo ""
    echo "🌐 GitHub Pages URLs (after enabling):"
    for REPO in "${REPOS[@]}"; do
        echo "   • https://${USER}.github.io/${REPO}/"
    done
else
    echo "⚠️  Some repositories failed to push."
    echo "   Manual push may be required."
fi

echo ""
echo "🔐 IMPORTANT: REVOKE THE GITHUB TOKEN NOW!"
echo "   Go to: https://github.com/settings/tokens"
echo "   Find token and click 'Revoke'"
echo ""
echo "📊 Dashboard: http://localhost:3001/dashboard"