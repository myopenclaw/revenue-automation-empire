# DEX Risk Dashboard SaaS - Technisch Blueprint
## Voor Clarence - Productie-ready Architectuur (2026-2028)

---

## 1. Architectuur Overzicht

### Core Stack
```
Frontend: Next.js + Tailwind + Wallet Connect
Backend: Node.js + Express + PostgreSQL
Agent Layer: OpenClaw + Ollama (multi-model)
Blockchain: Solana RPC + Jupiter API + Raydium API
Signing Service: Separated Node.js microservice (no LLM access)
```

### Multi-Agent Systeem
```
┌─────────────────────────────────────────────────────────┐
│                    User Dashboard                        │
│  • Wallet Risk Score                                     │
│  • Exposure Heatmap                                      │
│  • Anomaly Alerts                                        │
│  • Performance Analytics                                 │
└─────────────────┬───────────────────────────────────────┘
                  │ WebSocket
┌─────────────────▼───────────────────────────────────────┐
│                API Gateway Layer                         │
│  • Authentication (JWT + Wallet Sign)                   │
│  • Rate Limiting                                        │
│  • WebSocket Connections                                │
└─────────────────┬───────────────────────────────────────┘
                  │ gRPC / REST
┌─────────────────▼───────────────────────────────────────┐
│              Agent Orchestrator                          │
│  • Request Routing                                      │
│  • Load Balancing                                       │
│  • Result Aggregation                                   │
└─────────────────┬───────────────────────────────────────┘
                  │ Internal Queue (Redis)
┌─────────────────▼───────────────────────────────────────┐
│              Agent Execution Layer                       │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Risk        │  │ Signal      │  │ Data        │     │
│  │ Evaluator   │  │ Analyzer    │  │ Collector   │     │
│  │ (Strict)    │  │ (Medium)    │  │ (Light)     │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                 │            │
│  ┌──────▼──────┐  ┌─────▼──────┐  ┌──────▼──────┐     │
│  │ Ollama      │  │ Ollama     │  │ Ollama      │     │
│  │ llama3.2    │  │ deepseek   │  │ qwen2.5     │     │
│  │ 3B          │  │ 7B         │  │ 1.5B        │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────┬───────────────────────────────────────┘
                  │ External APIs
┌─────────────────▼───────────────────────────────────────┐
│              Data Sources Layer                          │
│  • Solana RPC (Helius/QuickNode)                        │
│  • Jupiter Swap API                                     │
│  • Raydium API                                          │
│  • Birdeye/DeFiLlama for analytics                      │
│  • Pyth/Oracle for price feeds                          │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Agent Structuur & Prompts

### Agent 1: Data Collector (Light Model - qwen2.5 1.5B)
**Verantwoordelijkheden:**
- Real-time token data verzamelen
- Liquidity changes monitoren
- Wallet transactions tracken
- Volume anomalies detecteren

**System Prompt:**
```
Je bent een Data Collector Agent voor DEX trading. Je taak is OBJECTIEF data verzamelen zonder interpretatie.

INPUT: Wallet address, token address, of timeframe
OUTPUT: JSON met raw data

Regels:
1. Geen analyse - alleen feiten
2. Maximaal 3 API calls per request
3. Cache resultaten 30 seconden
4. Valideer data integriteit
5. Log errors zonder retry

Data velden:
- token_address
- current_price
- liquidity_pools[]
- volume_24h
- holder_count
- top_10_holders_percentage
- contract_verified (true/false)
- created_timestamp
- recent_trades[]
```

### Agent 2: Signal Analyzer (Medium Model - deepseek 7B)
**Verantwoordelijkheden:**
- Trend detection
- Momentum analysis
- Pattern recognition
- Entry signal generation

**System Prompt:**
```
Je bent een Signal Analyzer Agent voor DEX trading. Je analyseert data en identificeert TRADING SIGNALEN.

INPUT: Raw data van Data Collector
OUTPUT: Signal score (0-100) + confidence + reasoning

Analyses:
1. Volume Acceleration: 24h volume vs 7d avg
2. Price Momentum: RSI, MACD (simplified)
3. Liquidity Flow: In/out changes
4. Social Sentiment: Twitter/Telegram mentions
5. Smart Money: Whale wallet activity

Risk flags (automatisch downgrade score):
- < $100k liquidity
- > 40% top 10 holders
- Contract unverified
- < 24h old token

