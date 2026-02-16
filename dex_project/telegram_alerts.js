// 🚀 DEX TELEGRAM ALERTS
// Real-time alerts for new listings

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

console.log('🚀 DEX TELEGRAM ALERTS SETUP');
console.log('============================\n');

// Configuration
const CONFIG = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN',
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || 'YOUR_CHAT_ID',
  
  // Alert thresholds
  MIN_LIQUIDITY_USD: 50000,
  MAX_AGE_HOURS: 6, // Very fresh listings
  MIN_PRICE_CHANGE: 0, // Any movement
  MAX_PRICE_CHANGE: 100, // Avoid extreme pumps
  
  // API
  DEXSCREENER_API: 'https://api.dexscreener.com/latest/dex',
  
  // Files
  SENT_ALERTS_FILE: path.join(__dirname, 'sent_alerts.json')
};

class TelegramAlerts {
  constructor() {
    this.sentAlerts = this.loadSentAlerts();
    console.log('📊 Telegram Alerts initialized');
    console.log('   Min liquidity: $' + CONFIG.MIN_LIQUIDITY_USD.toLocaleString());
    console.log('   Max age: ' + CONFIG.MAX_AGE_HOURS + ' hours');
    console.log('');
    
    if (!CONFIG.TELEGRAM_BOT_TOKEN || CONFIG.TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN') {
      console.log('⚠️  WARNING: Telegram bot token not configured');
      console.log('   Set TELEGRAM_BOT_TOKEN in .env file');
      console.log('   Get token from @BotFather on Telegram');
    }
  }
  
