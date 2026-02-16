// 🚀 COMPLETE PIPELINE TEST
// Test de hele flow: router → planner → executor

const tools = require('./mexc_spot_tools.js');

// Simulated router function
function router(message) {
  const lowerMsg = message.toLowerCase();
  
  const keywords = ['trade', 'traden', 'koop', 'buy', 'verkoop', 'sell', 'spot', 'market', 'limit', 'order', 'entry', 'tp', 'sl'];
  
  for (const keyword of keywords) {
    if (lowerMsg.includes(keyword)) {
      return {
        intent: "spot_trade",
        confidence: 0.90,
        route_to: "spot-planner",
        notes: `Contains keyword: ${keyword}`
      };
    }
  }
  
  return {
    intent: "general",
    confidence: 0.50,
    route_to: "main",
    notes: "No trading keywords detected"
  };
}

// Simulated spot-planner function
function spotPlanner(message) {
  const lowerMsg = message.toLowerCase();
  
  // Parse the message
  const tradeNow = lowerMsg.includes('trade now');
  const dryRun = lowerMsg.includes('dry run');
  
  // Simple parsing for demo
  let symbol = 'SOLUSDT';
  let side = 'buy';
  let type = 'market';
  let quote_amount = null;
  let base_qty = null;
  let limit_price = null;
  
  // Very basic parsing
  if (lowerMsg.includes('koop') && lowerMsg.includes('voor')) {
    // "koop SOL voor 50 USDT"
    const match = message.match(/voor\s+(\d+)/i);
    if (match) {
      quote_amount = parseFloat(match[1]);
    }
  } else if (lowerMsg.includes('verkoop')) {
    side = 'sell';
    const match = message.match(/verkoop\s+(\d+\.?\d*)/i);
    if (match) {
      base_qty = parseFloat(match[1]);
    }
  }
  
  // Check if we have enough info
  if ((side === 'buy' && !quote_amount && !base_qty) || (side === 'sell' && !base_qty)) {
    return {
      mode: "needs_confirmation",
      question: side === 'buy' ? "Hoeveel USDT wil je gebruiken?" : "Hoeveel SOL wil je verkopen?",
      trade: {
        exchange: "mexc",
        market: "spot",
        symbol,
        side,
        type,
        quote_amount,
        base_qty,
        limit_price
      },
      user_flags: {
        trade_now: tradeNow,
        dry_run: dryRun
      }
    };
  }
  
  return {
    mode: "planned",
    question: null,
    trade: {
      exchange: "mexc",
      market: "spot",
      symbol,
      side,
      type,
      quote_amount,
      base_qty,
      limit_price
    },
    user_flags: {
      trade_now: tradeNow,
      dry_run: dryRun
    }
  };
}

// Simulated risk governor
async function riskGovernor(tradePlan, userFlags) {
  // Simple risk checks
  const checks = {
    trades_today: 0, // Would come from store
    cooldown_active: false,
    balance_ok: false,
    size_ok: false
  };
  
  // Check balance
  const balance = await tools.mexc_spot_get_balance('USDT');
  const availableUSDT = balance.free || 0;
  
  // Check trade size
  const tradeAmount = tradePlan.quote_amount || (tradePlan.base_qty * 85); // Estimate
  
  if (tradeAmount > 200 && !userFlags.trade_now) {
    return {
      mode: "needs_confirmation",
      reason: `Trade size $${tradeAmount} > $200 limit. Add TRADE NOW to confirm.`,
      checks
    };
  }
  
  if (tradePlan.side === 'buy' && tradePlan.quote_amount > availableUSDT) {
    return {
      mode: "blocked",
      reason: `Insufficient balance: $${availableUSDT} available, need $${tradePlan.quote_amount}`,
      checks: { ...checks, balance_ok: false }
    };
  }
  
  checks.balance_ok = true;
  checks.size_ok = tradeAmount <= 200 || userFlags.trade_now;
  
  return {
    mode: "approved",
    reason: "Trade meets risk criteria",
    checks
  };
}

// Main test function
async function testPipeline() {
  console.log('🚀 COMPLETE PIPELINE TEST');
  console.log('========================\n');
  
  const testMessages = [
    "koop SOL voor 10 USDT DRY RUN",
    "koop SOL voor 10 USDT",
    "koop SOL voor 10 USDT TRADE NOW",
    "verkoop 0.1 SOL TRADE NOW"
  ];
  
  for (const message of testMessages) {
    console.log(`\n📨 Testing: "${message}"`);
    console.log('─'.repeat(50));
    
    // Step 1: Router
    const route = router(message);
    console.log('1. Router:', route.intent, '→', route.route_to);
    
    if (route.intent !== 'spot_trade') {
      console.log('   Skipping - not a trade');
      continue;
    }
    
    // Step 2: Spot Planner
    const plan = spotPlanner(message);
    console.log('2. Spot Planner:', plan.mode);
    console.log('   Trade:', JSON.stringify(plan.trade, null, 2));
    
    if (plan.mode === 'needs_confirmation') {
      console.log('   Question:', plan.question);
      continue;
    }
    
    // Step 3: Risk Governor
    const risk = await riskGovernor(plan.trade, plan.user_flags);
    console.log('3. Risk Governor:', risk.mode);
    console.log('   Reason:', risk.reason);
    
    if (risk.mode !== 'approved') {
      continue;
    }
    
    // Step 4: Check if dry run
    if (plan.user_flags.dry_run) {
      console.log('4. Dry Run - no execution');
      continue;
    }
    
    // Step 5: Execute (if TRADE NOW)
    if (plan.user_flags.trade_now) {
      console.log('4. Executing trade...');
      
      try {
        // Place order
        const orderResult = await tools.mexc_spot_place_order(plan.trade);
        
        if (!orderResult.success) {
          console.log('   ❌ Order failed:', orderResult.error);
          continue;
        }
        
        console.log('   ✅ Order placed! ID:', orderResult.orderId);
        
        // Verify order
        const verifyResult = await tools.mexc_spot_get_order(orderResult.orderId, plan.trade.symbol);
        
        if (!verifyResult.success) {
          console.log('   ⚠️  Order placed but verification failed:', verifyResult.error);
        } else {
          console.log('   ✅ Order verified!');
          console.log('   Status:', verifyResult.status);
          console.log('   Filled:', verifyResult.filled);
          console.log('   Avg Price:', verifyResult.average);
        }
        
      } catch (error) {
        console.log('   ❌ Execution error:', error.message);
      }
    } else {
      console.log('4. Needs confirmation - add TRADE NOW to execute');
    }
  }
  
  console.log('\n🎉 Pipeline test complete!');
}

// Run test
testPipeline().catch(console.error);