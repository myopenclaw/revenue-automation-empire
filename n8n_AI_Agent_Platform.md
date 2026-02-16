# n8n AI Agent Platform - Workflow Automation + Ollama Agents
## Voor Clarence - Volledige integratie voor e-commerce & trading automatisering

---

## 🎯 Waarom n8n + Ollama?

### Voordelen Combinatie:
```
✅ n8n: Visuele workflow automation
✅ Ollama: Lokale AI zonder kosten
✅ Combinatie: Enterprise automation met AI intelligence
✅ Self-hosted: Geen vendor lock-in
✅ Extensible: Eigen nodes/custom code
```

### Use Cases Voor Jou:
1. **Silver E-commerce Automation**
   - Dynamic pricing workflows
   - Inventory management
   - Customer onboarding
   - Order fulfillment

2. **DEX Trading Automation**
   - Token monitoring workflows
   - Risk assessment pipelines
   - Trade execution automation
   - Portfolio rebalancing

3. **Content & Marketing Automation**
   - Product description generation
   - Email campaign automation
   - Social media scheduling
   - SEO optimization

---

## 🏗️ Architectuur Overzicht

```
┌─────────────────────────────────────────────────────────┐
│                 n8n Workflow Engine                      │
│  • Visual workflow designer                             │
│  • 300+ built-in nodes                                  │
│  • Webhook triggers                                     │
│  • Cron schedules                                       │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP / WebSocket
┌─────────────────▼───────────────────────────────────────┐
│              AI Agent Orchestrator                       │
│  • Route requests to appropriate Ollama models          │
│  • Manage model loading/unloading                       │
│  • Cache frequent responses                             │
│  • Handle rate limiting                                 │
└─────────────────┬───────────────────────────────────────┘
                  │ Local API calls
┌─────────────────▼───────────────────────────────────────┐
│                 Ollama Models                            │
│  • llama3.2:latest - Pricing/General                    │
│  • deepseek-coder:6.7b - Trading/Code                   │
│  • qwen2.5:7b - Content/Marketing                       │
│  • phi3:mini - Routing/Light tasks                      │
└─────────────────┬───────────────────────────────────────┘
                  │ External APIs
┌─────────────────▼───────────────────────────────────────┐
│              External Services                           │
│  • Solana RPC (Helius)                                  │
│  • E-commerce platforms                                 │
│  • Email/SMS services                                   │
│  • Database (PostgreSQL)                                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 n8n Custom Nodes voor AI Agents

### Node 1: Ollama Agent Node
```typescript
// nodes/OllamaAgent.node.ts
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

