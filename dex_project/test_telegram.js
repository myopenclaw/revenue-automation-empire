// 🧪 TEST TELEGRAM ALERT
// Quick test of Telegram alert system

require('dotenv').config();
const axios = require('axios');

console.log('🧪 TESTING TELEGRAM ALERT...\n');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  console.log('❌ Missing Telegram credentials in .env file');
  console.log('   TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID required');
  process.exit(1);
}

console.log('✅ Credentials found:');
console.log('   Bot token:', BOT_TOKEN.substring(0, 10) + '...');
console.log('   Chat ID:', CHAT_ID);
console.log('');

async function testAlert() {
  const message = `
🚨 **TEST ALERT - DEX SCANNER** 🚨

✅ **Telegram alerts are working!**

This is a test message from your DEX trading system.

**System Status:**
• CEX Trading: Active (3 trades/day limit)
• DEX Scanner: Ready for new listings
• Performance Dashboard: Operational
• TP Orders: Active for SOL position

**Next Steps:**
1. Monitor TP orders (8%/15%/25%)
2. Plan tomorrow's trades
3. Watch for DEX opportunities

📊 **Current Stats:**
• USDT Balance: ~$43.55
• SOL Position: 0.1167 SOL
• Daily Target: +3% ($1.46)

🔗 **Links:**
[CEX Dashboard](https://mexc.com)
[DEX Screener](https://dexscreener.com)

⚠️ **This is a test - no action needed.**

System time: ${new Date().toLocaleTimeString()}
`.trim();

  try {
    console.log('📨 Sending test alert to Telegram...');
    
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      },
      { timeout: 10000 }
    );
    
    if (response.data.ok) {
      console.log('✅ TEST ALERT SENT SUCCESSFULLY!');
      console.log('   Message ID:', response.data.result.message_id);
      console.log('   Date:', new Date(response.data.result.date * 1000).toLocaleString());
      console.log('\n📱 Check your Telegram for the test message!');
      
      // Also try to get bot info
      try {
        const botInfo = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
        console.log('\n🤖 Bot Info:');
        console.log('   Name:', botInfo.data.result.first_name);
        console.log('   Username:', botInfo.data.result.username);
        console.log('   ID:', botInfo.data.result.id);
      } catch (botError) {
        console.log('   Could not fetch bot info:', botError.message);
      }
      
    } else {
      console.log('❌ Telegram API error:', response.data.description);
    }
    
  } catch (error) {
    console.log('❌ Telegram send failed:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAlert().catch(console.error);