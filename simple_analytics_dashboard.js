// 📊 SIMPLE ANALYTICS DASHBOARD
// Lightweight dashboard for social media metrics

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('📊 SIMPLE ANALYTICS DASHBOARD');
console.log('=============================\n');

const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'analytics_data.json');

// Sample data structure
const sampleData = {
  platforms: [
    { name: 'Junior Science Lab', type: 'YouTube', followers: 0, views: 0, revenue: 0 },
    { name: 'Kid Entrepreneur Club', type: 'YouTube', followers: 0, views: 0, revenue: 0 },
    { name: 'Storytime Adventures', type: 'YouTube', followers: 0, views: 0, revenue: 0 },
    { name: 'Art & Craft Kids', type: 'YouTube', followers: 0, views: 0, revenue: 0 },
    { name: 'AI Automation Lab', type: 'YouTube', followers: 0, views: 0, revenue: 0 },
    { name: 'Algorithmic Trading Hub', type: 'YouTube', followers: 0, views: 0, revenue: 0 },
    { name: 'Digital Collectibles Studio', type: 'YouTube', followers: 0, views: 0, revenue: 0 },
    { name: 'Local AI Revolution', type: 'YouTube', followers: 0, views: 0, revenue: 0 },
    { name: 'Kids Edu Network', type: 'Instagram', followers: 0, views: 0, revenue: 0 },
    { name: 'AI Tech Creators', type: 'Instagram', followers: 0, views: 0, revenue: 0 }
  ],
  summary: {
    total_followers: 0,
    total_views: 0,
    total_revenue: 0,
    platforms: 10,
    updated: new Date().toISOString()
  }
};

// Load or create data file
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (error) {
    console.log('⚠️  Could not load data file, using sample data');
  }
  return sampleData;
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('⚠️  Could not save data file:', error.message);
  }
}

// Initialize data
const analyticsData = loadData();
console.log(`✅ Loaded data for ${analyticsData.platforms.length} platforms`);

// Create HTTP server
const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // API endpoints
  if (url === '/api/metrics' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    
    // Update summary
    analyticsData.summary.total_followers = analyticsData.platforms.reduce((sum, p) => sum + p.followers, 0);
    analyticsData.summary.total_views = analyticsData.platforms.reduce((sum, p) => sum + p.views, 0);
    analyticsData.summary.total_revenue = analyticsData.platforms.reduce((sum, p) => sum + p.revenue, 0);
    analyticsData.summary.updated = new Date().toISOString();
    
    res.end(JSON.stringify(analyticsData));
    return;
  }
  
  if (url === '/api/update' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const update = JSON.parse(body);
        const platform = analyticsData.platforms.find(p => p.name === update.platform);
        
        if (platform) {
          platform.followers = update.followers || platform.followers;
          platform.views = update.views || platform.views;
          platform.revenue = update.revenue || platform.revenue;
          saveData(analyticsData);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Updated', platform }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Platform not found' }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }
  
  // Dashboard HTML
  if (url === '/' || url === '/dashboard') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>📊 Social Media Analytics</title>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
        body { font-family: system-ui, sans-serif; margin: 20px; background: #f5f5f5; }
        .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 2rem; border-radius: 10px; margin-bottom: 2rem; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .metric { background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2rem; font-weight: bold; color: #333; }
        .metric-label { color: #666; font-size: 0.9rem; text-transform: uppercase; }
        .chart { background: white; padding: 1.5rem; border-radius: 10px; margin-bottom: 2rem; }
        .platforms { background: white; padding: 1.5rem; border-radius: 10px; }
        .platform { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
        .platform:last-child { border-bottom: none; }
        .platform-name { font-weight: 600; }
        .platform-stats { color: #666; }
        .update-btn { background: #4CAF50; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer; margin-top: 1rem; }
        .update-btn:hover { background: #45a049; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Social Media Analytics Dashboard</h1>
        <p>Real-time tracking for 10 accounts • €0/month • Updated: <span id="update-time">Loading...</span></p>
      </div>
      
      <div class="metrics" id="metrics">
        <!-- Filled by JavaScript -->
      </div>
      
      <div class="chart">
        <h3>📈 Platform Performance</h3>
        <canvas id="performanceChart" height="200"></canvas>
      </div>
      
      <div class="platforms">
        <h3>🏆 Platform Details</h3>
        <div id="platform-list">
          <!-- Filled by JavaScript -->
        </div>
        <button class="update-btn" onclick="refreshData()">🔄 Refresh Data</button>
      </div>
      
      <script>
        let performanceChart;
        
        async function loadData() {
          try {
            const response = await fetch('/api/metrics');
            const data = await response.json();
            
            // Update metrics
            document.getElementById('metrics').innerHTML = \`
              <div class="metric">
                <div class="metric-label">Total Followers</div>
                <div class="metric-value">\${data.summary.total_followers.toLocaleString()}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Total Views</div>
                <div class="metric-value">\${data.summary.total_views.toLocaleString()}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Total Revenue</div>
                <div class="metric-value">€\${data.summary.total_revenue.toFixed(2)}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Platforms</div>
                <div class="metric-value">\${data.summary.platforms}</div>
              </div>
            \`;
            
            // Update platform list
            document.getElementById('platform-list').innerHTML = data.platforms.map(p => \`
              <div class="platform">
                <div class="platform-name">\${p.name}</div>
                <div class="platform-stats">
                  \${p.followers} followers • \${p.views} views • €\${p.revenue.toFixed(2)}
                </div>
              </div>
            \`).join('');
            
            // Update time
            document.getElementById('update-time').textContent = new Date(data.summary.updated).toLocaleTimeString();
            
            // Update chart
            updateChart(data.platforms);
            
          } catch (error) {
            console.error('Error loading data:', error);
          }
        }
        
        function updateChart(platforms) {
          const ctx = document.getElementById('performanceChart').getContext('2d');
          
          if (performanceChart) {
            performanceChart.destroy();
          }
          
          performanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: platforms.map(p => p.name.substring(0, 12)),
              datasets: [
                {
                  label: 'Followers',
                  data: platforms.map(p => p.followers),
                  backgroundColor: '#4CAF50',
                  borderColor: '#4CAF50',
                  borderWidth: 1
                },
                {
                  label: 'Views',
                  data: platforms.map(p => p.views / 100), // Scale down for chart
                  backgroundColor: '#2196F3',
                  borderColor: '#2196F3',
                  borderWidth: 1
                }
              ]
            },
            options: {
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          });
        }
        
        function refreshData() {
          loadData();
        }
        
        // Initial load
        loadData();
        
        // Auto-refresh every 30 seconds
        setInterval(loadData, 30000);
      </script>
    </body>
    </html>
    `;
    
    res.end(html);
    return;
  }
  
  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Start server
server.listen(PORT, () => {
  console.log(`✅ Dashboard running on: http://localhost:${PORT}`);
  console.log(`✅ API endpoints:`);
  console.log(`   • GET  /api/metrics - Get all metrics`);
  console.log(`   • POST /api/update  - Update platform metrics`);
  console.log(`   • GET  /dashboard   - Web dashboard`);
  console.log(`\n📊 Ready for social media launch!`);
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n📊 Shutting down dashboard...');
  saveData(analyticsData);
  process.exit(0);
});