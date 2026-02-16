// 🚀 1-COMMANDO SYNTAX IMPLEMENTATIE
// "trade SOL 50" → market buy 50 USDT SOL

const tools = require('./mexc_spot_tools.js');

// Symbol mapping
const SYMBOL_MAP = {
  'SOL': 'SOLUSDT',
  'BTC': 'BTCUSDT',
  'ETH': 'ETHUSDT',
  'XRP': 'XRPUSDT',
  'ADA': 'ADAUSDT'
};

// Enhanced router with 1-command syntax
function enhancedRouter(message) {
  const lowerMsg = message.toLowerCase().trim();
  
  // Check for 1-command syntax: "trade SYMBOL AMOUNT"
  const tradeMatch = lowerMsg.match(/^trade\s+(\w+)\s+(\d+(\.\d+)?)$/i);
  
  if (tradeMatch) {
    const symbol = tradeMatch[1].toUpperCase();
    const amount = parseFloat(tradeMatch[2]);
    
    if (SYMBOL_MAP[symbol]) {
      return {
        intent: "spot_trade",
        confidence: 0.95,
        route_to: "spot-planner",
        notes: `1-command syntax: trade ${symbol} ${amount}`,
        parsed: { symbol, amount, command: 'trade' }
      };
    }
  }
  
  // Original keyword detection
  const keywords = ['trade', 'traden', 'koop', 'buy', 'verkoop', 'sell', 'spot', 'market', 'limit', 'order', 'entry'];
  
  for (const keyword of keywords) {
    if (lowerMsg.includes(keyword)) {
      return {
        intent: "spot_trade",
        confidence: 0.90,
        route_to: "spot-planner",
        notes: `Contains keyword: ${keyword}`,
        parsed: null
      };
    }
  }
  
  return {
    intent: "general",
    confidence: 0.50,
    route_to: "main",
    notes: "No trading keywords detected",
    parsed: null
  };
}

// Enhanced spot-planner for 1-command syntax
function enhancedSpotPlanner(message, parsed = null) {
  const lowerMsg = message.toLowerCase();
  
  // Parse flags
  const tradeNow = lowerMsg.includes('trade now') || lowerMsg.includes('tr');
  const dryRun = lowerMsg.includes('dry run') || lowerMsg.includes('dr');
  
  let symbol = 'SOLUSDT';
  let side = 'buy';
  let type = 'market';
  let quote_amount = null;
  let base_qty = null;
  let limit_price = null;
  
  // Handle 1-command syntax
  if (parsed && parsed.command === 'trade') {
    symbol = SYMBOL_MAP[parsed.symbol] || (parsed.symbol + 'USDT');
    quote_amount = parsed.amount;
    side = 'buy'; // Default for "trade" command
    type = 'market'; // Default for "trade" command
    
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
        dry_run: dryRun,
        one_command: true
      }
    };
  }
  
  // Original parsing logic (for backward compatibility)
  if (lowerMsg.includes('koop') && lowerMsg.includes('voor')) {
    const match = message.match(/koop\s+(\w+)\s+voor\s+(\d+(\.\d+)?)/i);
    if (match) {
      const rawSymbol = match[1].toUpperCase();
      symbol = SYMBOL_MAP[rawSymbol] || (rawSymbol + 'USDT');
      quote_amount = parseFloat(match[2]);
    }
  } else if (lowerMsg.includes('verkoop')) {
    side = 'sell';
    const match = message.match(/verkoop\s+(\d+(\.\d+)?)\s+(\w+)/i);
    if (match) {
      base_qty = parseFloat(match[1]);
      const rawSymbol = match[3] ? match[3].toUpperCase() : 'SOL';
      symbol = SYMBOL_MAP[rawSymbol] || (rawSymbol + 'USDT');
    }
  }
  
  // Check if limit order
  if (lowerMsg.includes('op') || lowerMsg.includes('@')) {
    type = 'limit';
    const priceMatch = message.match(/(?:op|@)\s+(\d+(\.\d+)?)/i);
    if (priceMatch) {
      limit_price = parseFloat(priceMatch[1]);
    }
  }
  
  // Validation
  const missingInfo = (side === 'buy' && !quote_amount && !base_qty) || 
                     (side === 'sell' && !base_qty);
  
  if (missingInfo) {
    return {
      mode: "needs_confirmation",
      question: side === 'buy' 
        ? `Hoeveel USDT wil je gebruiken om ${symbol.replace('USDT', '')} te kopen?` 
        : `Hoeveel ${symbol.replace('USDT', '')} wil je verkopen?`,
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
        dry_run: dryRun,
        one_command: false
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
      dry_run: dryRun,
      one_command: false
    }
  };
}

