#!/bin/bash

echo "🔄 RESET AND PUSH SCRIPT"
echo "========================"
echo ""

cd /Users/clarenceetnel/.openclaw/workspace || exit 1

REPO="zero-cost-ai-toolchain"

echo "🎯 Processing: $REPO"
echo "────────────────────"

cd "$REPO" || { echo "❌ Repository not found"; exit 1; }

echo "1. 📁 Current directory: $(pwd)"
echo ""

echo "2. 🔗 Current remote URL:"
git remote get-url origin
echo ""

echo "3. 🔄 Resetting remote URL..."
git remote set-url origin https://github.com/myopenclaw/$REPO.git
echo "   ✅ Updated to: https://github.com/myopenclaw/$REPO.git"
echo ""

echo "4. 📤 Pushing to GitHub..."
echo ""
echo "   ⚠️  Terminal will ask for credentials:"
echo "   Username: myopenclaw"
echo "   Password: [Use your GitHub Personal Access Token]"
echo ""
echo "   If you don't have a token, create one at:"
echo "   https://github.com/settings/tokens"
echo "   Scope: 'repo' (FULL CONTROL)"
echo "   Expiration: 1 hour"
echo ""
echo "   Press Enter to continue..."
read -r

git push -u origin main

echo ""
echo "5. 🎯 If push failed:"
echo ""
echo "   A. Create new token: https://github.com/settings/tokens"
echo "   B. Update remote with token:"
echo "      git remote set-url origin https://TOKEN@github.com/myopenclaw/$REPO.git"
echo "      git push -u origin main"
echo ""
echo "   C. Force push:"
echo "      git push -u origin main --force"
echo ""
echo "📊 Dashboard: http://localhost:3001/dashboard"