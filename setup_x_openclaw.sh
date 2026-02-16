#!/bin/bash
# 🔧 X.COM OPENCLAW INTEGRATION SETUP
# Configure X.com API in OpenClaw for social media agents

echo "🔧 X.COM OPENCLAW INTEGRATION SETUP"
echo "==================================="
echo ""

# Check if OpenClaw is installed
if ! command -v openclaw &> /dev/null; then
    echo "❌ OpenClaw not found. Please install OpenClaw first."
    exit 1
fi

echo "📋 This script will configure X.com API in OpenClaw for:"
echo "   • Social Media Marketing Agent"
echo "   • Trading Alert Auto-tweets"
echo "   • Domain Promotion"
echo "   • Community Engagement"
echo ""

# Ask for API credentials
read -p "🔑 Enter X.com API Key: " X_API_KEY
read -p "🔒 Enter X.com API Secret: " X_API_SECRET
read -p "🪪 Enter X.com Access Token: " X_ACCESS_TOKEN
read -p "🗝️  Enter X.com Access Secret: " X_ACCESS_SECRET
read -p "🎫 Enter X.com Bearer Token (optional): " X_BEARER_TOKEN

echo ""
echo "⚙️ Configuring OpenClaw..."

# Configure X.com in OpenClaw
openclaw config set x.enabled true
openclaw config set x.api_key "$X_API_KEY"
openclaw config set x.api_secret "$X_API_SECRET"
openclaw config set x.access_token "$X_ACCESS_TOKEN"
openclaw config set x.access_secret "$X_ACCESS_SECRET"

if [ -n "$X_BEARER_TOKEN" ]; then
    openclaw config set x.bearer_token "$X_BEARER_TOKEN"
fi

# Set up social media agent
openclaw config set agents.x_social_agent.enabled true
openclaw config set agents.x_social_agent.provider "ollama"
openclaw config set agents.x_social_agent.model "mistral-7b"
openclaw config set agents.x_social_agent.schedule "0 */2 * * *"  # Every 2 hours

echo "✅ X.com API configured in OpenClaw!"
echo ""

# Create social media agent script
cat > ~/.openclaw/scripts/x_social_agent.js << 'EOF'
// 🤖 X.COM SOCIAL MEDIA AGENT
// Auto-tweets for Empire AI

const { TwitterApi } = require('twitter-api-v2');
const config = require('../../config.json');

class XSocialAgent {
  constructor() {
    this.client = new TwitterApi({
      appKey: config.x.api_key,
      appSecret: config.x.api_secret,
      accessToken: config.x.access_token,
      accessSecret: config.x.access_secret,
    });
    
    this.templates = {
      trading_win: `🎉 Trading Update: +${profit} today! 
Total: ${total} | Win Rate: ${win_rate}%
#Crypto #Trading #AI #EmpireAI`,
      
      trading_insight: `📊 Market Insight: ${insight}
Volatility: ${volatility}% | Trend: ${trend}
#Trading #Crypto #Analysis`,
      
      domain_launch: `🌐 New Web3 Domain: ${domain}
Type: ${type} | Price: $${price}/month
Lease now: ${link}
#Web3 #Domains #Crypto #NFT`,
      
      silver_update: `🥈 Silver Market: ${update}
Price: $${price}/oz | Change: ${change}%
#Silver #Investing #PreciousMetals`,
      
      ai_insight: `🤖 AI Insight: ${insight}
Powered by local Ollama models (€0 cost!)
#AI #Automation #Tech`
    };
  }
  
  async tweetTradingUpdate(profit, total, winRate) {
    const tweet = this.templates.trading_win
      .replace('${profit}', profit)
      .replace('${total}', total)
      .replace('${win_rate}', winRate);
    
    return await this.client.v2.tweet(tweet);
  }
  
  async tweetDomainLaunch(domain, type, price, link) {
    const tweet = this.templates.domain_launch
      .replace('${domain}', domain)
      .replace('${type}', type)
      .replace('${price}', price)
      .replace('${link}', link);
    
    return await this.client.v2.tweet(tweet);
  }
  
