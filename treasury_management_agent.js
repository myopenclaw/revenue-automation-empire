// treasury_management_agent.js
// USDC Treasury Management Agent voor OpenClaw Trading Bots
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { Token, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');

class USDCTreasuryAgent {
  constructor() {
    this.config = this.loadConfig();
    this.connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    this.usdcMint = new PublicKey(this.config.usdc_mint);
    
    // Load wallets
    this.wallets = this.loadWallets();
    
    // Risk limits
    this.riskLimits = this.config.risk_limits;
    
    console.log('🏦 USDC Treasury Agent Initialized');
    console.log(`Network: ${this.config.network}`);
    console.log(`Total Exposure Limit: $${this.riskLimits.total_exposure_limit_usdc}`);
  }

  loadConfig() {
    const configPath = path.join(process.env.HOME, '.openclaw/treasury/config/treasury_config.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  loadWallets() {
    const wallets = {
      master: this.loadWallet(this.config.wallets.master.path),
      hot: this.config.wallets.hot_pool.map(hot => ({
        ...hot,
        keypair: this.loadWallet(hot.path)
      })),
      bots: this.config.wallets.bot_wallets.map(bot => ({
        ...bot,
        keypair: this.loadWallet(bot.path)
      }))
    };
    return wallets;
  }

  loadWallet(walletPath) {
    const resolvedPath = walletPath.replace('~', process.env.HOME);
    const keypairFile = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    return Keypair.fromSecretKey(Uint8Array.from(keypairFile));
  }

  async getUSDCBalance(walletPublicKey) {
    try {
      const tokenAccounts = await this.connection.getTokenAccountsByOwner(
        walletPublicKey,
        { mint: this.usdcMint }
      );
      
      if (tokenAccounts.value.length === 0) return 0;
      
      const balance = await this.connection.getTokenAccountBalance(
        tokenAccounts.value[0].pubkey
      );
      
      return balance.value.uiAmount;
    } catch (error) {
      console.error(`Error getting balance for ${walletPublicKey}:`, error);
      return 0;
    }
  }

  async getAllBalances() {
    const balances = {
      master: await this.getUSDCBalance(this.wallets.master.publicKey),
      hot: {},
      bots: {},
      total: 0
    };

    // Hot wallet balances
    for (const hot of this.wallets.hot) {
      balances.hot[hot.name] = await this.getUSDCBalance(hot.keypair.publicKey);
      balances.total += balances.hot[hot.name];
    }

    // Bot wallet balances
    for (const bot of this.wallets.bots) {
      balances.bots[bot.name] = await this.getUSDCBalance(bot.keypair.publicKey);
      balances.total += balances.bots[bot.name];
    }

    balances.total += balances.master;
    
    return balances;
  }

  async checkRiskLimits(balances) {
    const violations = [];
    
    // Check total exposure
    const totalExposure = balances.total - balances.master;
    if (totalExposure > this.riskLimits.total_exposure_limit_usdc) {
      violations.push({
        type: 'total_exposure',
        current: totalExposure,
        limit: this.riskLimits.total_exposure_limit_usdc,
        excess: totalExposure - this.riskLimits.total_exposure_limit_usdc
      });
    }

    // Check individual bot limits
    for (const bot of this.wallets.bots) {
      const balance = balances.bots[bot.name];
      if (balance > bot.max_position_usdc) {
        violations.push({
          type: 'bot_position',
          bot: bot.name,
          current: balance,
          limit: bot.max_position_usdc,
          excess: balance - bot.max_position_usdc
        });
      }
    }

    // Check hot wallet daily limits (would need transaction history)
    // Simplified check for now
    
    return violations;
  }

  async sweepProfits() {
    console.log('💰 Sweeping profits from hot wallets to master...');
    
    const balances = await this.getAllBalances();
    const totalHotBalance = Object.values(balances.hot).reduce((a, b) => a + b, 0);
    
    if (totalHotBalance < this.riskLimits.profit_sweep_threshold_usdc) {
      console.log(`Profit sweep threshold not met: $${totalHotBalance} < $${this.riskLimits.profit_sweep_threshold_usdc}`);
      return { swept: 0, reason: 'threshold_not_met' };
    }

    // In production, this would actually transfer USDC
    // For now, just log the action
    console.log(`Would sweep $${totalHotBalance} from hot wallets to master`);
    
    return {
      swept: totalHotBalance,
      from: Object.keys(balances.hot),
      to: this.wallets.master.publicKey.toString(),
      timestamp: new Date().toISOString()
    };
  }

  async fundBotWallets() {
    console.log('🔧 Funding bot wallets from hot pool...');
    
    const fundingActions = [];
    const balances = await this.getAllBalances();
    
    for (const bot of this.wallets.bots) {
      const currentBalance = balances.bots[bot.name];
      const targetBalance = bot.max_position_usdc * 0.8; // Fund to 80% of max
      
      if (currentBalance < targetBalance) {
        const needed = targetBalance - currentBalance;
        
        // Find hot wallet with sufficient balance
        const sourceHot = this.wallets.hot.find(hot => 
          balances.hot[hot.name] > needed * 1.1
        );
        
        if (sourceHot) {
          fundingActions.push({
            bot: bot.name,
            source: sourceHot.name,
            amount: needed,
            action: 'transfer'
          });
          
          // Update balances for simulation
          balances.hot[sourceHot.name] -= needed;
          balances.bots[bot.name] += needed;
        } else {
          console.warn(`No hot wallet with sufficient funds for bot ${bot.name}`);
        }
      }
    }
    
    return fundingActions;
  }

  async generateReport() {
    const balances = await this.getAllBalances();
    const riskViolations = await this.checkRiskLimits(balances);
    const profitSweep = await this.sweepProfits();
    const fundingActions = await this.fundBotWallets();
    
    const report = {
      timestamp: new Date().toISOString(),
      balances,
      risk: {
        violations: riskViolations,
        total_exposure: balances.total - balances.master,
        limit: this.riskLimits.total_exposure_limit_usdc,
        utilization_percent: ((balances.total - balances.master) / this.riskLimits.total_exposure_limit_usdc * 100).toFixed(1)
      },
      actions: {
        profit_sweep: profitSweep,
        funding: fundingActions
      },
      recommendations: this.generateRecommendations(balances, riskViolations)
    };
    
    return report;
  }

  generateRecommendations(balances, violations) {
    const recommendations = [];
    
    if (violations.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'risk_limit_violation',
        details: violations.map(v => `${v.type}: ${v.excess.toFixed(2)} over limit`)
      });
    }
    
    // Check if master wallet needs funding
    if (balances.master < 1000) {
      recommendations.push({
        priority: 'medium',
        action: 'fund_master_wallet',
        amount: 5000 - balances.master,
        reason: 'Master wallet below minimum operational balance'
      });
    }
    
    // Check hot wallet utilization
    const hotUtilization = Object.values(balances.hot).reduce((a, b) => a + b, 0) / 
      (this.wallets.hot.reduce((a, b) => a + b.daily_limit_usdc, 0));
    
    if (hotUtilization > 0.9) {
      recommendations.push({
        priority: 'medium',
        action: 'increase_hot_wallet_limits',
        current_utilization: `${(hotUtilization * 100).toFixed(1)}%`,
        suggested_increase: '20%'
      });
    }
    
    return recommendations;
  }

  async monitorAndAlert() {
    const report = await this.generateReport();
    
    console.log('📊 Treasury Report:');
    console.log('==================');
    console.log(`Total USDC: $${report.balances.total.toFixed(2)}`);
    console.log(`Master: $${report.balances.master.toFixed(2)}`);
    console.log(`Hot Pool: $${Object.values(report.balances.hot).reduce((a, b) => a + b, 0).toFixed(2)}`);
    console.log(`Bots: $${Object.values(report.balances.bots).reduce((a, b) => a + b, 0).toFixed(2)}`);
    console.log(`Utilization: ${report.risk.utilization_percent}%`);
    
    if (report.risk.violations.length > 0) {
      console.log('🚨 Risk Violations:');
      report.risk.violations.forEach(v => {
        console.log(`  • ${v.type}: $${v.excess.toFixed(2)} over limit`);
      });
    }
    
    if (report.actions.funding.length > 0) {
      console.log('🔧 Funding Actions Needed:');
      report.actions.funding.forEach(f => {
        console.log(`  • ${f.bot}: $${f.amount.toFixed(2)} from ${f.source}`);
      });
    }
    
    // Save report to file
    const reportPath = path.join(process.env.HOME, '.openclaw/treasury/reports', `report_${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    return report;
  }
}

// OpenClaw Bot Integration
class OpenClawBotIntegration {
  constructor(treasuryAgent) {
    this.treasuryAgent = treasuryAgent;
    this.botConfigs = {};
  }

  async registerBot(botId, strategy, walletPublicKey) {
    this.botConfigs[botId] = {
      strategy,
      wallet: walletPublicKey,
      lastCheckin: new Date().toISOString(),
      performance: {
        totalTrades: 0,
        totalProfit: 0,
        currentBalance: 0
      }
    };
    
    console.log(`🤖 Registered bot ${botId} (${strategy})`);
  }

  async botCheckin(botId, tradeData) {
    const bot = this.botConfigs[botId];
    if (!bot) {
      throw new Error(`Bot ${botId} not registered`);
    }
    
    bot.lastCheckin = new Date().toISOString();
    bot.performance.totalTrades += tradeData.trades || 0;
    bot.performance.totalProfit += tradeData.profit || 0;
    bot.performance.currentBalance = tradeData.balance || 0;
    
    // Check if profit threshold reached for sweep
    if (tradeData.profit > 100) { // $100 profit threshold
      console.log(`📈 Bot ${botId} made $${tradeData.profit} profit`);
      
      // In production, this would trigger profit conversion to USDC
      // For now, just log
    }
    
    // Update treasury agent with bot performance
    await this.treasuryAgent.monitorAndAlert();
    
    return { status: 'checked_in', next_funding_check: 'in_24_hours' };
  }

  async requestFunding(botId, amount, reason) {
    const bot = this.botConfigs[botId];
    if (!bot) {
      throw new Error(`Bot ${botId} not registered`);
    }
    
    console.log(`💸 Bot ${botId} requesting $${amount} funding: ${reason}`);
    
    // Check treasury balances
    const balances = await this.treasuryAgent.getAllBalances();
    const availableHotBalance = Object.values(balances.hot).reduce((a, b) => a + b, 0);
    
    if (availableHotBalance < amount) {
      return {
        approved: false,
        reason: 'insufficient_hot_wallet_balance',
        available: availableHotBalance,
        needed: amount
      };
    }
    
    // Check bot's position limit
    const botConfig = this.treasuryAgent.wallets.bots.find(b => b.name === botId);
    if (botConfig && (balances.bots[botId] + amount) > botConfig.max_position_usdc) {
      return {
        approved: false,
        reason: 'would_exceed_position_limit',
        current: balances.bots[botId],
        limit: botConfig.max_position_usdc,
        requested: amount
      };
    }
    
    // Funding approved (in simulation)
    return {
      approved: true,
      amount,
      source: 'hot_wallet_pool',
      estimated_arrival: 'immediate',
      transaction_id: `sim_${Date.now()}`
    };
  }
}

// Usage Example
async function main() {
  console.log('🚀 Starting USDC Treasury Management System...');
  
  // Initialize treasury agent
  const treasuryAgent = new USDCTreasuryAgent();
  
  // Initialize bot integration
  const botIntegration = new OpenClawBotIntegration(treasuryAgent);
  
  // Register example bots
  await botIntegration.registerBot('bot_1', 'dex_arbitrage', treasuryAgent.wallets.bots[0].keypair.publicKey.toString());
  await botIntegration.registerBot('bot_2', 'mexc_futures', treasuryAgent.wallets.bots[1].keypair.publicKey.toString());
  
  // Run monitoring
  const report = await treasuryAgent.monitorAndAlert();
  
  // Example bot checkin
  await botIntegration.botCheckin('bot_1', {
    trades: 5,
    profit: 150.25,
    balance: 850.75
  });
  
  // Example funding request
  const fundingRequest = await botIntegration.requestFunding('bot_2', 300, 'position sizing for opportunity');
  console.log('Funding request result:', fundingRequest);
  
  return report;
}

// Export for OpenClaw integration
module.exports = {
  USDCTreasuryAgent,
  OpenClawBotIntegration,
  main
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}