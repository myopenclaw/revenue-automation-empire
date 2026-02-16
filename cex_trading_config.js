// 🎯 CEX Trading Configuration for $100 Capital
// MEXC Spot Trading Agent Configuration

module.exports = {
  // CAPITAL SETTINGS
  capital: {
    total: 170, // USD - Total portfolio value
    current: 58.36, // Current USDT balance (updated)
    target: 100, // Trading allocation target
    deposit_needed: 41.64 // Need to reach $100 allocation in USDT
  },
  
  // TRADING PARAMETERS
  trading: {
    // Position sizing (5% of $100 allocation = $5 per trade)
    position_size_percent: 5,
    position_size_usd: 5,
    
    // Daily targets
    daily_target_percent: 3,
    daily_target_usd: 3,
    
    // Risk management
    max_daily_loss_percent: 5,
    max_daily_loss_usd: 5,
    max_trades_per_day: 3,
    risk_reward_ratio: 2, // 1:2 risk/reward
    
    // Win rate targets
    target_win_rate_min: 60,
    target_win_rate_max: 70
  },
  
  // COIN FILTER
  top_coins: ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'AVAX', 'LINK'],
  
  // REGIME RULES
  regime: {
    // No trades if BTC 1H candle >4%
    btc_1h_max_change: 4,
    
    // No trades during macro events
    avoid_macro_events: true,
    
    // No trades during extreme volatility
    avoid_extreme_volatility: true,
    
    // Market hours preference (UTC)
    preferred_trading_hours: {
      start: 8, // 8 AM UTC
      end: 20   // 8 PM UTC
    }
  },
  
  // PERFORMANCE TRACKING
  performance: {
    // Daily tracking
    track_daily_pnl: true,
    track_win_rate: true,
    track_compounding: true,
    
    // Goals
    daily_goal: 3, // $3 per day
    weekly_goal: 21, // $21 per week (7 days)
    monthly_goal: 90, // $90 per month (30 days)
    
    // Ultimate goal: $50/day
    ultimate_daily_goal: 50,
    capital_needed_for_50_per_day: 1667 // $50 is 3% of $1667
  },
  
  // SAFETY RULES
  safety: {
    // Never trade without regime check
    enforce_regime_check: true,
    
    // Never exceed position size
    enforce_position_size: true,
    
    // Stop trading if daily loss reached
    enforce_daily_loss_limit: true,
    
    // Verify all orders
    verify_all_orders: true,
    
    // Minimum balance check
    min_balance_for_trading: 10 // USD
  },
  
  // COORDINATION
  coordination: {
    // Report to main session
    report_progress: true,
    
    // Ask for confirmation before large trades
    confirmation_threshold: 20, // USD - ask for confirmation above this amount
    
    // Coordinate with DEX agent
    coordinate_with_dex: true,
    dex_agent_channel: 'Team 2'
  }
};