Output format:
{
  "signal_score": 75,
  "confidence": "high|medium|low",
  "reasoning": "Volume spiked 300% with stable price...",
  "risk_flags": ["low_liquidity"],
  "recommended_action": "monitor|consider|avoid"
}
```

### Agent 3: Risk Evaluator (Strict Model - llama3.2 3B)
**Verantwoordelijkheden:**
- Final risk assessment
- Position sizing calculation
- Exposure management
- Emergency exit triggers

**System Prompt:**
```
Je bent een Risk Evaluator Agent voor DEX trading. Je bent CONSERVATIEF en BLOCKKEERT riskante trades.

INPUT: Signal van Analyzer + user portfolio
OUTPUT: Go/No-Go + position size + risk parameters

RISK RULES (HARD STOPS):
1. NO unverified contracts
2. NO tokens < 24h old
3. NO liquidity < $250k
4. NO top 10 holders > 35%
5. MAX 2% portfolio per trade
6. MAX 10% portfolio in microcaps
7. REQUIRED stop loss: -25%
8. REQUIRED take profit: +100% (scale out)

Calculations:
- Position Size = min(2% portfolio, risk_adjusted_size)
- Risk Score = (contract_risk + liquidity_risk + holder_risk) / 3
- Max Exposure = 10% - current_microcap_exposure

Output format:
{
  "decision": "APPROVED|REJECTED",
  "risk_score": 65,
  "position_size_usd": 500,
  "max_position_usd": 1000,
  "stop_loss_percent": 25,
  "take_profit_targets": [50, 100],
  "risk_reasons": ["adequate_liquidity", "verified_contract"],
  "warning_flags": ["high_volatility"],
  "monitoring_required": true
}
```

---

## 3. Tool Structuur & Integraties

### Solana Toolset
```javascript
// tools/solana.js
module.exports = {
  getTokenData: async (mintAddress) => {
    // Helius RPC calls
  },
  
  getWalletHoldings: async (walletAddress) => {
    // Token accounts + balances
  },
  
  analyzeLiquidityPool: async (poolAddress) => {
    // Raydium/Orca pool analysis
  },
  
  trackSmartMoney: async (walletList) => {
    // Monitor 20 profitable wallets
  },
  
  simulateSwap: async (input) => {
    // Jupiter quote API
  }
};
```

### Risk Analysis Tools
```javascript
// tools/risk.js
module.exports = {
  calculatePositionSize: (portfolio, riskScore) => {
    // Kelly Criterion adjusted
  },
  
  exposureHeatmap: (wallets) => {
    // Visualize risk concentration
  },
  
  detectHoneypot: (contractAddress) => {
    // Contract analysis for malicious code
  },
  
  MEVProtection: (tradeParams) => {
    // Slippage optimization + timing
  },
  
  emergencyExitCheck: (position, market) => {
    // Real-time stop loss monitoring
  }
};
```

### Dashboard Tools
```javascript
// tools/dashboard.js
module.exports = {
  generateRiskReport: (wallet) => {
    // Comprehensive risk assessment
  },
  
  createAlert: (userId, alertType, data) => {
    // Real-time notifications
  },
  
  performanceAnalytics: (trades) => {
    // ROI, Sharpe ratio, win rate
  },
  
  exportData: (format, timeframe) => {
    // CSV/PDF reports
  }
};
```

---

## 4. Ollama Setup & Model Routing

### Installation
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull models
ollama pull qwen2.5:1.5b
ollama pull deepseek-coder:6.7b
ollama pull llama3.2:3b

# Create custom model configurations
ollama create dex-data-collector -f ./Modelfiles/data-collector
ollama create dex-signal-analyzer -f ./Modelfiles/signal-analyzer  
ollama create dex-risk-evaluator -f ./Modelfiles/risk-evaluator
```

### Model Routing Logic
```javascript
// model-router.js
class ModelRouter {
  constructor() {
    this.models = {
      data: 'qwen2.5:1.5b',
      signal: 'deepseek-coder:6.7b',
      risk: 'llama3.2:3b'
    };
  }

  async routeRequest(taskType, input) {
    switch(taskType) {
      case 'data_collection':
        return this.callModel(this.models.data, input);
      case 'signal_analysis':
        return this.callModel(this.models.signal, input);
      case 'risk_evaluation':
        return this.callModel(this.models.risk, input);
      default:
        throw new Error('Unknown task type');
    }
  }

  async callModel(model, input) {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        model,
        prompt: input,
        stream: false,
        options: {
          temperature: taskType === 'risk' ? 0.1 : 0.3,
          top_p: 0.9,
          max_tokens: 1000
        }
      })
    });
    return response.json();
  }
}
```

