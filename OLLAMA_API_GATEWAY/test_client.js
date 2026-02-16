#!/usr/bin/env node
// 🧪 Test Client for Ollama API Gateway
// Tests OpenAI-compatible API endpoints

const axios = require('axios');

const API_BASE = 'http://localhost:3000/v1';
const API_KEY = 'empire_sk_test_123';

async function testChatCompletion() {
  console.log('🧪 Testing /v1/chat/completions...');
  
  try {
    const response = await axios.post(`${API_BASE}/chat/completions`, {
      model: 'mistral-7b',
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant.' },
        { role: 'user', content: 'What is 2 + 2?' }
      ],
      temperature: 0.7,
      max_tokens: 100
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    console.log('✅ Success! Response:');
    console.log(`  ID: ${response.data.id}`);
    console.log(`  Model: ${response.data.model}`);
    console.log(`  Response: ${response.data.choices[0].message.content}`);
    console.log(`  Tokens: ${response.data.usage.total_tokens}`);
    console.log(`  Latency: ${response.data.latency_ms}ms`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return null;
  }
}

async function testModelsEndpoint() {
  console.log('\n🧪 Testing /v1/models...');
  
  try {
    const response = await axios.get(`${API_BASE}/models`);
    console.log('✅ Success! Available models:');
    response.data.data.forEach(model => {
      console.log(`  • ${model.id} (${model.context_length} context)`);
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return null;
  }
}

async function testUsageEndpoint() {
  console.log('\n🧪 Testing /v1/usage...');
  
  try {
    const response = await axios.get(`${API_BASE}/usage`);
    console.log('✅ Success! Usage stats:');
    console.log(`  Total Requests: ${response.data.total_requests}`);
    console.log(`  Cache Hits: ${response.data.cache_hits}`);
    console.log(`  Total Tokens: ${response.data.total_tokens}`);
    console.log(`  Cost Savings: ${response.data.cost_comparison.savings}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return null;
  }
}

async function testHealthEndpoint() {
  console.log('\n🧪 Testing /v1/health...');
  
  try {
    const response = await axios.get(`${API_BASE}/health`);
    console.log('✅ Success! Health status:');
    console.log(`  Status: ${response.data.status}`);
    console.log(`  Ollama Models: ${response.data.ollama.models}`);
    console.log(`  Uptime: ${response.data.gateway.uptime.toFixed(0)}s`);
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return null;
  }
}

async function testMultipleModels() {
  console.log('\n🧪 Testing different models...');
  
  const models = ['mistral-7b', 'llama3.2', 'phi3-mini'];
  const results = [];
  
  for (const model of models) {
    console.log(`  Testing ${model}...`);
    try {
      const start = Date.now();
      const response = await axios.post(`${API_BASE}/chat/completions`, {
        model: model,
        messages: [{ role: 'user', content: 'Say "Hello" in one word.' }],
        temperature: 0.3,
        max_tokens: 10
      });
      const latency = Date.now() - start;
      
      results.push({
        model,
        success: true,
        latency,
        tokens: response.data.usage.total_tokens,
        response: response.data.choices[0].message.content.trim()
      });
    } catch (error) {
      results.push({ model, success: false, error: error.message });
    }
  }
  
  console.log('\n📊 Model Performance Results:');
  console.table(results.map(r => ({
    Model: r.model,
    Status: r.success ? '✅' : '❌',
    Latency: r.latency ? `${r.latency}ms` : 'N/A',
    Tokens: r.tokens || 'N/A',
    Response: r.response || 'N/A'
  })));
  
  return results;
}

async function testCostComparison() {
  console.log('\n💰 Cost Comparison Analysis');
  console.log('==========================');
  
  // Simulate 1000 requests
  const requests = 1000;
  const avgTokens = 500; // Average tokens per request
  
  const openaiCost = (requests * avgTokens / 1000) * 0.03; // $0.03 per 1K tokens
  const ourCost = (requests * avgTokens / 1000) * 0.000001; // Our cost
  
  console.log(`For ${requests.toLocaleString()} requests (${avgTokens} tokens avg):`);
  console.log(`  OpenAI Cost: €${openaiCost.toFixed(2)}`);
  console.log(`  Our Cost: €${ourCost.toFixed(6)}`);
  console.log(`  Savings: €${(openaiCost - ourCost).toFixed(2)}`);
  console.log(`  Savings %: ${((openaiCost - ourCost) / openaiCost * 100).toFixed(2)}%`);
  console.log(`\nMonthly Projection (50 agents, 24/7):`);
  console.log(`  OpenAI: €${(openaiCost * 30).toFixed(2)}/month`);
  console.log(`  Our API: €${(ourCost * 30).toFixed(2)}/month`);
  console.log(`  Yearly Savings: €${((openaiCost - ourCost) * 365).toFixed(2)}`);
}

async function runAllTests() {
  console.log('🚀 Starting Ollama API Gateway Tests');
  console.log('====================================\n');
  
  // Check if server is running
  try {
    await axios.get('http://localhost:3000/v1/health');
    console.log('✅ API Gateway is running\n');
  } catch (error) {
    console.log('❌ API Gateway not running. Starting tests anyway...\n');
  }
  
  await testHealthEndpoint();
  await testModelsEndpoint();
  await testChatCompletion();
  await testMultipleModels();
  await testUsageEndpoint();
  await testCostComparison();
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📋 Next Steps:');
  console.log('  1. Update your agents to use: http://localhost:3000/v1/chat/completions');
  console.log('  2. Replace OpenAI API key with: "empire_sk_test_123"');
  console.log('  3. Change model from "gpt-4" to "mistral-7b" or other Ollama models');
  console.log('  4. Monitor savings at: http://localhost:3000/admin');
}

// Run tests
runAllTests().catch(console.error);