#!/bin/bash
# 🚀 Stripe Webhook Setup Script for Revenue Automation Empire
# Run this script to set up your Stripe webhook endpoint

echo "🌐 Setting up Stripe Webhook for Revenue Automation Empire"
echo "=========================================================="

# Check for required tools
command -v stripe >/dev/null 2>&1 || {
    echo "❌ Stripe CLI not found. Installing..."
    # Install Stripe CLI
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install stripe/stripe-cli/stripe
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -fsSL https://stripe.com/stripe-cli-deb.sh | sudo sh
    else
        echo "⚠️ Please install Stripe CLI manually: https://stripe.com/docs/stripe-cli"
        exit 1
    fi
}

command -v ngrok >/dev/null 2>&1 || {
    echo "❌ ngrok not found. Installing..."
    npm install -g ngrok
}

echo "✅ Required tools installed"

# Step 1: Login to Stripe
echo ""
echo "1. 🔐 Logging into Stripe..."
stripe login

# Step 2: Start ngrok tunnel
echo ""
echo "2. 🌐 Starting ngrok tunnel..."
ngrok http 3000 > /dev/null &
NGROK_PID=$!
sleep 3  # Wait for ngrok to start

# Get ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')
if [ -z "$NGROK_URL" ] || [ "$NGROK_URL" = "null" ]; then
    echo "❌ Failed to get ngrok URL"
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

echo "   ✅ ngrok URL: $NGROK_URL"
WEBHOOK_URL="${NGROK_URL}/webhooks/stripe"
echo "   📍 Webhook endpoint: $WEBHOOK_URL"

# Step 3: Create webhook endpoint
echo ""
echo "3. 🔔 Creating Stripe webhook endpoint..."
WEBHOOK_OUTPUT=$(stripe webhook-endpoints create \
  --url="$WEBHOOK_URL" \
  --enabled-events="checkout.session.completed" \
  --enabled-events="invoice.paid" \
  --enabled-events="customer.subscription.created" \
  --enabled-events="customer.subscription.updated" \
  --enabled-events="customer.subscription.deleted" \
  --enabled-events="payment_intent.succeeded" \
  --enabled-events="charge.refunded" \
  --description="Revenue Automation Empire Webhook" \
  --api-key="$STRIPE_SECRET_KEY" 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ Failed to create webhook endpoint"
    echo "   Try creating manually: https://dashboard.stripe.com/webhooks"
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

# Extract webhook secret
WEBHOOK_SECRET=$(echo "$WEBHOOK_OUTPUT" | grep -o '"secret":"[^"]*"' | cut -d'"' -f4)
WEBHOOK_ID=$(echo "$WEBHOOK_OUTPUT" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$WEBHOOK_SECRET" ]; then
    echo "⚠️ Could not extract webhook secret automatically"
    echo "   Please get it manually from: https://dashboard.stripe.com/webhooks"
    WEBHOOK_SECRET="whsec_..."
else
    echo "   ✅ Webhook created: $WEBHOOK_ID"
    echo "   🔐 Webhook secret: ${WEBHOOK_SECRET:0:20}..."
fi

# Step 4: Update .env file
echo ""
echo "4. ⚙️ Updating environment configuration..."
ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
    echo "   Creating .env file from template..."
    cp .env.example .env
fi

# Update Stripe keys in .env
if [ -n "$STRIPE_SECRET_KEY" ]; then
    sed -i '' "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY|" "$ENV_FILE" 2>/dev/null || \
    sed -i "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY|" "$ENV_FILE"
fi

if [ -n "$WEBHOOK_SECRET" ] && [ "$WEBHOOK_SECRET" != "whsec_..." ]; then
    sed -i '' "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET|" "$ENV_FILE" 2>/dev/null || \
    sed -i "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET|" "$ENV_FILE"
    echo "   ✅ Webhook secret added to .env"
fi

# Step 5: Start test server
echo ""
echo "5. 🧪 Starting test server..."
echo "   📁 Project root: $(pwd)"
echo "   🚀 Starting server on port 3000..."

# Create a simple test server if not exists
if [ ! -f "server.js" ]; then
    cat > server.js << 'EOF'
const express = require('express');
const stripe = require('./stripe_n8n_integration.js');
const app = express();

app.use(express.json());
app.use('/webhooks/stripe', stripe.router);

app.get('/', (req, res) => {
  res.json({
    service: 'Revenue Automation Empire',
    status: 'running',
    endpoints: {
      webhook: '/webhooks/stripe',
      revenue: '/revenue/daily',
      health: '/health'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Webhook endpoint: http://localhost:${PORT}/webhooks/stripe`);
});
EOF
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "   📦 Installing dependencies..."
    npm install express
fi

# Start server in background
node server.js &
SERVER_PID=$!
sleep 2

# Step 6: Test webhook
echo ""
echo "6. 🧪 Testing webhook connection..."
echo "   📡 Listening for Stripe events..."
echo ""
echo "   💡 Open a NEW terminal and run:"
echo "   stripe listen --forward-to localhost:3000/webhooks/stripe"
echo ""
echo "   💡 Then in another terminal, trigger a test event:"
echo "   stripe trigger checkout.session.completed"
echo ""
echo "   📊 Or check the webhook dashboard:"
echo "   https://dashboard.stripe.com/webhooks"
echo ""
echo "=========================================================="
echo "🎉 Stripe Webhook Setup Complete!"
echo ""
echo "📋 Next steps:"
echo "1. Keep this terminal open (ngrok + server running)"
echo "2. Open new terminal for 'stripe listen' command"
echo "3. Test with 'stripe trigger checkout.session.completed'"
echo "4. Check server logs for received webhooks"
echo "5. Update production webhook when deploying"
echo ""
echo "⚠️  Press Ctrl+C to stop all services"
echo "=========================================================="

# Wait for user to press Ctrl+C
trap 'kill $NGROK_PID $SERVER_PID 2>/dev/null; echo "🛑 Services stopped"; exit' INT
wait