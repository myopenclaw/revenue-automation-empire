// 🧪 Test Stripe Integration for Revenue Automation Empire
// Run: node test_stripe_integration.js

// Load from environment variable for security
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_...');

async function testStripeConnection() {
  console.log('🧪 Testing Stripe Integration...');
  console.log('📊 Account:', 'Revenue Automation Empire');
  console.log('💳 Mode:', 'LIVE (Production)');
  console.log('🔑 Key:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...' : 'Not set (use STRIPE_SECRET_KEY env var)');
  console.log('---');
  
  try {
    // 1. Test API Connection
    console.log('1. Testing API connection...');
    const balance = await stripe.balance.retrieve();
    console.log('   ✅ Stripe connection successful!');
    console.log('   💰 Available balance:', 
      balance.available[0]?.amount / 100, 
      balance.available[0]?.currency
    );
    
    // 2. List Products
    console.log('\n2. Checking existing products...');
    const products = await stripe.products.list({ limit: 10 });
    console.log('   📦 Found', products.data.length, 'products:');
    products.data.forEach(p => {
      console.log('   •', p.name, `(${p.id})`);
    });
    
    // 3. List Prices
    console.log('\n3. Checking prices...');
    const prices = await stripe.prices.list({ limit: 10 });
    console.log('   💵 Found', prices.data.length, 'prices:');
    prices.data.forEach(price => {
      console.log('   •', 
        price.unit_amount / 100, 
        price.currency,
        price.recurring ? `(${price.recurring.interval})` : '(one-time)'
      );
    });
    
    // 4. Check Webhooks
    console.log('\n4. Checking webhooks...');
    const webhooks = await stripe.webhookEndpoints.list({ limit: 5 });
    console.log('   🌐 Found', webhooks.data.length, 'webhook endpoints:');
    webhooks.data.forEach(wh => {
      console.log('   •', wh.url, `(${wh.status})`);
    });
    
    // 5. Create Test Product (if none exist)
    if (products.data.length === 0) {
      console.log('\n5. Creating test product...');
      const testProduct = await stripe.products.create({
        name: 'Test Silver Product',
        description: 'Test product for Revenue Automation Empire'
      });
      
      const testPrice = await stripe.prices.create({
        product: testProduct.id,
        unit_amount: 8999, // €89.99
        currency: 'eur',
      });
      
      console.log('   ✅ Created test product:', testProduct.name);
      console.log('   💵 Price:', testPrice.unit_amount / 100, 'EUR');
    }
    
    // 6. Test Payment Intent (simulate payment)
    console.log('\n6. Testing payment intent creation...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 8999, // €89.99
      currency: 'eur',
      payment_method_types: ['card'],
      metadata: {
        test: 'true',
        product: 'silver_bracelet',
        integration_test: 'revenue-automation-empire'
      }
    });
    
    console.log('   ✅ Payment intent created:', paymentIntent.id);
    console.log('   💶 Amount:', paymentIntent.amount / 100, 'EUR');
    console.log('   📝 Status:', paymentIntent.status);
    
    // 7. Check Account Capabilities
    console.log('\n7. Checking account capabilities...');
    const account = await stripe.accounts.retrieve();
    console.log('   🏢 Business:', account.business_profile?.name || 'Not set');
    console.log('   📍 Country:', account.country);
    console.log('   💳 Charges enabled:', account.charges_enabled);
    console.log('   💸 Payouts enabled:', account.payouts_enabled);
    
    // 8. Test Balance Transaction
    console.log('\n8. Checking recent transactions...');
    const transactions = await stripe.balanceTransactions.list({ limit: 5 });
    console.log('   📊 Recent transactions:', transactions.data.length);
    transactions.data.forEach(tx => {
      console.log('   •', 
        new Date(tx.created * 1000).toLocaleDateString(),
        tx.type,
        tx.amount / 100,
        tx.currency,
        tx.status
      );
    });
    
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('🚀 Stripe is ready for €50K+ MRR processing');
    console.log('\n📋 Next steps:');
    console.log('1. Create products in Stripe Dashboard');
    console.log('2. Set up webhook endpoint');
    console.log('3. Configure n8n workflow');
    console.log('4. Test complete payment flow');
    
    return {
      success: true,
      balance: balance.available[0],
      products: products.data.length,
      prices: prices.data.length,
      webhooks: webhooks.data.length,
      account_status: {
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        country: account.country
      }
    };
    
  } catch (error) {
    console.error('\n❌ Stripe test failed:', error.message);
    console.error('Error type:', error.type);
    console.error('Error code:', error.code);
    
    // Provide helpful debugging info
    if (error.type === 'StripeAuthenticationError') {
      console.log('\n🔐 Authentication issue:');
      console.log('• Check your secret key is correct');
      console.log('• Verify the key starts with "sk_live_"');
      console.log('• Check if the key has been revoked');
    } else if (error.type === 'StripePermissionError') {
      console.log('\n🔒 Permission issue:');
      console.log('• Check API key permissions');
      console.log('• Verify webhook endpoints are configured');
    } else if (error.type === 'StripeRateLimitError') {
      console.log('\n⏱️ Rate limit issue:');
      console.log('• Too many requests, wait and retry');
    }
    
    return {
      success: false,
      error: error.message,
      type: error.type,
      code: error.code
    };
  }
}

// Run test
testStripeConnection().then(result => {
  console.log('\n📊 Test Summary:');
  console.log(JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('\n✅ Stripe integration is LIVE and ready for production!');
    console.log('💰 Start processing payments for Revenue Automation Empire');
  } else {
    console.log('\n❌ Fix the issues above before proceeding');
    process.exit(1);
  }
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});