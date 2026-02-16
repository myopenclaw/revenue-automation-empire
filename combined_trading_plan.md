# 🚀 Gecombineerd Trading Plan
## MEXC (2 SOL) + Phantom DEX (50 USDC) = $50/Dag Target

---

## 🏦 Jouw Capital Allocatie:

### CEX (MEXC):
```
• 2 SOL ≈ $190
• Doel: $30-40/dag (15-21% return)
• Strategie: Mixed scalping + momentum
• Trades: 10-15/dag
• Focus: SOL, BTC, ETH
```

### DEX (Phantom):
```
• 50 USDC = $50
• Doel: $10-15/dag (20-30% return)
• Strategie: DEX arbitrage + momentum
• Trades: 5-8/dag
• Focus: SOL/USDC, BONK, JUP pools
```

### Totaal:
```
• Capital: $240
• Doel: $40-55/dag
• Target: $50/dag ✅
```

---

## 🎯 Dagelijks Plan:

### Ochtend Sessie (08:00-10:00 UTC):
```
MEXC (CEX):
• 5-7 scalping trades op SOL/USDT
• Target: $10-15 winst
• Risk: Max $5 verlies

DEX (Phantom):
• 2-3 arbitrage trades op SOL/USDC
• Target: $3-5 winst
• Risk: Max $2 verlies
```

### Middag Sessie (12:00-14:00 UTC):
```
MEXC (CEX):
• 3-5 momentum trades op BTC/ETH
• Target: $10-15 winst
• Risk: Max $5 verlies

DEX (Phantom):
• 2-3 momentum trades op BONK/JUP
• Target: $3-5 winst
• Risk: Max $2 verlies
```

### Avond Sessie (20:00-21:00 UTC):
```
Gecombineerd:
• 2-3 opportunity trades
• Target: $5-10 winst
• Risk: Max $3 verlies
```

### Dag Totaal:
```
MEXC: $25-35
DEX: $8-12
Totaal: $33-47 (richting $50 target)
```

---

## 🤖 Hoe te Starten:

### Stap 1: MEXC Bot Configureren
```bash
# 1. API credentials instellen
nano ~/.mexc_credentials

# 2. Start de bot
cd ~/mexc_trading
./start.sh
```

### Stap 2: DEX Agent Configureren
```bash
# 1. Installeer dependencies
cd ~/mexc_trading
npm install @solana/web3.js @solana/spl-token axios

# 2. Run DEX agent
node dex_agent_50usdc.js
```

### Stap 3: Gecombineerd Run
```bash
# Run beide agents (in verschillende terminals)
# Terminal 1: MEXC bot
cd ~/mexc_trading && ./start.sh

# Terminal 2: DEX agent  
cd ~/mexc_trading && node dex_agent_50usdc.js
```

---

## 📊 Real-time Monitoring:

### MEXC Dashboard:
```
🤖 MEXC Trading Bot
💰 Balance: 2.0000 SOL ($190.50)
🎯 Daily Target: $30-40
🔄 Trade: SOL/USDT @ $95.25
✅ WIN: $0.85
📊 Daily: $12.45 / $35.00
```

### DEX Dashboard:
```
🤖 DEX Agent (Phantom)
💰 Balance: 50.00 USDC
🎯 Daily Target: $10-15
🔄 Trade: SOL/USDC arbitrage
✅ WIN: $0.42
📊 Daily: $3.25 / $12.00
```

### Gecombineerd Dashboard:
```
🚀 Combined Trading
💰 Total Capital: $240.00
🎯 Daily Target: $50.00
📊 Progress: $15.70 / $50.00 (31.4%)
⏳ Time: 2.5/8 hours
📈 Projection: $48.20 by EOD
```

---

## 💰 Compounding Projectie:

### Dag 1-7 (Met 80% Reinvestment):
```
Start: $240
Dag 1: $240 → $290 (+$50)
Dag 2: $290 → $350 (+$60)
Dag 3: $350 → $423 (+$73)
Dag 4: $423 → $511 (+$88)
Dag 5: $511 → $618 (+$107)
Dag 6: $618 → $747 (+$129)
Dag 7: $747 → $903 (+$156)

Week 1: $240 → $903 (+276%)
```

