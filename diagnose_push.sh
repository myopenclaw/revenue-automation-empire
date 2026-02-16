#!/bin/bash

echo "🔍 DIAGNOSING GITHUB PUSH ISSUES"
echo "================================"
echo ""

echo "1. 📂 Checking local repository..."
cd /Users/clarenceetnel/.openclaw/workspace/social-media-ai-pipeline 2>/dev/null
if [ $? -ne 0 ]; then
    echo "   ❌ Local repository not found"
    exit 1
fi
echo "   ✅ Local repository exists"

echo ""
echo "2. 🔗 Checking git remote..."
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE_URL" ]; then
    echo "   ❌ No remote origin set"
    echo "   Run: git remote add origin https://github.com/myopenclaw/social-media-ai-pipeline.git"
else
    echo "   ✅ Remote: $REMOTE_URL"
fi

echo ""
echo "3. 🌐 Checking GitHub repository..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://github.com/myopenclaw/social-media-ai-pipeline)
if [ "$STATUS" = "200" ]; then
    echo "   ✅ Repository exists on GitHub (Status: $STATUS)"
elif [ "$STATUS" = "404" ]; then
    echo "   ❌ Repository NOT FOUND on GitHub (Status: $STATUS)"
    echo "   Create at: https://github.com/new"
    echo "   Name: social-media-ai-pipeline"
    echo "   DO NOT initialize with README"
else
    echo "   ⚠️  GitHub status: $STATUS"
fi

echo ""
echo "4. 🔐 Testing authentication (needs token)..."
echo "   Please run manually:"
echo "   curl -H \"Authorization: token YOUR_TOKEN\" https://api.github.com/user"
echo "   Should return: {\"login\":\"myopenclaw\", ...}"

echo ""
echo "5. 🚀 Try these fixes:"
echo ""
echo "   A. If repository doesn't exist:"
echo "      https://github.com/new → Create repository"
echo ""
echo "   B. If authentication fails:"
echo "      https://github.com/settings/tokens → New token with 'repo' scope"
echo ""
echo "   C. Force push:"
echo "      git push -u origin main --force"
echo ""
echo "   D. Update remote:"
echo "      git remote set-url origin https://github.com/myopenclaw/social-media-ai-pipeline.git"
echo ""
echo "📊 Dashboard: http://localhost:3001/dashboard"