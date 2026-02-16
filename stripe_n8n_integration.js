// 🚀 Stripe + n8n Integration for Revenue Automation Empire
// Version: 1.0.0 | Live Mode: ACTIVE

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_live_...');
const express = require('express');
const router = express.Router();

// 📊 Revenue Tracking Database
const revenueDB = {
  daily: { date: new Date().toISOString().split('T')[0], amount: 0, transactions: [] },
  monthly: { month: new Date().getMonth() + 1, amount: 0, mrr: 0 },
  customers: new Map(),
  subscriptions: new Map()
};

// 🎯 Stripe Webhook Handler
async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`✅ Stripe webhook received: ${event.type}`);
  
  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
      
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object);
      break;
      
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;
      
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
      
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
      
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
      
    case 'charge.refunded':
      await handleChargeRefunded(event.data.object);
      break;
      
    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
}

// 💰 Checkout Completed - One-time purchase
async function handleCheckoutCompleted(session) {
  const { customer, amount_total, currency, metadata } = session;
  const amount = amount_total / 100; // Convert from cents
  
  console.log(`💰 Checkout completed: €${amount} ${currency}`);
  
  // Update revenue tracking
  revenueDB.daily.amount += amount;
  revenueDB.daily.transactions.push({
    type: 'one_time',
    amount,
    currency,
    customer: customer,
    product: metadata?.product || 'unknown',
    timestamp: new Date().toISOString()
  });
  
  // Trigger fulfillment based on product
  if (metadata?.product_type === 'silver') {
    await triggerShopifyFulfillment(session);
  } else if (metadata?.product_type === 'digital') {
    await triggerDigitalDelivery(session);
  }
  
  // Send confirmation email
  await sendConfirmationEmail(session);
  
  // Log to database
  await logTransaction(session);
}

// 📈 Invoice Paid - Subscription/recurring payment
async function handleInvoicePaid(invoice) {
  const { customer, amount_paid, currency, subscription } = invoice;
  const amount = amount_paid / 100;
  
  console.log(`📈 Invoice paid: €${amount} ${currency} for subscription ${subscription}`);
  
  // Update MRR (Monthly Recurring Revenue)
  if (invoice.billing_reason === 'subscription_cycle') {
    revenueDB.monthly.mrr += amount;
    revenueDB.monthly.amount += amount;
    
    // Update subscription in tracking
    const sub = await stripe.subscriptions.retrieve(subscription);
    revenueDB.subscriptions.set(subscription, {
      customer,
      amount,
      interval: sub.items.data[0].plan.interval,
      current_period_end: sub.current_period_end,
      status: sub.status
    });
  }
  
  // Update customer lifetime value
  updateCustomerLTV(customer, amount);
  
  // Trigger subscription benefits
  await triggerSubscriptionBenefits(invoice);
}

// 🔄 Subscription Created
async function handleSubscriptionCreated(subscription) {
  const { customer, items, current_period_end } = subscription;
  const amount = items.data[0].price.unit_amount / 100;
  
  console.log(`🔄 Subscription created: €${amount}/month for customer ${customer}`);
  
  // Add to active subscriptions
  revenueDB.subscriptions.set(subscription.id, {
    customer,
    amount,
    interval: items.data[0].plan.interval,
    current_period_end,
    status: 'active'
  });
  
  // Send welcome email
  await sendSubscriptionWelcomeEmail(subscription);
  
  // Grant access to subscription features
  await grantSubscriptionAccess(subscription);
}

// 📊 Revenue Analytics Functions
function getDailyRevenue() {
  return {
    date: revenueDB.daily.date,
    total: revenueDB.daily.amount,
    transactions: revenueDB.daily.transactions.length,
    average: revenueDB.daily.transactions.length > 0 
      ? revenueDB.daily.amount / revenueDB.daily.transactions.length 
      : 0
  };
}

function getMonthlyMRR() {
  return {
    month: revenueDB.monthly.month,
    mrr: revenueDB.monthly.mrr,
    total: revenueDB.monthly.amount,
    activeSubscriptions: revenueDB.subscriptions.size
  };
}

function getCustomerLTV(customerId) {
  const customer = revenueDB.customers.get(customerId);
  return customer ? customer.lifetime_value : 0;
}

// 🛠️ Integration Functions
async function triggerShopifyFulfillment(session) {
  // Integrate with Shopify order fulfillment
  console.log('🛍️ Triggering Shopify fulfillment for order:', session.id);
  
  // This would call your Shopify API to create/update order
  // const shopifyOrder = await shopifyApi.createOrder({
  //   customer_email: session.customer_email,
  //   line_items: session.metadata.items,
  //   total_price: session.amount_total / 100
  // });
  
  return { success: true, message: 'Shopify fulfillment triggered' };
}

async function triggerDigitalDelivery(session) {
  // Deliver digital products (NFTs, access codes, etc.)
  console.log('🎁 Delivering digital product for:', session.id);
  
  // Example: Mint NFT for digital purchase
  // if (session.metadata.product === 'silver_nft') {
  //   await mintNFT(session.customer_email, session.metadata);
  // }
  
  return { success: true, message: 'Digital delivery triggered' };
}