export class OllamaAgent implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Ollama Agent',
    name: 'ollamaAgent',
    icon: 'fa:robot',
    group: ['transform'],
    version: 1,
    description: 'Execute AI agents using Ollama models',
    defaults: {
      name: 'Ollama Agent',
      color: '#772244',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'ollamaApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Agent Type',
        name: 'agentType',
        type: 'options',
        options: [
          { name: 'Pricing Engine', value: 'pricing' },
          { name: 'Token Scanner', value: 'tokenScanner' },
          { name: 'Product Description', value: 'productDescription' },
          { name: 'Trading Signal', value: 'tradingSignal' },
          { name: 'Customer Support', value: 'customerSupport' },
          { name: 'Content Generator', value: 'contentGenerator' },
        ],
        default: 'pricing',
        required: true,
        description: 'Type of AI agent to execute',
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        options: [
          { name: 'llama3.2:latest', value: 'llama3.2:latest' },
          { name: 'deepseek-coder:6.7b', value: 'deepseek-coder:6.7b' },
          { name: 'qwen2.5:7b', value: 'qwen2.5:7b' },
          { name: 'phi3:mini', value: 'phi3:mini' },
          { name: 'mistral:7b', value: 'mistral:7b' },
        ],
        default: 'llama3.2:latest',
        required: true,
        description: 'Ollama model to use',
      },
      {
        displayName: 'Input Data',
        name: 'inputData',
        type: 'json',
        default: '{}',
        required: true,
        description: 'JSON input data for the agent',
      },
      {
        displayName: 'Temperature',
        name: 'temperature',
        type: 'number',
        default: 0.3,
        typeOptions: {
          minValue: 0,
          maxValue: 1,
          numberPrecision: 1,
        },
        description: 'Creativity level (0=strict, 1=creative)',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const agentType = this.getNodeParameter('agentType', i) as string;
        const model = this.getNodeParameter('model', i) as string;
        const inputData = this.getNodeParameter('inputData', i) as string;
        const temperature = this.getNodeParameter('temperature', i) as number;

        const credentials = await this.getCredentials('ollamaApi');
        const ollamaUrl = credentials.url as string || 'http://localhost:11434';

        // Get appropriate prompt based on agent type
        const prompt = this.getAgentPrompt(agentType, JSON.parse(inputData));
        
        // Call Ollama API
        const response = await this.helpers.httpRequest({
          method: 'POST',
          url: `${ollamaUrl}/api/generate`,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            model,
            prompt,
            stream: false,
            options: {
              temperature,
              top_p: 0.9,
            },
          },
          json: true,
        });

        // Parse response
        let result;
        try {
          result = JSON.parse(response.response);
        } catch {
          result = { text: response.response };
        }

        returnData.push({
          json: {
            agentType,
            model,
            input: JSON.parse(inputData),
            output: result,
            timestamp: new Date().toISOString(),
          },
          pairedItem: {
            item: i,
          },
        });

      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error.message,
              agentType: this.getNodeParameter('agentType', i),
              timestamp: new Date().toISOString(),
            },
            pairedItem: {
              item: i,
            },
          });
        } else {
          throw new NodeOperationError(this.getNode(), error.message, {
            itemIndex: i,
          });
        }
      }
    }

    return [returnData];
  }

  private getAgentPrompt(agentType: string, inputData: any): string {
    const prompts = {
      pricing: `
      Calculate optimal price for product:
      - Product: ${inputData.name}
      - Cost: €${inputData.cost}
      - Competitors: ${JSON.stringify(inputData.competitors || [])}
      - Target margin: ${inputData.targetMargin || 40}%
      
      Return JSON: { price: number, margin: number, reasoning: string }
      `,

      tokenScanner: `
      Analyze crypto token for trading risk:
      - Contract: ${inputData.contractAddress}
      - Liquidity: $${inputData.liquidity}
      - Holders: ${inputData.holderCount}
      - Age: ${inputData.ageDays} days
      
      Risk assessment (return JSON):
      {
        riskScore: 0-100,
        riskLevel: "LOW|MEDIUM|HIGH|EXTREME",
        flags: string[],
        recommendation: "BUY|AVOID|MONITOR"
      }
      `,

      productDescription: `
      Generate product description for:
      - Product: ${inputData.name}
      - Features: ${inputData.features?.join(', ') || ''}
      - Target: ${inputData.targetAudience || 'general'}
      
      Requirements:
      - SEO optimized
      - 150-200 words
      - Emotional appeal
      
      Return JSON: { title: string, description: string, bulletPoints: string[] }
      `,

      tradingSignal: `
      Generate trading signal:
      - Token: ${inputData.token}
      - Price: $${inputData.price}
      - Volume 24h: $${inputData.volume24h}
      - RSI: ${inputData.rsi}
      
      Return JSON: {
        signal: "BUY|SELL|HOLD",
        confidence: 0-100,
        entryPrice: number|null,
        stopLoss: number|null
      }
      `,
    };

    return prompts[agentType] || `Process: ${JSON.stringify(inputData)}`;
  }
}
```

### Node 2: AI Decision Router Node
```typescript
// nodes/AIDecisionRouter.node.ts
export class AIDecisionRouter implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'AI Decision Router',
    name: 'aiDecisionRouter',
    icon: 'fa:code-branch',
    group: ['transform'],
    version: 1,
    description: 'Route workflow based on AI analysis',
    defaults: {
      name: 'AI Decision Router',
      color: '#3366FF',
    },
    inputs: ['main'],
    outputs: ['route_1', 'route_2', 'route_3', 'route_4'],
    credentials: [
      {
        name: 'ollamaApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Routing Prompt',
        name: 'routingPrompt',
        type: 'string',
        default: 'Based on the input data, which route should be taken?',
        required: true,
        description: 'Prompt for AI to decide routing',
      },
      {
        displayName: 'Route Options',
        name: 'routeOptions',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        default: {
          values: [
            { routeName: 'High Priority', routeDescription: 'For urgent matters' },
            { routeName: 'Normal Processing', routeDescription: 'Standard workflow' },
            { routeName: 'Review Needed', routeDescription: 'Requires human review' },
            { routeName: 'Discard', routeDescription: 'Ignore/archive' },
          ],
        },
        description: 'Define possible routes',
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        options: [
          { name: 'phi3:mini', value: 'phi3:mini' },
          { name: 'llama3.2:latest', value: 'llama3.2:latest' },
        ],
        default: 'phi3:mini',
        description: 'Model for routing decisions',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const routeOptions = this.getNodeParameter('routeOptions.values', 0) as any[];
    
    // Initialize output arrays
    const outputs: INodeExecutionData[][] = [];
    for (let i = 0; i < routeOptions.length; i++) {
      outputs.push([]);
    }

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const item = items[itemIndex];
      
      try {
        const routingPrompt = this.getNodeParameter('routingPrompt', itemIndex) as string;
        const model = this.getNodeParameter('model', itemIndex) as string;
        
        const credentials = await this.getCredentials('ollamaApi');
        const ollamaUrl = credentials.url as string || 'http://localhost:11434';

        // Prepare prompt with route options
        const routeList = routeOptions.map((opt, idx) => 
          `${idx + 1}. ${opt.routeName}: ${opt.routeDescription}`
        ).join('\n');

        const fullPrompt = `${routingPrompt}\n\nInput: ${JSON.stringify(item.json)}\n\nRoute Options:\n${routeList}\n\nReturn only the route number (1-${routeOptions.length}):`;

        // Get AI decision
        const response = await this.helpers.httpRequest({
          method: 'POST',
          url: `${ollamaUrl}/api/generate`,
          headers: { 'Content-Type': 'application/json' },
          body: {
            model,
            prompt: fullPrompt,
            stream: false,
            options: { temperature: 0.1 },
          },
          json: true,
        });

        // Parse route number from response
        const routeMatch = response.response.match(/\d+/);
        const routeNumber = routeMatch ? parseInt(routeMatch[0]) - 1 : 0;
        
        // Ensure valid route number
        const validRoute = Math.max(0, Math.min(routeOptions.length - 1, routeNumber));
        
        // Add item to appropriate output
        outputs[validRoute].push({
          json: {
            ...item.json,
            aiDecision: {
              chosenRoute: routeOptions[validRoute].routeName,
              confidence: response.response,
              timestamp: new Date().toISOString(),
            },
          },
          pairedItem: {
            item: itemIndex,
          },
        });

      } catch (error) {
        // On error, route to first output
        outputs[0].push({
          json: {
            ...item.json,
            error: error.message,
            aiDecision: {
              chosenRoute: 'Error Fallback',
              timestamp: new Date().toISOString(),
            },
          },
          pairedItem: {
            item: itemIndex,
          },
        });
      }
    }

    return outputs;
  }
}
```

### Node 3: Batch AI Processor Node
```typescript
// nodes/BatchAIProcessor.node.ts
export class BatchAIProcessor implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Batch AI Processor',
    name: 'batchAIProcessor',
    icon: 'fa:layer-group',
    group: ['transform'],
    version: 1,
    description: 'Process multiple items with AI in batches',
    defaults: {
      name: 'Batch AI Processor',
      color: '#FF6633',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'ollamaApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Batch Size',
        name: 'batchSize',
        type: 'number',
        default: 10,
        description: 'Number of items to process in each batch',
      },
      {
        displayName: 'Agent Type',
        name: 'agentType',
        type: 'options',
        options: [
          { name: 'Price Update', value: 'priceUpdate' },
          { name: 'Token Scan', value: 'tokenScan' },
          { name: 'Description Generate', value: 'descriptionGenerate' },
        ],
        default: 'priceUpdate',
      },
      {
        displayName: 'Parallel Processing',
        name: 'parallel',
        type: 'boolean',
        default: true,
        description: 'Whether to process batches in parallel',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const batchSize = this.getNodeParameter('batchSize', 0) as number;
    const agentType = this.getNodeParameter('agentType', 0) as string;
    const parallel = this.getNodeParameter('parallel', 0) as boolean;
    
    const returnData: INodeExecutionData[] = [];
    
    // Split items into batches
    const batches: INodeExecutionData[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    // Process batches
    if (parallel) {
      // Parallel processing
      const batchPromises = batches.map((batch, batchIndex) => 
        this.processBatch(batch, batchIndex, agentType)
      );
      
      const batchResults = await Promise.all(batchPromises);
      returnData.push(...batchResults.flat());
    } else {
      // Sequential processing
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batchResult = await this.processBatch(
          batches[batchIndex], 
          batchIndex, 
          agentType
        );
        returnData.push(...batchResult);
      }
    }

    return [returnData];
  }

  private async processBatch(
    batch: INodeExecutionData[], 
    batchIndex: number,
    agentType: string
  ): Promise<INodeExecutionData[]> {
    const results: INodeExecutionData[] = [];
    
    // Prepare batch prompt
    const batchData = batch.map(item => item.json);
    const batchPrompt = this.getBatchPrompt(agentType, batchData);
    
    try {
      const credentials = await this.getCredentials('ollamaApi');
      const ollamaUrl = credentials.url as string || 'http://localhost:11434';
      
      // Process entire batch with AI
      const response = await this.helpers.httpRequest({
        method: 'POST',
        url: `${ollamaUrl}/api/generate`,
        headers: { 'Content-Type': 'application/json' },
        body: {
          model: 'llama3.2:latest',
          prompt: batchPrompt,
          stream: false,
          options: { temperature: 0.2 },
        },
        json: true,
      });

      // Parse batch results
      const batchResults = JSON.parse(response.response);
      
      // Map results back to items
      batch.forEach((item, itemIndex) => {
        results.push({
          json: {
            ...item.json,
            batchIndex,
            itemIndex,
            aiResult: batchResults[itemIndex] || {},
            timestamp: new Date().toISOString(),
          },
          pairedItem: item.pairedItem,
        });
      });

    } catch (error) {
      // Handle batch error - return items with error info
      batch.forEach((item, itemIndex) => {
        results.push({
          json: {
            ...item.json,
            batchIndex,
            itemIndex,
            error: error.message,
            timestamp: new Date().toISOString(),
          },
          pairedItem: item.pairedItem,
        });
      });
    }

    return results;
  }

  private getBatchPrompt(agentType: string, batchData: any[]): string {
    const prompts = {
      priceUpdate: `
      Process batch of ${batchData.length} products for price updates:
      ${batchData.map((item, idx) => 
        `Product ${idx + 1}: ${item.name}, Cost: €${item.cost}, Current Price: €${item.price}`
      ).join('\n')}
      
      Calculate new prices with 40% target margin.
      Return JSON array with same order: [{ newPrice: number, margin: number }]
      `,

      tokenScan: `
      Analyze batch of ${batchData.length} crypto tokens:
      ${batchData.map((item, idx) => 
        `Token ${idx + 1}: ${item.symbol}, Liquidity: $${item.liquidity}, Age: ${item.ageDays}d`
      ).join('\n')}
      
      Return risk scores (0-100) as JSON array: [{ riskScore: number, flags: string[] }]
      `,
    };

    return prompts[agentType] || `Process batch: ${JSON.stringify(batchData)}`;
  }
}
```

---

## 🚀 n8n Workflow Voorbeelden

### Workflow 1: Dynamic Silver Pricing Automation
```
Trigger: Cron (elke 6 uur) of Webhook (bij kostprijs wijziging)
↓
Node: HTTP Request - Haal silver spot price op
↓
Node: Ollama Agent - Bereken optimale verkoopprijs
   • Model: llama3.2:latest
   • Agent: pricing
   • Input: { cost: spotPrice, competitors: [...], targetMargin: 45 }
