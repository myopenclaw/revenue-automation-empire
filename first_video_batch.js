// 🎬 FIRST VIDEO BATCH - Empire Media Machine
// Generate 5 videos for initial content

const fs = require('fs');
const path = require('path');

console.log('🎬 FIRST VIDEO BATCH - Empire Media Machine');
console.log('===========================================\n');

// Batch configuration
const BATCH = [
  {
    id: 1,
    niche: 'silver',
    topic: 'Silver Price Update Today',
    platform: 'TikTok',
    duration: 30,
    template: 'price_update'
  },
  {
    id: 2,
    niche: 'crypto',
    topic: 'Bitcoin Market Analysis',
    platform: 'YouTube Shorts',
    duration: 45,
    template: 'market_analysis'
  },
  {
    id: 3,
    niche: 'trading',
    topic: 'Pro Trading Strategy Tip',
    platform: 'Instagram Reels',
    duration: 25,
    template: 'strategy_tip'
  },
  {
    id: 4,
    niche: 'crypto',
    topic: 'Solana New Listing Alert',
    platform: 'TikTok',
    duration: 35,
    template: 'alert'
  },
  {
    id: 5,
    niche: 'silver',
    topic: 'Silver Investment Guide 2026',
    platform: 'YouTube Shorts',
    duration: 50,
    template: 'guide'
  }
];

// Template system
const TEMPLATES = {
  price_update: `🎯 {TITLE}

💰 Current Price: ${getRandomPrice(22, 28)} USD/oz
📈 24h Change: ${getRandomChange(-2, 3)}%
📊 7d Change: ${getRandomChange(-5, 8)}%

💡 Key Insight:
{INSIGHT}

🚀 What to Watch:
- {WATCH1}
- {WATCH2}

📈 Technical Levels:
Support: ${getRandomPrice(21, 23)}
Resistance: ${getRandomPrice(27, 30)}

🔔 Follow for daily updates!
#{HASHTAG1} #{HASHTAG2} #{HASHTAG3}`,

  market_analysis: `🚀 {TITLE}

📊 Market Overview:
Bitcoin: ${getRandomPrice(60000, 75000)}
Ethereum: ${getRandomPrice(3000, 4500)}
Total Crypto Market: ${getRandomPrice(2000, 3000)}B

🎯 Key Trend: {TREND}

💡 Trading Insight:
{INSIGHT}

⚠️ Risk Level: ${getRandomRisk()}

📈 Outlook: {OUTLOOK}

✅ Always use stop losses!
#{HASHTAG1} #{HASHTAG2} #{HASHTAG3}`,

  strategy_tip: `💡 {TITLE}

📊 Strategy: {STRATEGY}
⏰ Timeframe: ${getRandomTimeframe()}
🎯 Success Rate: ${getRandomNumber(65, 85)}%

🔧 How It Works:
1. {STEP1}
2. {STEP2}
3. {STEP3}

📈 Example Trade:
Entry: ${getRandomPrice(50, 500)}
Stop Loss: -${getRandomNumber(3, 8)}%
Take Profit: +${getRandomNumber(8, 25)}%
RR Ratio: 1:${getRandomNumber(2, 4)}

💡 Pro Tip:
{TIP}

⚠️ Risk max 2% per trade!
#{HASHTAG1} #{HASHTAG2} #{HASHTAG3}`,

  alert: `🚨 {TITLE}

⚠️ ALERT: {COIN} New Listing

📊 Details:
Price: ${getRandomPrice(0.1, 50)}
Market Cap: ${getRandomMarketCap()}
24h Volume: ${getRandomVolume()}

🎯 Opportunity: {OPPORTUNITY}

💡 Action Plan:
1. {ACTION1}
2. {ACTION2}
3. {ACTION3}

⚠️ HIGH RISK - New listings volatile
✅ Do your own research!

#{HASHTAG1} #{HASHTAG2} #{HASHTAG3}`,

  guide: `📚 {TITLE}

🎯 Why Silver in 2026:
• {REASON1}
• {REASON2}
• {REASON3}

💰 Investment Methods:
1. Physical (coins/bars)
2. ETFs (SLV, PSLV)
3. Mining stocks
4. Digital silver

📊 Current Metrics:
Price: ${getRandomPrice(22, 28)}/oz
Gold/Silver Ratio: ${getRandomNumber(70, 85)}
Industrial Demand: ↗️ Rising

💡 Best Approach:
{APPROACH}

⚠️ Not financial advice
✅ Consult a professional

#{HASHTAG1} #{HASHTAG2} #{HASHTAG3}`
};

// Helper functions
function getRandomPrice(min, max) {
  return `$${(Math.random() * (max - min) + min).toFixed(2)}`;
}

