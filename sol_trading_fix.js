// 🔧 SOL TRADING FIX
// Automatically convert small amount of SOL to USDT for trading

const ccxt = require('ccxt');
require('dotenv').config({ path: require('os').homedir() + '/.mexc_credentials' });

async function setupSOLTrading() {
  console.log('🚀 SETTING UP SOL TRADING');
  console.log('=========================\n');
  
  const mexc = new ccxt.mexc({
    apiKey: process.env.API_KEY,
    secret: process.env.API_SECRET,
    enableRateLimit: true
  });
  
  try {
    // 1. Check current balance
    const balance = await mexc.fetchBalance();
    const solBalance = balance.SOL?.free || 0;
    const usdtBalance = balance.USDT?.free || 0;
    
    console.log('📊 CURRENT BALANCE:');
    console.log(`   SOL: ${solBalance} ($${(solBalance * 85.37).toFixed(2)})`);
    console.log(`   USDT: ${usdtBalance}\n`);
    
    // 2. If USDT < $10, convert some SOL
    if (usdtBalance < 10 && solBalance > 0.3) {
      const amountSOL = 0.2; // Convert 0.2 SOL ($17)
      console.log(`💱 Converting ${amountSOL} SOL to USDT for trading...`);
      
      try {
        // Create market sell order
        const order = await mexc.createMarketSellOrder('SOL/USDT', amountSOL);
        console.log(`✅ Sold ${amountSOL} SOL for $${order.cost} USDT`);
        console.log(`   Price: $${order.price}/SOL`);
        console.log(`   Fee: $${order.fee.cost || 0}`);
        
        // Check new balance
        const newBalance = await mexc.fetchBalance();
        console.log(`\n💰 NEW BALANCE:`);
        console.log(`   SOL: ${newBalance.SOL?.free || 0} ($${((newBalance.SOL?.free || 0) * 85.37).toFixed(2)})`);
        console.log(`   USDT: ${newBalance.USDT?.free || 0}`);
        
        return {
          success: true,
          solConverted: amountSOL,
          usdtReceived: order.cost,
          newBalance: {
            sol: newBalance.SOL?.free || 0,
            usdt: newBalance.USDT?.free || 0
          }
        };
      } catch (tradeError) {
        console.error(`❌ Trade failed: ${tradeError.message}`);
        return { success: false, error: tradeError.message };
      }
    } else if (usdtBalance >= 10) {
      console.log('✅ Sufficient USDT already available for trading');
      console.log(`   USDT: $${usdtBalance} (minimum $10 required)`);
      return { success: true, alreadyHasUSDT: true, usdtBalance };
    } else {
      console.log('❌ Insufficient SOL for conversion');
      console.log(`   Need at least 0.3 SOL, have: ${solBalance}`);
      return { success: false, error: 'Insufficient SOL' };
    }
  } catch (error) {
    console.error(`❌ Setup failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Also create modified trading bot that starts with SOL conversion
const fs = require('fs');
const path = require('path');

function createSOLTradingBot() {
  const originalBot = path.join(process.env.HOME, 'mexc_trading/live_trading_bot.js');
  const solBot = path.join(process.env.HOME, 'mexc_trading/live_trading_bot_sol.js');
  
  if (!fs.existsSync(originalBot)) {
    console.log('❌ Original trading bot not found');
    return false;
  }
  
  let content = fs.readFileSync(originalBot, 'utf8');
  
  // Add SOL conversion at startup
  const initCode = `
  // AUTO SOL CONVERSION FOR TRADING CAPITAL
  async function setupTradingCapital() {
    console.log('💰 Setting up trading capital from SOL...');
    try {
      const balance = await this.mexc.fetchBalance();
      const usdtBalance = balance.USDT?.free || 0;
      
      if (usdtBalance < 10) {
        console.log('💱 Converting 0.2 SOL to USDT for trading...');
        const order = await this.mexc.createMarketSellOrder('SOL/USDT', 0.2);
        console.log(\`✅ Sold 0.2 SOL for $\${order.cost} USDT\`);
        return order.cost;
      }
      return usdtBalance;
    } catch (error) {
      console.log('⚠️  SOL conversion failed, using simulation mode');
      return 0;
    }
  }
  `;
  
  // Insert after constructor
  content = content.replace(
    'console.log(\'🎉 Initialization complete!\');',
    `console.log('🎉 Initialization complete!');
    
    // Setup trading capital
    this.tradingCapital = await this.setupTradingCapital();
    console.log(\`💰 Trading capital: $\${this.tradingCapital.toFixed(2)} USDT\`);`
  );
  
  // Add the function to class
  content = content.replace(
    'class FinalLiveTradingBot {',
    `class FinalLiveTradingBot {
  ${initCode}`
  );
  
  // Modify trade size based on available capital
  content = content.replace(
    'const positionSize = riskAmount * 2;',
    `const maxTradeSize = Math.min(2, this.tradingCapital * 0.1); // Max 10% of capital or $2
    const positionSize = Math.min(riskAmount * 2, maxTradeSize);`
  );
  
  fs.writeFileSync(solBot, content);
  console.log(`✅ Created SOL trading bot: ${solBot}`);
  return true;
}

// Run setup
async function main() {
  console.log('🎯 SOL TRADING SETUP');
  console.log('===================\n');
  
  // Option 1: Auto-convert SOL now
  const result = await setupSOLTrading();
  
  if (result.success) {
    console.log('\n🎉 SOL TRADING READY!');
    
    // Option 2: Create modified bot
    if (createSOLTradingBot()) {
      console.log('\n🚀 TO START TRADING WITH SOL:');
      console.log('============================');
      console.log('cd ~/mexc_trading');
      console.log('node live_trading_bot_sol.js');
      console.log('\n📊 EXPECTED:');
      console.log('• Auto-convert 0.2 SOL to USDT');
      console.log('• Trading capital: ~$17 USDT');
      console.log('• Trade size: $1-2');
      console.log('• First trade within 5-10 minutes');
    }
  } else {
    console.log('\n❌ SETUP FAILED');
    console.log('You need to either:');
    console.log('1. Deposit $10-20 USDT to MEXC');
    console.log('2. Or manually sell 0.2 SOL on MEXC');
    console.log('\n💡 QUICK FIX:');
    console.log('Go to MEXC → Trade → SOL/USDT → Sell 0.2 SOL');
  }
}

main().catch(console.error);