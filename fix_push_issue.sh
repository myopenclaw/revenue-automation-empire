#!/bin/bash

echo "🔧 FIXING PUSH ISSUE FOR zero-cost-ai-toolchain"
echo "==============================================="
echo ""

cd /Users/clarenceetnel/.openclaw/workspace/zero-cost-ai-toolchain || {
  echo "❌ Cannot access repository"
  exit 1
}

echo "📁 Current directory: $(pwd)"
echo ""

echo "1. 🔗 Current remote URL:"
REMOTE_URL=$(git remote get-url origin)
echo "   $REMOTE_URL"
echo ""

echo "2. 🔄 Updating remote URL (removing old token)..."
git remote set-url origin https://github.com/myopenclaw/zero-cost-ai-toolchain.git
echo "   ✅ Updated to: https://github.com/myopenclaw/zero-cost-ai-toolchain.git"
echo ""

echo "3. 📤 Attempting push..."
echo "   ⚠️  Terminal will ask for credentials:"
echo "   Username: myopenclaw"
echo "   Password: [Use NIEUWE_TOKEN from PrivateBin]"
echo ""
echo "   Running git push -u origin main..."
echo "   ----------------------------------"

git push -u origin main

echo ""
echo "4. 🎯 If push failed, try these:"
echo ""
echo "   A. Update with new token:"
echo "      git remote set-url origin https://NIEUWE_TOKEN@github.com/myopenclaw/zero-cost-ai-toolchain.git"
echo "      git push -u origin main"
echo ""
echo "   B. Force push:"
echo "      git push -u origin main --force"
echo ""
echo "   C. Clear credentials and retry:"
echo "      git credential-osxkeychain erase"
echo "      host=github.com"
echo "      protocol=https"
echo "      git push -u origin main"
echo ""
echo "📊 Dashboard: http://localhost:3001/dashboard"