↓
Node: If Condition - Check of prijs > 5% gewijzigd
   • Ja: Update product in WooCommerce/Shopify
   • Nee: Log alleen
↓
Node: Email/Slack - Notificatie bij prijswijziging
↓
Node: PostgreSQL - Log prijshistoriek
```

### Workflow 2: DEX Token Monitoring & Alerting
```
Trigger: Webhook (nieuwe liquidity pool) of Cron (elke 30 min)
↓
Node: HTTP Request - Haal token data van Solana RPC
↓
Node: Ollama Agent - Token risk analysis
   • Model: deepseek-coder:6.7b
   • Agent: tokenScanner
   • Input: { contractAddress, liquidity, holderCount, ... }
↓
Node: AI Decision Router - Route based on risk
   • Route 1: HIGH risk → Telegram alert
   • Route 2: MEDIUM risk → Watchlist toevoegen
   • Route 3: LOW risk → Log alleen
↓
Node: If Condition - Trading opportunity?
   • RSI < 30 & risk LOW → Trading signal genereren
↓
Node: Ollama Agent - Generate trading signal
   • Model: qwen2.5-coder:7b
   • Agent: tradingSignal
↓
Node: Webhook - Stuur naar trading bot (optioneel)
```

### Workflow 3: Product Onboarding Automation
```
Trigger: Webhook (nieuw product in CMS)
↓
Node: Ollama Agent - Generate product description
   • Model: qwen2.5:7b
   • Agent: productDescription
   • Input: { name, features, category, keywords }