async function triggerSubscriptionBenefits(invoice) {
  // Grant subscription benefits (API access, premium features, etc.)
  console.log('🎯 Granting subscription benefits for:', invoice.subscription);
  
  // Example: Update user access in your system
  // await userService.updateAccess(invoice.customer, 'premium');
  
  return { success: true, message: 'Subscription benefits granted' };
}

// 📧 Email Functions
async function sendConfirmationEmail(session) {
  console.log('📧 Sending confirmation email to:', session.customer_email);
  // Integrate with your email service (SendGrid, Postmark, etc.)
}

async function sendSubscriptionWelcomeEmail(subscription) {
  console.log('📧 Sending welcome email for subscription:', subscription.id);
  // Send onboarding email with access instructions
}

// 📝 Database Functions
async function logTransaction(session) {
  // Log to your database (SQLite, PostgreSQL, etc.)
  console.log('📝 Logging transaction to database:', session.id);
}

function updateCustomerLTV(customerId, amount) {
  if (!revenueDB.customers.has(customerId)) {
    revenueDB.customers.set(customerId, {
      lifetime_value: amount,
      first_purchase: new Date().toISOString(),
      last_purchase: new Date().toISOString(),
      transaction_count: 1
    });
  } else {
    const customer = revenueDB.customers.get(customerId);
    customer.lifetime_value += amount;
    customer.last_purchase = new Date().toISOString();
    customer.transaction_count += 1;
    revenueDB.customers.set(customerId, customer);
  }
}

async function grantSubscriptionAccess(subscription) {
  // Grant access to premium features
  console.log('🔓 Granting access for subscription:', subscription.id);
}

// 🚀 n8n Workflow Export
const n8nWorkflow = {
  name: "Stripe Payment Processing",
  nodes: [
    {
      name: "Stripe Webhook",
      type: "n8n-nodes-base.stripeTrigger",
      position: [250, 300],
      parameters: {
        event: "checkout.session.completed",
        credentials: {
          stripeApi: {
            id: "1",
            name: "Stripe Live"
          }
        }
      }
    },
    {
      name: "Process Payment",
      type: "n8n-nodes-base.function",
      position: [450, 300],
      parameters: {
        functionCode: `
          // Process Stripe payment
          const session = items[0].json;
          const amount = session.amount_total / 100;
          
          // Update revenue tracking
          $('revenue').daily += amount;
          
          // Trigger fulfillment
          if (session.metadata.product_type === 'silver') {
            $('shopify').createOrder(session);
          }
          
          return { 
            success: true, 
            amount: amount,
            customer: session.customer_email 
          };
        `
      }
    },
    {
      name: "Send Confirmation",
      type: "n8n-nodes-base.emailSend",
      position: [650, 300],
      parameters: {
        to: "={{ $json.customer }}",
        subject: "Order Confirmation - Revenue Automation Empire",
        text: "Thank you for your purchase! Your order is being processed."
      }
    }
  ]
};

// 📊 Dashboard Endpoints
router.get('/revenue/daily', (req, res) => {
  res.json(getDailyRevenue());
});

router.get('/revenue/monthly', (req, res) => {
  res.json(getMonthlyMRR());
});

router.get('/customers/:id/ltv', (req, res) => {
  const ltv = getCustomerLTV(req.params.id);
  res.json({ customerId: req.params.id, lifetime_value: ltv });
});

router.post('/webhooks/stripe', handleStripeWebhook);

// 🎯 Product Creation Helper
async function createStripeProduct(name, price, type = 'one_time') {
  try {
    // Create product
    const product = await stripe.products.create({
      name,
      metadata: { type }
    });
    
    // Create price
    const priceObj = await stripe.prices.create({
      product: product.id,
      unit_amount: price * 100, // in cents
      currency: 'eur',
      recurring: type === 'subscription' ? { interval: 'month' } : undefined
    });
    
    console.log(`✅ Created ${type} product: ${name} (€${price})`);
    return { product: product.id, price: priceObj.id };
  } catch (error) {
    console.error('❌ Error creating Stripe product:', error);
    throw error;
  }
}

// Initialize default products
async function initializeProducts() {
  const products = [
    { name: "Silver Bracelet", price: 89.99, type: "one_time" },
    { name: "Silver Necklace", price: 129.99, type: "one_time" },
    { name: "Trading Signals Pro", price: 99, type: "subscription" },
    { name: "AI Toolkit", price: 49, type: "subscription" },
    { name: "Video Agency", price: 199, type: "subscription" }
  ];
  
  const created = [];
  for (const product of products) {
    try {
      const result = await createStripeProduct(product.name, product.price, product.type);
      created.push({ ...product, ...result });
    } catch (error) {
      console.error(`Failed to create product: ${product.name}`, error);
    }
  }
  
  return created;
}

module.exports = {
  router,
  handleStripeWebhook,
  getDailyRevenue,
  getMonthlyMRR,
  initializeProducts,
  n8nWorkflow,
  revenueDB
};

console.log('🚀 Stripe Integration loaded - Live Mode: ACTIVE');
console.log('📊 Ready to process payments for Revenue Automation Empire');
console.log('💳 Publishable Key:', process.env.STRIPE_PUBLISHABLE_KEY?.substring(0, 20) + '...');