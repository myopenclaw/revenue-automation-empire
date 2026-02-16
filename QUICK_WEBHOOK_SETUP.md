# ⚡ Quick Stripe Webhook Setup

## 🎯 Eenvoudigste Methode (5 minuten)

### Stap 1: Start het automatische setup script
```bash
cd /Users/clarenceetnel/.openclaw/workspace
export STRIPE_SECRET_KEY="sk_live_..."  # Use your actual secret key from Stripe Dashboard
./setup_stripe_webhook.sh
```

### Stap 2: Volg de instructies op het scherm
Het script doet:
- ✅ Installeert Stripe CLI & ngrok (als nodig)
- ✅ Logt in op Stripe
- ✅ Start ngrok tunnel
- ✅ Maakt webhook endpoint aan
- ✅ Update .env file met webhook secret
- ✅ Start test server

### Stap 3: Test de webhook
In een **NIEUWE terminal**:
```bash
# Terminal 2: Luister naar events
stripe listen --forward-to localhost:3000/webhooks/stripe

# Terminal 3: Trigger test event
stripe trigger checkout.session.completed
```

## 📝 Handmatige Methode (als script niet werkt)

### Stap 1: Start ngrok tunnel
```bash
npm install -g ngrok
ngrok http 3000
```
**Kopieer de ngrok URL:** `https://abc123.ngrok.io`

### Stap 2: Maak webhook aan in Stripe Dashboard
1. Ga naar: https://dashboard.stripe.com/webhooks
2. Klik "Add endpoint"
3. **Endpoint URL:** `https://abc123.ngrok.io/webhooks/stripe`
4. **Select events:**
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `payment_intent.succeeded`
5. Klik "Add endpoint"
6. Klik "Reveal" naast "Signing secret"
7. **Kopieer de secret:** `whsec_...`

### Stap 3: Update .env file
```bash
# Maak .env file aan
cp .env.example .env

# Voeg je keys toe
echo "STRIPE_SECRET_KEY=sk_live_..." >> .env  # Add your actual secret key
echo "STRIPE_WEBHOOK_SECRET=whsec_..." >> .env  # Plak je webhook secret
```

### Stap 4: Start de server
```bash
# Installeer dependencies
npm install express

# Start server
node -e "
const express = require('express');
const stripe = require('./stripe_n8n_integration.js');
const app = express();
app.use(express.json());
app.use('/webhooks/stripe', stripe.router);
app.listen(3000, () => console.log('🚀 Server running on port 3000'));
"
```

## 🧪 Test de Setup

### Optie A: Met Stripe CLI
```bash
# Terminal 1: Luister naar events
stripe listen --forward-to localhost:3000/webhooks/stripe

# Terminal 2: Trigger test payment
stripe trigger checkout.session.completed
```

### Optie B: Handmatig in Dashboard
1. Ga naar je webhook in Stripe Dashboard
2. Klik "Send test webhook"
3. Select event: `checkout.session.completed`
4. Check server logs voor ontvangst

## ✅ Succes Indicators

- **Server logs:** "Stripe webhook received: checkout.session.completed"
- **Stripe CLI:** "Webhook received" melding
- **Dashboard:** Webhook delivery shows "Succeeded" (groen vinkje)

## 🆘 Troubleshooting

### Webhook niet ontvangen?
```bash
# Check of server draait
curl http://localhost:3000/health

# Check ngrok tunnel
curl http://localhost:4040/api/tunnels

# Test webhook handmatig
curl -X POST http://localhost:3000/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Signature verification failed?
- Check of webhook secret klopt in .env
- Herstart server na .env update
- Test met Stripe CLI (die signeert automatisch)

## 🚀 Production Ready

Wanneer je naar productie gaat:
1. **Vervang ngrok URL** met je eigen domein
2. **Update webhook endpoint** in Stripe Dashboard
3. **Zet HTTPS aan** op je server
4. **Monitor webhook deliveries** in Stripe Dashboard

---

**⏱️ Tijd nodig:** 5-10 minuten  
**🎯 Resultaat:** Live Stripe payments met automated fulfillment  
**💰 Impact:** €50K+ MRR processing ready

*"Automate revenue, not excuses."*