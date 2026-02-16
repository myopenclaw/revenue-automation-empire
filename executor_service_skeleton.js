// ⚡️ Executor Service Skeleton - DEX Signing Service
// Safe key management, separate from n8n

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const axios = require('axios');

class ExecutorService {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
    this.version = '1.0.0';
    
    // Security configuration
    this.apiTokens = new Set(process.env.API_TOKENS?.split(',') || []);
    
    // Solana configuration
    this.solanaConnection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );
    
    // Wallet (in production: use secure key management)
    this.wallet = this.loadWallet();
    
    // Jupiter API
    this.jupiterBaseUrl = 'https://quote-api.jup.ag/v6';
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }
  
  /**
   * Load wallet from environment (in production: use AWS KMS, HashiCorp Vault, etc.)
   */
  loadWallet() {
    // For development: load from env var
    // In production: use secure key management service
    const privateKey = process.env.SOLANA_PRIVATE_KEY;
    
    if (!privateKey) {
      console.warn('⚠️  No SOLANA_PRIVATE_KEY found, using dummy wallet for development');
      return Keypair.generate();
    }
    
    try {
      const keypair = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(privateKey))
      );
      console.log(`✅ Wallet loaded: ${keypair.publicKey.toBase58().substring(0, 16)}...`);
      return keypair;
    } catch (error) {
      console.error('❌ Failed to load wallet:', error.message);
      return Keypair.generate(); // Fallback for development
    }
  }
  
  /**
   * Setup middleware
   */
  setupMiddleware() {
    // Security headers
    this.app.use(helmet());
    
    // CORS (restrict in production)
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5678', // n8n port
      methods: ['GET', 'POST']
    }));
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 100, // 100 requests per minute
      message: { error: 'Too many requests' }
    });
    this.app.use(limiter);
    
    // JSON parsing
    this.app.use(express.json({ limit: '1mb' }));
    
    // Authentication middleware
    this.app.use((req, res, next) => {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
      }
      
      const token = authHeader.substring(7);
      
      if (!this.apiTokens.has(token)) {
        return res.status(403).json({ error: 'Invalid API token' });
      }
      
      next();
    });
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });
  }
  
  /**
   * Setup routes
   */
  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        version: this.version,
        uptime: process.uptime(),
        wallet: this.wallet.publicKey.toBase58().substring(0, 16) + '...',
        solana: this.solanaConnection.rpcEndpoint
      });
    });
    
    // Get quote from Jupiter
    this.app.post('/quote', async (req, res) => {
      try {
        const { symbol, side, quantity, venue, slippageBps = 50 } = req.body;
        
        // Validate input
        if (!symbol || !side || !quantity) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Parse symbol (e.g., "SOL/USDC")
        const [inputMint, outputMint] = this.parseSymbol(symbol, side);
        
        // Get quote from Jupiter
        const quote = await this.getJupiterQuote(
          inputMint,
          outputMint,
          quantity,
          slippageBps
        );
        
        res.json({
          success: true,
          quoteId: `quote_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          inputAmount: quote.inAmount,
          outputAmount: quote.outAmount,
          price: quote.outAmount / quote.inAmount,
          route: quote.routePlan,
          fees: quote.fees,
          validForSeconds: 30,
          expiresAt: new Date(Date.now() + 30000).toISOString()
        });
        
      } catch (error) {
        console.error('Quote error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message,
          details: 'Failed to get quote from Jupiter'
        });
      }
    });
    
    // Execute swap
    this.app.post('/swap', async (req, res) => {
      try {
        const { quoteId, wallet, clientOrderId } = req.body;
        
        if (!quoteId || !wallet || !clientOrderId) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // In production: validate quoteId, get cached quote
        // For now, simulate transaction
        
        const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        console.log(`🔄 Executing swap: ${clientOrderId}`);
        console.log(`   Quote: ${quoteId}`);
        console.log(`   Wallet: ${wallet.substring(0, 16)}...`);
        
        // Simulate transaction (in production: actual Solana transaction)
        const success = Math.random() > 0.1; // 90% success rate simulation
        
        if (success) {
          res.json({
            success: true,
            transactionId,
            clientOrderId,
            status: 'pending',
            estimatedCompletion: new Date(Date.now() + 10000).toISOString(),
            message: 'Transaction submitted to network'
          });
          
          // Simulate confirmation after delay
          setTimeout(() => {
            console.log(`✅ Swap confirmed: ${transactionId} for ${clientOrderId}`);
          }, 5000);
          
        } else {
          res.status(500).json({
            success: false,
            transactionId,
            clientOrderId,
            status: 'failed',
            error: 'Simulated transaction failure'
          });
        }
        
      } catch (error) {
        console.error('Swap error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message 
        });
      }
    });
    
    // Get transaction status
    this.app.get('/status/:transactionId', async (req, res) => {
      const { transactionId } = req.params;
      
      // Simulate status check
      const statuses = ['pending', 'confirmed', 'failed'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      res.json({
        success: true,
        transactionId,
        status,
        confirmedAt: status === 'confirmed' ? new Date().toISOString() : null,
        error: status === 'failed' ? 'Simulated transaction failure' : null
      });
    });
    
    // Get wallet balance
    this.app.get('/balance/:mint', async (req, res) => {
      try {
        const { mint } = req.params;
        
        // In production: fetch actual balance
        const balance = Math.random() * 100; // Simulated balance
        
        res.json({
          success: true,
          mint,
          balance,
          decimals: 9 // Default for SOL
        });
        
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }
  
  /**
   * Parse symbol to Jupiter mint addresses
   */
  parseSymbol(symbol, side) {
    // Simplified mapping (in production: use token registry)
    const tokenMap = {
      'SOL': 'So11111111111111111111111111111111111111112',
      'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
    };
    
    const [base, quote] = symbol.split('/');
    
    if (!tokenMap[base] || !tokenMap[quote]) {
      throw new Error(`Unsupported symbol: ${symbol}`);
    }
    
    return side === 'buy' 
      ? [tokenMap[quote], tokenMap[base]]  // Buy: quote → base
      : [tokenMap[base], tokenMap[quote]]; // Sell: base → quote
  }
  
  /**
   * Get quote from Jupiter API
   */
  async getJupiterQuote(inputMint, outputMint, amount, slippageBps) {
    try {
      const response = await axios.get(`${this.jupiterBaseUrl}/quote`, {
        params: {
          inputMint,
          outputMint,
          amount: Math.floor(amount * 1_000_000_000), // Assuming 9 decimals
          slippageBps,
          onlyDirectRoutes: false
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Jupiter API error:', error.response?.data || error.message);
      throw new Error(`Failed to get quote: ${error.message}`);
    }
  }
  
  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });
    
    // Global error handler
    this.app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
      res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });
  }
  
  /**
   * Start the server
   */
  start() {
    this.server = this.app.listen(this.port, () => {
      console.log(`⚡️ Executor Service v${this.version}`);
      console.log(`   Listening on port ${this.port}`);
      console.log(`   Wallet: ${this.wallet.publicKey.toBase58()}`);
      console.log(`   Solana RPC: ${this.solanaConnection.rpcEndpoint}`);
      console.log(`   Health: http://localhost:${this.port}/health\n`);
    });
  }
  
  /**
   * Stop the server
   */
  stop() {
    if (this.server) {
      this.server.close();
      console.log('Executor Service stopped');
    }
  }
}

// Export for testing
module.exports = ExecutorService;

// If run directly
if (require.main === module) {
  const service = new ExecutorService();
  service.start();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    service.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\nTerminating...');
    service.stop();
    process.exit(0);
  });
}