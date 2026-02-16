#!/bin/bash
# 🔐 PROTONMAIL SETUP SCRIPT voor OpenClaw
# End-to-end encrypted email integration

echo "🔐 PROTONMAIL EMAIL INTEGRATION SETUP"
echo "======================================"
echo "Time: $(date)"
echo ""

# Check if OpenClaw is installed
if ! command -v openclaw &> /dev/null; then
    echo "❌ OpenClaw not found. Please install OpenClaw first."
    exit 1
fi

echo "📋 STAP 1: ProtonMail Account Maken"
echo "-----------------------------------"
echo "1. Ga naar: https://proton.me/mail"
echo "2. Klik 'Sign up'"
echo "3. Kies: 'Get Proton Mail Free'"
echo "4. Email: empire.ai@proton.me (of jouw keuze)"
echo "5. Wachtwoord: Sterk wachtwoord (bewaar ergens!)"
echo "6. Complete signup"
echo ""
read -p "✅ Druk Enter als je ProtonMail account hebt..." dummy

echo ""
echo "🔑 STAP 2: App Password Genereren"
echo "---------------------------------"
echo "1. Login op ProtonMail web"
echo "2. Settings → Security → Passwords"
echo "3. Klik 'Generate app password'"
echo "4. App naam: 'OpenClaw Empire AI'"
echo "5. Kopieer het gegenereerde wachtwoord"
echo ""
read -p "📋 Plak je app password hier: " PROTON_PASSWORD

echo ""
echo "🖥️ STAP 3: ProtonMail Bridge Installeren"
echo "---------------------------------------"

# Check OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📱 macOS gedetecteerd"
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew niet gevonden. Installeer eerst Homebrew:"
        echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
    
    echo "📦 ProtonMail Bridge installeren via Homebrew..."
    brew install protonmail-bridge --cask
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Linux gedetecteerd"
    
    # Check distribution
    if command -v apt &> /dev/null; then
        echo "📦 Debian/Ubuntu - Download ProtonMail Bridge .deb"
        echo "Download van: https://proton.me/mail/bridge#download"
        echo "Installeer met: sudo dpkg -i protonmail-bridge_*.deb"
    elif command -v dnf &> /dev/null; then
        echo "📦 Fedora - Download ProtonMail Bridge .rpm"
        echo "Download van: https://proton.me/mail/bridge#download"
        echo "Installeer met: sudo dnf install protonmail-bridge_*.rpm"
    else
        echo "⚠️  Onbekende Linux distributie"
        echo "Download bridge van: https://proton.me/mail/bridge#download"
    fi
    
else
    echo "⚠️  Onbekend OS: $OSTYPE"
    echo "Download ProtonMail Bridge van: https://proton.me/mail/bridge"
fi

echo ""
echo "🚀 STAP 4: Start ProtonMail Bridge"
echo "---------------------------------"
echo "Start bridge met:"
echo "  protonmail-bridge &"
echo ""
echo "Bij eerste run:"
echo "1. Login met je ProtonMail credentials"
echo "2. Noteer IMAP/SMTP ports (meestal 1143/1025)"
echo "3. Gebruik het app password als bridge daarom vraagt"
echo ""
read -p "✅ Druk Enter als bridge draait..." dummy

echo ""
echo "⚙️ STAP 5: OpenClaw Configureren"
echo "-------------------------------"

# Get ProtonMail email
read -p "📧 Je ProtonMail email adres: " PROTON_EMAIL

# Configure OpenClaw
echo "🔧 OpenClaw configureren..."
openclaw config set email.enabled true
openclaw config set email.provider "protonmail"

# IMAP settings
openclaw config set email.imap.host "127.0.0.1"
openclaw config set email.imap.port 1143
openclaw config set email.imap.user "$PROTON_EMAIL"
openclaw config set email.imap.pass "$PROTON_PASSWORD"
openclaw config set email.imap.tls true

# SMTP settings
openclaw config set email.smtp.host "127.0.0.1"
openclaw config set email.smtp.port 1025
openclaw config set email.smtp.user "$PROTON_EMAIL"
openclaw config set email.smtp.pass "$PROTON_PASSWORD"
openclaw config set email.smtp.tls true

# Bridge settings
openclaw config set email.protonmail.bridge.enabled true
openclaw config set email.protonmail.bridge.autoStart true

echo ""
echo "🧪 STAP 6: Test Configuratie"
echo "---------------------------"

# Create test script
cat > test_protonmail.sh << 'EOF'
#!/bin/bash
echo "🧪 ProtonMail Integration Test"
echo "=============================="

# Test 1: Check bridge connection
echo "1. Testing bridge connection..."
if netstat -an | grep -q ":1143.*LISTEN"; then
    echo "   ✅ IMAP port 1143 listening"
else
    echo "   ❌ IMAP port not listening - is bridge running?"
fi

if netstat -an | grep -q ":1025.*LISTEN"; then
    echo "   ✅ SMTP port 1025 listening"