  loadSentAlerts() {
    try {
      if (fs.existsSync(CONFIG.SENT_ALERTS_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG.SENT_ALERTS_FILE, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading sent alerts:', error.message);
    }
    return {};
  }
  
  saveSentAlerts() {
    try {
      fs.writeFileSync(CONFIG.SENT_ALERTS_FILE, JSON.stringify(this.sentAlerts, null, 2));
    } catch (error) {
      console.error('Error saving sent alerts:', error.message);
    }
  }
  
  getPairAge(pair) {
    if (!pair.pairCreatedAt) return null;
    const created = new Date(pair.pairCreatedAt).getTime();
    return Math.floor((Date.now() - created) / (1000 * 60 * 60)); // hours
  }
  
  async sendTelegramAlert(pair, reason) {
    const pairKey = `${pair.chainId}:${pair.dexId}:${pair.pairAddress}`;
    
    // Check if already sent
    if (this.sentAlerts[pairKey]) {
      console.log('   ⏭️  Alert already sent for this pair');
      return false;
    }
    
    const age = this.getPairAge(pair);
    const liquidity = pair.liquidity?.usd || 0;
    const symbol = `${pair.baseToken.symbol}/${pair.quoteToken.symbol}`;
    
    // Create alert message
    const message = `
🚨 **NEW DEX LISTING ALERT** 🚨

**Pair:** ${symbol}
**DEX:** ${pair.dexId.toUpperCase()}
**Age:** ${age || 'N/A'} hours
**Liquidity:** $${liquidity.toLocaleString()}

📊 **Metrics:**
• Price: $${pair.priceUsd || 'N/A'}
• 24h Change: ${pair.priceChange?.h24 || 0}%
• Volume (24h): $${(pair.volume?.h24 || 0).toLocaleString()}
• Transactions (24h): ${pair.txns?.h24 || 0}

🎯 **Trade Setup:**
• Size: $20 (test)
• Stop Loss: -10%
• Take Profit: +25%
• Risk/Reward: 1:2.5

🔗 **Links:**
[Chart](${pair.url})
[DexScreener](https://dexscreener.com/${pair.chainId}/${pair.pairAddress})

⚠️ **High Risk - Small Size Only!**

${reason}
`.trim();
    
    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: CONFIG.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
          disable_web_page_preview: false
        },
        { timeout: 10000 }
      );
      
      if (response.data.ok) {
        console.log('   ✅ Telegram alert sent!');
        console.log('   Message ID:', response.data.result.message_id);
        
        // Mark as sent
        this.sentAlerts[pairKey] = {
          timestamp: new Date().toISOString(),
          pair: symbol,
          messageId: response.data.result.message_id
        };
        this.saveSentAlerts();
        
        return true;
      } else {
        console.log('   ❌ Telegram API error:', response.data.description);
        return false;
      }
    } catch (error) {
      console.log('   ❌ Telegram send failed:', error.message);
      return false;
    }
  }
  
  async scanAndAlert() {
    console.log('🔍 Scanning for alert-worthy listings...');
    
    try {
      // Scan multiple DEXes
      const dexes = ['raydium', 'orca', 'jupiter'];
      const allPairs = [];
      
      for (const dex of dexes) {
        try {
          const response = await axios.get(
            `${CONFIG.DEXSCREENER_API}/pairs/solana/${dex}`,
            { timeout: 10000 }
          );
          
          if (response.data && response.data.pairs) {
            allPairs.push(...response.data.pairs);
          }
        } catch (error) {
          console.log(`   ⚠️  ${dex}: ${error.message}`);
        }
      }
      
      console.log('   Total pairs found:', allPairs.length);
      
      // Filter for alerts
      const alertPairs = allPairs.filter(pair => {
        const age = this.getPairAge(pair);
        if (age === null || age > CONFIG.MAX_AGE_HOURS) return false;
        
        const liquidity = pair.liquidity?.usd || 0;
        if (liquidity < CONFIG.MIN_LIQUIDITY_USD) return false;
        
        const priceChange = pair.priceChange?.h24 || 0;
        if (priceChange > CONFIG.MAX_PRICE_CHANGE) return false;
        
        return true;
      });
      
      console.log('   Alert-worthy pairs:', alertPairs.length);
      
      // Send alerts
      for (const pair of alertPairs.slice(0, 5)) { // Limit to 5 alerts
        const age = this.getPairAge(pair);
        const liquidity = pair.liquidity?.usd || 0;
        const symbol = `${pair.baseToken.symbol}/${pair.quoteToken.symbol}`;
        
        console.log(`\n📨 Sending alert for: ${symbol}`);
        console.log(`   Age: ${age}h, Liquidity: $${liquidity.toLocaleString()}`);
        
        const reason = `New listing on ${pair.dexId} with $${liquidity.toLocaleString()} liquidity`;
        await this.sendTelegramAlert(pair, reason);
        
        // Delay between alerts
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      console.log('\n✅ Scan and alert completed!');
      
    } catch (error) {
      console.error('Scan error:', error.message);
    }
  }
  
  async testAlert() {
    console.log('\n🧪 TESTING TELEGRAM ALERT...');
    
    if (!CONFIG.TELEGRAM_BOT_TOKEN || CONFIG.TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN') {
      console.log('❌ Cannot test - Telegram bot token not configured');
      console.log('\n📋 SETUP INSTRUCTIONS:');
      console.log('1. Open Telegram, search for @BotFather');
      console.log('2. Send /newbot command');
      console.log('3. Follow instructions to create bot');
      console.log('4. Get API token from BotFather');
      console.log('5. Add to .env file:');
      console.log('   TELEGRAM_BOT_TOKEN=your_token_here');
      console.log('   TELEGRAM_CHAT_ID=your_chat_id');
      console.log('\n💡 Get chat ID by messaging @userinfobot');
      return;
    }
    
    // Create test pair data
    const testPair = {
      chainId: 'solana',
      dexId: 'raydium',
      pairAddress: 'test123',
      baseToken: { symbol: 'TEST' },
      quoteToken: { symbol: 'USDC' },
      liquidity: { usd: 75000 },
      priceUsd: '1.50',
      priceChange: { h24: 15.5 },
      volume: { h24: 250000 },
      txns: { h24: 450 },
      url: 'https://dexscreener.com/solana/test123',
      pairCreatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    };
    
    console.log('Sending test alert...');
    const sent = await this.sendTelegramAlert(testPair, 'TEST ALERT - This is a test');
    
    if (sent) {
      console.log('✅ Test alert sent successfully!');
      console.log('Check your Telegram for the test message.');
    }
  }
}

// Main function
async function main() {
  console.log('🎯 TELEGRAM ALERTS FOR DEX SCANNER');
  console.log('===================================\n');
  
  const alerts = new TelegramAlerts();
  
  console.log('Options:');
  console.log('1. Test alert (requires bot token)');
  console.log('2. Scan and send real alerts');
  console.log('3. Show setup instructions');
  console.log('');
  
  // For demo, show instructions
  console.log('📋 QUICK SETUP:');
  console.log('1. Create Telegram bot via @BotFather');
  console.log('2. Get your chat ID from @userinfobot');
  console.log('3. Add to dex_project/.env:');
  console.log('   TELEGRAM_BOT_TOKEN=your_token');
  console.log('   TELEGRAM_CHAT_ID=your_chat_id');
  console.log('4. Run: node telegram_alerts.js');
  console.log('');
  
  console.log('✅ Telegram alerts system ready!');
  console.log('\n⚡️  Integration:');
  console.log('   • Call alerts.scanAndAlert() from scanner');
  console.log('   • Auto-alerts for qualified listings');
  console.log('   • Rate limiting built-in');
  console.log('   • Duplicate prevention');
}

main().catch(console.error);