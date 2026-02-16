// 🛠️ MEXC Spot Tools for OpenClaw
// Implements the 4 tools needed for spot-executor

const ccxt = require('ccxt');
const path = require('path');
const fs = require('fs');

// Load MEXC credentials from ~/.mexc_credentials
const credentialsPath = path.join(require('os').homedir(), '.mexc_credentials');
let mexcClient = null;

function getMEXCClient() {
  if (!mexcClient) {
    try {
      // Check if credentials file exists
      if (!fs.existsSync(credentialsPath)) {
        throw new Error(`Credentials file not found: ${credentialsPath}`);
      }
      
      // Load environment variables from .mexc_credentials
      require('dotenv').config({ path: credentialsPath });
      
      const apiKey = process.env.API_KEY;
      const apiSecret = process.env.API_SECRET;
      
      if (!apiKey || !apiSecret) {
        throw new Error('API_KEY or API_SECRET not found in credentials file');
      }
      
      mexcClient = new ccxt.mexc({
        apiKey,
        secret: apiSecret,
        enableRateLimit: true,
        timeout: 30000,
      });
      
      console.log('✅ MEXC client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize MEXC client:', error.message);
      throw error;
    }
  }
  return mexcClient;
}

// Tool 1: mexc_spot_get_balance
async function mexc_spot_get_balance(symbol = null) {
  try {
    const mexc = getMEXCClient();
    const balance = await mexc.fetchBalance();
    
    if (symbol) {
      // Return specific symbol balance
      const asset = symbol.toUpperCase();
      const balanceData = balance[asset];
      
      // Handle USDT specially since it's the quote currency
      if (!balanceData && asset === 'USDT') {
        // Some exchanges might not have USDT in balance object
        return {
          success: true,
          symbol: asset,
          free: 0,
          used: 0,
          total: 0,
          usd_value: 0,
          timestamp: new Date().toISOString(),
          note: "USDT balance not found in response, checking info field"
        };
      }
      
      const free = balanceData?.free || 0;
      const used = balanceData?.used || 0;
      const total = balanceData?.total || 0;
      
      return {
        success: true,
        symbol: asset,
        free,
        used,
        total,
        usd_value: asset === 'USDT' ? free : null,
        timestamp: new Date().toISOString()
      };
    } else {
      // Return all balances (filter out zero balances)
      const nonZeroBalances = {};
      for (const [asset, data] of Object.entries(balance)) {
        if (data.total > 0 || asset === 'USDT') {
          nonZeroBalances[asset] = {
            free: data.free || 0,
            used: data.used || 0,
            total: data.total || 0
          };
        }
      }
      
      return {
        success: true,
        balances: nonZeroBalances,
        total_usdt: balance.USDT?.free || 0,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      error_type: error.constructor.name,
      timestamp: new Date().toISOString()
    };
  }
}

// Tool 2: mexc_spot_place_order
async function mexc_spot_place_order(params) {
  try {
    const mexc = getMEXCClient();
    const { symbol, side, type, quote_amount = null, base_qty = null, price = null } = params;
    
    // Validate required parameters
    if (!symbol || !side || !type) {
      throw new Error('Missing required parameters: symbol, side, type');
    }
    
    // Must have either quote_amount or base_qty
    if (!quote_amount && !base_qty) {
      throw new Error('Missing amount: need either quote_amount or base_qty');
    }
    
    // Format symbol (ensure it's in exchange format)
    const formattedSymbol = symbol.toUpperCase().replace('/', '');
    
    // For MARKET BUY with quote_amount, we need to use createMarketBuyOrderWithCost
    // For other orders, use createOrder
    
    let order;
    
    if (type.toLowerCase() === 'market' && side.toLowerCase() === 'buy' && quote_amount) {
      // Special case: market buy with quote amount (cost)
      console.log(`📤 Placing MARKET BUY with quote amount: ${quote_amount} USDT`);
      
      // Note: ccxt's createMarketBuyOrderWithCost might not be supported by all exchanges
      // For MEXC, we need to check if this works
      try {
        // Try the cost-based method first
        order = await mexc.createMarketBuyOrderWithCost(formattedSymbol, quote_amount);
      } catch (costError) {
        console.log('Market buy with cost failed, falling back to estimate:', costError.message);
        
        // Fallback: estimate base amount from current price
        const ticker = await mexc.fetchTicker(formattedSymbol);
        const currentPrice = ticker.last;
        const estimatedBaseQty = quote_amount / currentPrice;
        
        // Reduce by 1% for safety (slippage)
        const safeBaseQty = estimatedBaseQty * 0.99;
        
        console.log(`Estimated: ${quote_amount} USDT / ${currentPrice} = ${estimatedBaseQty} ${symbol.split('USDT')[0]}`);
        console.log(`Using safe amount: ${safeBaseQty}`);
        
        order = await mexc.createOrder(
          formattedSymbol,
          'market',
          'buy',
          safeBaseQty
        );
      }
    } else {
      // Regular order (market sell, limit buy/sell)
      const amount = base_qty || quote_amount;
      
      const orderParams = {
        symbol: formattedSymbol,
        type: type.toLowerCase(),
        side: side.toLowerCase(),
        amount: parseFloat(amount),
      };
      
      if (type.toLowerCase() === 'limit' && price) {
        orderParams.price = parseFloat(price);
      }
      
      console.log(`📤 Placing ${side} ${type} order:`, orderParams);
      
      order = await mexc.createOrder(
        orderParams.symbol,
        orderParams.type,
        orderParams.side,
        orderParams.amount,
        orderParams.price
      );
    }
    
    return {
      success: true,
      orderId: order.id,
      symbol: order.symbol,
      side: order.side,
      type: order.type,
      amount: order.amount,
      cost: order.cost,
      price: order.price || null,
      status: order.status,
      timestamp: new Date().toISOString(),
      raw: order
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      error_type: error.constructor.name,
      params: params,
      timestamp: new Date().toISOString()
    };
  }
}

// Tool 3: mexc_spot_get_order
async function mexc_spot_get_order(orderId, symbol = null) {
  try {
    const mexc = getMEXCClient();
    
    if (!orderId) {
      throw new Error('orderId is required');
    }
    
    // If symbol not provided, we need to find it (limitation of ccxt)
    // For now, require symbol
    if (!symbol) {
      throw new Error('symbol is required to fetch order');
    }
    
    const formattedSymbol = symbol.toUpperCase().replace('/', '');
    
    console.log(`📥 Fetching order ${orderId} for ${formattedSymbol}`);
    
    const order = await mexc.fetchOrder(orderId, formattedSymbol);
    
    return {
      success: true,
      orderId: order.id,
      symbol: order.symbol,
      side: order.side,
      type: order.type,
      amount: order.amount,
      filled: order.filled,
      remaining: order.remaining,
      price: order.price,
      average: order.average,
      status: order.status,
      fee: order.fee,
      timestamp: new Date().toISOString(),
      raw: order
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      error_type: error.constructor.name,
      orderId,
      symbol,
      timestamp: new Date().toISOString()
    };
  }
}

// Tool 4: mexc_spot_cancel_order
async function mexc_spot_cancel_order(orderId, symbol = null) {
  try {
    const mexc = getMEXCClient();
    
    if (!orderId) {
      throw new Error('orderId is required');
    }
    
    if (!symbol) {
      throw new Error('symbol is required to cancel order');
    }
    
    const formattedSymbol = symbol.toUpperCase().replace('/', '');
    
    console.log(`❌ Cancelling order ${orderId} for ${formattedSymbol}`);
    
    const result = await mexc.cancelOrder(orderId, formattedSymbol);
    
    return {
      success: true,
      orderId: result.id,
      symbol: result.symbol,
      cancelled: true,
      timestamp: new Date().toISOString(),
      raw: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      error_type: error.constructor.name,
      orderId,
      symbol,
      timestamp: new Date().toISOString()
    };
  }
}

// Tool 5: mexc_spot_get_ticker
async function mexc_spot_get_ticker(symbol) {
  try {
    const mexc = getMEXCClient();
    const formattedSymbol = symbol.toUpperCase().replace('/', '');
    
    const ticker = await mexc.fetchTicker(formattedSymbol);
    
    return {
      success: true,
      symbol: ticker.symbol,
      last: ticker.last,
      high: ticker.high,
      low: ticker.low,
      volume: ticker.volume,
      timestamp: new Date().toISOString(),
      raw: ticker
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      error_type: error.constructor.name,
      symbol: symbol,
      timestamp: new Date().toISOString()
    };
  }
}

// Export tools for OpenClaw
module.exports = {
  mexc_spot_get_balance,
  mexc_spot_place_order,
  mexc_spot_get_order,
  mexc_spot_cancel_order,
  mexc_spot_get_ticker,
  getMEXCClient // Export for other modules
};