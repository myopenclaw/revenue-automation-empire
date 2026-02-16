// 🚀 DEX SCANNER V1 - New Listings Detection
// Team 2: First functional prototype

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

console.log('🚀 DEX SCANNER V1 - NEW LISTINGS DETECTION');
console.log('===========================================\n');

// Configuration
const CONFIG = {
  // API endpoints
  DEXSCREENER_API: 'https://api.dexscreener.com/latest/dex',
  JUPITER_QUOTE_API: 'https://quote-api.jup.ag/v6/quote',
  
  // Scanner settings
  CHECK_INTERVAL_MS: 60000, // 1 minute
  MIN_LIQUIDITY_USD: 50000, // $50K minimum
  MAX_AGE_HOURS: 24, // Only listings <24h old
  MIN_HOLDERS: 100, // Minimum holders
  
  // Risk settings
  MAX_TRADE_SIZE_USD: 20, // $20 per trade
  STOP_LOSS_PCT: 10, // -10%
  TAKE_PROFIT_PCT: 25, // +25%
  
  // Files
  STATE_FILE: path.join(__dirname, 'scanner_state.json'),
  ALERTS_FILE: path.join(__dirname, 'alerts.jsonl')
};

class DexScanner {
  constructor() {
    this.state = this.loadState();
    this.scannedPairs = new Set();
    console.log('📊 Scanner initialized');
    console.log('   Min liquidity: $' + CONFIG.MIN_LIQUIDITY_USD.toLocaleString());
    console.log('   Max age: ' + CONFIG.MAX_AGE_HOURS + ' hours');
    console.log('   Trade size: $' + CONFIG.MAX_TRADE_SIZE_USD);
    console.log('');
  }
  