### Realistischere 15% Dagelijks:
```
Dag 1: $240 → $276 (+$36)
Dag 7: $240 → $639 (+166%)
Dag 30: $240 → $15,864 (met compounding!)
```

---

## 🔧 Risk Management:

### MEXC Limits:
```
• Max 2% risk per trade ($3.80)
• Stop loss: 0.4-1%
• Max daily loss: $19 (10%)
• Stop na 3 consecutive losses
```

### DEX Limits:
```
• Max 2% risk per trade ($1.00)
• Stop loss: 0.5-1.5%
• Max daily loss: $5 (10%)
• Stop na 2 consecutive losses
```

### Gecombineerde Limits:
```
• Totaal max daily loss: $24 (10% van $240)
• Win rate target: > 65%
• Sharpe ratio: > 1.5
• Max correlation tussen MEXC/DEX trades: < 0.3
```

---

## 🎯 Eerste Dag Concrete Plan:

### 08:00-10:00 UTC:
```
1. MEXC: 3 SOL scalping trades ($2-3 target per trade)
2. DEX: 1 SOL/USDC arbitrage ($1-2 target)
3. Check win rates, adjust indien nodig
```

### 12:00-14:00 UTC:
```
1. MEXC: 2 BTC momentum trades ($4-6 target per trade)
2. DEX: 1 BONK momentum trade ($1-2 target)
3. Review morning performance
```

### 20:00-21:00 UTC:
```
1. Opportunity scan op beide platforms
2. 1-2 beste trades plaatsen
3. Dagelijkse review en compounding berekenen
```

### Einde Dag:
```
• Bereken totale winst
• Reinvesteer 80% naar morgen
• Review trades voor verbetering
• Pas strategy aan indien nodig
```

---

## ⚡ Snel Start Commando's:

### MEXC Bot Starten:
```bash
# Configureer eerst API keys
nano ~/.mexc_credentials

# Start in simulation mode eerst
cd ~/mexc_trading
node bot.js --simulate

# Dan met echte trading
./start.sh
```

### DEX Agent Starten:
```bash
# Run DEX agent (gebruikt Jupiter API)
cd ~/mexc_trading
node dex_agent_50usdc.js

# Voor alleen DEX monitoring
node dex_agent_50usdc.js --monitor
```

### Gecombineerd Monitoring:
```bash
# Start beide in screen sessions
screen -S mexc ./start.sh
screen -S dex node dex_agent_50usdc.js

# Monitor beide
screen -r mexc  # MEXC terminal
screen -r dex   # DEX terminal
```

---

## 🚨 Belangrijke Waarschuwingen:

### NOOIT Doen:
1. **Meer dan 2% per trade risken**
2. **Trading zonder stop loss**
3. **Alles in één trade**
4. **Emotionele beslissingen**
5. **Vergeten te compounden**

### Altijd Doen:
1. **Stop losses plaatsen**
2. **Trades loggen voor review**
3. **Dagelijks compounding berekenen**
4. **Strategy aanpassen op basis van data**
5. **Breaks nemen bij vermoeidheid**

---

## 📈 Success Metrics:

### Week 1 Doelen:
```
1. Consistency: > 65% win rate
2. Risk management: < 10% daily drawdown
3. Profit: $25-35/dag gemiddeld
4. Compounding: 80% reinvestment rate
5. Learning: Dagelijkse trade review
```

### Maand 1 Doelen:
```
1. Capital: $240 → $500+ (108%+ growth)
2. Daily target: $50 → $100+
3. Automation: Beide agents volledig automated
4. Scaling: Voorbereiding voor $1,000+ capital
```

---

## ❓ Directe Actie:

**Start je met:**

1. **Simulation mode eerst** (veilig leren)
2. **Kleine echte trades** ($1-2 per trade)
3. **Volle strategy** (beide agents direct)
4. **Focus op één platform eerst** (MEXC of DEX)

**Gezien je ervaring: Start met kleine echte trades op beide (optie 2).**

**Wil je dat ik je help met:**

A) **Live trading sessie** begeleiding?
B) **Real-time dashboard** voor beide agents?
C) **Compounding calculator** met groei projecties?
D) **Risk management alerts** setup?

**Ready om je eerste $50 te maken met je $240 trading capital?**