#!/bin/bash

echo "🚀 Pushing to GitHub: myopenclaw"
echo "================================"

cd /Users/clarenceetnel/.openclaw/workspace

REPOS=(
    "social-media-ai-pipeline"
    "zero-cost-ai-toolchain"
    "n8n-social-automation"
    "social-media-analytics-dashboard"
)

for REPO in "${REPOS[@]}"; do
    echo ""
    echo "🎯 Processing: $REPO"
    
    if [ ! -d "$REPO" ]; then
        echo "   ⚠️  Repository not found: $REPO"
        continue
    fi
    
    cd "$REPO"
    
    # Update remote to myopenclaw
    git remote set-url origin "https://github.com/myopenclaw/$REPO.git"
    
    # Check if repository exists on GitHub
    echo "   Checking GitHub repository..."
    if curl -s "https://github.com/myopenclaw/$REPO" | grep -q "404"; then
        echo "   ⚠️  Repository not found on GitHub. Create it first at:"
        echo "   https://github.com/new"
        echo "   Name: $REPO"
        echo "   Public repository"
        echo "   DO NOT initialize with README"
        echo ""
        echo "   Press Enter after creating repository..."
        read
    fi
    
    # Push to GitHub
    echo "   Pushing to GitHub..."
    if git push -u origin main 2>/dev/null; then
        echo "   ✅ Success! https://github.com/myopenclaw/$REPO"
    else
        echo "   ⚠️  Push failed. Creating repository first..."
        echo "   Please create: https://github.com/new"
        echo "   Then press Enter to retry..."
        read
        git push -u origin main 2>/dev/null && echo "   ✅ Success!" || echo "   ❌ Failed. Check manually."
    fi
    
    cd ..
done

echo ""
echo "🎉 PUSH COMPLETE!"
echo "================="
echo ""
echo "📦 Repositories pushed to:"
echo "   https://github.com/myopenclaw"
echo ""
echo "🚀 Next: Enable GitHub Pages for each repository"
echo "   Settings → Pages → Source: main branch"
echo ""
echo "💰 Monetization ready!"
echo "   GitHub Sponsors: https://github.com/sponsors"
echo "   Consulting: €200/hour"
echo "   Courses: €50-€500 each"
echo "   Enterprise: €5,000+/project"