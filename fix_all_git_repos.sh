#!/bin/bash

echo "🔧 FIXING ALL GIT REPOSITORIES"
echo "==============================="
echo ""

WORKSPACE="/Users/clarenceetnel/.openclaw/workspace"
cd "$WORKSPACE" || { echo "❌ Cannot access workspace"; exit 1; }

REPOS=(
    "social-media-ai-pipeline"
    "zero-cost-ai-toolchain"
    "n8n-social-automation"
    "social-media-analytics-dashboard"
)

for REPO in "${REPOS[@]}"; do
    echo ""
    echo "🎯 Processing: $REPO"
    echo "────────────────────"
    
    if [ ! -d "$REPO" ]; then
        echo "   ❌ Directory not found!"
        continue
    fi
    
    cd "$REPO"
    echo "   📁 Directory: $(pwd)"
    
    if [ -d ".git" ]; then
        echo "   ✅ .git folder exists"
        echo "   🔗 Remote: $(git remote get-url origin 2>/dev/null || echo 'Not set')"
    else
        echo "   ❌ .git folder missing - initializing..."
        git init
        git add .
        git commit -m "Initial commit: $REPO"
        git branch -M main
        echo "   ✅ Git initialized"
    fi
    
    cd "$WORKSPACE"
done

echo ""
echo "🎉 ALL REPOSITORIES CHECKED"
echo ""
echo "🚀 Next steps:"
echo "1. Update remote URLs with token:"
echo "   git remote set-url origin https://TOKEN@github.com/myopenclaw/REPO_NAME.git"
echo ""
echo "2. Push to GitHub:"
echo "   git push -u origin main"
echo ""
echo "📊 Dashboard: http://localhost:3001/dashboard"