↓
Node: Ollama Agent - Generate SEO metadata
   • Model: llama3.2:latest
   • Prompt: "Generate meta title and description for: ..."
↓
Node: Batch AI Processor - Generate variant descriptions
   • Batch size: 5
   • Agent: descriptionGenerate
↓
Node: HTTP Request - Upload naar e-commerce platform
↓
Node: Ollama Agent - Generate social media posts
   • Model: mistral:7b
   • Prompt: "Create Twitter/Facebook posts for new product"
↓
Node: Schedule Trigger - Plan social media posts
```

---

## 🏗️ n8n Installation & Configuration

### Docker Compose Setup
```yaml
# docker-compose.yml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - N8N_EDITOR_BASE_URL=http://localhost:5678/
      - NODE_ENV=production
      - WEBHOOK_URL=http://localhost:5678/
      - GENERIC_TIMEZONE=Europe/Amsterdam
      - N8N_USER_FOLDER=/home/node/.n8n
      - N8N_CUSTOM_EXTENSIONS=/home/node/.n8n/custom
    volumes:
      - n8n_data:/home/node/.n8n
      - ./custom-nodes:/home/node/.n8n/custom
    networks:
      - n8n_network

  ollama:
    image: ollama/ollama
    container_name: ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    networks:
      - n8n_network

  postgres:
    image: postgres:15
    container_name: n8n_postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=n8n
      - POSTGRES_NON_ROOT_USER=n8n
      - POSTGRES_NON_ROOT_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - n8n_network

  redis:
    image: redis:7-alpine
    container_name: n8n_redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - n8n_network

