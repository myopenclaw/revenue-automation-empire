// 🎯 Trading Integration Schema - Unified for CEX/DEX
// Platform-agnostic order and signal definitions

const tradingSchemas = {
  // Unified order schema (CEX + DEX)
  order: {
    required: ['symbol', 'side', 'quantity', 'orderType', 'venue', 'strategyId'],
    properties: {
      // Core identification
      clientOrderId: { type: 'string', pattern: '^[A-Za-z0-9_-]+$' },
      strategyId: { type: 'string', description: 'Which strategy generated this order' },
      
      // Trade details
      symbol: { type: 'string', examples: ['BTC/USDT', 'SOL/USDC'] },
      side: { type: 'string', enum: ['buy', 'sell'] },
      quantity: { type: 'number', minimum: 0 },
      orderType: { type: 'string', enum: ['market', 'limit', 'stop_market', 'stop_limit'] },
      
      // Price parameters
      limitPrice: { type: 'number', optional: true },
      stopPrice: { type: 'number', optional: true },
      
      // Risk parameters
      maxSlippageBps: { type: 'number', minimum: 0, maximum: 1000, default: 50 },
      timeInForce: { type: 'string', enum: ['GTC', 'IOC', 'FOK'], default: 'GTC' },
      
      // Take profit / Stop loss
      takeProfitPrice: { type: 'number', optional: true },
      stopLossPrice: { type: 'number', optional: true },
      
      // Venue configuration
      venue: { type: 'string', enum: ['mexc', 'bybit', 'solana_jupiter', 'solana_raydium'] },
      subAccount: { type: 'string', optional: true },
      
      // Metadata
      tags: { type: 'array', items: { type: 'string' }, default: [] },
      notes: { type: 'string', optional: true },
      
      // Timestamps (auto-filled)
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  
  // Signal schema (from OpenClaw/TradingView/Telegram)
  signal: {
    required: ['symbol', 'side', 'confidence', 'strategyId'],
    properties: {
      signalId: { type: 'string' },
      strategyId: { type: 'string' },
      
      // Signal details
      symbol: { type: 'string' },
      side: { type: 'string', enum: ['buy', 'sell', 'neutral'] },
      confidence: { type: 'number', minimum: 0, maximum: 1 },
      
      // Suggested parameters
      suggestedQuantity: { type: 'number', optional: true },
      suggestedEntry: { type: 'number', optional: true },
      suggestedStopLoss: { type: 'number', optional: true },
      suggestedTakeProfit: { type: 'number', optional: true },
      
      // Signal metadata
      source: { type: 'string', enum: ['openclaw', 'tradingview', 'telegram', 'manual'] },
      timestamp: { type: 'string', format: 'date-time' },
      rawData: { type: 'object', optional: true }
    }
  },
  
  // Fill schema (execution results)
  fill: {
    required: ['orderId', 'price', 'quantity', 'venue'],
    properties: {
      orderId: { type: 'string' },
      clientOrderId: { type: 'string' },
      
      // Execution details
      price: { type: 'number' },
      quantity: { type: 'number' },
      fee: { type: 'number' },
      feeCurrency: { type: 'string' },
      
      // Venue info
      venue: { type: 'string' },
      venueOrderId: { type: 'string' },
      venueTradeId: { type: 'string' },
      
      // Timestamps
      executedAt: { type: 'string', format: 'date-time' },
      confirmedAt: { type: 'string', format: 'date-time', optional: true }
    }
  },
  
  // Position schema (current holdings)
  position: {
    required: ['symbol', 'venue', 'quantity'],
    properties: {
      symbol: { type: 'string' },
      venue: { type: 'string' },
      
      // Position details
      quantity: { type: 'number' },
      averagePrice: { type: 'number' },
      currentPrice: { type: 'number', optional: true },
      
      // PnL
      unrealizedPnl: { type: 'number' },
      realizedPnl: { type: 'number', default: 0 },
      
      // Metadata
      lastUpdated: { type: 'string', format: 'date-time' }
    }
  },
  
  // Risk event schema
  riskEvent: {
    required: ['type', 'severity', 'description'],
    properties: {
      type: { type: 'string', enum: ['max_loss', 'max_exposure', 'liquidity', 'volatility', 'error'] },
      severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
      description: { type: 'string' },
      
      // Context
      strategyId: { type: 'string', optional: true },
      symbol: { type: 'string', optional: true },
      data: { type: 'object', optional: true },
      
      // Timestamps
      detectedAt: { type: 'string', format: 'date-time' },
      resolvedAt: { type: 'string', format: 'date-time', optional: true }
    }
  }
};

// Database table definitions (PostgreSQL)
const databaseSchema = {
  strategies: `
    CREATE TABLE strategies (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      params JSONB NOT NULL DEFAULT '{}',
      enabled BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  signals: `
    CREATE TABLE signals (
      id VARCHAR(50) PRIMARY KEY,
      strategy_id VARCHAR(50) REFERENCES strategies(id),
      symbol VARCHAR(20) NOT NULL,
      side VARCHAR(10) NOT NULL,
      confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
      suggested_quantity DECIMAL(20,8),
      suggested_entry DECIMAL(20,8),
      suggested_stop_loss DECIMAL(20,8),
      suggested_take_profit DECIMAL(20,8),
      source VARCHAR(20) NOT NULL,
      raw_data JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      INDEX idx_signals_strategy (strategy_id),
      INDEX idx_signals_created (created_at)
    );
  `,
  
  orders: `
    CREATE TABLE orders (
      id VARCHAR(50) PRIMARY KEY,
      signal_id VARCHAR(50) REFERENCES signals(id),
      client_order_id VARCHAR(100) UNIQUE NOT NULL,
      venue VARCHAR(20) NOT NULL,
      symbol VARCHAR(20) NOT NULL,
      side VARCHAR(10) NOT NULL,
      quantity DECIMAL(20,8) NOT NULL,
      order_type VARCHAR(20) NOT NULL,
      limit_price DECIMAL(20,8),
      stop_price DECIMAL(20,8),
      max_slippage_bps INTEGER DEFAULT 50,
      time_in_force VARCHAR(10) DEFAULT 'GTC',
      take_profit_price DECIMAL(20,8),
      stop_loss_price DECIMAL(20,8),
      sub_account VARCHAR(50),
      tags JSONB DEFAULT '[]',
      notes TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      request_json JSONB NOT NULL,
      response_json JSONB,
      error_message TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      INDEX idx_orders_status (status),
      INDEX idx_orders_venue (venue),
      INDEX idx_orders_created (created_at)
    );
  `,
  
  fills: `
    CREATE TABLE fills (
      id SERIAL PRIMARY KEY,
      order_id VARCHAR(50) REFERENCES orders(id),
      client_order_id VARCHAR(100),
      price DECIMAL(20,8) NOT NULL,
      quantity DECIMAL(20,8) NOT NULL,
      fee DECIMAL(20,8) NOT NULL,
      fee_currency VARCHAR(10) NOT NULL,
      venue VARCHAR(20) NOT NULL,
      venue_order_id VARCHAR(100),
      venue_trade_id VARCHAR(100),
      executed_at TIMESTAMP WITH TIME ZONE NOT NULL,
      confirmed_at TIMESTAMP WITH TIME ZONE,
      INDEX idx_fills_order (order_id),
      INDEX idx_fills_executed (executed_at)
    );
  `,
  
  positions: `
    CREATE TABLE positions (
      id SERIAL PRIMARY KEY,
      symbol VARCHAR(20) NOT NULL,
      venue VARCHAR(20) NOT NULL,
      quantity DECIMAL(20,8) NOT NULL,
      average_price DECIMAL(20,8) NOT NULL,
      current_price DECIMAL(20,8),
      unrealized_pnl DECIMAL(20,8) DEFAULT 0,
      realized_pnl DECIMAL(20,8) DEFAULT 0,
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(symbol, venue),
      INDEX idx_positions_venue (venue)
    );
  `,
  
  risk_events: `
    CREATE TABLE risk_events (
      id SERIAL PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      severity VARCHAR(20) NOT NULL,
      description TEXT NOT NULL,
      strategy_id VARCHAR(50),
      symbol VARCHAR(20),
      data JSONB,
      detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      resolved_at TIMESTAMP WITH TIME ZONE,
      INDEX idx_risk_events_severity (severity),
      INDEX idx_risk_events_detected (detected_at)
    );
  `,
  
  runs: `
    CREATE TABLE runs (
      id SERIAL PRIMARY KEY,
      workflow_run_id VARCHAR(100),
      status VARCHAR(20) NOT NULL,
      started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      ended_at TIMESTAMP WITH TIME ZONE,
      error TEXT,
      metadata JSONB,
      INDEX idx_runs_status (status),
      INDEX idx_runs_started (started_at)
    );
  `
};

// Executor Service API Contract
const executorServiceContract = {
  baseUrl: 'http://localhost:3001',
  endpoints: {
    // Quote endpoint (pre-trade)
    quote: {
      method: 'POST',
      path: '/quote',
      request: {
        symbol: 'string',
        side: 'buy|sell',
        quantity: 'number',
        venue: 'solana_jupiter|solana_raydium',
        slippageBps: 'number'
      },
      response: {
        success: 'boolean',
        inputAmount: 'number',
        outputAmount: 'number',
        price: 'number',
        route: 'object',
        fees: 'object',
        validForSeconds: 'number'
      }
    },
    
    // Swap endpoint (execute trade)
    swap: {
      method: 'POST',
      path: '/swap',
      request: {
        quoteId: 'string',
        wallet: 'string', // Wallet address (not private key)
        clientOrderId: 'string'
      },
      response: {
        success: 'boolean',
        transactionId: 'string',
        clientOrderId: 'string',
        status: 'pending|confirmed|failed',
        estimatedCompletion: 'string'
      }
    },
    
    // Status endpoint
    status: {
      method: 'GET',
      path: '/status/:transactionId',
      response: {
        success: 'boolean',
        transactionId: 'string',
        status: 'pending|confirmed|failed',
        confirmedAt: 'string|null',
        error: 'string|null'
      }
    },
    
    // Health check
    health: {
      method: 'GET',
      path: '/health',
      response: {
        status: 'healthy|unhealthy',
        version: 'string',
        uptime: 'number'
      }
    }
  },
  
  // Security headers
  security: {
    authentication: 'Bearer token (from n8n credentials)',
    rateLimiting: '100 requests/minute per IP',
    payloadSigning: 'HMAC-SHA256 for webhooks'
  }
};

// n8n workflow building blocks
const n8nWorkflowBlocks = {
  signalIntake: {
    description: 'Receive signal from OpenClaw/TradingView/Telegram',
    nodes: [
      'Webhook (receive)',
      'Function (normalize to schema)',
      'Validate (rules check)',
      'PostgreSQL (save signal)',
      'HTTP Request (push to execution queue)'
    ]
  },
  
  riskGate: {
    description: 'Risk checks before execution',
    checks: [
      'Max daily loss (per strategy)',
      'Max exposure (per symbol)',
      'Liquidity/price impact',
      'No-trade windows (news/volatility)',
      'Symbol lock (prevent duplicate orders)'
    ]
  },
  
  executeTrade: {
    description: 'Execute trade on CEX or DEX',
    cexFlow: 'HTTP Request → Exchange API → Save order',
    dexFlow: 'HTTP Request → Executor Service → Save order',
    features: [
      'Retry logic with backoff',
      'Status polling',
      'Timeout handling',
      'Error recovery'
    ]
  },
  
  reconcilePnl: {
    description: 'Periodic reconciliation',
    schedule: 'Every 5 minutes',
    tasks: [
      'Fetch balances/positions',
      'Compute PnL',
      'Detect position drift',
      'Send alerts if discrepancies'
    ]
  },
  
  alerts: {
    description: 'Notification system',
    channels: ['Telegram', 'Discord', 'Email'],
    events: [
      'Trade fills',
      'Errors',
      'Daily summary',
      'Risk events',
      'Kill switch activation'
    ]
  }
};

module.exports = {
  tradingSchemas,
  databaseSchema,
  executorServiceContract,
  n8nWorkflowBlocks
};

// If run directly, show summary
if (require.main === module) {
  console.log('🎯 TRADING INTEGRATION SCHEMA SUMMARY\n');
  
  console.log('📊 Unified Order Schema:');
  console.log('  Required fields:', tradingSchemas.order.required.join(', '));
  console.log('  Venues:', tradingSchemas.order.properties.venue.enum.join(', '));
  console.log('');
  
  console.log('🗄️  Database Tables:');
  Object.keys(databaseSchema).forEach(table => {
    console.log(`  - ${table}`);
  });
  console.log('');
  
  console.log('⚡️ Executor Service Endpoints:');
  Object.keys(executorServiceContract.endpoints).forEach(endpoint => {
    console.log(`  - ${endpoint}: ${executorServiceContract.endpoints[endpoint].method} ${executorServiceContract.baseUrl}${executorServiceContract.endpoints[endpoint].path}`);
  });
  console.log('');
  
  console.log('🛠️  n8n Workflow Blocks:');
  Object.keys(n8nWorkflowBlocks).forEach(block => {
    console.log(`  - ${block}: ${n8nWorkflowBlocks[block].description}`);
  });
  console.log('');
  
  console.log('✅ Schema ready for implementation');
  console.log('Next: Build executor service and n8n workflows');
}