  loadState() {
    try {
      if (fs.existsSync(CONFIG.STATE_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG.STATE_FILE, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading state:', error.message);
    }
    return {
      lastScan: null,
      totalScans: 0,
      alertsSent: 0,
      pairsScanned: 0
    };
  }
  
  saveState() {
    try {
      fs.writeFileSync(CONFIG.STATE_FILE, JSON.stringify(this.state, null, 2));
    } catch (error) {
      console.error('Error saving state:', error.message);
    }
  }
  
  logAlert(pair, reason) {
    const alert = {
      timestamp: new Date().toISOString(),
      pair: pair.baseToken.symbol + '/' + pair.quoteToken.symbol,
      dexId: pair.dexId,
      url: pair.url,
      liquidity: pair.liquidity?.usd || 0,
      age: this.getPairAge(pair),
      reason: reason,
      metrics: {
        priceChange: pair.priceChange?.h24 || 0,
        volume: pair.volume?.h24 || 0,
        txns: pair.txns?.h24 || 0
      }
    };
    
    try {
      fs.appendFileSync(CONFIG.ALERTS_FILE, JSON.stringify(alert) + '\n');
      console.log('   📝 Alert logged to file');
    } catch (error) {
      console.error('Error logging alert:', error.message);
    }
  }
  
  getPairAge(pair) {
    if (!pair.pairCreatedAt) return null;
    const created = new Date(pair.pairCreatedAt).getTime();
    return Math.floor((Date.now() - created) / (1000 * 60 * 60)); // hours
  }
  
  async scanNewListings() {
    console.log('🔍 Scanning for new listings...');
    this.state.totalScans++;
    this.state.lastScan = new Date().toISOString();
    
    try {
      // Scan Solana DEXes
      const responses = await Promise.all([
        this.scanDex('raydium'),
        this.scanDex('orca'),
        this.scanDex('jupiter')
      ]);
      
      const allPairs = responses.flat();
      console.log('   Total pairs found:', allPairs.length);
      
      // Filter and analyze
      const qualifiedPairs = this.filterPairs(allPairs);
      console.log('   Qualified pairs:', qualifiedPairs.length);
      
      // Process qualified pairs
      for (const pair of qualifiedPairs) {
        await this.analyzePair(pair);
      }
      
      this.state.pairsScanned += allPairs.length;
      this.saveState();
      
      console.log('\n📊 Scan completed:');
      console.log('   Total scans:', this.state.totalScans);
      console.log('   Pairs scanned:', this.state.pairsScanned);
      console.log('   Alerts sent:', this.state.alertsSent);
      
    } catch (error) {
      console.error('Scan error:', error.message);
    }
  }
  
  async scanDex(dexId) {
    try {
      const response = await axios.get(
        `${CONFIG.DEXSCREENER_API}/pairs/solana/${dexId}`,
        { timeout: 10000 }
      );
      
      if (response.data && response.data.pairs) {
        return response.data.pairs;
      }
    } catch (error) {
      console.log(`   ⚠️  ${dexId}: ${error.message}`);
    }
    return [];
  }
  
  filterPairs(pairs) {
    return pairs.filter(pair => {
      // Age filter
      const age = this.getPairAge(pair);
      if (age === null || age > CONFIG.MAX_AGE_HOURS) return false;
      
      // Liquidity filter
      const liquidity = pair.liquidity?.usd || 0;
      if (liquidity < CONFIG.MIN_LIQUIDITY_USD) return false;
      
      // Already scanned
      const pairKey = `${pair.chainId}:${pair.dexId}:${pair.pairAddress}`;
      if (this.scannedPairs.has(pairKey)) return false;
      
      this.scannedPairs.add(pairKey);
      return true;
    });
  }
  
  async analyzePair(pair) {
    const age = this.getPairAge(pair);
    const liquidity = pair.liquidity?.usd || 0;
    const symbol = `${pair.baseToken.symbol}/${pair.quoteToken.symbol}`;
    
    console.log(`\n📈 Analyzing: ${symbol}`);
    console.log(`   Age: ${age}h, Liquidity: $${liquidity.toLocaleString()}`);
    console.log(`   DEX: ${pair.dexId}, Price: $${pair.priceUsd || 'N/A'}`);
    
    // Check for red flags
    const redFlags = [];
    
    if (liquidity < CONFIG.MIN_LIQUIDITY_USD * 2) {
      redFlags.push('Low liquidity');
    }
    
    if (pair.priceChange?.h24 > 100) {
      redFlags.push('Extreme pump (>100% 24h)');
    }
    
    if (pair.volume?.h24 && pair.volume.h24 > liquidity * 10) {
      redFlags.push('High volume/liquidity ratio');
    }
    
    // Decision
    if (redFlags.length === 0) {
      console.log('   ✅ QUALIFIED FOR TRADE!');
      this.state.alertsSent++;
      
      // Log alert
      this.logAlert(pair, 'Qualified for trade');
      
      // Show trade plan
      console.log('   🎯 Trade Plan:');
      console.log(`     Size: $${CONFIG.MAX_TRADE_SIZE_USD}`);
      console.log(`     Stop loss: -${CONFIG.STOP_LOSS_PCT}%`);
      console.log(`     Take profit: +${CONFIG.TAKE_PROFIT_PCT}%`);
      console.log(`     Risk/Reward: 1:${(CONFIG.TAKE_PROFIT_PCT / CONFIG.STOP_LOSS_PCT).toFixed(1)}`);
      
    } else {
      console.log(`   ⚠️  Not qualified: ${redFlags.join(', ')}`);
    }
  }
  
  startContinuousScan() {
    console.log('\n🔄 Starting continuous scan...');
    console.log(`   Interval: ${CONFIG.CHECK_INTERVAL_MS / 1000} seconds`);
    console.log('   Press Ctrl+C to stop\n');
    
    // Initial scan
    this.scanNewListings();
    
    // Set up interval
    setInterval(() => {
      this.scanNewListings();
    }, CONFIG.CHECK_INTERVAL_MS);
  }
}

// Run scanner
async function main() {
  console.log('🚀 DEX SCANNER V1 STARTING');
  console.log('==========================\n');
  
  const scanner = new DexScanner();
  
  // Single scan mode
  await scanner.scanNewListings();
  
  console.log('\n🎯 SCANNER READY FOR PRODUCTION!');
  console.log('\n📋 Features:');
  console.log('   • New listings detection (<24h)');
  console.log('   • Liquidity filtering (>$50K)');
  console.log('   • Red flag detection');
  console.log('   • Alert logging');
  console.log('   • Continuous scanning');
  
  console.log('\n⚡️  Next steps:');
  console.log('   1. Add Telegram alerts');
  console.log('   2. Integrate Jupiter price routing');
  console.log('   3. Add wallet connection for execution');
  console.log('   4. Implement risk management');
  console.log('   5. Connect to CEX profit tracking');
  
  console.log('\n✅ DEX Scanner V1 operational!');
}

main().catch(console.error);