volumes:
  n8n_data:
  ollama_data:
  postgres_data:
  redis_data:

networks:
  n8n_network:
    driver: bridge
```

### Custom Nodes Installation
```bash
#!/bin/bash
# install-custom-nodes.sh

echo "Installing n8n custom AI nodes..."

# Create custom nodes directory
mkdir -p ~/.n8n/custom/nodes
cd ~/.n8n/custom/nodes

# Clone or create node templates
cat > OllamaAgent.node.ts << 'EOF'
// [Paste the OllamaAgent node code here]
EOF

cat > AIDecisionRouter.node.ts << 'EOF'
// [Paste the AIDecisionRouter node code here]
EOF

cat > BatchAIProcessor.node.ts << 'EOF'
// [Paste the BatchAIProcessor node code here]
EOF

# Install dependencies
cd ~/.n8n
npm install @n8n_io/typescript-node @types/node axios

# Build nodes
npx tsc ~/.n8n/custom/nodes/*.ts --outDir ~/.n8n/custom/nodes --module commonjs --target es2020

echo "Custom nodes installed! Restart n8n to load them."
```

---

## 🔌 Integration met Externe Services

### Solana RPC Integration Node
```typescript
// nodes/SolanaRPC.node.ts
export class SolanaRPC implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Solana RPC',
    name: 'solanaRPC',
    icon: 'fa:link',
    group: ['input'],
    version: 1,
    description: 'Interact with Solana blockchain via RPC',
    defaults: {
      name: 'Solana RPC',
      color: '#9945FF',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'solanaRpcApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        options: [
          { name: 'Get Token Info', value: 'getTokenInfo' },
          { name: 'Get Wallet Balance', value: 'getWalletBalance' },
          { name: 'Get Transaction', value: 'getTransaction' },
          { name: 'Get Program Accounts', value: 'getProgramAccounts' },
        ],
        default: 'getTokenInfo',
      },
      {
        displayName: 'Token Address',
        name: 'tokenAddress',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['getTokenInfo'],
          },
        },
      },
      {
        displayName: 'Wallet Address',
        name: 'walletAddress',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['getWalletBalance'],
          },
        },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const operation = this.getNodeParameter('operation', i) as string;
        const credentials = await this.getCredentials('solanaRpcApi');
        const rpcUrl = credentials.url as string || 'https://api.mainnet-beta.solana.com';

        let result: any;

        switch (operation) {
          case 'getTokenInfo':
            const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
            result = await this.getTokenInfo(rpcUrl, tokenAddress);
            break;

          case 'getWalletBalance':
            const walletAddress = this.getNodeParameter('walletAddress', i) as string;
            result = await this.getWalletBalance(rpcUrl, walletAddress);
            break;

          default:
            throw new Error(`Operation ${operation} not implemented`);
        }

        returnData.push({
          json: {
            operation,
            result,
            timestamp: new Date().toISOString(),
          },
          pairedItem: {
            item: i,
          },
        });

      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error.message,
              operation: this.getNodeParameter('operation', i),
              timestamp: new Date().toISOString(),
            },
            pairedItem: {
              item: i,
            },
          });
        } else {
          throw error;
        }
      }
    }

    return [returnData];
  }

  private async getTokenInfo(rpcUrl: string, tokenAddress: string): Promise<any> {
    const response = await this.helpers.httpRequest({
      method: 'POST',
      url: rpcUrl,
      headers: { 'Content-Type': 'application/json' },
      body: {
        jsonrpc: '2.0',
        id: 1,
        method: 'getAccountInfo',
        params: [
          tokenAddress,
          { encoding: 'jsonParsed' }
        ],
      },
      json: true,
    });

    return response.result;
  }

  private async getWalletBalance(rpcUrl: string, walletAddress: string): Promise<any> {
    const response = await this.helpers.httpRequest({
      method: 'POST',
      url: rpcUrl,
      headers: { 'Content-Type': 'application/json' },
      body: {
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [walletAddress],
      },
      json: true,
    });

    return response.result;
  }
}
```

### E-commerce Platform Nodes
```typescript
// nodes/ShopifyAI.node.ts
export class ShopifyAI implements INodeType {
  // Node for AI-powered Shopify automation
  // Features:
  // - AI product description generation
  // - Dynamic pricing updates
  // - Inventory prediction
  // - Customer segmentation
}

// nodes/WooCommerceAI.node.ts  
export class WooCommerceAI implements INodeType {
  // Node for WooCommerce + AI integration
  // Features:
  // - Bulk product updates with AI
  // - Smart categorization
  // - Cross-sell recommendations
  // - Review analysis
}
```

---

## 📊 Monitoring & Analytics

### Workflow Analytics Dashboard
```typescript
// nodes/WorkflowAnalytics.node.ts
export class WorkflowAnalytics implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Workflow Analytics',
    name: 'workflowAnalytics',
    icon: 'fa:chart-bar',
    group: ['output'],
    version: 1,
    description: 'Collect analytics from workflow execution',
    defaults: {
      name: 'Workflow Analytics',
      color: '#666666',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Metrics to Track',
        name: 'metrics',
        type: 'multiOptions',
        options: [
          { name: 'Execution Time', value: 'executionTime' },
          { name: 'Success Rate', value: 'successRate' },
          { name: 'AI Model Usage', value: 'modelUsage' },
          { name: 'Error Types', value: 'errorTypes' },
          { name: 'Cost Savings', value: 'costSavings' },
        ],
        default: ['executionTime', 'successRate'],
      },
      {
        displayName: 'Storage Backend',
        name: 'storage',
        type: 'options',
        options: [
          { name: 'PostgreSQL', value: 'postgres' },
          { name: 'InfluxDB', value: 'influxdb' },
          { name: 'Elasticsearch', value: 'elasticsearch' },
          { name: 'CSV File', value: 'csv' },
        ],
        default: 'postgres',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const metrics = this.getNodeParameter('metrics', i) as string[];
      const storage = this.getNodeParameter('storage', i) as string;

      // Collect metrics
      const analytics = {
        workflowId: this.getWorkflow().id,
        executionId: this.getExecutionId(),
        timestamp: new Date().toISOString(),
        node: this.getNode().name,
        metrics: {},
      };

      // Calculate metrics
      if (metrics.includes('executionTime')) {
        analytics.metrics['executionTime'] = Date.now() - item.json.startTime;
      }

      if (metrics.includes('successRate')) {
        analytics.metrics['success'] = !item.json.error;
      }

      if (item.json.aiResult) {
        if (metrics.includes('modelUsage')) {
          analytics.metrics['model'] = item.json.aiResult.model;
          analytics.metrics['tokenCount'] = item.json.aiResult.tokenCount;
        }

        if (metrics.includes('costSavings')) {
          // Calculate savings vs OpenAI API
          const openAICost = this.calculateOpenAICost(item.json.aiResult);
          analytics.metrics['costSavings'] = openAICost;
        }
      }

      // Store analytics
      await this.storeAnalytics(analytics, storage);

      returnData.push({
        json: {
          ...item.json,
          analytics,
        },
        pairedItem: item.pairedItem,
      });
    }

    return [returnData];
  }

  private calculateOpenAICost(aiResult: any): number {
    // Estimate cost if using OpenAI API
    const tokens = aiResult.tokenCount || 1000;
    const costPer1K = 0.002; // GPT-3.5 Turbo price
    return (tokens / 1000) * costPer1K;
  }

  private async storeAnalytics(data: any, storage: string): Promise<void> {
    switch (storage) {
      case 'postgres':
        // Store in PostgreSQL
        break;
      case 'csv':
        // Append to CSV file
        break;
      default:
        // Default: log to console
        console.log('Analytics:', data);
    }
  }
}
```

---

## 🚀 Deployment & Scaling

### Production Deployment
```bash
# Production deployment script
#!/bin/bash
# deploy-n8n-ai.sh

echo "🚀 Deploying n8n AI Agent Platform..."

# 1. Create environment file
cat > .env << EOF
N8N_PASSWORD=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
EOF

# 2. Start services
docker-compose up -d

# 3. Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# 4. Install custom nodes
docker exec n8n bash -c "cd /home/node/.n8n && npm install"

# 5. Load initial workflows
echo "Loading initial workflows..."
curl -X POST http://localhost:5678/rest/workflows \
  -H "Content-Type: application/json" \
  -u admin:$(cat .env | grep N8N_PASSWORD | cut -d= -f2) \
  -d @workflows/silver-pricing.json

# 6. Create API credentials for Ollama
curl -X POST http://localhost:5678/rest/credentials \
  -H "Content-Type: application/json" \
  -u admin:$(cat .env | grep N8N_PASSWORD | cut -d= -f2) \
  -d '{
    "name": "Ollama Local",
    "type": "ollamaApi",
    "data": {
      "url": "http://ollama:11434"
    }
  }'

echo "✅ Deployment complete!"
echo "Access n8n at: http://localhost:5678"
echo "Username: admin"
echo "Password: $(cat .env | grep N8N_PASSWORD | cut -d= -f2)"
```

### Scaling Strategy
```
Horizontal Scaling:
• n8n: Multiple instances behind load balancer
• Ollama: GPU-enabled instances for heavy models
• Database: Read replicas for analytics

Vertical Scaling:
• Ollama: NVIDIA GPU for faster inference
• n8n: More CPU/RAM for complex workflows
• Redis: Cluster mode for session management

Cost Optimization:
• Use phi3:mini for routing decisions
• Cache frequent AI responses
• Batch process where possible
• Schedule heavy workflows during off-peak
```

---

## 🎯 Starter Workflows Template

### Workflow Template 1: Silver Price Updater
```json
{
  "name": "Silver Price Automation",
  "nodes": [
    {
      "name": "Cron Trigger",
      "type": "n8n-nodes-base.cron",
      "position": [250, 300],
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "hours",
              "minutesInterval": 6
            }
          ]
        }
      }
    },
    {
      "name": "Get Silver Price",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300],
      "parameters": {
        "url": "https://api.metals.dev/v1/latest",
        "options": {
          "qs": {
            "api_key": "={{$credentials.metalsApiKey}}",
            "currency": "EUR",
            "unit": "g"
          }
        }
      }
    },
    {
      "name": "Calculate Optimal Price",
      "type": "ollamaAgent",
      "position": [650, 300],
      "parameters": {
        "agentType": "pricing",
        "model": "llama3.2:latest",
        "inputData": "={{{\n  \"cost\": $json.silver,\n  \"competitors\": [\n    { \"name\": \"Competitor A\", \"price\": 1.20 },\n    { \"name\": \"Competitor B\", \"price\": 1.25 }\n  ],\n  \"targetMargin\": 45\n}}}",
        "temperature": 0.1
      }
    },
    {
      "name": "Update Shopify",
      "type": "n8n-nodes-base.httpRequest",
      "position": [850, 300],
      "parameters": {
        "url": "https://{{$credentials.shopifyStore}}.myshopify.com/admin/api/2024-01/products/{{$json.productId}}/variants/{{$json.variantId}}.json",
        "method": "PUT",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "X-Shopify-Access-Token",
              "value": "={{$credentials.shopifyAccessToken}}"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "variant",
              "value": "={{\n  \"price\": $json.aiResult.price\n}}}"
            }
          ]
        }
      }
    }
  ],
  "connections": {
    "Cron Trigger": {
      "main": [
        [
          {
            "node": "Get Silver Price",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get Silver Price": {
      "main": [
        [
          {
            "node": "Calculate Optimal Price",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Calculate Optimal Price": {
      "main": [
        [
          {
            "node": "Update Shopify",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### Workflow Template 2: Token Risk Monitor
```json
{
  "name": "DEX Token Risk Monitor",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "webhookId": "new-token-alert",
      "parameters": {
        "path": "new-token",
        "responseMode": "responseNode"
      }
    },
    {
      "name": "Solana RPC",
      "type": "solanaRPC",
      "position": [450, 300],
      "parameters": {
        "operation": "getTokenInfo",
        "tokenAddress": "={{$json.contractAddress}}"
      }
    },
    {
      "name": "Token Risk Analysis",
      "type": "ollamaAgent",
      "position": [650, 300],
      "parameters": {
        "agentType": "tokenScanner",
        "model": "deepseek-coder:6.7b",
        "inputData": "={{{\n  \"contractAddress\": $json.contractAddress,\n  \"liquidity\": $json.result.value.liquidity,\n  \"holderCount\": $json.result.value.holders,\n  \"ageDays\": $json.result.value.ageDays\n}}}",
        "temperature": 0.05
      }
    },
    {
      "name": "AI Decision Router",
      "type": "aiDecisionRouter",
      "position": [850, 300],
      "parameters": {
        "routingPrompt": "Based on token risk analysis, should we alert traders?",
        "routeOptions": {
          "values": [
            {
              "routeName": "High Alert",
              "routeDescription": "Extreme risk - immediate alert"
            },
            {
              "routeName": "Watchlist",
              "routeDescription": "Medium risk - add to watchlist"
            },
            {
              "routeName": "Ignore",
              "routeDescription": "Low risk - no action needed"
            }
          ]
        }
      }
    },
    {
      "name": "Telegram Alert",
      "type": "n8n-nodes-base.telegram",
      "position": [1050, 200],
      "parameters": {
        "resource": "message",
        "operation": "sendMessage",
        "chatId": "={{$credentials.telegramChatId}}",
        "text": "={{`🚨 HIGH RISK TOKEN DETECTED\\n\\nToken: ${$json.contractAddress}\\nRisk: ${$json.aiResult.riskLevel}\\nScore: ${$json.aiResult.riskScore}/100\\n\\nFlags: ${$json.aiResult.flags.join(', ')}`}}"
      }
    }
  ]
}
```

---

## 🔧 Development Workflow

### Local Development Setup
```bash
# 1. Clone n8n for development
git clone https://github.com/n8n-io/n8n.git
cd n8n

# 2. Install dependencies
npm install

# 3. Link custom nodes
mkdir -p ~/.n8n/custom/nodes
ln -s $(pwd)/custom-nodes/* ~/.n8n/custom/nodes/

# 4. Start n8n in development mode
npm run start

# 5. Start Ollama
ollama serve

# 6. Test custom nodes
curl -X POST http://localhost:5678/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Testing Strategy
```typescript
// tests/nodes/OllamaAgent.test.ts
import { OllamaAgent } from '../../nodes/OllamaAgent.node';

describe('OllamaAgent Node', () => {
  it('should process pricing requests', async () => {
    const node = new OllamaAgent();
    const mockExecute = jest.fn();
    
    // Mock Ollama response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          response: '{"price": 119.95, "margin": 42.5, "reasoning": "Competitive pricing"}'
        }),
      })
    ) as jest.Mock;

    // Test execution
    const result = await node.execute(mockExecute as any);
    
    expect(result).toBeDefined();
    expect(result[0][0].json.aiResult.price).toBe(119.95);
  });
});
```

---

## 🎯 Conclusie & Volgende Stappen

### Waarom Deze Combinatie Werkt:
1. **n8n** geeft visuele workflow automation
2. **Ollama** geeft AI intelligence zonder kosten
3. **Custom nodes** maken het specifiek voor jouw use cases
4. **Self-hosted** betekent volledige controle

### Directe Acties (Vandaag):
1. **Installeer n8n** met Docker
   ```bash
   docker run -it --rm \
     --name n8n \
     -p 5678:5678 \
     -v ~/.n8n:/home/node/.n8n \
     n8nio/n8n
   ```

2. **Test Ollama integration**
   ```bash
   curl http://localhost:11434/api/tags
   ```

3. **Creëer eerste workflow** voor silver pricing

### Week 1 Plan:
```
Day 1: n8n + Ollama basic integration
Day 2: Build custom nodes (OllamaAgent, AIDecisionRouter)
Day 3: Create silver pricing workflow
Day 4: Create token monitoring workflow  
Day 5: Testing & optimization
Day 6: Documentation
Day 7: Production deployment
```

### Lange Termijn Visie:
```
Maand 1: Core automation voor silver + trading
Maand 2: Scale naar andere product lines
Maand 3: Enterprise features (multi-tenant, analytics)
Maand 6: White-label platform voor andere merchants
```

---

## ❓ Vragen om te Beantwoorden

1. **Welk e-commerce platform gebruik je nu?** (Shopify, WooCommerce, custom?)
2. **Heb je al trading bots of monitoring tools?**
3. **Wil je eerst focussen op e-commerce OF trading automation?**
4. **Heb je voorkeur voor Docker of native installatie?**

**Ik kan je helpen met de eerste n8n setup en Ollama integration. Waar wil je beginnen?**
