// 🚀 POSITION MONITOR
// TP ladder + Stop loss automation voor spot trading

const fs = require('fs');
const path = require('path');
const tools = require('./mexc_spot_tools.js');

// Configuration
const CONFIG = {
  TP_PLAN: [
    { pct_gain: 8, sell_pct: 25 },
    { pct_gain: 15, sell_pct: 25 },
    { pct_gain: 25, sell_pct: 50 }
  ],
  STOP_LOSS: { pct_drop: 6 },
  
  STATE_FILE: path.join(__dirname, 'position_state.json'),
  MONITOR_INTERVAL_MS: 30000, // Check every 30 seconds
  MAX_RETRIES: 3
};

// Position State Management
class PositionState {
  constructor() {
    this.positions = this.loadPositions();
  }
  
  loadPositions() {
    try {
      if (fs.existsSync(CONFIG.STATE_FILE)) {
        const data = fs.readFileSync(CONFIG.STATE_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading positions:', error.message);
    }
    return {};
  }
  
  savePositions() {
    try {
      fs.writeFileSync(CONFIG.STATE_FILE, JSON.stringify(this.positions, null, 2));
    } catch (error) {
      console.error('Error saving positions:', error.message);
    }
  }
  
  addPosition(symbol, entry) {
    const positionId = `${symbol}_${Date.now()}`;
    
    this.positions[positionId] = {
      id: positionId,
      symbol: symbol,
      entry_price: entry.price,
      entry_qty: entry.qty,
      remaining_qty: entry.qty,
      entry_time: new Date().toISOString(),
      status: 'open',
      tp_orders: [], // Array of { orderId, pct_gain, sell_pct, qty }
      stop_armed: true,
      last_check: null,
      pnl_pct: 0
    };
    
    this.savePositions();
    console.log(`✅ Position added: ${positionId}`);
    return positionId;
  }
  
  updatePosition(positionId, updates) {
    if (this.positions[positionId]) {
      this.positions[positionId] = {
        ...this.positions[positionId],
        ...updates,
        last_check: new Date().toISOString()
      };
      this.savePositions();
    }
  }
  
  removePosition(positionId) {
    if (this.positions[positionId]) {
      delete this.positions[positionId];
      this.savePositions();
      console.log(`🗑️  Position removed: ${positionId}`);
    }
  }
  
  getOpenPositions() {
    return Object.values(this.positions).filter(p => p.status === 'open');
  }
  
  getPositionBySymbol(symbol) {
    return Object.values(this.positions).find(p => p.symbol === symbol && p.status === 'open');
  }
}

// Position Monitor
class PositionMonitor {
  constructor() {
    this.state = new PositionState();
    this.isMonitoring = false;
    this.monitorInterval = null;
  }
  
  startMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️  Monitor already running');
      return;
    }
    
    console.log('🚀 Starting Position Monitor...');
    this.isMonitoring = true;
    
    // Initial check
    this.checkAllPositions();
    
    // Set up interval
    this.monitorInterval = setInterval(() => {
      this.checkAllPositions();
    }, CONFIG.MONITOR_INTERVAL_MS);
    
    console.log(`✅ Monitor started (checking every ${CONFIG.MONITOR_INTERVAL_MS/1000}s)`);
  }
  
  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.isMonitoring = false;
    console.log('🛑 Position Monitor stopped');
  }
  
  async checkAllPositions() {
    const openPositions = this.state.getOpenPositions();
    
    if (openPositions.length === 0) {
      console.log('📭 No open positions to monitor');
      return;
    }
    
    console.log(`\n🔍 Checking ${openPositions.length} open positions...`);
    
    for (const position of openPositions) {
      await this.checkPosition(position);
      
      // Small delay between positions to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  async checkPosition(position) {
    console.log(`\n📊 Position: ${position.symbol}`);
    console.log(`   Entry: ${position.entry_qty} @ $${position.entry_price}`);
    console.log(`   Remaining: ${position.remaining_qty}`);
    console.log(`   TP orders: ${position.tp_orders.length}`);
    
    try {
      // Get current price
      const ticker = await tools.mexc_spot_get_ticker(position.symbol);
      if (!ticker.success) {
        console.log(`   ❌ Failed to get price: ${ticker.error}`);
        return;
      }
      
      const currentPrice = ticker.last;
      const pnlPct = ((currentPrice - position.entry_price) / position.entry_price) * 100;
      
      console.log(`   Current: $${currentPrice} (${pnlPct.toFixed(2)}%)`);
      
      // Update position PnL
      this.state.updatePosition(position.id, { pnl_pct: pnlPct });
      
      // 1. Check if TP orders need to be placed
      if (position.tp_orders.length === 0) {
        console.log('   📤 Setting up TP ladder...');
        await this.setupTPLadder(position, currentPrice);
      } else {
        // Check TP order status
        await this.checkTPOrders(position);
      }
      
      // 2. Check stop loss
      if (position.stop_armed && pnlPct <= -CONFIG.STOP_LOSS.pct_drop) {
        console.log(`   🚨 Stop loss triggered! (${pnlPct.toFixed(2)}% <= -${CONFIG.STOP_LOSS.pct_drop}%)`);
        await this.executeStopLoss(position, currentPrice);
      }
      
    } catch (error) {
      console.log(`   ❌ Error checking position: ${error.message}`);
    }
  }
  
  async setupTPLadder(position, currentPrice) {
    const tpOrders = [];
    
    for (const tp of CONFIG.TP_PLAN) {
      const targetPrice = position.entry_price * (1 + tp.pct_gain / 100);
      const sellQty = position.entry_qty * (tp.sell_pct / 100);
      
      // Ensure we don't sell more than remaining
      const availableQty = position.remaining_qty;
      const actualSellQty = Math.min(sellQty, availableQty);
      
      if (actualSellQty <= 0) {
        console.log(`   ⚠️  Skipping TP ${tp.pct_gain}% - no quantity available`);
        continue;
      }
      
      console.log(`   TP ${tp.pct_gain}%: Sell ${actualSellQty.toFixed(4)} @ $${targetPrice.toFixed(2)}`);
      
      try {
        // Place limit sell order
        const orderResult = await tools.mexc_spot_place_order({
          symbol: position.symbol,
          side: 'sell',
          type: 'limit',
          base_qty: actualSellQty,
          price: targetPrice
        });
        
        if (orderResult.success) {
          tpOrders.push({
            orderId: orderResult.orderId,
            pct_gain: tp.pct_gain,
            sell_pct: tp.sell_pct,
            qty: actualSellQty,
            target_price: targetPrice,
            status: 'open'
          });
          console.log(`     ✅ Order placed: ${orderResult.orderId}`);
        } else {
          console.log(`     ❌ Failed to place order: ${orderResult.error}`);
        }
      } catch (error) {
        console.log(`     ❌ Error placing TP order: ${error.message}`);
      }
      
      // Small delay between orders
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (tpOrders.length > 0) {
      this.state.updatePosition(position.id, { tp_orders: tpOrders });
      console.log(`   ✅ TP ladder setup complete: ${tpOrders.length} orders placed`);
    } else {
      console.log('   ⚠️  No TP orders were placed');
    }
  }
  
  async checkTPOrders(position) {
    let updated = false;
    const updatedTPOrders = [...position.tp_orders];
    
    for (let i = 0; i < updatedTPOrders.length; i++) {
      const tpOrder = updatedTPOrders[i];
      
      if (tpOrder.status === 'filled' || tpOrder.status === 'cancelled') {
        continue;
      }
      
      try {
        const orderResult = await tools.mexc_spot_get_order(tpOrder.orderId, position.symbol);
        
        if (orderResult.success) {
          if (orderResult.status === 'closed' || orderResult.status === 'filled') {
            console.log(`   ✅ TP order ${tpOrder.orderId} filled!`);
            updatedTPOrders[i].status = 'filled';
            updatedTPOrders[i].filled_qty = orderResult.filled;
            updatedTPOrders[i].avg_price = orderResult.average;
            
            // Update remaining quantity
            const newRemainingQty = position.remaining_qty - orderResult.filled;
            this.state.updatePosition(position.id, { 
              remaining_qty: newRemainingQty 
            });
            
            updated = true;
            
            // If position is fully closed
            if (newRemainingQty <= 0) {
              console.log(`   🎉 Position fully closed via TP!`);
              this.state.updatePosition(position.id, { 
                status: 'closed',
                exit_price: orderResult.average,
                exit_time: new Date().toISOString()
              });
              break;
            }
          }
        } else {
          console.log(`   ⚠️  Could not check TP order ${tpOrder.orderId}: ${orderResult.error}`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking TP order: ${error.message}`);
      }
    }
    
    if (updated) {
      this.state.updatePosition(position.id, { tp_orders: updatedTPOrders });
    }
  }
  
  async executeStopLoss(position, currentPrice) {
    console.log(`   🚀 Executing stop loss market sell...`);
    
    try {
      const orderResult = await tools.mexc_spot_place_order({
        symbol: position.symbol,
        side: 'sell',
        type: 'market',
        base_qty: position.remaining_qty
      });
      
      if (orderResult.success) {
        console.log(`     ✅ Stop loss order placed: ${orderResult.orderId}`);
        
        // Verify order
        const verifyResult = await tools.mexc_spot_get_order(orderResult.orderId, position.symbol);
        
        if (verifyResult.success) {
          console.log(`     ✅ Order verified: ${verifyResult.status}, filled: ${verifyResult.filled}`);
          
          this.state.updatePosition(position.id, {
            status: 'closed',
            exit_price: verifyResult.average || currentPrice,
            exit_time: new Date().toISOString(),
            remaining_qty: 0,
            stop_armed: false,
            exit_reason: 'stop_loss'
          });
          
          // Cancel any remaining TP orders
          await this.cancelTPOrders(position);
          
          console.log(`   🎯 Stop loss executed successfully!`);
        }
      } else {
        console.log(`     ❌ Failed to place stop loss: ${orderResult.error}`);
      }
    } catch (error) {
      console.log(`     ❌ Error executing stop loss: ${error.message}`);
    }
  }
  
  async cancelTPOrders(position) {
    for (const tpOrder of position.tp_orders) {
      if (tpOrder.status === 'open') {
        try {
          await tools.mexc_spot_cancel_order(tpOrder.orderId, position.symbol);
          console.log(`   🗑️  Cancelled TP order: ${tpOrder.orderId}`);
        } catch (error) {
          console.log(`   ⚠️  Could not cancel TP order ${tpOrder.orderId}: ${error.message}`);
        }
      }
    }
  }
  
  // Called by trading system after a buy
  async onBuyExecuted(symbol, entryPrice, entryQty) {
    console.log(`\n🎯 Position Monitor: Buy executed for ${symbol}`);
    
    const positionId = this.state.addPosition(symbol, {
      price: entryPrice,
      qty: entryQty
    });
    
    // Start monitoring if not already running
    if (!this.isMonitoring) {
      this.startMonitoring();
    }
    
    return positionId;
  }
  
  getStatus() {
    const openPositions = this.state.getOpenPositions();
    
    return {
      is_monitoring: this.isMonitoring,
      open_positions: openPositions.length,
      positions: openPositions.map(p => ({
        symbol: p.symbol,
        entry_price: p.entry_price,
        remaining_qty: p.remaining_qty,
        pnl_pct: p.pnl_pct,
        tp_orders: p.tp_orders.length
      }))
    };
  }
}

// Test function
async function testPositionMonitor() {
  console.log('🧪 TESTING POSITION MONITOR');
  console.log('===========================\n');
  
  const monitor = new PositionMonitor();
  
  // Show current status
  const status = monitor.getStatus();
  console.log('📊 Initial Status:');
  console.log('  Monitoring:', status.is_monitoring ? '✅ Active' : '❌ Inactive');
  console.log('  Open positions:', status.open_positions);
  console.log('');
  
  // Simulate a buy (for testing)
  console.log('1. Simulating buy execution...');
  const testPositionId = await monitor.onBuyExecuted('SOLUSDT', 85.0, 0.5);
  
  console.log('\n2. Starting monitor...');
  monitor.startMonitoring();
  
  console.log('\n3. Checking status after 5 seconds...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const newStatus = monitor.getStatus();
  console.log('📊 Updated Status:');
  console.log('  Monitoring:', newStatus.is_monitoring ? '✅ Active' : '❌ Inactive');
  console.log('  Open positions:', newStatus.open_positions);
  
  if (newStatus.positions.length > 0) {
    console.log('\n📋 Open Positions:');
    newStatus.positions.forEach((pos, i) => {
      console.log(`  ${i+1}. ${pos.symbol}: ${pos.remaining_qty} @ $${pos.entry_price}`);
      console.log(`     PnL: ${pos.pnl_pct.toFixed(2)}%, TP orders: ${pos.tp_orders}`);
    });
  }
  
  console.log('\n🎯 POSITION MONITOR READY!');
  console.log('\n📋 Features:');
  console.log('  • Auto TP ladder (8%/15%/25%)');
  console.log('  • Stop loss at -6%');
  console.log('  • Auto-monitoring every 30s');
  console.log('  • State persistence');
  console.log('\n⚡️  Integration:');
  console.log('  Call monitor.onBuyExecuted(symbol, price, qty) after successful buy');
  console.log('  Monitor auto-starts and manages exits');
  
  // Clean up for test
  monitor.stopMonitoring();
}

// Run test
testPositionMonitor().catch(console.error);