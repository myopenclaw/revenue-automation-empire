// 🛒 Shopify + n8n Integration Script
// Connects your Shopify stores to n8n automation

const fs = require('fs');
const path = require('path');
const axios = require('axios');

class ShopifyN8NIntegration {
  constructor() {
    this.name = 'Shopify n8n Integration';
    this.version = '1.0.0';
    
    // Configuration paths
    this.configDir = path.join(__dirname, 'shopify_config');
    this.credentialsFile = path.join(this.configDir, 'credentials.json');
    this.workflowsDir = path.join(__dirname, 'n8n_workflows');
    
    // Create directories
    [this.configDir, this.workflowsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    });
    
    console.log(`🛒 ${this.name} v${this.version} initialized`);
    console.log(`   Config directory: ${this.configDir}`);
    console.log(`   Workflows directory: ${this.workflowsDir}\n`);
  }
  
  /**
   * Create Shopify API credentials template
   */
  createCredentialsTemplate(storeData = {}) {
    const template = {
      stores: {
        silverjstore: {
          storeUrl: storeData.silverjstoreUrl || 'silverjstore.myshopify.com',
          apiKey: storeData.silverjstoreApiKey || 'YOUR_API_KEY_HERE',
          apiSecret: storeData.silverjstoreApiSecret || 'YOUR_API_SECRET_HERE',
          accessToken: storeData.silverjstoreAccessToken || 'YOUR_ACCESS_TOKEN_HERE',
          webhookSecret: storeData.silverjstoreWebhookSecret || 'YOUR_WEBHOOK_SECRET'
        },
        sterlingsilver: {
          storeUrl: storeData.sterlingsilverUrl || 'sterlingsilver.myshopify.com',
          apiKey: storeData.sterlingsilverApiKey || 'YOUR_API_KEY_HERE',
          apiSecret: storeData.sterlingsilverApiSecret || 'YOUR_API_SECRET_HERE',
          accessToken: storeData.sterlingsilverAccessToken || 'YOUR_ACCESS_TOKEN_HERE',
          webhookSecret: storeData.sterlingsilverWebhookSecret || 'YOUR_WEBHOOK_SECRET'
        }
      },
      n8n: {
        webhookUrl: 'http://localhost:5678/webhook/shopify',
        apiUrl: 'http://localhost:5678/api/v1'
      },
      features: {
        nftMinting: true,
        automatedFulfillment: true,
        inventorySync: true,
        customerNotifications: true,
        analytics: true
      }
    };
    
    fs.writeFileSync(this.credentialsFile, JSON.stringify(template, null, 2));
    console.log(`✅ Created credentials template: ${this.credentialsFile}`);
    console.log(`   Please fill in your actual Shopify API credentials\n`);
    
    return template;
  }
  
  /**
   * Generate n8n workflow JSON for Shopify automation
   */
  generateWorkflow(workflowName, store = 'silverjstore') {
    const workflows = {
      'order-processing': {
        name: 'Shopify Order Processing',
        description: 'Process new Shopify orders: NFT minting + fulfillment',
        nodes: [
          {
            name: 'Shopify Trigger',
            type: 'n8n-nodes-base.shopifyTrigger',
            position: [250, 300],
            parameters: {
              event: 'order/created',
              additionalFields: {}
            },
            credentials: {
              shopifyApi: {
                id: 'shopify-api-credential',
                name: `${store} API`
              }
            }
          },
          {
            name: 'Extract Order Data',
            type: 'n8n-nodes-base.function',
            position: [450, 300],
            parameters: {
              jsCode: `// Extract relevant order data
const order = items[0].json;
const output = {
  orderId: order.id,
  customerEmail: order.email,
  lineItems: order.line_items,
  totalPrice: order.total_price,
  shippingAddress: order.shipping_address,
  billingAddress: order.billing_address
};
return [output];`
            }
          },
          {
            name: 'Mint NFT',
            type: 'n8n-nodes-base.httpRequest',
            position: [650, 250],
            parameters: {
              method: 'POST',
              url: 'https://api.solana.com/mint-nft',
              sendBody: true,
              bodyParameters: {
                parameters: [
                  {
                    name: 'metadata',
                    value: '={{$json.lineItems[0].title}} - Silver Certificate'
                  },
                  {
                    name: 'recipient',
                    value: '={{$json.customerEmail}}'
                  },
                  {
                    name: 'orderId', 
                    value: '={{$json.orderId}}'
                  }
                ]
              }
            }
          },
          {
            name: 'Update Order Tags',
            type: 'n8n-nodes-base.shopify',
            position: [650, 400],
            parameters: {
              resource: 'order',
              operation: 'update',
              orderId: '={{$json.orderId}}',
              additionalFields: {
                tags: 'nft-minted,processing'
              }
            },
            credentials: {
              shopifyApi: {
                id: 'shopify-api-credential',
                name: `${store} API`
              }
            }
          },
          {
            name: 'Send Confirmation Email',
            type: 'n8n-nodes-base.emailSend',
            position: [850, 300],
            parameters: {
              fromEmail: 'orders@silverjstore.com',
              toEmail: '={{$json.customerEmail}}',
              subject: 'Your Silver Order + NFT Certificate',
              text: 'Thank you for your order! Your NFT certificate has been minted and will be sent to your wallet shortly.'
            }
          }
        ],
        connections: {
          'Shopify Trigger': {
            main: [
              [
                {
                  node: 'Extract Order Data',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          },
          'Extract Order Data': {
            main: [
              [
                {
                  node: 'Mint NFT',
                  type: 'main',
                  index: 0
                },
                {
                  node: 'Update Order Tags',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          },
          'Mint NFT': {
            main: [
              [
                {
                  node: 'Send Confirmation Email',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          },
          'Update Order Tags': {
            main: [
              [
                {
                  node: 'Send Confirmation Email',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          }
        }
      },
      
      'inventory-sync': {
        name: 'Silver Inventory Sync',
        description: 'Sync silver inventory with supplier API',
        nodes: [
          // Inventory sync nodes would go here
        ]
      },
      
      'customer-notifications': {
        name: 'Customer Notification System',
        description: 'Send automated notifications to customers',
        nodes: [
          // Notification nodes would go here
        ]
      }
    };
    
    const workflow = workflows[workflowName];
    if (!workflow) {
      throw new Error(`Workflow ${workflowName} not found`);
    }
    
    const workflowFile = path.join(this.workflowsDir, `${workflowName}.json`);
    fs.writeFileSync(workflowFile, JSON.stringify(workflow, null, 2));
    
    console.log(`✅ Generated workflow: ${workflowFile}`);
    console.log(`   Name: ${workflow.name}`);
    console.log(`   Description: ${workflow.description}`);
    console.log(`   Nodes: ${workflow.nodes.length}\n`);
    
    return workflow;
  }
  
  /**
   * Test Shopify API connection
   */
  async testConnection(storeConfig) {
    console.log(`🔗 Testing Shopify API connection to ${storeConfig.storeUrl}...`);
    
    const testUrl = `https://${storeConfig.storeUrl}/admin/api/2024-01/products.json?limit=1`;
    
    try {
      const response = await axios.get(testUrl, {
        headers: {
          'X-Shopify-Access-Token': storeConfig.accessToken,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Shopify API connection successful`);
      console.log(`   Store: ${storeConfig.storeUrl}`);
      console.log(`   Products count: ${response.data.products?.length || 0}`);
      console.log(`   Status: ${response.status}\n`);
      
      return {
        success: true,
        store: storeConfig.storeUrl,
        productCount: response.data.products?.length || 0
      };
    } catch (error) {
      console.log(`❌ Shopify API connection failed`);
      console.log(`   Error: ${error.message}`);
      console.log(`   Tip: Check API credentials and store URL\n`);
      
      return {
        success: false,
        error: error.message,
        store: storeConfig.storeUrl
      };
    }
  }
  
  /**
   * Generate setup instructions
   */
  generateSetupInstructions() {
    const instructions = `
# 🛒 Shopify + n8n Setup Instructions

## 1. GET SHOPIFY API CREDENTIALS

### For silverjstore.com:
1. Go to https://silverjstore.myshopify.com/admin
2. Navigate to Settings → Apps and sales channels
3. Click "Develop apps" (if not already)
4. Create a new private app
5. Set permissions:
   - Products: Read/Write
   - Orders: Read/Write
   - Customers: Read
   - Inventory: Read/Write
   - Fulfillment services: Read/Write
6. Save and copy:
   - API Key
   - API Secret Key
   - Admin API access token

### For sterlingsilver.xyz:
Repeat same steps for your second store.

## 2. CONFIGURE n8n CREDENTIALS

1. Open n8n at http://localhost:5678
2. Go to Credentials → New Credential
3. Select "Shopify API"
4. Enter:
   - Store URL: yourstore.myshopify.com
   - API Key: [from step 1]
   - API Secret Key: [from step 1]
   - Access Token: [from step 1]

## 3. IMPORT WORKFLOWS

1. In n8n, go to Workflows → Import from file
2. Select the JSON files from: ${this.workflowsDir}
3. Start with: order-processing.json

## 4. SETUP WEBHOOKS (Optional)

For real-time order processing:
1. In Shopify admin: Settings → Notifications
2. Add webhook for "Order creation"
3. URL: http://localhost:5678/webhook/shopify
4. Format: JSON

## 5. TEST THE SYSTEM

1. Make a test order in Shopify
2. Watch n8n workflow execute
3. Check NFT minting (if configured)
4. Verify email notifications

## TROUBLESHOOTING

### API Connection Issues:
- Verify store URL format (no https://)
- Check API token permissions
- Ensure store is on paid plan (API requires paid)

### n8n Issues:
- Check n8n is running: http://localhost:5678
- Verify credentials are saved
- Check workflow is activated (toggle on)

### NFT Minting Issues:
- Ensure Solana RPC endpoint is configured
- Check wallet has SOL for gas fees
- Verify NFT metadata format
`;

    const instructionsFile = path.join(this.configDir, 'SETUP_INSTRUCTIONS.md');
    fs.writeFileSync(instructionsFile, instructions);
    
    console.log(`📋 Setup instructions saved: ${instructionsFile}`);
    return instructions;
  }
  
  /**
   * Get integration status
   */
  getStatus() {
    const hasCredentials = fs.existsSync(this.credentialsFile);
    const workflowCount = fs.existsSync(this.workflowsDir) 
      ? fs.readdirSync(this.workflowsDir).filter(f => f.endsWith('.json')).length
      : 0;
    
    return {
      name: this.name,
      version: this.version,
      credentialsConfigured: hasCredentials,
      workflowsGenerated: workflowCount,
      directories: {
        config: this.configDir,
        workflows: this.workflowsDir
      }
    };
  }
}

// Export for use
module.exports = ShopifyN8NIntegration;

// If run directly
if (require.main === module) {
  (async () => {
    console.log('🛒 SHOPIFY N8N INTEGRATION SETUP\n');
    
    const integration = new ShopifyN8NIntegration();
    console.log('Status:', JSON.stringify(integration.getStatus(), null, 2));
    
    // Create credentials template
    integration.createCredentialsTemplate();
    
    // Generate order processing workflow
    integration.generateWorkflow('order-processing', 'silverjstore');
    
    // Generate setup instructions
    integration.generateSetupInstructions();
    
    console.log('🎉 Setup complete! Next steps:');
    console.log('1. Fill in your Shopify API credentials in credentials.json');
    console.log('2. Import order-processing.json into n8n');
    console.log('3. Configure n8n Shopify credentials');
    console.log('4. Test with a Shopify order\n');
  })();
}