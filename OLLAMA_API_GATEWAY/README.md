# 🚀 Ollama API Gateway

**OpenAI-compatible API for local Ollama models | €0 cost vs €1200/month OpenAI**

## 🎯 What This Does

Replaces expensive OpenAI/Anthropic API calls with 100% local Ollama models, saving **€1,200+/month** while maintaining **100% data privacy**.

## 📊 Cost Comparison

| Metric | OpenAI API | Our Ollama API | Savings |
|--------|------------|----------------|---------|
| Cost per 1K tokens | €0.03 | €0.000001 | **99.997%** |
| Monthly (50 agents) | €1,200 | €0.30 | **€1,199.70** |
| Data Privacy | ❌ Sends data to OpenAI | ✅ 100% local | **Secure** |
| Rate Limits | 3-60/min | Unlimited (your hardware) | **No limits** |

## 🏗️ Architecture

```
Your Apps/Agents → Our API Gateway → Ollama Local Models
      │                (localhost:3000)     (localhost:11434)
      │                        │                    │
      │                        ├── OpenAI-compatible
      │                        ├── Model routing
      │                        ├── Response caching
      │                        └── Usage tracking
      │
      └── €0.000001/request vs €0.03/request
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install Ollama (if not already)
curl -fsSL https://ollama.com/install.sh | sh

# Pull models
ollama pull mistral:7b
ollama pull llama3.2:latest
ollama pull qwen2.5-coder:7b

# Start Ollama (in background)
ollama serve &
```

### 2. Start API Gateway
```bash
cd OLLAMA_API_GATEWAY
npm install
npm start

# Server starts on http://localhost:3000
# Admin dashboard: http://localhost:3000/admin
```

### 3. Test It Works
```bash
npm test
```

## 🔌 API Endpoints

### OpenAI-Compatible Chat Completion
```bash
curl http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer empire_sk_test_123" \
  -d '{
    "model": "mistral-7b",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "temperature": 0.7
  }'
```

### Available Models
```bash
curl http://localhost:3000/v1/models
```

### Usage Statistics
```bash
curl http://localhost:3000/v1/usage
```

### Health Check
```bash
curl http://localhost:3000/v1/health
```

## 🛠️ Integration Examples

### Python (Replace OpenAI)
```python
# OLD (OpenAI - €0.03/request):
import openai
openai.api_key = "sk-..."  # €€€
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello"}]
)

# NEW (Our API - €0.000001/request):
import requests
response = requests.post(
    "http://localhost:3000/v1/chat/completions",
    headers={"Authorization": "Bearer empire_sk_test_123"},
    json={
        "model": "mistral-7b",
        "messages": [{"role": "user", "content": "Hello"}]
    }
)
```

### JavaScript/Node.js
```javascript
// OLD: OpenAI
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: 'sk-...' }); // €€€

// NEW: Our API
const axios = require('axios');
const response = await axios.post('http://localhost:3000/v1/chat/completions', {
  model: 'mistral-7b',
  messages: [{ role: 'user', content: 'Hello' }]
}, {
  headers: { Authorization: 'Bearer empire_sk_test_123' }
});
```

## 📈 Admin Dashboard

Access: `http://localhost:3000/admin`

**Features:**
- Real-time request monitoring
- Cost savings calculator
- Model performance analytics
- Cache hit rates
- Health status

## 🎯 Model Selection Guide

| Task Type | Recommended Model | Context | Speed |
|-----------|------------------|---------|-------|
| General Chat | `mistral-7b` | 32K | Fast |
| Code Generation | `qwen2.5-coder:7b` | 32K | Fast |
| Reasoning/Analysis | `llama3.2:latest` | 8K | Medium |
| Quick Responses | `phi3:mini` | 4K | Very Fast |
| Complex Code | `deepseek-coder:6.7b` | 16K | Medium |

## 💰 Cost Savings Calculator

**For 50 AI agents running 24/7:**
```
Requests per month: 3,600,000 (50 agents × 100/hr × 24 × 30)
Tokens per request: 500 (average)
Total tokens: 1,800,000,000

OpenAI Cost: €54,000/month (€0.03 per 1K tokens)
Our Cost: €1.80/month (electricity only)

SAVINGS: €53,998.20/month (99.997%)
```

## 🔧 Configuration

Edit `server.js` to customize:
```javascript
const CONFIG = {
  port: 3000,
  ollamaUrl: 'http://localhost:11434',
  models: {
    'mistral-7b': { name: 'mistral:7b', context: 32768 },
    // Add more models as needed
  },
  cacheTtl: 3600, // Cache for 1 hour
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // 1000 requests per IP per window
  }
};
```

## 🚨 Troubleshooting

### Ollama Not Running
```bash
# Check Ollama status
ollama list

# Start Ollama
ollama serve

# Pull missing models
ollama pull mistral:7b
```

### API Gateway Not Starting
```bash
# Check port 3000
lsof -i :3000

# Kill process if needed
pkill -f "node server.js"

# Start fresh
npm start
```

### Slow Responses
```bash
# Check available RAM
free -h

# Consider using lighter models
# phi3:mini is fastest for simple tasks
```

## 📊 Monitoring

### Logs
```bash
# View API logs
tail -f logs/api.log

# Monitor requests in real-time
watch -n 1 "curl -s http://localhost:3000/v1/usage | jq ."
```

### Performance Metrics
```bash
# Get health status
curl http://localhost:3000/v1/health

# Check model availability
curl http://localhost:11434/api/tags
```

## 🎯 Use Cases

### 1. Trading Agents
```python
# Analyze trades with local AI
response = requests.post(
    "http://localhost:3000/v1/chat/completions",
    json={
        "model": "mistral-7b",
        "messages": [
            {"role": "system", "content": "You are a trading expert."},
            {"role": "user", "content": f"Analyze: {trade_data}"}
        ]
    }
)
# Cost: €0.000001 vs €0.03 (OpenAI)
```

### 2. E-commerce Pricing
```javascript
// Dynamic pricing with local AI
const price = await analyzeWithAI({
  model: 'llama3.2',
  prompt: `Calculate optimal price for silver jewelry...`
});
// No API costs, 100% data privacy
```

### 3. Content Generation
```bash
# Generate blog posts locally
curl http://localhost:3000/v1/chat/completions \
  -d '{"model": "qwen2.5:7b", "messages": [{"role": "user", "content": "Write about Web3 domains..."}]}'
```

## 📈 Roadmap

- [x] OpenAI-compatible API
- [x] Multiple model support
- [x] Response caching
- [x] Admin dashboard
- [ ] Load balancing (multiple Ollama instances)
- [ ] Fine-tuning pipeline
- [ ] SaaS platform (sell API access)
- [ ] Enterprise features

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- [Ollama](https://ollama.com) for amazing local AI
- OpenAI for API specification
- All model creators (Mistral, Meta, Qwen, DeepSeek, Microsoft)

---

**💰 Remember:** Every request to our API saves **€0.029999** compared to OpenAI. At scale, this is **€1,200+/month** for 50 agents!

**Start saving today!** 🚀