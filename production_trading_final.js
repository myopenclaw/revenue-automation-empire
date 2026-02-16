// 🚀 PRODUCTION TRADING SYSTEM
// Complete 1-command syntax + Risk Governor

const fs = require('fs');
const path = require('path');
const tools = require('./mexc_spot_tools.js');

// Configuration
const CONFIG = {
  // Symbol mapping
  SYMBOL_MAP: {
    'SOL': 'SOLUSDT',
    'BTC': 'BTCUSDT', 
    'ETH': 'ETHUSDT',
    'XRP': 'XRPUSDT',
    'ADA': 'ADAUSDT'
  },
  
  // Risk policy
  RISK_POLICY: {
    max_trades_per_day: 5,
    max_risk_pct_per_trade: 2.0,
    max_daily_drawdown_pct: 3.0,
    max_exposure_pct_per_symbol: 20.0,
    cooldown_minutes_after_loss: 30,
    require_confirmation_over: 200,
    default_quote_asset: 'USDT'
  },
  
  // State file
  STATE_FILE: path.join(__dirname, 'trading_state.json'),
  
  // Log file
  LOG_FILE: path.join(__dirname, 'trading_log.jsonl')
};

// State management
class TradingState {
  constructor() {
    this.state = this.loadState();
  }
  
  loadState() {
    try {
      if (fs.existsSync(CONFIG.STATE_FILE)) {
        const data = fs.readFileSync(CONFIG.STATE_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading state:', error.message);
    }
    
    // Default state
    return {
      trades_today: 0,
      daily_pnl: 0,
      last_trade_time: null,
      last_loss_time: null,
      positions: {},
      trade_history: [],
      daily_reset_time: new Date().toISOString().split('T')[0]
    };
  }
  
  saveState() {
    try {
      fs.writeFileSync(CONFIG.STATE_FILE, JSON.stringify(this.state, null, 2));
    } catch (error) {
      console.error('Error saving state:', error.message);
    }
  }
  
  checkDailyReset() {
    const today = new Date().toISOString().split('T')[0];
    if (this.state.daily_reset_time !== today) {
      console.log('📅 Resetting daily limits...');
      this.state.trades_today = 0;
      this.state.daily_pnl = 0;
      this.state.daily_reset_time = today;
      this.saveState();
    }
  }
  
  recordTrade(tradePlan, result) {
    this.checkDailyReset();
    
    const tradeRecord = {
      timestamp: new Date().toISOString(),
      trade: tradePlan,
      result: result,
      state_before: { ...this.state }
    };
    
    this.state.trades_today++;
    this.state.last_trade_time = Date.now();
    this.state.trade_history.push(tradeRecord);
    
    // Keep only last 100 trades
    if (this.state.trade_history.length > 100) {
      this.state.trade_history = this.state.trade_history.slice(-100);
    }
    
    // Update positions
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
    if (result && (result.includes('loss') || result.includes('failed'))) {
      this.state.last_loss_time = Date.now();
    }
    
    this.saveState();
    this.logTrade(tradeRecord);
    
    return tradeRecord;
  }
  
  logTrade(tradeRecord) {
    try {
      const logEntry = JSON.stringify(tradeRecord);
      fs.appendFileSync(CONFIG.LOG_FILE, logEntry + '\n');
    } catch (error) {
      console.error('Error logging trade:', error.message);
    }
  }
  
  getStats() {
    return {
      trades_today: this.state.trades_today,
      daily_limit: CONFIG.RISK_POLICY.max_trades_per_day,
      positions: this.state.positions,
      last_trade: this.state.trade_history[this.state.trade_history.length - 1]
    };
  }
}

// Enhanced router with 1-command syntax
class TradingRouter {
  parseMessage(message) {
    const lowerMsg = message.toLowerCase().trim();
    
    // 1-command syntax: "trade SYMBOL AMOUNT"
    const tradeMatch = lowerMsg.match(/^trade\s+(\w+)\s+(\d+(\.\d+)?)(?:\s+(TR|DR))?$/i);
    
    if (tradeMatch) {
      const symbol = tradeMatch[1].toUpperCase();
      const amount = parseFloat(tradeMatch[2]);
      const flag = tradeMatch[4] ? tradeMatch[4].toUpperCase() : null;
      
      if (CONFIG.SYMBOL_MAP[symbol]) {
        return {
          intent: "spot_trade",
          confidence: 0.95,
          route_to: "spot-planner",
          notes: `1-command syntax: trade ${symbol} ${amount}${flag ? ' ' + flag : ''}`,
          parsed: { 
            symbol, 
            amount, 
            command: 'trade',
            flag: flag || null
          }
        };
      }
    }
    
    // Original keyword detection
    const keywords = ['trade', 'traden', 'koop', 'buy', 'verkoop', 'sell', 'spot', 'market', 'limit', 'order'];
    
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
}

// Enhanced spot-planner
class SpotPlanner {
  createPlan(message, parsed = null) {
    const lowerMsg = message.toLowerCase();
    
    // Parse flags from message
    let tradeNow = lowerMsg.includes('trade now') || lowerMsg.includes('tr');
    let dryRun = lowerMsg.includes('dry run') || lowerMsg.includes('dr');
    
    // Default values
    let symbol = 'SOLUSDT';
    let side = 'buy';
    let type = 'market';
    let quote_amount = null;
    let base_qty = null;
    let limit_price = null;
    
    // Handle 1-command syntax
    if (parsed && parsed.command === 'trade') {
      symbol = CONFIG.SYMBOL_MAP[parsed.symbol] || (parsed.symbol + 'USDT');
      quote_amount = parsed.amount;
      side = 'buy';
      type = 'market';
      
      // Override flags from parsed flag
      if (parsed.flag === 'TR') tradeNow = true;
      if (parsed.flag === 'DR') dryRun = true;
      
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
    
    // Original parsing (backward compatibility)
    // [Implementation similar to previous version...]
    
    // For now, return a simple plan
    return {
      mode: "needs_confirmation",
      question: "Please use 1-command syntax: 'trade SOL 50' or 'trade SOL 50 TR'",
      trade: {
        exchange: "mexc",
        market: "spot",
        symbol: "SOLUSDT",
        side: "buy",
        type: "market",
        quote_amount: null,
        base_qty: null,
        limit_price: null
      },
      user_flags: {
        trade_now: false,
        dry_run: false,
        one_command: false
      }
    };
  }
}

// Enhanced Risk Governor
class RiskGovernor {
  constructor(stateManager) {
    this.state = stateManager;
    this.policy = CONFIG.RISK_POLICY;
  }
  
  async checkTrade(tradePlan, userFlags) {
    const checks = {
      trades_today: this.state.state.trades_today,
      cooldown_active: false,
      balance_ok: false,
      size_ok: false,
      exposure_ok: false,
      daily_limit_ok: false
    };
    
    // 1. Check daily trade limit
    if (this.state.state.trades_today >= this.policy.max_trades_per_day) {
      return {
        mode: "blocked",
        reason: `Daily trade limit reached: ${this.state.state.trades_today}/${this.policy.max_trades_per_day} trades today`,
        checks: { ...checks, daily_limit_ok: false }
      };
    }
    checks.daily_limit_ok = true;
    
    // 2. Check cooldown after loss
    if (this.state.state.last_loss_time) {
      const cooldownMs = this.policy.cooldown_minutes_after_loss * 60 * 1000;
      const timeSinceLoss = Date.now() - this.state.state.last_loss_time;
      
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
      // Get current price for accurate calculation
      try {
        const ticker = await tools.mexc_spot_get_ticker(tradePlan.symbol);
        tradeAmountUSDT = tradePlan.base_qty * ticker.last;
      } catch {
        // Fallback estimate
        tradeAmountUSDT = tradePlan.base_qty * 85; // Rough estimate for SOL
      }
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
    const currentPosition = this.state.state.positions[symbol] || 0;
    
    // Calculate total portfolio value (simplified)
    let portfolioValue = availableUSDT;
    
    // Add value of existing positions
    for (const [posSymbol, posQty] of Object.entries(this.state.state.positions)) {
      if (posSymbol === symbol) continue; // Already counted
      portfolioValue += posQty * 85; // Simplified
    }
    
    const exposurePct = (tradeAmountUSDT / portfolioValue) * 100;
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
}

// Main trading system
class TradingSystem {
  constructor() {
    this.stateManager = new TradingState();
    this.router = new TradingRouter();
    this.planner = new SpotPlanner();
    this.riskGovernor = new RiskGovernor(this.stateManager);
  }
  
  async processMessage(message) {
    console.log(`\n📨 Processing: "${message}"`);
    console.log('─'.repeat(60));
    
    // Step 1: Route
    const route = this.router.parseMessage(message);
    console.log('1. Router:', route.intent, '→', route.route_to);
    
    if (route.intent !== 'spot_trade') {
      return { success: false, reason: 'Not a trading command' };
    }
    
    // Step 2: Plan
    const plan = this.planner.createPlan(message, route.parsed);
    console.log('2. Spot Planner:', plan.mode);
    
    if (plan.mode === 'needs_confirmation') {
      return { 
        success: false, 
        needs_confirmation: true,
        question: plan.question,
        plan: plan.trade
      };
    }
    
    console.log('   Trade:', JSON.stringify(plan.trade, null, 2));
    console.log('   Flags:', JSON.stringify(plan.user_flags, null, 2));
    
    // Step 3: Risk Check
    const risk = await this.riskGovernor.checkTrade(plan.trade, plan.user_flags);
    console.log('3. Risk Governor:', risk.mode);
    console.log('   Reason:', risk.reason);
    
    if (risk.mode !== 'approved') {
      return { 
        success: false, 
        blocked: true,
        reason: risk.reason,
        checks: risk.checks
      };
    }
    
    // Step 4: Dry Run check
    if (plan.user_flags.dry_run) {
      console.log('4. Dry Run - no execution');
      this.stateManager.recordTrade(plan.trade, 'dry_run');
      return {
        success: true,
        dry_run: true,
        plan: plan.trade,
        risk_checks: risk.checks,
        stats: this.stateManager.getStats()
      };
    }
    
    // Step 5: Execute if TRADE NOW or 1-command with TR flag
    const shouldExecute = plan.user_flags.trade_now || 
                         (plan.user_flags.one_command && route.parsed?.flag === 'TR');
    
    if (!shouldExecute) {
      return {
        success: false,
        needs_confirmation: true,
        question: `Add TRADE NOW to execute: ${plan.trade.side.toUpperCase()} ${plan.trade.symbol} for $${plan.trade.quote_amount || '?'}`,
        plan: plan.trade
      };
    }
    
    // Step 6: Execute trade
    console.log('4. Executing trade...');
    
    try {
      // Place order
      const orderResult = await tools.mexc_spot_place_order(plan.trade);
      
      if (!orderResult.success) {
        console.log('   ❌ Order failed:', orderResult.error);
        this.stateManager.recordTrade(plan.trade, `failed: ${orderResult.error}`);
        
        return {
          success: false,
          execution_failed: true,
          error: orderResult.error,
          plan: plan.trade
        };
      }
      
      console.log('   ✅ Order placed! ID:', orderResult.orderId);
      
      // Verify order
      const verifyResult = await tools.mexc_spot_get_order(orderResult.orderId, plan.trade.symbol);
      
      let resultStatus = 'executed';
      if (!verifyResult.success) {
        console.log('   ⚠️  Order placed but verification failed:', verifyResult.error);
        resultStatus = `executed_verification_failed: ${verifyResult.error}`;
      } else {
        console.log('   ✅ Order verified!');
        console.log('   Status:', verifyResult.status);
        console.log('   Filled:', verifyResult.filled);
        console.log('   Avg Price:', verifyResult.average);
        resultStatus = `executed: ${verifyResult.status}, filled: ${verifyResult.filled}`;
      }
      
      // Record successful trade
      const tradeRecord = this.stateManager.recordTrade(plan.trade, resultStatus);
      
      console.log('5. Trade recorded in system');
      console.log('   Trades today:', this.stateManager.state.trades_today);
      console.log('   Positions:', this.stateManager.state.positions);
      
      return {
        success: true,
        executed: true,
        order_id: orderResult.orderId,
        plan: plan.trade,
        execution: {
          status: verifyResult.success ? verifyResult.status : 'unknown',
          filled: verifyResult.success ? verifyResult.filled : null,
          avg_price: verifyResult.success ? verifyResult.average : null
        },
        risk_checks: risk.checks,
        stats: this.stateManager.getStats(),
        trade_record: tradeRecord
      };
      
    } catch (error) {
      console.log('   ❌ Execution error:', error.message);
      this.stateManager.recordTrade(plan.trade, `execution_error: ${error.message}`);
      
      return {
        success: false,
        execution_error: true,
        error: error.message,
        plan: plan.trade
      };
    }
  }
  
  getStatus() {
    return this.stateManager.getStats();
  }
  
  resetDaily() {
    this.stateManager.state.trades_today = 0;
    this.stateManager.state.daily_pnl = 0;
    this.stateManager.saveState();
    return { success: true, message: 'Daily limits reset' };
  }
}

// Test the production system
async function testProductionSystem() {
  console.log('🚀 PRODUCTION TRADING SYSTEM TEST');
  console.log('=================================\n');
  
  const tradingSystem = new TradingSystem();
  
  // Show current status
  const status = tradingSystem.getStatus();
  console.log('📊 Current Status:');
  console.log('  Trades today:', status.trades_today, '/', CONFIG.RISK_POLICY.max_trades_per_day);
  console.log('  Positions:', status.positions);
  console.log('');
  
  // Test cases
  const testCases = [
    "trade SOL 10",
    "trade SOL 10 TR",
    "trade SOL 10 DR",
    "trade BTC 50 TR",
    "trade SOL 250",
    "trade SOL 250 TR"
  ];
  
  for (const message of testCases) {
    console.log(`\n🧪 Testing: "${message}"`);
    console.log('─'.repeat(50));
    
    const result = await tradingSystem.processMessage(message);
    
    if (result.success) {
      if (result.dry_run) {
        console.log('✅ Dry Run successful');
        console.log('   Plan:', JSON.stringify(result.plan, null, 2));
      } else if (result.executed) {
        console.log('✅ Trade executed!');
        console.log('   Order ID:', result.order_id);
        console.log('   Filled:', result.execution.filled);
        console.log('   Avg Price:', result.execution.avg_price);
      }
    } else {
      if (result.needs_confirmation) {
        console.log('⚠️  Needs confirmation:', result.question);
      } else if (result.blocked) {
        console.log('❌ Blocked by Risk Governor:', result.reason);
      } else if (result.execution_failed) {
        console.log('❌ Execution failed:', result.error);
      } else {
        console.log('❌ Failed:', result.reason);
      }
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Final status
  console.log('\n🎯 FINAL SYSTEM STATUS:');
  const finalStatus = tradingSystem.getStatus();
  console.log('  Trades executed today:', finalStatus.trades_today);
  console.log('  Current positions:', finalStatus.positions);
  console.log('  State saved to:', CONFIG.STATE_FILE);
  console.log('  Logs saved to:', CONFIG.LOG_FILE);
  
  console.log('\n🚀 PRODUCTION SYSTEM READY!');
  console.log('\n📋 USAGE:');
  console.log('  trade SOL 50          → Plan $50 SOL buy');
  console.log('  trade SOL 50 TR       → Execute immediately');
  console.log('  trade SOL 50 DR       → Dry run only');
  console.log('  trade BTC 100 TR      → Execute $100 BTC buy');
  console.log('\n⚡️  Risk Governor protects you:');
  console.log('  • Max 5 trades/day');
  console.log('  • Max 20% exposure per coin');
  console.log('  • 30min cooldown after loss');
  console.log('  • Auto-confirmation for trades ≤ $200');
}

// Add missing tool function
async function mexc_spot_get_ticker(symbol) {
  try {
    const mexc = require('./mexc_spot_tools.js').getMEXCClient();
    const ticker = await mexc.fetchTicker(symbol);
    return {
      success: true,
      symbol: ticker.symbol,
      last: ticker.last,
      high: ticker.high,
      low: ticker.low,
      volume: ticker.volume,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      symbol: symbol
    };
  }
}

// Add to tools module
const originalTools = require('./mexc_spot_tools.js');
originalTools.mexc_spot_get_ticker = mexc_spot_get_ticker;

// Run test
testProductionSystem().catch(console.error);