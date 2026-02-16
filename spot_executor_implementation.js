// 🚀 Spot Executor Implementation
// Direct implementation of spot-executor with tool calls

const tools = require('./mexc_spot_tools.js');

async function executeTrade() {
  console.log('🚀 EXECUTING TRADE: "koop SOL voor 10 USDT TRADE NOW"');
  console.log('=====================================================\n');
  
  const tradePlan = {
    exchange: "mexc",
    market: "spot",
    symbol: "SOLUSDT",
    side: "buy",
    type: "market",
    quote_amount: 10,
    base_qty: null,
    limit_price: null
  };
  
  const result = {
    mode: "failed", // default
    summary: "",
    trade: tradePlan,
    execution: {
      attempted: false,
      orderId: null,
      status: null,
      filledQty: null,
      avgPrice: null
    },
    verification: {
      verified: false,
      method: null,
      raw: null
    },
    errors: []
  };
  
  try {
    // STEP 1: Validate trade plan
    console.log('1. ✅ Validating trade plan...');
    if (!tradePlan.symbol || !tradePlan.side || !tradePlan.type) {
      result.errors.push("INVALID_TRADE_PLAN: Missing symbol, side, or type");
      result.summary = "Trade plan validation failed";
      return result;
    }
    
    if (!tradePlan.quote_amount && !tradePlan.base_qty) {
      result.errors.push("INVALID_TRADE_PLAN: Missing quote_amount or base_qty");
      result.summary = "Trade plan validation failed";
      return result;
    }
    
    console.log(`   Symbol: ${tradePlan.symbol}`);
    console.log(`   Side: ${tradePlan.side}`);
    console.log(`   Type: ${tradePlan.type}`);
    console.log(`   Amount: ${tradePlan.quote_amount || tradePlan.base_qty}`);
    
    // STEP 2: Check balance
    console.log('\n2. 💰 Checking balance...');
    const balanceResult = await tools.mexc_spot_get_balance('USDT');
    
    if (!balanceResult.success) {
      result.errors.push(`BALANCE_CHECK_FAILED: ${balanceResult.error}`);
      result.summary = "Failed to check balance";
      return result;
    }
    
    const availableUSDT = balanceResult.free;
    console.log(`   Available USDT: $${availableUSDT}`);
    
    if (availableUSDT < tradePlan.quote_amount) {
      result.errors.push(`INSUFFICIENT_BALANCE: Only $${availableUSDT} USDT available, need $${tradePlan.quote_amount}`);
      result.summary = `Insufficient balance for $${tradePlan.quote_amount} trade`;
      return result;
    }
    
    console.log(`   ✅ Sufficient balance: $${availableUSDT} >= $${tradePlan.quote_amount}`);
    
    // STEP 3: Place order
    console.log('\n3. 📤 Placing order...');
    const orderParams = {
      symbol: tradePlan.symbol,
      side: tradePlan.side,
      type: tradePlan.type,
      amount: tradePlan.quote_amount,
      price: tradePlan.limit_price
    };
    
    const orderResult = await tools.mexc_spot_place_order(orderParams);
    
    if (!orderResult.success) {
      result.errors.push(`ORDER_FAILED: ${orderResult.error}`);
      result.summary = "Failed to place order";
      return result;
    }
    
    console.log(`   ✅ Order placed! Order ID: ${orderResult.orderId}`);
    console.log(`   Status: ${orderResult.status}`);
    
    result.execution.attempted = true;
    result.execution.orderId = orderResult.orderId;
    result.execution.status = orderResult.status;
    result.execution.filledQty = orderResult.amount;
    result.execution.avgPrice = orderResult.price;
    
    // STEP 4: Verify order
    console.log('\n4. 🔍 Verifying order...');
    const verifyResult = await tools.mexc_spot_get_order(orderResult.orderId, tradePlan.symbol);
    
    if (!verifyResult.success) {
      result.errors.push(`VERIFICATION_FAILED: ${verifyResult.error}`);
      result.summary = "Order placed but verification failed";
      result.mode = "executed"; // Order was placed
      return result;
    }
    
    console.log(`   ✅ Order verified!`);
    console.log(`   Filled: ${verifyResult.filled}`);
    console.log(`   Remaining: ${verifyResult.remaining}`);
    console.log(`   Average price: ${verifyResult.average}`);
    
    result.verification.verified = true;
    result.verification.method = "mexc_spot_get_order";
    result.verification.raw = verifyResult.raw;
    
    result.execution.filledQty = verifyResult.filled;
    result.execution.avgPrice = verifyResult.average;
    result.execution.status = verifyResult.status;
    
    // STEP 5: Success!
    result.mode = "executed";
    result.summary = `MARKET BUY ${tradePlan.symbol} executed for $${tradePlan.quote_amount} USDT`;
    
    console.log('\n🎉 TRADE EXECUTED SUCCESSFULLY!');
    console.log('==============================');
    console.log(`Summary: ${result.summary}`);
    console.log(`Order ID: ${result.execution.orderId}`);
    console.log(`Filled: ${result.execution.filledQty} SOL`);
    console.log(`Avg Price: $${result.execution.avgPrice}`);
    console.log(`Status: ${result.execution.status}`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    result.errors.push(`UNEXPECTED_ERROR: ${error.message}`);
    result.summary = "Unexpected error during trade execution";
  }
  
  return result;
}

// Run the trade execution
executeTrade().then(result => {
  console.log('\n📊 FINAL RESULT:');
  console.log(JSON.stringify(result, null, 2));
  
  // Also show for user
  console.log('\n🚀 FOR USER:');
  if (result.mode === "executed") {
    console.log(`✅ ${result.summary}`);
    console.log(`   Order ID: ${result.execution.orderId}`);
    console.log(`   Filled: ${result.execution.filledQty} SOL`);
    console.log(`   Avg Price: $${result.execution.avgPrice}`);
  } else {
    console.log(`❌ ${result.summary}`);
    if (result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.join(', ')}`);
    }
  }
}).catch(error => {
  console.error('Fatal error:', error);
});