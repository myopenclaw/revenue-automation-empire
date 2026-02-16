#!/bin/bash
# USDC Treasury Setup voor OpenClaw Trading Bots
# Clarence - 2026-02-15

echo "🚀 USDC Treasury Setup voor OpenClaw Trading Bots"
echo "=================================================="

# 1. Installeer Solana CLI tools
echo "📦 Installing Solana CLI tools..."
if ! command -v solana &> /dev/null; then
    sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
fi

# 2. Maak wallet directories
echo "🔐 Creating wallet structure..."
mkdir -p ~/.openclaw/wallets/{master,hot,bots}
mkdir -p ~/.openclaw/treasury/config

# 3. Maak master treasury wallet (cold storage)
echo "🏦 Creating master treasury wallet..."
solana-keygen new --no-passphrase -o ~/.openclaw/wallets/master/treasury.json
MASTER_PUBKEY=$(solana-keygen pubkey ~/.openclaw/wallets/master/treasury.json)
echo "Master Treasury Address: $MASTER_PUBKEY"

# 4. Maak hot wallet pool
echo "🔥 Creating hot wallet pool..."
for i in {1..3}; do
    solana-keygen new --no-passphrase -o ~/.openclaw/wallets/hot/hot_$i.json
    HOT_PUBKEY=$(solana-keygen pubkey ~/.openclaw/wallets/hot/hot_$i.json)
    echo "Hot Wallet $i: $HOT_PUBKEY"
done

# 5. Maak trading bot wallets
echo "🤖 Creating trading bot wallets..."
BOT_WALLETS=()
for i in {1..5}; do
    solana-keygen new --no-passphrase -o ~/.openclaw/wallets/bots/bot_$i.json
    BOT_PUBKEY=$(solana-keygen pubkey ~/.openclaw/wallets/bots/bot_$i.json)
    BOT_WALLETS+=("$BOT_PUBKEY")
    echo "Bot $i Wallet: $BOT_PUBKEY"
done

# 6. Request test SOL voor gas
echo "⛽ Requesting test SOL for gas..."
solana airdrop 1 $MASTER_PUBKEY
for i in {1..3}; do
    HOT_PUBKEY=$(solana-keygen pubkey ~/.openclaw/wallets/hot/hot_$i.json)
    solana airdrop 0.5 $HOT_PUBKEY
done

# 7. Create USDC token accounts
echo "💵 Creating USDC token accounts..."
# USDC mint address op Solana: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
USDC_MINT="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

# Maak token account voor master wallet
spl-token create-account $USDC_MINT --owner $MASTER_PUBKEY

# Maak token accounts voor hot wallets
for i in {1..3}; do
    HOT_PUBKEY=$(solana-keygen pubkey ~/.openclaw/wallets/hot/hot_$i.json)
    spl-token create-account $USDC_MINT --owner $HOT_PUBKEY
done

# 8. Maak treasury config file
echo "📋 Creating treasury configuration..."
cat > ~/.openclaw/treasury/config/treasury_config.json << EOF
{
  "version": "1.0",
  "network": "mainnet-beta",
  "usdc_mint": "$USDC_MINT",
  "wallets": {
    "master": {
      "address": "$MASTER_PUBKEY",
      "path": "~/.openclaw/wallets/master/treasury.json",
      "type": "cold",
      "multi_sig": {
        "required_signatures": 3,
        "signers": []
      }
    },
    "hot_pool": [
      {
        "name": "hot_1",
        "address": "$(solana-keygen pubkey ~/.openclaw/wallets/hot/hot_1.json)",
        "path": "~/.openclaw/wallets/hot/hot_1.json",
        "daily_limit_usdc": 10000,
        "purpose": "dex_arbitrage"
      },
      {
        "name": "hot_2",
        "address": "$(solana-keygen pubkey ~/.openclaw/wallets/hot/hot_2.json)",
        "path": "~/.openclaw/wallets/hot/hot_2.json",
        "daily_limit_usdc": 5000,
        "purpose": "futures_trading"
      },
      {
        "name": "hot_3",
        "address": "$(solana-keygen pubkey ~/.openclaw/wallets/hot/hot_3.json)",
        "path": "~/.openclaw/wallets/hot/hot_3.json",
        "daily_limit_usdc": 3000,
        "purpose": "spot_trading"
      }
    ],
    "bot_wallets": [
      {
        "name": "bot_1",
        "address": "${BOT_WALLETS[0]}",
        "path": "~/.openclaw/wallets/bots/bot_1.json",
        "max_position_usdc": 1000,
        "strategy": "dex_arbitrage"
      },
      {
        "name": "bot_2",
        "address": "${BOT_WALLETS[1]}",
        "path": "~/.openclaw/wallets/bots/bot_2.json",
        "max_position_usdc": 500,
        "strategy": "mexc_futures"
      },
      {
        "name": "bot_3",
        "address": "${BOT_WALLETS[2]}",
        "path": "~/.openclaw/wallets/bots/bot_3.json",
        "max_position_usdc": 300,
        "strategy": "spot_trading"
      },
      {
        "name": "bot_4",
        "address": "${BOT_WALLETS[3]}",
        "path": "~/.openclaw/wallets/bots/bot_4.json",
        "max_position_usdc": 200,
        "strategy": "market_making"
      },
      {
        "name": "bot_5",
        "address": "${BOT_WALLETS[4]}",
        "path": "~/.openclaw/wallets/bots/bot_5.json",
        "max_position_usdc": 100,
        "strategy": "scalp_trading"
      }
    ]
  },
  "risk_limits": {
    "total_exposure_limit_usdc": 20000,
    "max_loss_per_day_usdc": 1000,
    "max_loss_per_trade_usdc": 100,
    "profit_sweep_threshold_usdc": 500,
    "rebalance_frequency_hours": 24
  },
  "automation": {
    "profit_sweep_enabled": true,
    "auto_funding_enabled": true,
    "risk_monitoring_enabled": true,
    "alert_threshold_percent": 10
  }
}
EOF

echo "✅ Treasury setup complete!"
echo ""
echo "📊 Summary:"
echo "• Master Treasury: $MASTER_PUBKEY"
echo "• Hot Wallets: 3 (DEX, Futures, Spot)"
echo "• Bot Wallets: 5 (various strategies)"
echo "• Total USDC Capacity: $20,000"
echo "• Config: ~/.openclaw/treasury/config/treasury_config.json"
echo ""
echo "🚨 Next steps:"
echo "1. Fund master wallet with USDC"
echo "2. Run treasury management agent"
echo "3. Integrate with OpenClaw bots"
echo "4. Set up monitoring dashboard"