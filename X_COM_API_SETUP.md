# 🐦 X.COM (TWITTER) API SETUP
## Voor Social Media Agents & Automatisering

---

## 🎯 **WAAROM JE X.COM API NODIG HEBT:**

### **Voor Je Empire Agents:**
```
1. 📢 Social Media Marketing Agent
   • Auto-tweet trading insights
   • Post silver/crypto updates
   • Engage with community

2. 📊 Social Listening Agent
   • Monitor mentions & trends
   • Track competitor activity
   • Sentiment analysis

3. 🤖 Auto-Engagement Agent
   • Auto-reply to comments
   • Like relevant content
   • Follow-back strategy

4. 📈 Analytics Agent
   • Follower growth tracking
   • Engagement metrics
   • ROI measurement
```

### **Use Cases:**
```
• Trading alerts → Auto-tweet profits
• Domain launches → Promote new .crypto domains
• Silver products → Marketing campaigns
• AI insights → Share authority content
```

---

## 🔍 **STAP 1: CHECK OF JE AL EEN API HEBT**

### **Waar te zoeken:**
```bash
# 1. Check environment variables
env | grep -i twitter
env | grep -i x.com
env | grep -i bearer

# 2. Check config files
ls -la ~/.twitter* ~/.x* 2>/dev/null
ls -la ~/.*rc 2>/dev/null | grep -i twitter

# 3. Check project directories
find ~/projects -name "*.env*" -exec grep -l "twitter\|x.com" {} \; 2>/dev/null

# 4. Check OpenClaw config
openclaw config get | grep -i twitter
```

### **Als je een API hebt:**
```
API Key:        xxxxxxxx
API Secret:     xxxxxxxx
Bearer Token:   xxxxxxxx
Access Token:   xxxxxxxx
Access Secret:  xxxxxxxx
```

---

## 🚀 **STAP 2: NIEUWE X.COM API MAKEN (ALS JE GEEN HEBT)**

### **Ga naar: https://developer.twitter.com**
```
1. Login met je X.com account
2. Klik "Developer Portal"
3. Klik "Projects & Apps"
4. Klik "Create App"
```

### **App Details:**
```
App Name: Empire AI Trading & Domains
Description: AI agents for trading automation, domain management, and content creation
Website: https://yourempire.ai (of placeholder)
Callback URL: https://yourempire.ai/callback
```

### **Permissions Selecteren:**
```
✅ Read and Write (nodig voor tweeten)
✅ Direct Messages (optioneel)
✅ Follows (optioneel)
```

### **API Keys Genereren:**
```
1. Na app creatie: "Keys and Tokens" tab
2. Generate: "API Key and Secret"
3. Generate: "Access Token and Secret"
4. Generate: "Bearer Token"
5. SAVE ALL KEYS SECURELY!
```

---

## 🔑 **STAP 3: API KEYS OPSLAAN VEILIG**

### **Optie A: OpenClaw Config**
```bash
# Configureer X.com in OpenClaw
openclaw config set x.enabled true
openclaw config set x.api_key "YOUR_API_KEY"
openclaw config set x.api_secret "YOUR_API_SECRET"
openclaw config set x.bearer_token "YOUR_BEARER_TOKEN"
openclaw config set x.access_token "YOUR_ACCESS_TOKEN"
openclaw config set x.access_secret "YOUR_ACCESS_SECRET"
```

### **Optie B: Environment Variables**
```bash
# Add to ~/.zshrc or ~/.bashrc
export X_API_KEY="xxxxxxxx"
export X_API_SECRET="xxxxxxxx"
export X_BEARER_TOKEN="xxxxxxxx"
export X_ACCESS_TOKEN="xxxxxxxx"
export X_ACCESS_SECRET="xxxxxxxx"

# Reload
source ~/.zshrc
```

### **Optie C: Encrypted File**
```bash
# Maak encrypted config
cat > ~/.x_credentials.enc << EOF
X_API_KEY=xxxxxxxx
X_API_SECRET=xxxxxxxx
X_BEARER_TOKEN=xxxxxxxx
X_ACCESS_TOKEN=xxxxxxxx
X_ACCESS_SECRET=xxxxxxxx
EOF

# Encrypt met GPG
gpg -c ~/.x_credentials.enc
rm ~/.x_credentials.enc  # verwijder plaintext
```

---

## 🧪 **STAP 4: TEST JE API**

### **Test Script:**
```javascript
// test_x_api.js
const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({
  appKey: process.env.X_API_KEY,
  appSecret: process.env.X_API_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessSecret: process.env.X_ACCESS_SECRET,
});

async function testAPI() {
  try {
    // Test 1: Get user info
    const user = await client.v2.me();
    console.log('✅ User:', user.data.username);
    
    // Test 2: Send tweet
    const tweet = await client.v2.tweet('🤖 Empire AI is online! Testing X.com API integration.');
    console.log('✅ Tweet sent:', tweet.data.id);
    
    // Test 3: Get timeline
    const timeline = await client.v2.userTimeline(user.data.id, { max_results: 5 });
    console.log('✅ Timeline:', timeline.data.data.length, 'tweets');
    
    return true;
  } catch (error) {
    console.error('❌ API Error:', error);
    return false;
  }
}

testAPI();
```

### **Installatie:**
```bash
npm install twitter-api-v2
node test_x_api.js
```

---

## 🤖 **STAP 5: INTEGREREN MET OPENCLAW AGENTS**

