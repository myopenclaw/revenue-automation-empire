# 🚀 DEX Sniper Agent
## Team 2: Edge Development for New Listings & Microcaps

## 📋 Overview
DEX agent for scanning and executing on new token listings with asymmetric risk/reward profile.

## 🎯 Purpose
- **Scanner:** Detect new listings on DEXes (Raydium, Orca, etc.)
- **Sniper:** Quick execution on qualified setups
- **Risk Management:** Small size, quick exits, stop losses
- **Integration:** Profits flow to CEX core for compounding

## 🏗️ Architecture
```
dex_project/
├── src/
│   ├── scanners/     # New listings detection
│   ├── execution/    # Trade execution
│   ├── risk/         # Risk management
│   └── utils/        # Helper functions
├── config/           # Configuration files
├── logs/             # Trade logs
└── tests/            # Test suite
```

## 🚀 Getting Started

### 1. Installation
```bash
cd dex_project
npm install
```

### 2. Configuration
```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Run
```bash
npm start
```

## ⚠️ Important Notes
- **Testnet first:** Always test on testnet before mainnet
- **Small size:** Start with $10-50 per trade
- **Security:** Never commit private keys to git
- **Risk:** DEX trading is high risk - only risk capital

## 📊 Development Phases
1. **Phase 1:** Foundation (setup, wallet, basic connection)
2. **Phase 2:** Scanner (new listings detection)
3. **Phase 3:** Execution (sniper trades)
4. **Phase 4:** Integration (with CEX system)

## 🔗 Links
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [Jupiter API Docs](https://station.jup.ag/docs/apis/swap-api)
- [Raydium SDK](https://raydium.gitbook.io/raydium/)
- [DexScreener API](https://docs.dexscreener.com/)
```