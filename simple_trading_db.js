// 🗄️ Simple Trading Database (JSON files for development)
// Lightweight alternative while SQLite installs

const fs = require('fs');
const path = require('path');

class SimpleTradingDB {
  constructor() {
    this.dataDir = path.join(__dirname, 'trading_data');
    this.tables = {
      strategies: 'strategies.json',
      signals: 'signals.json',
      orders: 'orders.json',
      fills: 'fills.json',
      positions: 'positions.json',
      risk_events: 'risk_events.json',
      runs: 'runs.json'
    };
    
    // Create data directory
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
      console.log(`📁 Created data directory: ${this.dataDir}`);
    }
    
    // Initialize empty tables
    this.initializeTables();
    
    console.log('🗄️ Simple Trading Database (JSON files)');
    console.log(`   Directory: ${this.dataDir}`);
    console.log(`   Tables: ${Object.keys(this.tables).length}\n`);
  }
  
  /**
   * Initialize empty tables
   */
  initializeTables() {
    for (const [tableName, fileName] of Object.entries(this.tables)) {
      const filePath = path.join(this.dataDir, fileName);
      
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
        console.log(`   ✅ Created: ${fileName}`);
      }
    }
  }
  
  /**
   * Insert record into table
   */
  insert(table, record) {
    const filePath = path.join(this.dataDir, this.tables[table]);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Table ${table} not found`);
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Add ID and timestamps if not present
    if (!record.id) {
      record.id = `${table}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
    
    if (!record.created_at) {
      record.created_at = new Date().toISOString();
    }
    
    if (!record.updated_at) {
      record.updated_at = new Date().toISOString();
    }
    
    data.push(record);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    return record.id;
  }
  
  /**
   * Find records in table
   */
  find(table, query = {}) {
    const filePath = path.join(this.dataDir, this.tables[table]);
    
    if (!fs.existsSync(filePath)) {
      return [];
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    return data.filter(record => {
      for (const [key, value] of Object.entries(query)) {
        if (record[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }
  
  /**
   * Update record in table
   */
  update(table, id, updates) {
    const filePath = path.join(this.dataDir, this.tables[table]);
    
    if (!fs.existsSync(filePath)) {
      return false;
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const index = data.findIndex(record => record.id === id);
    
    if (index === -1) {
      return false;
    }
    
    // Update record
    data[index] = {
      ...data[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  }
  
  /**
   * Get table statistics
   */
  getStats(table) {
    const filePath = path.join(this.dataDir, this.tables[table]);
    
    if (!fs.existsSync(filePath)) {
      return { count: 0, size: '0 KB' };
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const size = fs.statSync(filePath).size;
    
    return {
      count: data.length,
      size: `${(size / 1024).toFixed(2)} KB`
    };
  }
  
  /**
   * Insert sample strategies
   */
  insertSampleStrategies() {
    const strategies = [
      {
        id: 'strategy_001',
        name: 'Silver Momentum',
        params: { lookback: 14, threshold: 0.02 },
        enabled: true
      },
      {
        id: 'strategy_002',
        name: 'Crypto Mean Reversion',
        params: { period: 20, stdDev: 2 },
        enabled: true
      },
      {
        id: 'strategy_003',
        name: 'TradingView Alerts',
        params: { source: 'tradingview', minConfidence: 0.7 },
        enabled: true
      }
    ];
    
    console.log('📝 Inserting sample strategies...');
    
    for (const strategy of strategies) {
      this.insert('strategies', strategy);
      console.log(`   ✅ Strategy: ${strategy.name}`);
    }
    
    console.log('');
  }
  
  /**
   * Get all database statistics
   */
  getAllStats() {
    const stats = {};
    
    for (const table of Object.keys(this.tables)) {
      stats[table] = this.getStats(table);
    }
    
    return {
      directory: this.dataDir,
      tables: stats,
      totalRecords: Object.values(stats).reduce((sum, s) => sum + s.count, 0)
    };
  }
}

// Export for use
module.exports = SimpleTradingDB;

// If run directly
if (require.main === module) {
  console.log('🗄️ SIMPLE TRADING DATABASE SETUP\n');
  
  const db = new SimpleTradingDB();
  
  // Insert sample strategies
  db.insertSampleStrategies();
  
  // Get statistics
  const stats = db.getAllStats();
  
  console.log('📊 Database Statistics:');
  console.log(`   Directory: ${stats.directory}`);
  console.log(`   Total records: ${stats.totalRecords}`);
  
  console.log('\n📈 Table details:');
  for (const [table, tableStats] of Object.entries(stats.tables)) {
    console.log(`   ${table}: ${tableStats.count} records, ${tableStats.size}`);
  }
  
  console.log('\n✅ Simple trading database ready');
  console.log('   Use with n8n Function nodes for data storage');
  console.log('   Upgrade to SQLite/PostgreSQL for production\n');
}