// 🚀 LIVE DEX SCANNER TEST
// Test with real data and send Telegram alerts

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

console.log('🚀 LIVE DEX SCANNER TEST');
console.log('========================\n');

// Configuration
const CONFIG = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  DEXSCREENER_API: 'https://api.dexscreener.com/latest/dex',
  
  // Realistic filters for testing
  MIN_LIQUIDITY_USD: 10000, // Lower for testing
  MAX_AGE_HOURS: 48, // Wider window for testing
  MIN_VOLUME_USD: 5000,
  
  // Test mode - don't send too many alerts
  MAX_ALERTS_PER_TEST: 2
};

class LiveScannerTest {
  constructor() {
    console.log('📊 Live Scanner Test initialized');
    console.log('   Min liquidity: $' + CONFIG.MIN_LIQUIDITY_USD.toLocaleString());
    console.log('   Max age: ' + CONFIG.MAX_AGE_HOURS + ' hours');
    console.log('   Max alerts: ' + CONFIG.MAX_ALERTS_PER_TEST);
    console.log('');
  }
  
  getPairAge(pair) {
    if (!pair.pairCreatedAt) return null;
    const created = new Date(pair.pairCreatedAt).getTime();
    return Math.floor((Date.now() - created) / (1000 * 60 * 60)); // hours
  }
  
