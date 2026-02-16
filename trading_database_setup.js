// 🗄️ Trading Database Setup (SQLite for development)
// Lightweight alternative to PostgreSQL

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class TradingDatabase {
  constructor() {
    this.dbPath = path.join(__dirname, 'trading_data.db');
    this.db = null;
    
    console.log('🗄️ Trading Database Setup (SQLite)');
    console.log(`   Database: ${this.dbPath}`);
  }
  
  /**
   * Initialize database and create tables
   */
  async initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Database connection error:', err.message);
          reject(err);
          return;
        }
        
        console.log('✅ Connected to SQLite database');
        this.createTables().then(resolve).catch(reject);
      });
    });
  }
  
  /**
   * Create all required tables
   */
  async createTables() {
    const tables = [
      // Strategies table
      `CREATE TABLE IF NOT EXISTS strategies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        params TEXT DEFAULT '{}',
        enabled INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Signals table
      `CREATE TABLE IF NOT EXISTS signals (
        id TEXT PRIMARY KEY,
        strategy_id TEXT,
        symbol TEXT NOT NULL,
        side TEXT NOT NULL,
        confidence REAL CHECK (confidence >= 0 AND confidence <= 1),
        suggested_quantity REAL,
        suggested_entry REAL,
        suggested_stop_loss REAL,
        suggested_take_profit REAL,
        source TEXT NOT NULL,
        raw_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Orders table
      `CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        signal_id TEXT,
        client_order_id TEXT UNIQUE NOT NULL,
        venue TEXT NOT NULL,
        symbol TEXT NOT NULL,
        side TEXT NOT NULL,
        quantity REAL NOT NULL,
        order_type TEXT NOT NULL,
        limit_price REAL,
        stop_price REAL,
        max_slippage_bps INTEGER DEFAULT 50,
        time_in_force TEXT DEFAULT 'GTC',
        take_profit_price REAL,
        stop_loss_price REAL,
        sub_account TEXT,
        tags TEXT DEFAULT '[]',
        notes TEXT,
        status TEXT DEFAULT 'pending',
        request_json TEXT NOT NULL,
        response_json TEXT,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Fills table
      `CREATE TABLE IF NOT EXISTS fills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT,
        client_order_id TEXT,
        price REAL NOT NULL,
        quantity REAL NOT NULL,
        fee REAL NOT NULL,
        fee_currency TEXT NOT NULL,
        venue TEXT NOT NULL,
        venue_order_id TEXT,
        venue_trade_id TEXT,
        executed_at DATETIME NOT NULL,
        confirmed_at DATETIME
      )`,
      
      // Positions table
      `CREATE TABLE IF NOT EXISTS positions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        venue TEXT NOT NULL,
        quantity REAL NOT NULL,
        average_price REAL NOT NULL,
        current_price REAL,
        unrealized_pnl REAL DEFAULT 0,
        realized_pnl REAL DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(symbol, venue)
      )`,
      
      // Risk events table
      `CREATE TABLE IF NOT EXISTS risk_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        description TEXT NOT NULL,
        strategy_id TEXT,
        symbol TEXT,
        data TEXT,
        detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME
      )`,
      
      // Workflow runs table
      `CREATE TABLE IF NOT EXISTS runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workflow_run_id TEXT,
        status TEXT NOT NULL,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ended_at DATETIME,
        error TEXT,
        metadata TEXT
      )`
    ];
    
    console.log('📊 Creating database tables...');
    
    for (let i = 0; i < tables.length; i++) {
      await this.runQuery(tables[i]);
      console.log(`   ✅ Table ${i + 1}/${tables.length} created`);
    }
    
    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_signals_strategy ON signals(strategy_id)',
      'CREATE INDEX IF NOT EXISTS idx_signals_created ON signals(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)',
      'CREATE INDEX IF NOT EXISTS idx_orders_venue ON orders(venue)',
      'CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_fills_order ON fills(order_id)',
      'CREATE INDEX IF NOT EXISTS idx_fills_executed ON fills(executed_at)',
      'CREATE INDEX IF NOT EXISTS idx_positions_venue ON positions(venue)',
      'CREATE INDEX IF NOT EXISTS idx_risk_events_severity ON risk_events(severity)',
      'CREATE INDEX IF NOT EXISTS idx_risk_events_detected ON risk_events(detected_at)',
      'CREATE INDEX IF NOT EXISTS idx_runs_status ON runs(status)',
      'CREATE INDEX IF NOT EXISTS idx_runs_started ON runs(started_at)'
    ];
    
    console.log('📈 Creating indexes...');
    
    for (let i = 0; i < indexes.length; i++) {
      await this.runQuery(indexes[i]);
    }
    
    console.log('✅ All tables and indexes created\n');
    
    // Insert sample strategies
    await this.insertSampleData();
  }
  
  /**
   * Run a SQL query
   */
  runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }
  
  /**
   * Insert sample data for testing
   */
  async insertSampleData() {
    const sampleStrategies = [
      {
        id: 'strategy_001',
        name: 'Silver Momentum',
        params: JSON.stringify({ lookback: 14, threshold: 0.02 }),
        enabled: 1
      },
      {
        id: 'strategy_002', 
        name: 'Crypto Mean Reversion',
        params: JSON.stringify({ period: 20, stdDev: 2 }),
        enabled: 1
      },
      {
        id: 'strategy_003',
        name: 'TradingView Alerts',
        params: JSON.stringify({ source: 'tradingview', minConfidence: 0.7 }),
        enabled: 1
      }
    ];
    
    console.log('📝 Inserting sample strategies...');
    
    for (const strategy of sampleStrategies) {
      const sql = `INSERT OR IGNORE INTO strategies (id, name, params, enabled) VALUES (?, ?, ?, ?)`;
      await this.runQuery(sql, [strategy.id, strategy.name, strategy.params, strategy.enabled]);
      console.log(`   ✅ Strategy: ${strategy.name}`);
    }
    
    console.log('✅ Sample data inserted\n');
  }
  
  /**
   * Get database statistics
   */
  async getStats() {
    const tables = ['strategies', 'signals', 'orders', 'fills', 'positions', 'risk_events', 'runs'];
    const stats = {};
    
    for (const table of tables) {
      const result = await this.runQuery(`SELECT COUNT(*) as count FROM ${table}`);
      // SQLite doesn't support async/await nicely for queries that return data
      // For now, just note the table exists
      stats[table] = 'exists';
    }
    
    return {
      database: this.dbPath,
      tables: Object.keys(stats).length,
      size: fs.existsSync(this.dbPath) ? `${(fs.statSync(this.dbPath).size / 1024).toFixed(2)} KB` : 'N/A'
    };
  }
  
  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      console.log('🔒 Database connection closed');
    }
  }
}

// Export for use
module.exports = TradingDatabase;

// If run directly
if (require.main === module) {
  (async () => {
    console.log('🗄️ TRADING DATABASE SETUP\n');
    
    const db = new TradingDatabase();
    
    try {
      await db.initialize();
      
      const stats = await db.getStats();
      console.log('📊 Database Statistics:');
      console.log(`   Path: ${stats.database}`);
      console.log(`   Tables: ${stats.tables}`);
      console.log(`   Size: ${stats.size}`);
      
      console.log('\n✅ Trading database ready for n8n integration');
      console.log('   File: trading_data.db');
      console.log('   Use with n8n SQLite node\n');
      
      db.close();
      
    } catch (error) {
      console.error('❌ Database setup failed:', error.message);
      process.exit(1);
    }
  })();
}