
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
2. Select the JSON files from: /Users/clarenceetnel/.openclaw/workspace/n8n_workflows
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
