// Check portfolio value
const tools = require('./mexc_spot_tools.js');
const config = require('./cex_trading_config.js');

async function checkPortfolio() {
  // Get balances
  const balance = await tools.mexc_spot_get_balance();
  
  if (!balance.success) {
    console.log('Failed to get balance');
    return;
  }
  
  console.log('💰 PORTFOLIO BREAKDOWN:');
  console.log('=======================');
  
  let totalValue = 0;
  
  for (const [asset, data] of Object.entries(balance.balances)) {
    if (data.total > 0) {
      if (asset === 'USDT') {
        console.log(`USDT: $${data.free.toFixed(2)} (free) + $${data.used.toFixed(2)} (used) = $${data.total.toFixed(2)}`);
        totalValue += data.total;
      } else {
        // Get price for other assets
        try {
          const ticker = await tools.mexc_spot_get_ticker(`${asset}/USDT`);
          if (ticker.success) {
            const assetValue = data.total * ticker.last;
            console.log(`${asset}: ${data.total.toFixed(4)} × $${ticker.last.toFixed(2)} = $${assetValue.toFixed(2)}`);
            totalValue += assetValue;
          }
        } catch (error) {
          console.log(`${asset}: ${data.total.toFixed(4)} (price unavailable)`);
        }
      }
    }
  }
  
  console.log('=======================');
  console.log(`TOTAL PORTFOLIO VALUE: $${totalValue.toFixed(2)}`);
  console.log(`USDT Available for Trading: $${balance.balances.USDT?.free.toFixed(2) || 0}`);
  
  // Update config
  config.capital.total = totalValue;
  config.capital.current = balance.balances.USDT?.free || 0;
  config.capital.deposit_needed = Math.max(0, config.capital.target - config.capital.current);
  
  console.log('\n📊 UPDATED CAPITAL SETTINGS:');
  console.log(`Total Portfolio: $${config.capital.total.toFixed(2)}`);
  console.log(`Available USDT: $${config.capital.current.toFixed(2)}`);
  console.log(`Target Allocation: $${config.capital.target}`);
  console.log(`Additional USDT needed: $${config.capital.deposit_needed.toFixed(2)}`);
  
  return {
    totalValue,
    availableUSDT: balance.balances.USDT?.free || 0,
    config
  };
}

checkPortfolio().catch(console.error);