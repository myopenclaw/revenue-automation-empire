// 📊 LIVE ANALYTICS DASHBOARD
// Real-time tracking for social media empire

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

console.log('📊 LIVE ANALYTICS DASHBOARD');
console.log('===========================\n');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'analytics.db');

// Create database if not exists
function initDatabase() {
  const db = new sqlite3.Database(DB_PATH);
  
  db.serialize(() => {
    // Platform metrics
    db.run(`CREATE TABLE IF NOT EXISTS platform_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      account_id TEXT NOT NULL,
      date DATE NOT NULL,
      followers INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      revenue REAL DEFAULT 0,
      engagement_rate REAL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Content performance
    db.run(`CREATE TABLE IF NOT EXISTS content_performance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      title TEXT,
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      watch_time INTEGER DEFAULT 0,
      revenue REAL DEFAULT 0,
      published_at TIMESTAMP,
      collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Daily summaries
    db.run(`CREATE TABLE IF NOT EXISTS daily_summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL UNIQUE,
      total_followers INTEGER DEFAULT 0,
      total_views INTEGER DEFAULT 0,
      total_engagement INTEGER DEFAULT 0,
      total_revenue REAL DEFAULT 0,
      content_count INTEGER DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Platform configurations
    db.run(`CREATE TABLE IF NOT EXISTS platforms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      account_id TEXT NOT NULL,
      api_key TEXT,
      api_secret TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    console.log('✅ Database initialized');
  });
  
  db.close();
}

// Initialize sample data
function initSampleData() {
  const db = new sqlite3.Database(DB_PATH);
  
  // Insert platform configurations
  const platforms = [
    { name: 'Junior Science Lab', type: 'YouTube', account_id: 'channel_1' },
    { name: 'Kid Entrepreneur Club', type: 'YouTube', account_id: 'channel_2' },
    { name: 'Storytime Adventures', type: 'YouTube', account_id: 'channel_3' },
    { name: 'Art & Craft Kids', type: 'YouTube', account_id: 'channel_4' },
    { name: 'AI Automation Lab', type: 'YouTube', account_id: 'channel_5' },
    { name: 'Algorithmic Trading Hub', type: 'YouTube', account_id: 'channel_6' },
    { name: 'Digital Collectibles Studio', type: 'YouTube', account_id: 'channel_7' },
    { name: 'Local AI Revolution', type: 'YouTube', account_id: 'channel_8' },
    { name: 'Kids Edu Network', type: 'Instagram', account_id: 'instagram_kids' },
    { name: 'AI Tech Creators', type: 'Instagram', account_id: 'instagram_adult' }
  ];
  
  platforms.forEach(platform => {
    db.run(
      `INSERT OR IGNORE INTO platforms (name, type, account_id) VALUES (?, ?, ?)`,
      [platform.name, platform.type, platform.account_id]
    );
  });
  
  // Insert sample metrics for today
  const today = new Date().toISOString().split('T')[0];
  
  platforms.forEach((platform, index) => {
    const followers = 100 + (index * 50);
    const views = 1000 + (index * 200);
    const engagement = 5 + (index * 0.5);
    const revenue = index * 10;
    
    db.run(
      `INSERT INTO platform_metrics (platform, account_id, date, followers, views, engagement_rate, revenue) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [platform.name, platform.account_id, today, followers, views, engagement, revenue]
    );
  });
  
  console.log('✅ Sample data initialized');
  db.close();
}

// API Routes
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Get all platform metrics
app.get('/api/metrics', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.all(`
    SELECT 
      platform,
      account_id,
      MAX(date) as latest_date,
      followers,
      views,
      engagement_rate,
      revenue
    FROM platform_metrics
    GROUP BY platform, account_id
    ORDER BY platform
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Calculate totals
    const totals = rows.reduce((acc, row) => ({
      followers: acc.followers + (row.followers || 0),
      views: acc.views + (row.views || 0),
      revenue: acc.revenue + (row.revenue || 0),
      platforms: acc.platforms + 1
    }), { followers: 0, views: 0, revenue: 0, platforms: 0 });
    
    res.json({
      platforms: rows,
      totals,
      timestamp: new Date().toISOString()
    });
    
    db.close();
  });
});

// Get daily summary
app.get('/api/daily-summary', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  const today = new Date().toISOString().split('T')[0];
  
  db.get(`
    SELECT 
      date,
      total_followers,
      total_views,
      total_engagement,
      total_revenue,
      content_count
    FROM daily_summaries
    WHERE date = ?
    ORDER BY date DESC
    LIMIT 1
  `, [today], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // If no summary for today, calculate from platform metrics
    if (!row) {
      db.all(`
        SELECT 
          SUM(followers) as total_followers,
          SUM(views) as total_views,
          AVG(engagement_rate) as avg_engagement,
          SUM(revenue) as total_revenue,
          COUNT(*) as platform_count
        FROM platform_metrics
        WHERE date = ?
      `, [today], (err, metrics) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        const summary = metrics[0] || {
          total_followers: 0,
          total_views: 0,
          avg_engagement: 0,
          total_revenue: 0,
          platform_count: 0
        };
        
        res.json({
          date: today,
          total_followers: summary.total_followers || 0,
          total_views: summary.total_views || 0,
          avg_engagement: summary.avg_engagement || 0,
          total_revenue: summary.total_revenue || 0,
          platform_count: summary.platform_count || 0,
          content_count: 0,
          calculated: true
        });
        
        db.close();
      });
    } else {
      res.json(row);
      db.close();
    }
  });
});