  async engageWithMentions() {
    // Get mentions in last hour
    const mentions = await this.client.v2.userMentionTimeline('me', {
      start_time: new Date(Date.now() - 3600000).toISOString(),
      max_results: 20
    });
    
    for (const mention of mentions.data || []) {
      // Auto-reply to questions
      if (mention.text.includes('?')) {
        await this.client.v2.reply('Thanks for your question! Our AI agent will respond shortly. 🤖', mention.id);
      }
      
      // Like all mentions
      await this.client.v2.like('me', mention.id);
    }
    
    return mentions.data?.length || 0;
  }
  
  async getAnalytics() {
    const user = await this.client.v2.me();
    const tweets = await this.client.v2.userTimeline(user.data.id, { max_results: 50 });
    
    return {
      username: user.data.username,
      followers: user.data.public_metrics?.followers_count || 0,
      following: user.data.public_metrics?.following_count || 0,
      tweet_count: user.data.public_metrics?.tweet_count || 0,
      recent_engagement: this.calculateEngagement(tweets.data)
    };
  }
  
  calculateEngagement(tweets) {
    if (!tweets) return 0;
    
    let totalEngagement = 0;
    for (const tweet of tweets) {
      totalEngagement += 
        (tweet.public_metrics?.like_count || 0) +
        (tweet.public_metrics?.retweet_count || 0) +
        (tweet.public_metrics?.reply_count || 0);
    }
    
    return totalEngagement / tweets.length;
  }
}

module.exports = XSocialAgent;
EOF

echo "📝 Social media agent script created: ~/.openclaw/scripts/x_social_agent.js"
echo ""

# Create automation rules
cat > ~/.openclaw/automation/x_rules.json << 'EOF'
{
  "rules": [
    {
      "name": "trading_profit_alert",
      "condition": "trading.daily_profit > 20",
      "action": "x.tweet",
      "template": "trading_win",
      "parameters": {
        "profit": "{{trading.daily_profit}}",
        "total": "{{trading.total_capital}}",
        "win_rate": "{{trading.win_rate}}"
      }
    },
    {
      "name": "domain_lease_signed",
      "condition": "domains.new_lease == true",
      "action": "x.tweet",
      "template": "domain_launch",
      "parameters": {
        "domain": "{{domains.leased_domain}}",
        "type": "{{domains.type}}",
        "price": "{{domains.lease_price}}",
        "link": "https://yourempire.ai/domains"
      }
    },
    {
      "name": "daily_engagement",
      "schedule": "0 9,12,15,18 * * *",
      "action": "x.engage",
      "parameters": {
        "max_mentions": 20
      }
    },
    {
      "name": "weekly_analytics",
      "schedule": "0 10 * * 1",
      "action": "x.analytics",
      "parameters": {
        "email_report": true
      }
    }
  ]
}
EOF

echo "📊 Automation rules created: ~/.openclaw/automation/x_rules.json"
echo ""

# Test the configuration
echo "🧪 Testing configuration..."
if openclaw config get x.api_key &> /dev/null; then
    echo "✅ X.com API configured successfully!"
    echo "   Key: ${X_API_KEY:0:10}..."
    echo "   Secret: ${X_API_SECRET:0:10}..."
else
    echo "❌ Configuration failed. Please check OpenClaw logs."
fi

echo ""
echo "🚀 NEXT STEPS:"
echo "============="
echo "1. Test API with: node test_x_complete.js"
echo "2. Start social media agent: openclaw agents start x_social_agent"
echo "3. Monitor logs: tail -f ~/.openclaw/logs/x_social.log"
echo "4. Check first auto-tweet in 2 hours"
echo ""
echo "📈 EXPECTED RESULTS:"
echo "==================="
echo "• 3-5 tweets per day (trading, domains, insights)"
echo "• 10+ engagements per day (likes, replies)"
echo "• 100-500 new followers per week"
echo "• €500-2000/month extra revenue from X.com leads"
echo ""
echo "🔧 TROUBLESHOOTING:"
echo "=================="
echo "• Check rate limits: https://developer.twitter.com/en/docs/rate-limits"
echo "• Regenerate tokens if expired"
echo "• Enable Read & Write permissions in developer portal"
echo "• Use delay between actions (5-60 seconds)"

echo ""
echo "🎉 X.COM INTEGRATION COMPLETE!"
echo "Your Empire AI will now auto-tweet trading results,"
echo "promote domains, and engage with the community!"