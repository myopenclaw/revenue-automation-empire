# 🌐 Stripe Webhook Setup Instructions

## 📍 Step 1: Go to Stripe Webhooks Dashboard
1. Open: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"** button

## 🎯 Step 2: Configure Webhook Endpoint

### For Local Development (Testing):
```bash
# Install ngrok for local tunnel
npm install -g ngrok

# Start tunnel to your local server
ngrok http 3000

# You'll get a URL like: https://abc123.ngrok.io
```

**Endpoint URL:** `https://abc123.ngrok.io/webhooks/stripe`

### For Production:
**Endpoint URL:** `https://your-domain.com/webhooks/stripe`

## 🔔 Step 3: Select Events to Listen For

**Select these events (minimum):**
- [x] `checkout.session.completed`
- [x] `invoice.paid`
- [x] `customer.subscription.created`
- [x] `customer.subscription.updated`
- [x] `customer.subscription.deleted`
- [x] `payment_intent.succeeded`
- [x] `charge.refunded`

**Optional but recommended:**
- `customer.created`
- `customer.updated`
- `invoice.payment_failed`
- `charge.dispute.created`

## 🔐 Step 4: Copy Webhook Signing Secret

After creating the webhook:
1. Find your new webhook in the list
2. Click **"Reveal"** next to "Signing secret"
3. Copy the secret: `whsec_...` (starts with `whsec_`)
4. **DO NOT SHARE THIS SECRET**

## ⚙️ Step 5: Configure Your .env File

Add to your `.env` file:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...  # Paste your secret here
```

## 🧪 Step 6: Test Webhook

### Using Stripe CLI (Recommended):
```bash
# Install Stripe CLI
curl -fsSL https://stripe.com/stripe-cli-deb.sh | sudo sh

# Login to Stripe
stripe login

# Listen for events
stripe listen --forward-to localhost:3000/webhooks/stripe
```

### Manual Test:
1. Go to webhook details in Stripe Dashboard
2. Click **"Send test webhook"**
3. Select event: `checkout.session.completed`
4. Check your server logs for received event

## 🚨 Step 7: Verify Webhook Signature

The code in `stripe_n8n_integration.js` already includes signature verification:

```javascript
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
```

## 🔄 Step 8: Configure n8n Webhook Node

In n8n:
1. Add **"Webhook"** node
2. Set path: `/webhooks/stripe`
3. Method: POST
4. Response: 200 OK
5. Connect to your Stripe processing workflow

## 📊 Step 9: Monitor Webhook Delivery

Check webhook health:
1. Dashboard → Developers → Webhooks
2. Click your endpoint
3. View **"Recent deliveries"**
4. Green = successful, Red = failed

## 🆘 Troubleshooting

### Webhook not receiving events:
- Check endpoint URL is correct
- Verify server is running and accessible
- Check firewall/port settings
- Test with Stripe CLI first

### Signature verification fails:
- Verify webhook secret matches
- Check request body is raw (not parsed)
- Ensure correct Stripe library version

### Events not triggering actions:
- Verify event types are selected
- Check n8n workflow is activated
- Test with manual webhook send

## 🎯 Production Checklist

- [ ] Webhook endpoint is HTTPS
- [ ] Signing secret is in environment variables (not code)
- [ ] All required events are selected
- [ ] Webhook retries are configured (default: 3 attempts)
- [ ] Monitoring alerts are set up
- [ ] Failed webhooks have manual retry process

## 📞 Support

- Stripe Docs: https://stripe.com/docs/webhooks
- Stripe Support: https://dashboard.stripe.com/support
- Code Issues: GitHub repository

---

**⚠️ SECURITY WARNING:** The webhook signing secret is like a password. Never commit it to GitHub or share it publicly.