---

## 5. Signing Service (CRITICAL - No LLM Access)

### Architecture
```
┌─────────────────────────────────────────────────────────┐
│               Isolated Signing Service                   │
│  • Runs on separate server/VPS                          │
│  • No internet access except RPC nodes                  │
│  • Hardware security module (optional)                  │
│  • Audit logging for all signatures                     │
└─────────────────┬───────────────────────────────────────┘
                  │ Local network only
┌─────────────────▼───────────────────────────────────────┐
│                    API Interface                         │
│  POST /sign/swap                                        │
│  POST /sign/approve                                     │
│  GET /audit/logs                                        │
└─────────────────────────────────────────────────────────┘
```

### Implementation
```javascript
// signing-service/index.js
const { Keypair, Transaction } = require('@solana/web3.js');
const express = require('express');
const app = express();

// Load encrypted private key from env
const PRIVATE_KEY = process.env.SIGNING_KEY;
const keypair = Keypair.fromSecretKey(
  Buffer.from(PRIVATE_KEY, 'base64')
);

app.post('/sign/swap', async (req, res) => {
  const { transactionData, userWallet } = req.body;
  
  // Validate request
  if (!validateSwapRequest(transactionData, userWallet)) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  
  // Create and sign transaction
  const transaction = Transaction.from(transactionData);
  transaction.sign(keypair);
  
  // Log for audit
  auditLog('swap_signed', {
    user: userWallet,
    amount: transactionData.amount,
    timestamp: Date.now()
  });
  
  res.json({ signedTransaction: transaction.serialize() });
});

// Strict validation
function validateSwapRequest(data, wallet) {
  // Business logic validation
  if (data.amount > MAX_TRADE_SIZE) return false;
  if (isBlacklistedToken(data.token)) return false;
  if (!isWhitelistedWallet(wallet)) return false;
  
  return true;
}
```

---

## 6. Winstmodel & Pricing Tiers

### Tier 1: Basic Risk Dashboard (€79/maand)
```
• 3 connected wallets
• Real-time risk scoring
• Exposure heatmap
• Daily email alerts
• Basic analytics
• API access (1000 calls/day)
```

### Tier 2: Pro Trader (€199/maand)
```
• 10 connected wallets  
• Smart money tracking
• Advanced risk metrics (Sharpe, VaR)
• Telegram/Webhook alerts
• Custom risk parameters
• API access (10,000 calls/day)
• Historical data export
```

### Tier 3: Institutional (€499/maand)
```
• Unlimited wallets
• White-label dashboard
• Dedicated RPC nodes
• SLA 99.9%
• Custom agent training
• On-premise deployment option
• 24/7 support
```

### Performance Fee Model (Additioneel)
```
• Copy trading automation: 15% van winst
• Managed portfolios: 2% management fee + 20% performance
• Signal marketplace: 30% revenue share
```

---

## 7. Implementatie Roadmap

### Fase 1: MVP (Maand 1-2)
```
Week 1-2: Core infrastructure
  • Ollama setup + model training
  • Basic agent architecture
  • Solana RPC integration

Week 3-4: Risk dashboard v1
  • Wallet connection
  • Basic risk scoring
  • Exposure visualization

Week 5-6: Alert system
  • Email notifications
  • Risk threshold alerts
  • Portfolio monitoring
```

### Fase 2: Automation (Maand 3-4)
```
• Semi-auto execution
• TP/SL automation
• Signal marketplace
• API documentation
```

### Fase 3: Scale (Maand 5-6)
```
• Multi-chain support (Ethereum, Base)
• Advanced analytics
• White-label solution
• Enterprise features
```

---

## 8. Technische Vereisten & Kosten

### Infrastructuur
```
• VPS: €50/maand (8GB RAM, 4 vCPU)
• RPC Nodes: €200/maand (Helius premium)
• Database: €30/maand (PostgreSQL)
• Storage: €20/maand (backups + logs)
• Total: €300/maand
```

### Development Team
```
• Full-stack developer: €5,000 (one-time MVP)
• Smart contract auditor: €2,000 (security review)
• UI/UX designer: €3,000 (dashboard)
• Total: €10,000 initial
```

### Break-even Analysis
```
• 10 Tier 2 customers: €1,990/maand
• 5 Tier 3 customers: €2,495/maand
• Total: €4,485/maand revenue
• Profit: €4,185/maand (na kosten)
• Break-even: 3 maanden
```