  async sendTelegramAlert(pair, testMode = true) {
    const age = this.getPairAge(pair);
    const liquidity = pair.liquidity?.usd || 0;
    const symbol = `${pair.baseToken.symbol}/${pair.quoteToken.symbol}`;
    
    const message = `
${testMode ? '🧪 **TEST ALERT** 🧪' : '🚨 **DEX OPPORTUNITY** 🚨'}

**Pair:** ${symbol}
**DEX:** ${pair.dexId.toUpperCase()}
**Age:** ${age || 'N/A'} hours
**Liquidity:** $${liquidity.toLocaleString()}

📊 **Metrics:**
• Price: $${pair.priceUsd || 'N/A'}
• 24h Change: ${pair.priceChange?.h24 || 0}%
• Volume (24h): $${(pair.volume?.h24 || 0).toLocaleString()}
• Transactions (24h): ${pair.txns?.h24 || 0}

🎯 **Analysis:**
${liquidity < 50000 ? '⚠️ Low liquidity - small size only' : '✅ Good liquidity'}
${age < 6 ? '🔥 Very fresh listing!' : '📅 Established pair'}

🔗 **Links:**
[Chart](${pair.url})
[DexScreener](https://dexscreener.com/${pair.chainId}/${pair.pairAddress})

${testMode ? '⚠️ **THIS IS A TEST - No trade recommended**' : '⚠️ **High Risk - Do your own research!**'}

Scanned at: ${new Date().toLocaleTimeString()}
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
        console.log(`   ✅ Alert sent for ${symbol}`);
        return true;
      }
    } catch (error) {
      console.log(`   ❌ Alert failed for ${symbol}:`, error.message);
    }
    return false;
  }
  
  async scanAndTest() {
    console.log('🔍 Scanning real DEX data...');
    
    const dexes = ['raydium', 'orca', 'jupiter'];
    let totalPairs = 0;
    let qualifiedPairs = [];
    
    for (const dex of dexes) {
      try {
        console.log(`\n   Scanning ${dex}...`);
        const response = await axios.get(
          `${CONFIG.DEXSCREENER_API}/pairs/solana/${dex}`,
          { timeout: 15000 }
        );
        
        if (response.data && response.data.pairs) {
          const pairs = response.data.pairs;
          totalPairs += pairs.length;
          console.log(`     Found: ${pairs.length} pairs`);
          
          // Filter for testing
          const filtered = pairs.filter(pair => {
            const age = this.getPairAge(pair);
            if (age === null || age > CONFIG.MAX_AGE_HOURS) return false;
            
            const liquidity = pair.liquidity?.usd || 0;
            if (liquidity < CONFIG.MIN_LIQUIDITY_USD) return false;
            
            return true;
          });
          
          console.log(`     Qualified: ${filtered.length} pairs`);
          qualifiedPairs.push(...filtered.slice(0, 3)); // Take top 3 per DEX
        }
      } catch (error) {
        console.log(`     ⚠️  Error: ${error.message}`);
      }
      
      // Small delay between DEX scans
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📊 SCAN RESULTS:');
    console.log('   Total pairs scanned:', totalPairs);
    console.log('   Qualified pairs:', qualifiedPairs.length);
    
    if (qualifiedPairs.length > 0) {
      console.log('\n🎯 SENDING TEST ALERTS...');
      
      // Sort by liquidity (highest first)
      qualifiedPairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
      
      let alertsSent = 0;
      for (const pair of qualifiedPairs.slice(0, CONFIG.MAX_ALERTS_PER_TEST)) {
        const age = this.getPairAge(pair);
        const liquidity = pair.liquidity?.usd || 0;
        const symbol = `${pair.baseToken.symbol}/${pair.quoteToken.symbol}`;
        
        console.log(`\n   ${symbol}:`);
        console.log(`     Age: ${age}h, Liquidity: $${liquidity.toLocaleString()}`);
        console.log(`     DEX: ${pair.dexId}, Price: $${pair.priceUsd || 'N/A'}`);
        
        const sent = await this.sendTelegramAlert(pair, true);
        if (sent) alertsSent++;
        
        // Delay between alerts
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      console.log(`\n✅ ${alertsSent} test alerts sent to Telegram!`);
      console.log('📱 Check your Telegram for real DEX data.');
      
    } else {
      console.log('\n📭 No qualified pairs found for testing.');
      console.log('   Try adjusting filters (lower min liquidity, increase max age)');
    }
    
    return { totalPairs, qualifiedPairs: qualifiedPairs.length };
  }
  
  async analyzeMarket() {
    console.log('\n📈 MARKET ANALYSIS');
    console.log('-----------------');
    
    try {
      // Get overall Solana DEX stats
      const response = await axios.get(
        `${CONFIG.DEXSCREENER_API}/pairs/solana`,
        { timeout: 10000 }
      );
      
      if (response.data && response.data.pairs) {
        const allPairs = response.data.pairs;
        const totalLiquidity = allPairs.reduce((sum, pair) => sum + (pair.liquidity?.usd || 0), 0);
        const avgLiquidity = totalLiquidity / allPairs.length;
        
        // New listings (<24h)
        const newListings = allPairs.filter(pair => {
          const age = this.getPairAge(pair);
          return age !== null && age < 24;
        });
        
        // High liquidity pairs (>$100K)
        const highLiquidity = allPairs.filter(pair => (pair.liquidity?.usd || 0) > 100000);
        
        console.log('   Total Solana pairs:', allPairs.length);
        console.log('   Total liquidity: $' + totalLiquidity.toLocaleString());
        console.log('   Average liquidity: $' + avgLiquidity.toLocaleString());
        console.log('   New listings (<24h):', newListings.length);
        console.log('   High liquidity (>$100K):', highLiquidity.length);
        
        if (newListings.length > 0) {
          console.log('\n   🆕 Recent new listings:');
          newListings.slice(0, 3).forEach((pair, i) => {
            const age = this.getPairAge(pair);
            console.log(`     ${i+1}. ${pair.baseToken.symbol}/${pair.quoteToken.symbol}`);
            console.log(`        Age: ${age}h, Liquidity: $${(pair.liquidity?.usd || 0).toLocaleString()}`);
            console.log(`        DEX: ${pair.dexId}`);
          });
        }
      }
    } catch (error) {
      console.log('   ❌ Market analysis failed:', error.message);
    }
  }
}

// Main function
async function main() {
  console.log('🎯 LIVE DEX SCANNER TEST STARTING');
  console.log('=================================\n');
  
  const scanner = new LiveScannerTest();
  
  // Run market analysis first
  await scanner.analyzeMarket();
  
  // Run live scan
  const results = await scanner.scanAndTest();
  
  console.log('\n✅ LIVE SCANNER TEST COMPLETE!');
  console.log('\n📊 Results:');
  console.log('   Pairs scanned:', results.totalPairs);
  console.log('   Qualified:', results.qualifiedPairs);
  
  console.log('\n⚡️  Next steps for DEX system:');
  console.log('   1. Adjust filters for production (higher liquidity)');
  console.log('   2. Add Jupiter price routing for execution');
  console.log('   3. Implement wallet connection (testnet first)');
  console.log('   4. Add risk management rules');
  console.log('   5. Integrate with CEX profit tracking');
  
  console.log('\n🚀 DEX Scanner is LIVE and sending Telegram alerts!');
}

main().catch(console.error);