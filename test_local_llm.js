// 🧠 TEST LOCAL LLM FOR SCRIPT GENERATION
// Uses Ollama with Llama 3.2 (2GB model)

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

console.log('🧠 TESTING LOCAL LLM (Ollama)');
console.log('==============================\n');

class LocalLLMTest {
  constructor() {
    this.model = 'llama3.2';
    this.availableModels = [
      'llama3.2',      // 2GB - best for scripts
      'mistral:7b',    // 4.4GB - better quality
      'phi3:mini',     // 2.2GB - fast
      'qwen2.5:7b'     // 4.7GB - good for coding
    ];
  }
  
  /**
   * Test if Ollama is running
   */
  async checkOllama() {
    console.log('🔍 Checking Ollama status...');
    
    try {
      const { stdout } = await execPromise('ollama --version');
      console.log(`   ✅ Ollama: ${stdout.trim()}`);
      
      // Check if model is available
      const { stdout: listStdout } = await execPromise('ollama list');
      const hasModel = listStdout.includes(this.model);
      
      if (hasModel) {
        console.log(`   ✅ Model available: ${this.model}`);
      } else {
        console.log(`   ⚠️  Model ${this.model} not found, using first available`);
        const firstModel = this.availableModels.find(m => listStdout.includes(m));
        if (firstModel) {
          this.model = firstModel;
          console.log(`   ✅ Using: ${this.model}`);
        }
      }
      
      return {
        available: true,
        version: stdout.trim(),
        model: this.model
      };
    } catch (error) {
      console.log(`   ❌ Ollama not running: ${error.message}`);
      console.log(`   💡 Start with: ollama serve`);
      return {
        available: false,
        error: error.message
      };
    }
  }
  
  /**
   * Generate a simple script using local LLM
   */
  async generateScript(prompt) {
    console.log(`\n📝 Generating script with ${this.model}...`);
    
    const fullPrompt = `You are a children's educational content creator. Write a short, engaging script for kids ages 6-8 about: ${prompt}

Requirements:
- 3-4 minutes long
- Simple language for kids
- Educational but fun
- Include a call to action
- Format as a video script

Script:`;
    
    try {
      // Use Ollama via command line
      const command = `echo "${fullPrompt.replace(/"/g, '\\"')}" | ollama run ${this.model}`;
      
      console.log(`   Prompt: ${prompt.substring(0, 50)}...`);
      console.log(`   Running (this may take 30-60 seconds)...`);
      
      const { stdout, stderr } = await execPromise(command, { timeout: 90000 }); // 90 second timeout
      
      if (stderr && !stderr.includes('warning')) {
        console.log(`   ⚠️  Warning: ${stderr.substring(0, 100)}`);
      }
      
      console.log(`\n✅ Script generated!`);
      console.log(`   Length: ${stdout.length} characters`);
      console.log(`   Model: ${this.model}`);
      
      return {
        success: true,
        script: stdout,
        length: stdout.length,
        model: this.model
      };
      
    } catch (error) {
      console.log(`   ❌ Generation failed: ${error.message}`);
      
      // Fallback to mock response for testing
      console.log(`   💡 Using mock response for testing`);
      
      const mockScript = `[UPBEAT MUSIC]

HOST: "Hi friends! Welcome to our show!

Today we're learning about ${prompt.toLowerCase()}!

Did you know that ${prompt.toLowerCase()} is really cool? Let me show you!

First, we need to get ready. You'll need:
1. A big smile
2. Curious eyes
3. Willingness to learn!

Now let's begin our adventure with ${prompt.toLowerCase()}!

[EXPLANATION SECTION]

So why is ${prompt.toLowerCase()} important? Because it helps us learn and grow!

You can try this at home too! Just remember to ask a grownup for help.

Thanks for watching! Don't forget to:
👍 LIKE this video
🔔 SUBSCRIBE for more fun
💬 COMMENT what you learned!

See you next time!"`;
      
      return {
        success: false,
        mock: true,
        script: mockScript,
        length: mockScript.length,
        error: error.message
      };
    }
  }
  