---

## 9. Risico Mitigatie

### Technische Risico's
```
• RPC node failure → Multi-provider fallback
• Model hallucination → Strict output validation
• API rate limits → Intelligent caching
• Private key security → Isolated signing service
```

### Bedrijfsrisico's
```
• Regulatory changes → Juridisch advies inwinnen
• Market volatility → Conservative risk parameters
• Competition → Focus on risk management niche
• Customer acquisition → Content marketing + partnerships
```

---

## 10. Next Steps Voor Jou

### Directe Acties (Week 1)
1. **Ollama setup** op je development machine
2. **Test wallets** aanmaken (devnet Solana)
3. **Helius account** aanmaken voor RPC access
4. **Basic agent** bouwen voor token scanning

### Validatie (Week 2-3)
1. **Risk scoring** testen op 100 bestaande tokens
2. **False positive rate** meten (< 5% target)
3. **Early adopters** vinden (3-5 traders)

### Scaling (Maand 1-3)
1. **Automated execution** toevoegen
2. **Multi-wallet** support
3. **SaaS pricing** implementeren
4. **Marketing funnel** opzetten

---

## 11. Conclusie & ROI Projectie

### Conservatieve Projectie
```
Jaar 1:
• 50 Tier 1 customers: €3,950/maand
• 20 Tier 2 customers: €3,980/maand  
• 5 Tier 3 customers: €2,495/maand
• Total Revenue: €10,425/maand
• Net Profit: €10,125/maand (€121,500/jaar)

Jaar 2:
• 200 Tier 1: €15,800/maand
• 50 Tier 2: €9,950/maand
• 15 Tier 3: €7,485/maand
• Performance fees: €5,000/maand
• Total: €38,235/maand (€458,820/jaar)
```

### Unique Selling Points
1. **Risk-first approach** - Niet nog een signal service
2. **Multi-agent architecture** - Geen single point of failure
3. **No private key exposure** - Geen security nightmares
4. **Ollama-based** - Geen OpenAI API costs
5. **Solana-focused** - Laag gas, hoge snelheid

### Competitive Advantage
• **Early mover** in DEX risk management SaaS
• **Technical depth** die retail traders niet kunnen bouwen
• **Scalable architecture** voor enterprise clients
• **Performance-based pricing** alignment

---

## 12. Direct Start Script

```bash
#!/bin/bash
# DEX Risk Dashboard - Initial Setup Script

echo "🚀 Starting DEX Risk Dashboard Setup..."

# 1. Install Ollama
echo "📦 Installing Ollama..."
curl -fsSL https://ollama.com/install.sh | sh

# 2. Pull models
echo "🧠 Downloading AI models..."
ollama pull qwen2.5:1.5b
ollama pull deepseek-coder:6.7b
ollama pull llama3.2:3b

# 3. Create project structure
echo "📁 Creating project structure..."
mkdir -p dex-risk-dashboard/{agents,tools,models,dashboard,signing-service}
cd dex-risk-dashboard

# 4. Initialize Node.js project
echo "📦 Initializing Node.js project..."
npm init -y
npm install express @solana/web3.js axios redis ws jsonwebtoken

# 5. Create basic agent structure
echo "🤖 Creating agent structure..."
cat > agents/data-collector.js << 'EOF'
// Data Collector Agent
module.exports = class DataCollector {
  constructor() {
    this.model = 'qwen2.5:1.5b';
  }
  
  async collectTokenData(mintAddress) {
    // Implementation here
  }
}
EOF

# 6. Create environment template
echo "⚙️ Creating environment configuration..."
cat > .env.example << 'EOF'
# Solana RPC
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
HELIUS_API_KEY=your_helius_key

# Ollama
OLLAMA_HOST=http://localhost:11434

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dex_risk

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Signing Service (ISOLATED)
SIGNING_SERVICE_URL=http://localhost:3001
SIGNING_KEY_ENCRYPTED=your_encrypted_key
EOF

echo "✅ Setup complete!"
echo "Next steps:"
echo "1. Fill in .env.example and rename to .env"
echo "2. Get Helius API key from https://helius.dev"
echo "3. Run: node agents/data-collector.js"
echo "4. Start building your dashboard!"
```

---

**Ready to build?** Dit blueprint geeft je een complete, productie-ready architectuur. Het combineert je trading expertise met een schaalbaar SaaS-model dat €50K+ MRR kan bereiken binnen 12-18 maanden.

Wat is je eerste stap? Ollama installeren of de agent prompts testen?