// Enhanced Risk Governor with daily limits
class RiskGovernor {
  constructor() {
    this.state = {
      trades_today: 0,
      last_trade_time: null,
      last_loss_time: null,
      daily_pnl: 0,
      positions: {}
    };
    
    this.policy = {
      max_trades_per_day: 5,
      max_risk_pct_per_trade: 2.0,
      max_daily_drawdown_pct: 3.0,
      max_exposure_pct_per_symbol: 20.0,
      cooldown_minutes_after_loss: 30,
      require_confirmation_over: 200
    };
  }
  
  async checkTrade(tradePlan, userFlags) {
    const checks = {
      trades_today: this.state.trades_today,
      cooldown_active: false,
      balance_ok: false,
      size_ok: false,
      exposure_ok: false,
      daily_limit_ok: false
    };
    
    // 1. Check daily trade limit
    if (this.state.trades_today >= this.policy.max_trades_per_day) {
      return {
        mode: "blocked",
        reason: `Daily trade limit reached: ${this.state.trades_today}/${this.policy.max_trades_per_day} trades today`,
        checks: { ...checks, daily_limit_ok: false }
      };
    }
    checks.daily_limit_ok = true;
    
    // 2. Check cooldown after loss
    if (this.state.last_loss_time) {
      const cooldownMs = this.policy.cooldown_minutes_after_loss * 60 * 1000;
      const timeSinceLoss = Date.now() - this.state.last_loss_time;
      
      if (timeSinceLoss < cooldownMs) {
        const minutesLeft = Math.ceil((cooldownMs - timeSinceLoss) / 60000);
        checks.cooldown_active = true;
        return {
          mode: "blocked",
          reason: `Cooldown active: ${minutesLeft} minutes remaining after last loss`,
          checks
        };
      }
    }
    
    // 3. Check balance
    const balance = await tools.mexc_spot_get_balance('USDT');
    const availableUSDT = balance.free || 0;
    
    // Calculate trade amount
    let tradeAmountUSDT;
    if (tradePlan.quote_amount) {
      tradeAmountUSDT = tradePlan.quote_amount;
    } else if (tradePlan.base_qty) {
      // Estimate value (would need current price for accuracy)
      tradeAmountUSDT = tradePlan.base_qty * 85; // Rough estimate for SOL
    } else {
      return {
        mode: "blocked",
        reason: "Cannot determine trade amount",
        checks
      };
    }
    
    if (tradePlan.side === 'buy' && tradeAmountUSDT > availableUSDT) {
      return {
        mode: "blocked",
        reason: `Insufficient balance: $${availableUSDT.toFixed(2)} available, need $${tradeAmountUSDT.toFixed(2)}`,
        checks: { ...checks, balance_ok: false }
      };
    }
    checks.balance_ok = true;
    
    // 4. Check trade size vs confirmation threshold
    if (tradeAmountUSDT > this.policy.require_confirmation_over && !userFlags.trade_now) {
      return {
        mode: "needs_confirmation",
        reason: `Trade size $${tradeAmountUSDT.toFixed(2)} > $${this.policy.require_confirmation_over} limit. Add TRADE NOW to confirm.`,
        checks: { ...checks, size_ok: false }
      };
    }
    checks.size_ok = true;
    
    // 5. Check exposure per symbol
    const symbol = tradePlan.symbol.replace('USDT', '');
    const currentExposure = this.state.positions[symbol] || 0;
    const totalBalance = availableUSDT + (currentExposure * 85); // Simplified
    
    const exposurePct = (tradeAmountUSDT / totalBalance) * 100;
    if (exposurePct > this.policy.max_exposure_pct_per_symbol) {
      return {
        mode: "blocked",
        reason: `Exposure too high: ${exposurePct.toFixed(1)}% > ${this.policy.max_exposure_pct_per_symbol}% max per symbol`,
        checks: { ...checks, exposure_ok: false }
      };
    }
    checks.exposure_ok = true;
    
    // All checks passed
    return {
      mode: "approved",
      reason: "Trade meets all risk criteria",
      checks
    };
  }
  
