const axios = require('axios');

const APIs = {
  ollama: {
    name: "Ollama API",
    url: "http://localhost:3000/v1/chat/completions",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer empire_sk_test_123'
    },
    data: {
      model: "mistral-7b",
      messages: [{ role: "user", content: "Hello from Ollama!" }],
      max_tokens: 20
    }
  },
  deepseek: {
    name: "DeepSeek API",
    url: "https://api.deepseek.com/v1/chat/completions",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-dfd5911ee9454f10a239b9506248e3f3'
    },
    data: {
      model: "deepseek-chat",
      messages: [{ role: "user", content: "Hello from DeepSeek!" }],
      max_tokens: 20
    }
  }
};

async function testAPI(apiName, config) {
  console.log(`\n🧪 Testing ${apiName}...`);
  
  try {
    const start = Date.now();
    const response = await axios.post(config.url, config.data, {
      headers: config.headers,
      timeout: 10000
    });
    const latency = Date.now() - start;
    
    console.log(`   ✅ Success!`);
    console.log(`   Latency: ${latency}ms`);
    console.log(`   Response: "${response.data.choices[0].message.content.trim()}"`);
    console.log(`   Tokens: ${response.data.usage?.total_tokens || 'N/A'}`);
    
    // Calculate cost
    const tokens = response.data.usage?.total_tokens || 50;
    const cost = apiName === 'Ollama API' ? 
      (tokens / 1000 * 0.000001).toFixed(6) :
      (tokens / 1000 * 0.03).toFixed(2);
    
    console.log(`   Cost: €${cost}`);
    
    return { success: true, latency, cost };
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 DUAL API SYSTEM TEST');
  console.log('======================\n');
  
  const results = {};
  
  // Test Ollama first (primary)
  results.ollama = await testAPI('Ollama API', APIs.ollama);
  
  // Test DeepSeek (backup)
  results.deepseek = await testAPI('DeepSeek API', APIs.deepseek);
  
  // Compare results
  console.log('\n📊 COMPARISON RESULTS:');
  console.log('====================');
  
  if (results.ollama.success && results.deepseek.success) {
    const ollamaCost = parseFloat(results.ollama.cost);
    const deepseekCost = parseFloat(results.deepseek.cost);
    const savings = deepseekCost - ollamaCost;
    const savingsPercent = (savings / deepseekCost * 100).toFixed(1);
    
    console.log(`✅ Both APIs working`);
    console.log(`💰 Cost per request:`);
    console.log(`   Ollama: €${ollamaCost.toFixed(6)}`);
    console.log(`   DeepSeek: €${deepseekCost.toFixed(2)}`);
    console.log(`   Savings: €${savings.toFixed(2)} (${savingsPercent}%)`);
    
    // Monthly projection
    const monthlyRequests = 100000; // 50 agents × 2000 requests/month
    const monthlyOllama = monthlyRequests * ollamaCost;
    const monthlyDeepseek = monthlyRequests * deepseekCost;
    const monthlySavings = monthlyDeepseek - monthlyOllama;
    
    console.log(`\n📈 Monthly projection (100K requests):`);
    console.log(`   Ollama: €${monthlyOllama.toFixed(2)}`);
    console.log(`   DeepSeek: €${monthlyDeepseek.toFixed(2)}`);
    console.log(`   Savings: €${monthlySavings.toFixed(2)}/month`);
    
  } else if (results.ollama.success) {
    console.log(`✅ Ollama working, DeepSeek failed`);
    console.log(`💡 Using Ollama as primary (€0 cost)`);
  } else if (results.deepseek.success) {
    console.log(`⚠️  Ollama failed, DeepSeek working`);
    console.log(`💡 Using DeepSeek as fallback (€0.03/1K tokens)`);
  } else {
    console.log(`❌ Both APIs failed`);
    console.log(`🚨 Emergency: No AI API available`);
  }
  
  return results;
}

runTests().catch(console.error);
