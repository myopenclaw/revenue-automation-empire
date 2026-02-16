# 🚀 Stripe Setup Guide for Revenue Automation Empire

## 📋 Prerequisites

### 1. Stripe Account
- ✅ Live account: **ACTIVE** (pk_live_51T1VQ3PTbwzVNBcUFMh9DkPBIpV1giuRNQ8zsG5ordtW5mf4xE8aJufgDlJI5oJkOJZqhmPbkpBfxYUEkLbq7isw007BqMLm9N)
- 🔑 **Need:** Secret Key (`sk_live_...`)
- 🔑 **Need:** Webhook Signing Secret (`whsec_...`)

### 2. Bank Account
- EUR bank account connected to Stripe
- Payout schedule configured

### 3. Business Details
- Legal business name
- VAT number (if applicable)
- Business address

## 🔧 Step 1: Get Missing Stripe Keys

### Secret Key
1. Go to: https://dashboard.stripe.com/apikeys
2. Under "Standard keys", copy **Secret key**
3. Format: `sk_live_51T1VQ3...`

### Webhook Signing Secret
1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://your-domain.com/webhooks/stripe` (or local tunnel)
4. Select events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `payment_intent.succeeded`
5. Copy **Signing secret**: `whsec_...`

## 🛠️ Step 2: Configure Environment

Create `.env` file in project root:

```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_live_51T1VQ3PTbwzVNBcUFMh9DkPBIpV1giuRNQ8zsG5ordtW5mf4xE8aJufgDlJI5oJkOJZqhmPbkpBfxYUEkLbq7isw007BqMLm9N
STRIPE_SECRET_KEY=sk_live_...  # GET FROM STRIPE DASHBOARD
STRIPE_WEBHOOK_SECRET=whsec_... # GET FROM STRIPE DASHBOARD

# Business Configuration
BUSINESS_NAME="Revenue Automation Empire"
CURRENCY="EUR"
DEFAULT_COUNTRY="NL"

# Email Configuration (for receipts)
EMAIL_FROM="payments@revenue-automation.com"
EMAIL_SERVICE="sendgrid"  # or postmark, mailgun, etc.
EMAIL_API_KEY=...
```

## 🎯 Step 3: Create Products in Stripe

Run the product initialization:

```bash
node -e "
const stripe = require('./stripe_n8n_integration.js');
stripe.initializeProducts().then(products => {
  console.log('✅ Products created:', products);
});
"
```

Or create manually in Stripe Dashboard:
1. **Products → Add Product**
2. Create these products:

### Silver E-commerce
| Name | Price | Type | Description |
|------|-------|------|-------------|
| Silver Bracelet | €89.99 | One-time | Handcrafted sterling silver |
| Silver Necklace | €129.99 | One-time | Premium silver necklace |
| Silver Ring | €69.99 | One-time | Custom silver ring |

### Subscription Services
| Name | Price | Interval | Description |
|------|-------|----------|-------------|
| Trading Signals Pro | €99/month | Monthly | Live trading alerts & analysis |
| AI Toolkit | €49/month | Monthly | AI automation tools & templates |
| Video Agency | €199/month | Monthly | 50 videos/month production |

## ⚡ Step 4: n8n Integration

### Option A: Use Pre-built Workflow
1. Open n8n: http://localhost:5678
2. Import workflow: `stripe_n8n_integration.js` (n8nWorkflow export)
3. Configure Stripe credentials in n8n

### Option B: Manual n8n Setup
1. **Add Stripe Trigger Node**
   - Event: `checkout.session.completed`
   - Credentials: Add your Stripe keys

2. **Add Function Node** (Payment Processing)
   - Use code from `stripe_n8n_integration.js`

3. **Add Email Node** (Confirmation)
   - Configure your email service

4. **Add Shopify Node** (Fulfillment)
   - Connect to Shopify for order processing

## 🌐 Step 5: Webhook Configuration

### For Development (Local)
```bash
# Install ngrok for local webhooks
npm install -g ngrok

# Start ngrok tunnel
ngrok http 3000

# Update Stripe webhook endpoint with ngrok URL
# Example: https://abc123.ngrok.io/webhooks/stripe
```

### For Production
1. Deploy to your server (VPS, Heroku, Railway, etc.)
2. Set webhook endpoint to: `https://your-domain.com/webhooks/stripe`
3. Verify webhook signature in code

