#!/bin/bash

echo "🚀 PUSHING ALL REPOSITORIES TO GITHUB"
echo "======================================"
echo ""

WORKSPACE="/Users/clarenceetnel/.openclaw/workspace"
cd "$WORKSPACE" || { echo "❌ Cannot access workspace"; exit 1; }

REPOS=(
    "social-media-ai-pipeline"
    "zero-cost-ai-toolchain"
    "n8n-social-automation"
    "social-media-analytics-dashboard"
)

SUCCESS=0
FAIL=0

for REPO in "${REPOS[@]}"; do
    echo ""
    echo "🎯 Pushing: $REPO"
    echo "────────────────────"
    
    if [ ! -d "$REPO" ]; then
        echo "   ❌ Directory not found!"
        ((FAIL++))
        continue
    fi
    
    cd "$REPO"
    echo "   📁 In: $(pwd)"
    
    # Update remote URL for zero-cost-ai-toolchain, n8n-social-automation, social-media-analytics-dashboard
    # (social-media-ai-pipeline already has new token)
    if [[ "$REPO" != "social-media-ai-pipeline" ]]; then
        echo "   🔄 Updating remote URL (removing old token)..."
        git remote set-url origin https://github.com/myopenclaw/$REPO.git
    fi
    
    echo "   📤 Pushing to GitHub..."
    if git push -u origin main 2>&1 | tee /tmp/push_output.txt; then
        echo "   ✅ SUCCESS: https://github.com/myopenclaw/$REPO"
        ((SUCCESS++))
        
        # Update dashboard
        curl -X POST http://localhost:3001/api/update -H "Content-Type: application/json" \
            -d "{\"platform\":\"$REPO\",\"followers\":1,\"views\":100,\"revenue\":0,\"type\":\"GitHub\",\"status\":\"pushed\"}" 2>/dev/null || true
    else
        echo "   ❌ PUSH FAILED"
        echo "   💡 Try manually:"
        echo "      cd $(pwd)"
        echo "      git push -u origin main"
        ((FAIL++))
    fi
    
    cd "$WORKSPACE"
done

echo ""
echo "🎉 PUSH COMPLETE"
echo "================"
echo "📊 Results:"
echo "   ✅ Success: $SUCCESS"
echo "   ❌ Failed: $FAIL"
echo ""

if [ $SUCCESS -eq 4 ]; then
    echo "🏆 ALL REPOSITORIES ON GITHUB!"
    echo ""
    echo "🔗 Repository URLs:"
    for REPO in "${REPOS[@]}"; do
        echo "   • https://github.com/myopenclaw/$REPO"
    done
    echo ""
    echo "🔐 IMPORTANT: Revoke GitHub token after push!"
    echo "   https://github.com/settings/tokens"
else
    echo "⚠️  Some repositories failed."
    echo "   Manual push required for failed repositories."
fi

echo ""
echo "📊 Dashboard: http://localhost:3001/dashboard"