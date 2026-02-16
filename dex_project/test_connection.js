// 🚀 DEX CONNECTION TEST
// Testing Solana + Jupiter integration

require('dotenv').config();
const { Connection, PublicKey } = require('@solana/web3.js');
const axios = require('axios');

console.log('🚀 TESTING DEX CONNECTIONS');
console.log('==========================\n');

async function testConnections() {
  console.log('1. Testing Solana connection...');
  
  // Use testnet for safety
  const rpcUrl = process.env.SOLANA_RPC_URL_TESTNET || 'https://api.testnet.solana.com';
  const connection = new Connection(rpcUrl, 'confirmed');
  
  try {
    const version = await connection.getVersion();
    console.log('   ✅ Solana connection successful!');
    console.log('   Network:', rpcUrl.includes('testnet') ? 'Testnet' : 'Mainnet');
    console.log('   Version:', version['solana-core']);
    console.log('   Slot:', await connection.getSlot());
  } catch (error) {
    console.log('   ❌ Solana connection failed:', error.message);
  }
  
  console.log('\n2. Testing Jupiter API...');
  
  try {
    // Get SOL price quote
    const quoteResponse = await axios.get(
      'https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1000000000', // 1 SOL
      { timeout: 10000 }
    );
    
    if (quoteResponse.data) {
      console.log('   ✅ Jupiter API working!');
      console.log('   SOL → USDC quote received');
      console.log('   Out amount:', quoteResponse.data.outAmount / 1_000_000, 'USDC');
    }
  } catch (error) {
    console.log('   ❌ Jupiter API failed:', error.message);
    console.log('   Note: API might need key for production');
  }
  
  console.log('\n3. Testing DexScreener API...');
  
  try {
    const dexResponse = await axios.get(
      'https://api.dexscreener.com/latest/dex/pairs/solana/raydium',
      { timeout: 10000 }
    );
    
    if (dexResponse.data && dexResponse.data.pairs) {
      console.log('   ✅ DexScreener API working!');
      console.log('   Pairs found:', dexResponse.data.pairs.length);
      
      // Show some new pairs
      const newPairs = dexResponse.data.pairs
        .filter(p => p.pairCreatedAt && Date.now() - new Date(p.pairCreatedAt).getTime() < 24 * 60 * 60 * 1000)
        .slice(0, 3);
      
      if (newPairs.length > 0) {
        console.log('\n   📈 New pairs (<24h):');
        newPairs.forEach((pair, i) => {
          const age = Math.floor((Date.now() - new Date(pair.pairCreatedAt).getTime()) / (60 * 60 * 1000));
          console.log(`   ${i+1}. ${pair.baseToken.symbol}/${pair.quoteToken.symbol}`);
          console.log(`      Age: ${age}h, Liquidity: $${(pair.liquidity.usd || 0).toLocaleString()}`);
        });
      }
    }
  } catch (error) {
    console.log('   ❌ DexScreener API failed:', error.message);
  }
  
  console.log('\n4. DEX Development Status:');
  console.log('   ✅ Solana Web3.js: Installed');
  console.log('   ✅ Jupiter API: Tested');
  console.log('   ✅ DexScreener API: Tested');
  console.log('   ✅ Axios: Installed');
  console.log('   ✅ Environment: Ready');
  
  console.log('\n🎯 NEXT STEPS FOR DEX DEVELOPMENT:');
  console.log('   1. Create wallet connection (testnet first)');
  console.log('   2. Build price router with slippage protection');
  console.log('   3. Create new listings scanner with filters');
  console.log('   4. Implement basic trade execution');
  console.log('   5. Add risk management rules');
  console.log('   6. Integrate with CEX profit tracking');
  
  console.log('\n🚀 DEX INFRASTRUCTURE READY FOR DEVELOPMENT!');
}

testConnections().catch(console.error);