## 💰 Step 6: Payment Flows

### 1. One-time Purchases (Silver Products)
```
Customer → Stripe Checkout → Webhook → n8n → Shopify Fulfillment
```

### 2. Subscriptions (Services)
```
Customer → Stripe Subscription → Monthly Invoices → n8n → Access Grant
```

### 3. Hybrid (Product + Subscription)
Example: Silver necklace + Trading signals subscription bundle

## 📊 Step 7: Revenue Dashboard

Access real-time revenue data:

```bash
# Daily revenue
curl http://localhost:3000/revenue/daily

# Monthly MRR
curl http://localhost:3000/revenue/monthly

# Customer LTV
curl http://localhost:3000/customers/cus_xxx/ltv
```

Or use the built-in dashboard in `cex_performance_dashboard.js` (extended for Stripe).

## 🔐 Step 8: Security & Compliance

### PCI Compliance
- Stripe is PCI Level 1 compliant
- Never store card details yourself
- Use Stripe Elements/Checkout for payment forms

### GDPR Compliance
- Stripe handles customer data compliance
- Implement privacy policy
- Allow data deletion requests

### Tax Compliance
- Configure tax rates in Stripe Dashboard
- EU: VAT based on customer location
- NL: 21% VAT for consumers
- Issue VAT invoices automatically

## 🚀 Step 9: Go Live Checklist

- [ ] Stripe account in Live mode
- [ ] Bank account connected & verified
- [ ] Products created in Stripe
- [ ] Webhook endpoint configured & tested
- [ ] n8n workflow imported & tested
- [ ] Email templates configured
- [ ] Tax rates configured
- [ ] Privacy policy & terms of service
- [ ] Test transactions completed
- [ ] Monitoring alerts configured

## 🛠️ Step 10: Testing

### Test Mode First
```bash
# Use test keys initially
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Test card numbers:
# 4242 4242 4242 4242 - Success
# 4000 0000 0000 0002 - Declined
# 4000 0000 0000 0069 - Expired
```

### Test Scenarios
1. **Successful purchase** (€89.99 silver bracelet)
2. **Subscription signup** (€99/month trading signals)
3. **Failed payment** (insufficient funds)
4. **Refund processing**
5. **Subscription cancellation**
6. **Webhook retries** (simulate failure)

## 📈 Step 11: Analytics & Optimization

### Key Metrics to Track
- **MRR**: Monthly Recurring Revenue
- **ARR**: Annual Run Rate (MRR × 12)
- **LTV**: Customer Lifetime Value
- **CAC**: Customer Acquisition Cost
- **Churn Rate**: Monthly subscription cancellations
- **Conversion Rate**: Checkout completion %

### Optimization Tips
1. **A/B test pricing** (€89 vs €99)
2. **Offer annual discounts** (€99/month → €999/year)
3. **Upsell bundles** (silver + subscription)
4. **Retention offers** (discount before cancellation)
5. **Referral program** (10% commission)

## 🆘 Troubleshooting

### Common Issues

#### Webhooks not firing
- Check endpoint URL is correct
- Verify webhook secret matches
- Test with Stripe CLI: `stripe listen --forward-to localhost:3000/webhooks/stripe`

#### Payments failing
- Check card details (test cards for development)
- Verify currency matches customer location
- Check for fraud filters in Stripe Radar

#### n8n workflow not triggering
- Verify Stripe credentials in n8n
- Check workflow is activated (toggle on)
- Test with Stripe test events

#### Email not sending
- Verify email service credentials
- Check spam folder
- Test with different email provider

## 📞 Support

### Stripe Support
- Dashboard: https://dashboard.stripe.com/support
- Documentation: https://stripe.com/docs
- Status: https://status.stripe.com

### Code Support
- GitHub Issues: https://github.com/myopenclaw/revenue-automation-empire/issues
- Email: clarence@openclaw.ai

## 🎯 Next Steps After Setup

1. **Integrate with Shopify** for automated fulfillment
2. **Connect to trading dashboard** for subscription access
3. **Set up automated reporting** (daily revenue emails)
4. **Implement customer portal** for self-service
5. **Add advanced analytics** (cohort analysis, predictions)

---

**🚀 Revenue Automation Empire | Stripe Integration v1.0**
*Process payments, track revenue, automate fulfillment*