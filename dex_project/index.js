// 🚀 DEX SNIPER AGENT - MAIN ENTRY POINT
// Team 2: Edge Development

require('dotenv').config();
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const axios = require('axios');

console.log('🚀 DEX Sniper Agent Starting...');
console.log('===============================\n');

class DexAgent {
  constructor() {
    this.connection = null;
    this.wallet = null;
    this.isTestnet = process.env.USE_TESTNET === 'true';
    this.initialize();
  }
  
  async initialize() {
    console.log('1. Initializing DEX Agent...');
    
    // Setup Solana connection
    const rpcUrl = this.isTestnet 
      ? process.env.SOLANA_RPC_URL_TESTNET 
      : process.env.SOLANA_RPC_URL;
    
    this.connection = new Connection(rpcUrl, 'confirmed');
    console.log(`   Connected to: ${this.isTestnet ? 'Testnet' : 'Mainnet'}`);
    
    // Setup wallet (in production, use secure key management)
    if (process.env.WALLET_PRIVATE_KEY) {
      const secretKey = Uint8Array.from(JSON.parse(process.env.WALLET_PRIVATE_KEY));
      this.wallet = Keypair.fromSecretKey(secretKey);
      console.log(`   Wallet: ${this.wallet.publicKey.toString()}`);
    } else {
      console.log('   ⚠️  No wallet configured - using test mode');
    }
    
    // Load configuration
    const config = require('./config/default.json');
    this.config = config;
    
    console.log('\n2. Starting modules...');
    
    // Initialize modules
    await this.startScanner();
    await this.startRiskManager();
    
    console.log('\n✅ DEX Agent initialized successfully!');
    console.log('\n📊 STATUS:');
    console.log(`   Network: ${this.isTestnet ? 'Testnet' : 'Mainnet'}`);
    console.log(`   Max trade size: $${config.trading.maxTradeSizeUSD}`);
    console.log(`   Min liquidity: $${config.trading.minLiquidityUSD}`);
    console.log(`   Stop loss: ${config.trading.stopLossPct}%`);
    console.log(`   Take profit: ${config.trading.takeProfitPct}%`);
  }
  
  async startScanner() {
    console.log('   📡 Starting new listings scanner...');
    // Scanner module will be implemented
  }
  
  async startRiskManager() {
    console.log('   🛡️  Starting risk manager...');
    // Risk manager will be implemented
  }
  
  async checkNewListings() {
    console.log('\n🔍 Checking for new listings...');
    // Implementation coming in Phase 2
  }
  
  async getSolanaPrice() {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      return response.data.solana.usd;
    } catch (error) {
      console.error('Error fetching SOL price:', error.message);
      return 85; // Fallback price
    }
  }
}

// Start the agent
const agent = new DexAgent();

// Export for testing
module.exports = { DexAgent };