// Update metrics (for n8n/webhooks)
app.post('/api/update-metrics', (req, res) => {
  const { platform, account_id, metrics } = req.body;
  const today = new Date().toISOString().split('T')[0];
  
  const db = new sqlite3.Database(DB_PATH);
  
  db.run(`
    INSERT OR REPLACE INTO platform_metrics 
    (platform, account_id, date, followers, views, likes, comments, shares, revenue, engagement_rate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    platform,
    account_id,
    today,
    metrics.followers || 0,
    metrics.views || 0,
    metrics.likes || 0,
    metrics.comments || 0,
    metrics.shares || 0,
    metrics.revenue || 0,
    metrics.engagement_rate || 0
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Update daily summary
    db.run(`
      INSERT OR REPLACE INTO daily_summaries (date, total_followers, total_views, total_revenue)
      SELECT 
        date,
        SUM(followers) as total_followers,
        SUM(views) as total_views,
        SUM(revenue) as total_revenue
      FROM platform_metrics
      WHERE date = ?
      GROUP BY date
    `, [today], (err) => {
      if (err) {
        console.error('Error updating daily summary:', err);
      }
      
      res.json({
        success: true,
        message: 'Metrics updated',
        platform,
        account_id,
        metrics_updated: this.changes
      });
      
      db.close();
    });
  });
});

// Get platform growth over time
app.get('/api/growth-timeline', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  const days = parseInt(req.query.days) || 7;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];
  
  db.all(`
    SELECT 
      date,
      platform,
      SUM(followers) as followers,
      SUM(views) as views,
      SUM(revenue) as revenue
    FROM platform_metrics
    WHERE date >= ?
    GROUP BY date, platform
    ORDER BY date ASC
  `, [startDateStr], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Format for chart.js
    const timeline = {};
    rows.forEach(row => {
      if (!timeline[row.date]) {
        timeline[row.date] = {
          date: row.date,
          platforms: {}
        };
      }
      timeline[row.date].platforms[row.platform] = {
        followers: row.followers,
        views: row.views,
        revenue: row.revenue
      };
    });
    
    res.json({
      timeline: Object.values(timeline),
      platforms: [...new Set(rows.map(r => r.platform))],
      days
    });
    
    db.close();
  });
});

// Dashboard HTML
app.get('/dashboard', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📊 Social Media Analytics Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 10px; margin-bottom: 2rem; }
      .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
      .metric-card { background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
      .metric-value { font-size: 2rem; font-weight: bold; color: #333; }
      .metric-label { color: #666; font-size: 0.9rem; text-transform: uppercase; }
      .chart-container { background: white; padding: 1.5rem; border-radius: 10px; margin-bottom: 2rem; }
      .platform-list { background: white; padding: 1.5rem; border-radius: 10px; }
      .platform-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
      .platform-name { font-weight: 600; }
      .platform-metrics { color: #666; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>📊 Social Media Analytics Dashboard</h1>
      <p>Real-time tracking for 10 social media accounts • €0/month cost</p>
      <p id="update-time">Loading...</p>
    </div>
    
    <div class="metrics-grid" id="metrics-grid">
      <!-- Filled by JavaScript -->
    </div>
    
    <div class="chart-container">
      <h3>📈 Follower Growth</h3>
      <canvas id="growthChart" height="200"></canvas>
    </div>
    
    <div class="chart-container">
      <h3>💰 Revenue by Platform</h3>
      <canvas id="revenueChart" height="200"></canvas>
    </div>
    
    <div class="platform-list">
      <h3>🏆 Platform Performance</h3>
      <div id="platform-list">
        <!-- Filled by JavaScript -->
      </div>
    </div>
    
    <script>
      async function loadMetrics() {
        try {
          const response = await fetch('/api/metrics');
          const data = await response.json();
          
          // Update metrics grid
          const metricsGrid = document.getElementById('metrics-grid');
          metricsGrid.innerHTML = \`
            <div class="metric-card">
              <div class="metric-label">Total Followers</div>
              <div class="metric-value">\${data.totals.followers.toLocaleString()}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Total Views</div>
              <div class="metric-value">\${data.totals.views.toLocaleString()}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Total Revenue</div>
              <div class="metric-value">€\${data.totals.revenue.toFixed(2)}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Active Platforms</div>
              <div class="metric-value">\${data.totals.platforms}</div>
            </div>
          \`;
          
          // Update platform list
          const platformList = document.getElementById('platform-list');
          platformList.innerHTML = data.platforms.map(platform => \`
            <div class="platform-item">
              <div class="platform-name">\${platform.platform}</div>
              <div class="platform-metrics">
                \${platform.followers} followers • \${platform.views} views • €\${platform.revenue || 0}
              </div>
            </div>
          \`).join('');
          
          // Update time
          document.getElementById('update-time').textContent = \`Last updated: \${new Date().toLocaleTimeString()}\`;
          
          // Load charts
          loadCharts(data);
          
        } catch (error) {
          console.error('Error loading metrics:', error);
        }
      }
      
      async function loadCharts(metricsData) {
        // Growth chart
        const growthCtx = document.getElementById('growthChart').getContext('2d');
        const growthChart = new Chart(growthCtx, {
          type: 'line',
          data: {
            labels: metricsData.platforms.map(p => p.platform.substring(0, 15)),
            datasets: [{
              label: 'Followers',
              data: metricsData.platforms.map(p => p.followers),
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'top' }
            }
          }
        });
        
        // Revenue chart
        const revenueCtx = document.getElementById('revenueChart').getContext('2d');
        const revenueChart = new Chart(revenueCtx, {
          type: 'bar',
          data: {
            labels: metricsData.platforms.map(p => p.platform.substring(0, 15)),
            datasets: [{
              label: 'Revenue (€)',
              data: metricsData.platforms.map(p => p.revenue || 0),
              backgroundColor: metricsData.platforms.map((_, i) => 
                ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63'][i % 5]
              )
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false }
            }
          }
        });
      }
      
      // Initial load
      loadMetrics();
      
      // Refresh every 30 seconds
      setInterval(loadMetrics, 30000);
    </script>
  </body>
  </html>
  `;
  
  res.send(html);
});

// Start server
function startServer() {
  // Initialize database
  initDatabase