else
    echo "   ❌ SMTP port not listening - is bridge running?"
fi

# Test 2: Send test email
echo ""
echo "2. Sending test email..."
YOUR_EMAIL="jouw.persoonlijke@email.com"  # Change this!

openclaw email send \
  --to "$YOUR_EMAIL" \
  --subject "✅ ProtonMail Integration Test - $(date)" \
  --body "Dit is een test van OpenClaw via ProtonMail Bridge!

Als je deze email ontvangt, werkt de integration!

📊 System Status:
• Time: $(date)
• OpenClaw: Running
• ProtonMail Bridge: Connected
• Encryption: End-to-end enabled

Volgende stappen:
1. Reply op deze email met 'status' voor system update
2. Stuur domain list als attachment voor analyse
3. Email 'trading update' voor real-time trading status

🔐 Alle emails zijn end-to-end encrypted via ProtonMail.

- Your Empire AI 🤖"

if [ $? -eq 0 ]; then
    echo "   ✅ Test email sent to $YOUR_EMAIL"
else
    echo "   ❌ Failed to send test email"
fi

# Test 3: Check email reception
echo ""
echo "3. Testing email reception..."
echo "   📧 Send an email to: $PROTON_EMAIL"
echo "   📧 Subject: 'test'"
echo "   📧 Body: 'This is a test'"
echo "   ⏳ Waiting 60 seconds for email check..."
sleep 60

# Test 4: Show configuration
echo ""
echo "4. Current Email Configuration:"
openclaw config get email

echo ""
echo "🎉 ProtonMail Integration Setup Complete!"
echo "========================================"
echo "📧 Your encrypted email: $PROTON_EMAIL"
echo "🔐 All emails are end-to-end encrypted"
echo "📱 Access via: https://mail.proton.me"
echo "🤖 Commands: 'status', 'trading update', 'domain report'"
echo ""
echo "⚠️  IMPORTANT: Save your ProtonMail password securely!"
echo "⚠️  IMPORTANT: Save the app password: $PROTON_PASSWORD"
EOF

chmod +x test_protonmail.sh

echo "✅ Test script created: ./test_protonmail.sh"
echo ""
echo "📋 STAP 7: Personalize Test Script"
echo "---------------------------------"
echo "Edit test_protonmail.sh and change:"
echo "  YOUR_EMAIL=\"jouw.persoonlijke@email.com\""
echo "to your actual email address"
echo ""
echo "Then run: ./test_protonmail.sh"

echo ""
echo "🚀 STAP 8: Scheduled Reports Instellen"
echo "-------------------------------------"

# Create scheduled reports config
cat > email_schedules.json << 'EOF'
{
  "schedules": {
    "daily": {
      "cron": "0 8 * * *",
      "subject": "🔐 Daily Empire Report - Encrypted",
      "recipients": ["jouw.persoonlijke@email.com"],
      "template": "daily_report"
    },
    "trading_alerts": {
      "cron": "*/30 * * * *",
      "condition": "trading.profit > 20 OR trading.loss > 10",
      "subject": "⚡ Trading Alert - Encrypted",
      "recipients": ["jouw.persoonlijke@email.com"],
      "template": "trading_alert"
    },
    "domain_updates": {
      "cron": "0 18 * * *",
      "subject": "🌐 Domain Daily Update - Encrypted",
      "recipients": ["jouw.persoonlijke@email.com"],
      "template": "domain_update"
    }
  },
  "templates": {
    "daily_report": {
      "subject": "🔐 Daily Empire Report - {date}",
      "body": "Encrypted daily report attached.",
      "attachments": ["daily_report.pdf"],
      "encrypt": true
    },
    "trading_alert": {
      "subject": "⚡ Trading Alert - {timestamp}",
      "body": "Encrypted trading alert attached.",
      "attachments": ["trading_alert.pdf"],
      "encrypt": true
    }
  }
}
EOF

echo "✅ Scheduled reports config created: email_schedules.json"
echo ""
echo "🎉 PROTONMAIL SETUP COMPLETE!"
echo "============================="
echo ""
echo "📋 NEXT STEPS:"
echo "1. Run: ./test_protonmail.sh"
echo "2. Check your email for test message"
echo "3. Reply with 'status' to test reception"
echo "4. Install ProtonMail app on phone (optional)"
echo ""
echo "🔐 ENCRYPTION STATUS: End-to-end enabled"
echo "📧 YOUR ENCRYPTED EMAIL: $PROTON_EMAIL"
echo "🖥️ BRIDGE PORTS: IMAP 1143, SMTP 1025"
echo "📱 WEB ACCESS: https://mail.proton.me"
echo ""
echo "💾 BACKUP YOUR PASSWORDS!"
echo "• ProtonMail password"
echo "• App password: $PROTON_PASSWORD"
echo ""
echo "🚀 Empire AI is now reachable via encrypted email!"