  /**
   * Test batch generation capability
   */
  async testBatchGeneration() {
    console.log('\n🔬 Testing batch generation capability...');
    
    const testPrompts = [
      'a volcano science experiment',
      'starting a lemonade stand business',
      'a story about a magical garden',
      'how to draw a friendly dinosaur'
    ];
    
    const results = [];
    
    for (let i = 0; i < Math.min(2, testPrompts.length); i++) { // Test 2 to save time
      console.log(`   ${i + 1}/${2}: ${testPrompts[i]}`);
      const result = await this.generateScript(testPrompts[i]);
      results.push({
        prompt: testPrompts[i],
        success: result.success,
        length: result.length,
        mock: result.mock || false
      });
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n📊 Batch Test Results:');
    results.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.prompt}: ${r.success ? '✅' : '❌'} ${r.mock ? '(mock)' : ''} ${r.length} chars`);
    });
    
    const successRate = results.filter(r => r.success && !r.mock).length / results.length;
    console.log(`   Success Rate: ${(successRate * 100).toFixed(0)}%`);
    
    return {
      total: results.length,
      successful: results.filter(r => r.success && !r.mock).length,
      mock: results.filter(r => r.mock).length,
      successRate
    };
  }
  
  /**
   * Calculate cost savings
   */
  calculateSavings() {
    console.log('\n💰 COST SAVINGS ANALYSIS\n');
    
    const monthlyCosts = {
      'ChatGPT Plus': 20,
      'ElevenLabs': 22,
      'Pictory AI': 29,
      'Canva Pro': 12,
      'Total External': 83
    };
    
    const localCosts = {
      'Ollama (Local)': 0,
      'Piper TTS (Local)': 0,
      'FFmpeg (Local)': 0,
      'Custom Graphics': 0,
      'Total Local': 0
    };
    
    console.log('Monthly Costs Comparison:');
    console.log('-------------------------');
    
    Object.entries(monthlyCosts).forEach(([service, cost]) => {
      console.log(`   ${service.padEnd(20)}: €${cost.toString().padStart(3)}`);
    });
    
    console.log('\nLocal Toolchain (One-time setup):');
    console.log('----------------------------------');
    
    Object.entries(localCosts).forEach(([tool, cost]) => {
      console.log(`   ${tool.padEnd(20)}: €${cost.toString().padStart(3)}`);
    });
    
    const monthlySavings = monthlyCosts.TotalExternal - localCosts.TotalLocal;
    const yearlySavings = monthlySavings * 12;
    
    console.log(`\n💵 Monthly Savings: €${monthlySavings}`);
    console.log(`💵 Yearly Savings: €${yearlySavings}`);
    console.log(`📈 5-year Savings: €${yearlySavings * 5}`);
    
    return {
      monthlySavings,
      yearlySavings,
      breakEven: 'Immediate (no monthly cost)'
    };
  }
  
  /**
   * Run complete test
   */
  async runTest() {
    console.log('🚀 STARTING LOCAL LLM TEST SUITE\n');
    
    try {
      // Step 1: Check Ollama
      const ollamaStatus = await this.checkOllama();
      
      if (!ollamaStatus.available) {
        console.log('\n❌ Ollama not available. Test stopped.');
        console.log('💡 Install: brew install ollama');
        console.log('💡 Then: ollama pull llama3.2');
        return { success: false };
      }
      
      // Step 2: Generate test script
      const scriptResult = await this.generateScript('science experiment for kids');
      
      // Step 3: Test batch capability
      const batchResult = await this.testBatchGeneration();
      
      // Step 4: Calculate savings
      const savings = this.calculateSavings();
      
      console.log('\n🎉 LOCAL LLM TEST COMPLETE!\n');
      
      console.log('📊 SUMMARY:');
      console.log(`   Ollama: ${ollamaStatus.available ? '✅ Running' : '❌ Stopped'}`);
      console.log(`   Model: ${ollamaStatus.model}`);
      console.log(`   Script Generation: ${scriptResult.success ? '✅ Working' : '❌ Failed'}`);
      console.log(`   Batch Success Rate: ${(batchResult.successRate * 100).toFixed(0)}%`);
      console.log(`   Monthly Savings: €${savings.monthlySavings}`);
      console.log(`   Yearly Savings: €${savings.yearlySavings}\n`);
      
      console.log('🚀 NEXT STEPS FOR IN-HOUSE TOOLCHAIN:');
      console.log('   1. Set up Ollama API server (REST endpoint)');
      console.log('   2. Install Piper TTS for local voice generation');
      console.log('   3. Build FFmpeg video pipeline');
      console.log('   4. Create custom graphics engine');
      console.log('   5. Integrate everything with n8n\n');
      
      console.log('🎯 POTENTIAL WITH IN-HOUSE TOOLS:');
      console.log('   • Unlimited script generation (no API limits)');
      console.log('   • Unlimited voiceovers (no character limits)');
      console.log('   • Unlimited video production (no render limits)');
      console.log('   • Zero monthly costs (€0 vs €103/month)');
      console.log('   • Complete control (no vendor lock-in)\n');
      
      return {
        success: true,
        ollama: ollamaStatus,
        scriptGeneration: scriptResult.success,
        batchCapability: batchResult.successRate,
        savings
      };
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Run test if executed directly
if (require.main === module) {
  const test = new LocalLLMTest();
  test.runTest();
}

module.exports = LocalLLMTest;