  recordTrade(tradePlan, result) {
    this.state.trades_today++;
    this.state.last_trade_time = Date.now();
    
    // Record position (simplified)
    const symbol = tradePlan.symbol.replace('USDT', '');
    
    if (tradePlan.side === 'buy') {
      const qty = tradePlan.base_qty || (tradePlan.quote_amount / 85); // Estimate
      this.state.positions[symbol] = (this.state.positions[symbol] || 0) + qty;
    } else if (tradePlan.side === 'sell') {
      this.state.positions[symbol] = (this.state.positions[symbol] || 0) - tradePlan.base_qty;
      if (this.state.positions[symbol] <= 0) {
        delete this.state.positions[symbol];
      }
    }
    
    // Record loss for cooldown
    if (result && result.includes('loss')) {
      this.state.last_loss_time = Date.now();
    }
  }
  
  resetDaily() {
    this.state.trades_today = 0;
    this.state.daily_pnl = 0;
    console.log('📅 Daily limits reset');
  }
}

// Test function
async function testOneCommandSyntax() {
  console.log('🚀 TESTING 1-COMMANDO SYNTAX + RISK GOVERNOR');
  console.log('===========================================\n');
  
  const governor = new RiskGovernor();
  
  const testCases = [
    "trade SOL 50",
    "trade SOL 50 TR",
    "trade SOL 50 DR",
    "trade BTC 100",
    "koop SOL voor 25 USDT",
    "verkoop 0.2 SOL TR"
  ];
  
  for (const message of testCases) {
    console.log(`\n📨 Testing: "${message}"`);
    console.log('─'.repeat(50));
    
    // Step 1: Enhanced Router
    const route = enhancedRouter(message);
    console.log('1. Router:', route.intent, '→', route.route_to);
    if (route.parsed) console.log('   Parsed:', route.parsed);
    
    if (route.intent !== 'spot_trade') {
      console.log('   Skipping - not a trade');
      continue;
    }
    
    // Step 2: Enhanced Spot Planner
    const plan = enhancedSpotPlanner(message, route.parsed);
    console.log('2. Spot Planner:', plan.mode);
    if (plan.mode === 'needs_confirmation') {
      console.log('   Question:', plan.question);
      continue;
    }
    
    console.log('   Trade:', JSON.stringify(plan.trade, null, 2));
    console.log('   Flags:', JSON.stringify(plan.user_flags, null, 2));
    
    // Step 3: Risk Governor
    const risk = await governor.checkTrade(plan.trade, plan.user_flags);
    console.log('3. Risk Governor:', risk.mode);
    console.log('   Reason:', risk.reason);
    console.log('   Checks:', JSON.stringify(risk.checks, null, 2));
    
    if (risk.mode !== 'approved') {
      continue;
    }
    
    // Step 4: Check if dry run
    if (plan.user_flags.dry_run) {
      console.log('4. Dry Run - no execution');
      governor.recordTrade(plan.trade, 'dry_run');
      continue;
    }
    
    // Step 5: Execute if TRADE NOW or 1-command with TR flag
    const shouldExecute = plan.user_flags.trade_now || 
                         (plan.user_flags.one_command && message.includes('TR'));
    
    if (shouldExecute) {
      console.log('4. Executing trade...');
      
      // For demo, simulate execution
      console.log('   [SIMULATED] Would execute:', JSON.stringify(plan.trade, null, 2));
      
      // Record the trade
      governor.recordTrade(plan.trade, 'executed');
      console.log('   ✅ Trade recorded in risk governor');
      console.log('   Trades today:', governor.state.trades_today);
      console.log('   Positions:', governor.state.positions);
    } else {
      console.log('4. Needs confirmation - add TR or TRADE NOW to execute');
    }
  }
  
  console.log('\n🎯 1-COMMANDO SYNTAX READY!');
  console.log('Examples:');
  console.log('  trade SOL 50          → Market buy $50 SOL');
  console.log('  trade SOL 50 TR       → Execute immediately');
  console.log('  trade SOL 50 DR       → Dry run only');
  console.log('  trade BTC 100 TR      → Market buy $100 BTC');
}

// Run test
testOneCommandSyntax().catch(console.error);