function getRandomChange(min, max) {
  const change = (Math.random() * (max - min) + min).toFixed(2);
  return `${change}%`;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomTimeframe() {
  const timeframes = ['5-min', '15-min', '1-hour', '4-hour', 'Daily'];
  return timeframes[Math.floor(Math.random() * timeframes.length)];
}

function getRandomRisk() {
  const risks = ['Low', 'Medium', 'High', 'Very High'];
  return risks[Math.floor(Math.random() * risks.length)];
}

function getRandomMarketCap() {
  const caps = ['$10M', '$50M', '$100M', '$500M', '$1B'];
  return caps[Math.floor(Math.random() * caps.length)];
}

function getRandomVolume() {
  const volumes = ['$1M', '$5M', '$10M', '$50M', '$100M'];
  return volumes[Math.floor(Math.random() * volumes.length)];
}

function getRandomCoin() {
  const coins = ['Bitcoin', 'Ethereum', 'Solana', 'Cardano', 'XRP', 'Dogecoin'];
  return coins[Math.floor(Math.random() * coins.length)];
}

function getRandomStrategy() {
  const strategies = ['Breakout Trading', 'Support/Resistance', 'Moving Average Crossover', 'RSI Divergence'];
  return strategies[Math.floor(Math.random() * strategies.length)];
}

// Content generators
function getInsight(niche) {
  const insights = {
    silver: [
      'Industrial demand from solar panels rising 15% YoY',
      'Central banks adding silver to reserves as inflation hedge',
      'Silver mining supply constrained, supporting higher prices',
      'EV revolution increasing silver usage in electronics'
    ],
    crypto: [
      'Institutional adoption accelerating with ETF approvals',
      'Layer 2 solutions reducing fees and increasing scalability',
      'Regulatory clarity improving in key markets',
      'DeFi TVL reaching new all-time highs'
    ],
    trading: [
      'Emotional discipline is more important than technical analysis',
      'Journal every trade to identify patterns and improve',
      'Risk management separates professionals from amateurs',
      'Let winners run, cut losers quickly'
    ]
  };
  const list = insights[niche] || insights.crypto;
  return list[Math.floor(Math.random() * list.length)];
}

function getWatchItems() {
  const items = [
    'Fed interest rate decisions',
    'CPI inflation data',
    'Dollar index (DXY) movements',
    'Geopolitical tensions',
    'Market sentiment indicators'
  ];
  return items.sort(() => Math.random() - 0.5).slice(0, 2);
}

function getTrend() {
  const trends = [
    'Bullish momentum continuing',
    'Consolidation before next move',
    'Correction phase, buying opportunity',
    'Sideways trading, wait for breakout'
  ];
  return trends[Math.floor(Math.random() * trends.length)];
}

function getOutlook() {
  const outlooks = [
    'Bullish long-term, short-term volatility',
    'Neutral until key resistance breaks',
    'Cautiously optimistic with tight stops',
    'Waiting for clearer direction'
  ];
  return outlooks[Math.floor(Math.random() * outlooks.length)];
}

function getSteps() {
  const steps = [
    'Identify key support/resistance levels',
    'Wait for confirmation candle/volume',
    'Enter trade with immediate stop loss',
    'Take partial profits at 1:1 risk/reward',
    'Move stop to breakeven at 1:1'
  ];
  return steps.sort(() => Math.random() - 0.5).slice(0, 3);
}

function getTip() {
  const tips = [
    'Always have an exit strategy before entering',
    'Trade the chart, not your emotions',
    'The trend is your friend until it ends',
    'Volume confirms price action'
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

function getOpportunity() {
  const opportunities = [
    'Early entry before major exchange listing',
    'Low market cap with high growth potential',
    'Strong team with proven track record',
    'Innovative technology solving real problems'
  ];
  return opportunities[Math.floor(Math.random() * opportunities.length)];
}

function getActions() {
  const actions = [
    'Research the project thoroughly',
    'Start with small position size',
    'Set tight stop loss immediately',
    'Take profits at 2-3x entry',
    'Never invest more than you can lose'
  ];
  return actions.sort(() => Math.random() - 0.5).slice(0, 3);
}

function getReasons() {
  const reasons = [
    'Inflation hedge as fiat currencies devalue',
    'Industrial demand growing exponentially',
    'Limited supply with increasing demand',
    'Portfolio diversification benefits',
    'Historical store of value'
  ];
  return reasons.sort(() => Math.random() - 0.5).slice(0, 3);
}

function getApproach() {
  const approaches = [
    'Dollar-cost average over time',
    'Allocate 5-10% of portfolio to silver',
    'Mix physical and paper silver',
    'Focus on quality over quantity'
  ];
  return approaches[Math.floor(Math.random() * approaches.length)];
}

function getHashtags(niche) {
  const hashtags = {
    silver: ['Silver', 'PreciousMetals', 'Investing', 'Gold', 'Commodities'],
    crypto: ['Crypto', 'Bitcoin', 'Altcoins', 'Blockchain', 'Web3'],
    trading: ['Trading', 'Stocks', 'Investing', 'Finance', 'Strategy']
  };
  const tags = hashtags[niche] || hashtags.crypto;
  return tags.sort(() => Math.random() - 0.5).slice(0, 3);
}

// Generate batch
async function generateBatch() {
  console.log(`🎯 Generating ${BATCH.length} videos for first batch\n`);
  
  const outputDir = path.join(__dirname, 'first_batch_output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const batchResults = [];
  
  for (const video of BATCH) {
    console.log(`📝 Video ${video.id}: ${video.topic} (${video.niche})`);
    console.log(`   Platform: ${video.platform}, Duration: ${video.duration}s`);
    
    // Get template
    const template = TEMPLATES[video.template];
    
    // Generate content
    const insight = getInsight(video.niche);
    const watchItems = getWatchItems();
    const hashtags = getHashtags(video.niche);
    
    // Replace placeholders
    let script = template
      .replace(/{TITLE}/g, video.topic)
      .replace(/{INSIGHT}/g, insight)
      .replace(/{WATCH1}/g, watchItems[0])
      .replace(/{WATCH2}/g, watchItems[1])
      .replace(/{HASHTAG1}/g, hashtags[0])
      .replace(/{HASHTAG2}/g, hashtags[1])
      .replace(/{HASHTAG3}/g, hashtags[2])
      .replace(/{TREND}/g, getTrend())
      .replace(/{OUTLOOK}/g, getOutlook())
      .replace(/{STRATEGY}/g, getRandomStrategy())
      .replace(/{STEP1}/g, getSteps()[0])
      .replace(/{STEP2}/g, getSteps()[1])
      .replace(/{STEP3}/g, getSteps()[2])
      .replace(/{TIP}/g, getTip())
      .replace(/{COIN}/g, getRandomCoin())
      .replace(/{OPPORTUNITY}/g, getOpportunity())
      .replace(/{ACTION1}/g, getActions()[0])
      .replace(/{ACTION2}/g, getActions()[1])
      .replace(/{ACTION3}/g, getActions()[2])
      .replace(/{REASON1}/g, getReasons()[0])
      .replace(/{REASON2}/g, getReasons()[1])
      .replace(/{REASON3}/g, getReasons()[2])
      .replace(/{APPROACH}/g, getApproach());
    
    // Save script
    const filename = `video_${video.id}_${video.niche}_${video.platform.replace(/\s+/g, '_')}.txt`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, script);
    
    console.log(`   ✅ Script saved: ${filename}`);
    console.log(`   📏 ${script.length} characters\n`);
    
    batchResults.push({
      ...video,
      script,
      filepath,
      hashtags
    });
  }
  
  // Create batch summary
  const summary = {
    generated: new Date().toISOString(),
    total_videos: batchResults.length,
    total_characters: batchResults.reduce((sum, v) => sum + v.script.length, 0),
    niches: [...new Set(batchResults.map(v => v.niche))],
    platforms: [...new Set(batchResults.map(v => v.platform))],
    videos: batchResults.map(v => ({
      id: v.id,
      niche: v.niche,
      topic: v.topic,
      platform: v.platform,
      filename: path.basename(v.filepath),
      duration: v.duration,
      hashtags: v.hashtags
    }))
  };
  
  const summaryPath = path.join(outputDir, 'batch_summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  console.log('🎉 BATCH GENERATION COMPLETE!');
  console.log('=============================\n');
  
  console.log('📊 BATCH SUMMARY:');
  console.log('-'.repeat(40));
  console.log(`Total videos: ${summary.total_videos}`);
  console.log(`Total characters: ${summary.total_characters}`);
  console.log(`Niches: ${summary.niches.join(', ')}`);
  console.log(`Platforms: ${summary.platforms.join(', ')}`);
  console.log(`Output directory: ${outputDir}`);
  
  console.log('\n📋 NEXT STEPS - MANUAL WORKFLOW:');
  console.log('-'.repeat(40));
  console.log('For each video script:');
  console.log('1. Copy script text');
  console.log('2. Go to ElevenLabs.io → Speech Synthesis');
  console.log('3. Paste script, choose voice, generate audio');
  console.log('4. Download MP3 file');
  console.log('5. Go to Canva.com → Create video');
  console.log('6. Use template, add audio, text overlays');
  console.log('7. Export video');
  console.log('8. Upload to platform with hashtags');
  
  console.log('\n⏰ TIME ESTIMATE:');
  console.log('-'.repeat(40));
  console.log('Per video: 15-20 minutes');
  console.log('Total batch (5 videos): 1.5-2 hours');
  console.log('With practice: 10 minutes/video');
  
  console.log('\n🚀 READY FOR PRODUCTION!');
  console.log('\n💡 Tip: Start with 1 video today to test workflow.');
  console.log('   Then scale to 5 tomorrow when comfortable.');
  
  return { batchResults, summary, outputDir };
}

// Run batch generation
generateBatch().catch(console.error);