### **Social Media Agent Config:**
```yaml
# In OpenClaw config.yaml
agents:
  - name: "XSocialAgent"
    description: "X.com social media automation"
    provider: "ollama"  # Gebruik onze lokale API!
    model: "mistral-7b"
    enabled: true
    tools:
      - x_tweet
      - x_reply
      - x_like
      - x_follow
      - x_analytics
    system_prompt: |
      Je bent de X.com Social Media Agent voor Empire AI.
      
      FOCUS:
      • Tweet trading insights (wins, losses, lessons)
      • Promote domain launches (.crypto, .x, .nft)
      • Share silver/crypto market updates
      • Engage with trading community
      • Auto-respond to mentions
      
      TONE:
      • Professional but approachable
      • Data-driven insights
      • Clear calls-to-action
      • Hashtag optimized: #Crypto #Trading #Web3 #AI
      
      SCHEDULE:
      • 3-5 tweets per day
      • 10+ engagements per day
      • Weekly analytics report
```

### **Automation Workflows:**
```javascript
// Auto-tweet trading milestones
WHEN trading_profit > $20 THEN
  tweet = `🎉 Trading milestone: +$${profit} today! 
           Total: $${total} | Win rate: ${win_rate}%
           #Crypto #Trading #AI #EmpireAI`
  POST_TO_X(tweet)

// Auto-tweet domain launches
WHEN new_domain_launched THEN
  tweet = `🌐 New Web3 domain launched: ${domain}
           Available for lease: $${price}/month
           #Web3 #Domains #Crypto #NFT`
  POST_TO_X(tweet)
```

---

## 📊 **STAP 6: CONTENT STRATEGIE**

### **Content Pillars:**
```
1. TRADING INSIGHTS (40%)
   • Daily profit/loss updates
   • Market analysis
   • Trading lessons learned
   • Strategy breakdowns

2. DOMAIN PORTFOLIO (30%)
   • New domain launches
   • Lease opportunities
   • Web3 education
   • Success stories

3. SILVER/CRYPTO (20%)
   • Market updates
   • Product launches
   • Investment insights
   • Industry news

4. AI AUTOMATION (10%)
   • Agent updates
   • Tech breakthroughs
   • Behind-the-scenes
   • Future roadmap
```

### **Posting Schedule:**
```
08:00 - Morning trading outlook
12:00 - Midday market update  
16:00 - Trading results update
18:00 - Domain/Web3 content
20:00 - Community engagement
```

---

## 🔒 **STAP 7: SECURITY & COMPLIANCE**

### **Rate Limits:**
```
• Tweets: 300 per 3 hours
• Likes: 1000 per 24 hours
• Follows: 400 per 24 hours
• DMs: 1000 per 24 hours
```

### **Best Practices:**
```
✅ Use delay between actions (5-60 seconds)
✅ Monitor rate limit headers
✅ Implement exponential backoff
✅ Log all API interactions
✅ Regular token rotation
```

### **Compliance:**
```
• Disclose automated posting
• No spam or duplicate content
• Respect user privacy
• Follow X.com rules
• Include opt-out options
```

---

## 🚀 **STAP 8: DIRECTE ACTIE**

### **Als Je API Hebt:**
```bash
# 1. Test of het werkt
./test_x_api.sh

# 2. Configureer OpenClaw
openclaw config set x.enabled true
# ... voeg keys toe

# 3. Start social media agent
openclaw agents start XSocialAgent
```

### **Als Je Geen API Hebt:**
```
1. Ga naar: https://developer.twitter.com
2. Maak app (5-10 minuten)
3. Kopieer API keys
4. Configureer OpenClaw
5. Test met script
6. Start automatisering
```

### **Morgen Klaar Voor Gebruik:**
```
✅ Auto-tweet trading results
✅ Domain promotion automation
✅ Community engagement
✅ Analytics tracking
```

---

## 💰 **ROI VAN X.COM INTEGRATIE:**

### **Metrics:**
```
• Followers: 100-500/week target
• Engagement: 5-10% rate target
• Leads: 2-5/day from X.com
• Conversions: 1-2% to customers
```

### **Revenue Impact:**
```
• Direct sales: €500-2000/maand
• Domain leases: +10-20% via promotion
• Trading signals: Premium subscribers
• Authority building: Higher conversion rates
```

### **Time Savings:**
```
• Manual posting: 1-2 hours/day → 0 hours
• Engagement: 30 min/day → auto
• Analytics: 1 hour/week → auto
• Total: 10-15 hours/week saved
```

---

## 🆘 **TROUBLESHOOTING:**

### **Common Issues:**
```
❌ "Invalid or expired token"
   Solution: Generate new tokens

❌ "Rate limit exceeded"
   Solution: Add delays, respect limits

❌ "Authentication failed"
   Solution: Check all keys, regenerate

❌ "App suspended"
   Solution: Review compliance, appeal
```

### **Debug Commands:**
```bash
# Test connectivity
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.twitter.com/2/users/me"

# Check rate limits
curl -I -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.twitter.com/2/tweets"
```

---

## 🏁 **CONCLUSIE:**

**X.com API Geeft Je:**
```
✅ Social media automation voor 10+ agents
✅ Real-time trading alerts op X.com
✅ Domain portfolio promotion
✅ Community engagement scaling
✅ Analytics en ROI tracking
```

**Setup Tijd: 15-30 minuten**  
**ROI: €500-2000+/maand extra revenue**

**Begin met testen en morgen draaien we de social media agents!** 🚀🐦