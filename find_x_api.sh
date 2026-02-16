#!/bin/bash
echo "🔍 X.COM API SEARCH SCRIPT"
echo "=========================="
echo "Searching for X.com/Twitter API credentials..."
echo ""

# 1. Check common locations
echo "📁 CHECKING COMMON LOCATIONS:"
echo "-----------------------------"

# Environment variables
echo "1. Environment variables:"
env | grep -i -E "twitter|x\.com|bearer|api.*key|api.*secret" | head -5

# Home directory config files
echo ""
echo "2. Config files in home:"
ls -la ~/.* 2>/dev/null | grep -i -E "twitter|x|api|cred" | head -10

# Specific known files
echo ""
echo "3. Known credential files:"
for file in ~/.twitter ~/.x ~/.api_keys ~/.credentials ~/.env; do
    if [ -f "$file" ]; then
        echo "   Found: $file"
        grep -i -E "twitter|x\.com|bearer" "$file" 2>/dev/null | head -3
    fi
done

# 2. Check OpenClaw config
echo ""
echo "🔧 CHECKING OPENCLAW CONFIG:"
echo "---------------------------"
if [ -f ~/.openclaw/config.yaml ]; then
    echo "OpenClaw config found"
    grep -i -B2 -A2 "twitter\|x.com" ~/.openclaw/config.yaml 2>/dev/null || echo "   No X.com config found"
else
    echo "No OpenClaw config found"
fi

# 3. Check for encrypted files
echo ""
echo "🔐 CHECKING ENCRYPTED/ARCHIVED FILES:"
echo "------------------------------------"
find ~ -name "*.gpg" -o -name "*.asc" -o -name "*.enc" 2>/dev/null | head -5 | while read file; do
    echo "   Found encrypted: $file"
done

# 4. Check recent downloads
echo ""
echo "📥 CHECKING RECENT DOWNLOADS/DOCUMENTS:"
echo "--------------------------------------"
find ~/Downloads ~/Documents -name "*.txt" -o -name "*.md" -o -name "*.json" 2>/dev/null | \
    xargs grep -l -i "twitter\|x\.com\|api.*key" 2>/dev/null | head -5

# 5. Check browser saved passwords (macOS)
echo ""
echo "🌐 CHECKING BROWSER SAVED PASSWORDS (macOS):"
echo "-------------------------------------------"
if command -v security &> /dev/null; then
    echo "Checking Keychain for Twitter/X entries..."
    security find-internet-password -s "twitter.com" 2>/dev/null && echo "   ✅ Twitter.com entry found"
    security find-internet-password -s "x.com" 2>/dev/null && echo "   ✅ X.com entry found"
    security find-generic-password -a "api" 2>/dev/null | grep -i "twitter\|x" | head -3
fi

# 6. Check process environment
echo ""
echo "⚙️ CHECKING RUNNING PROCESSES WITH API KEYS:"
echo "------------------------------------------"
ps aux | grep -i -E "twitter|x\.com" | head -5

# 7. Quick test with common patterns
echo ""
echo "🧪 QUICK TEST FOR COMMON PATTERNS:"
echo "---------------------------------"
echo "Testing for common API key patterns in home directory..."

# Look for 25-50 character strings that look like API keys
find ~ -type f -name "*.txt" -o -name "*.md" -o -name "*.json" -o -name "*.yaml" -o -name "*.yml" 2>/dev/null | \
    head -20 | while read file; do
    if grep -q -E "[A-Za-z0-9]{25,50}" "$file" 2>/dev/null; then
        echo "   File with potential API key: $file"
        grep -o -E "[A-Za-z0-9]{25,50}" "$file" 2>/dev/null | head -2
    fi
done

echo ""
echo "🔍 SEARCH COMPLETE!"
echo "=================="
echo ""
echo "📋 NEXT STEPS IF NO API FOUND:"
echo "1. Create new X.com API: https://developer.twitter.com"
echo "2. Save keys securely"
echo "3. Configure in OpenClaw"
echo "4. Test with provided scripts"
echo ""
echo "💡 TIP: Check your password manager (LastPass, 1Password, etc.)"
echo "💡 TIP: Check email for 'API key' or 'developer' messages"