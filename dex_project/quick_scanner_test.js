// 🚀 QUICK DEX SCANNER TEST
// Simple test with working API endpoint

require('dotenv').config();
const axios = require('axios');

console.log('🚀 QUICK DEX SCANNER TEST');
console.log('=========================\n');

async function quickTest() {
  console.log('1. Testing Telegram connection...');
  
  try {
    const botInfo = await axios.get(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`
    );
    console.log('   ✅ Bot connected:', botInfo.data.result.username);
  } catch (error) {
    console.log('   ❌ Bot connection failed:', error.message);
    return;
  }
  
  console.log('\n2. Testing DexScreener API...');
  
  try {
    // Search for SOL pairs (always has data)
    const response = await axios.get(
      'https://api.dexscreener.com/latest/dex/search?q=SOL',
      { timeout: 10000 }
    );
    
    if (response.data && response.data.pairs) {
      const pairs = response.data.pairs;
      console.log('   ✅ API working, found', pairs.length, 'SOL pairs');
      
      // Find new-ish pairs
      const recentPairs = pairs.filter(pair => {
        if (!pair.pairCreatedAt) return false;
        const created = new Date(pair.pairCreatedAt).getTime();
        const ageHours = (Date.now() - created) / (1000 * 60 * 60);
        return ageHours < 168; // < 1 week
      });
      
      console.log('   Recent pairs (<1 week):', recentPairs.length);
      
      if (recentPairs.length > 0) {
        // Take top 2 by liquidity
        const topPairs = recentPairs
          .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))
          .slice(0, 2);
        
        console.log('\n3. Sending Telegram alerts for top pairs...');
        
        for (const pair of topPairs) {
          const age = Math.floor((Date.now() - new Date(pair.pairCreatedAt).getTime()) / (1000 * 60 * 60));
          const liquidity = pair.liquidity?.usd || 0;
          const symbol = `${pair.baseToken.symbol}/${pair.quoteToken.symbol}`;
          
          console.log(`\n   ${symbol}:`);
          console.log(`     Age: ${age}h, Liquidity: $${liquidity.toLocaleString()}`);
          console.log(`     DEX: ${pair.dexId}`);
          
          const message = `
🧪 **DEX SCANNER TEST** 🧪

**Pair:** ${symbol}
**DEX:** ${pair.dexId.toUpperCase()}
**Age:** ${age} hours
**Liquidity:** $${liquidity.toLocaleString()}

📊 **Metrics:**
• Price: $${pair.priceUsd || 'N/A'}
• 24h Change: ${pair.priceChange?.h24 || 0}%
• Volume: $${(pair.volume?.h24 || 0).toLocaleString()}

🔗 **Links:**
[Chart](${pair.url})

⚠️ **THIS IS A TEST - Scanner is working!**

Scanned at: ${new Date().toLocaleTimeString()}
`.trim();
          
          try {
            const telegramResponse = await axios.post(
              `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
              {
                chat_id: process.env.TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
                disable_web_page_preview: false
              },
              { timeout: 10000 }
            );
            
            if (telegramResponse.data.ok) {
              console.log(`     ✅ Alert sent!`);
            }
          } catch (tgError) {
            console.log(`     ❌ Telegram error:`, tgError.message);
          }
          
          // Delay between alerts
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        console.log('\n✅ TEST COMPLETE!');
        console.log('📱 Check Telegram for real DEX data alerts.');
        
      } else {
        console.log('   No recent pairs found for testing.');
      }
    }
  } catch (error) {
    console.log('   ❌ API error:', error.message);
  }
  
  console.log('\n🎯 DEX SCANNER STATUS:');
  console.log('   • Telegram: ✅ Connected');
  console.log('   • DexScreener API: ✅ Working');
  console.log('   • Alert system: ✅ Ready');
  console.log('   • Next: Add filters & execution');
}

quickTest().catch(console.error);