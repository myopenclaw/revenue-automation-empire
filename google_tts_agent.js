// 🎤 GOOGLE CLOUD TTS AGENT
// Replacement for ElevenLabs with no API key issues

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class GoogleTTSAgent {
  constructor() {
    this.name = 'Google Cloud TTS Agent';
    this.version = '1.0.0';
    this.status = 'ready';
    this.usageThisMonth = 0;
    this.freeTierLimit = 1000000; // 1M characters free/month
    
    // Voice mapping per niche
    this.voiceMap = {
      'silver': {
        languageCode: 'en-US',
        name: 'en-US-Standard-C',
        ssmlGender: 'FEMALE',
        description: 'Clear, professional female voice for silver/commodities'
      },
      'crypto': {
        languageCode: 'en-US', 
        name: 'en-US-Standard-D',
        ssmlGender: 'MALE',
        description: 'Authoritative male voice for crypto/trading'
      },
      'trading': {
        languageCode: 'en-US',
        name: 'en-US-Wavenet-D',
        ssmlGender: 'MALE',
        description: 'Premium neural voice for trading insights'
      },
      'default': {
        languageCode: 'en-US',
        name: 'en-US-Standard-C',
        ssmlGender: 'FEMALE'
      }
    };
    
    // Output directory
    this.outputDir = path.join(__dirname, 'google_tts_output');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    console.log(`🎤 ${this.name} v${this.version} initialized`);
    console.log(`📁 Output directory: ${this.outputDir}`);
  }
  
  /**
   * Get voice configuration for a niche
   */
  getVoiceForNiche(niche = 'default') {
    return this.voiceMap[niche.toLowerCase()] || this.voiceMap.default;
  }
  
  /**
   * Generate audio using Google Cloud TTS
   * Uses curl command with gcloud authentication
   */
  async generateAudio(text, options = {}) {
    const {
      niche = 'default',
      outputFilename = null,
      speakingRate = 1.0,
      pitch = 0.0
    } = options;
    
    const voice = this.getVoiceForNiche(niche);
    const timestamp = Date.now();
    const filename = outputFilename || `audio_${niche}_${timestamp}.mp3`;
    const outputPath = path.join(this.outputDir, filename);
    
    console.log(`🔧 Generating audio for ${niche} niche...`);
    console.log(`   Text length: ${text.length} characters`);
    console.log(`   Voice: ${voice.name} (${voice.ssmlGender})`);
    console.log(`   Output: ${filename}`);
    
    // Update usage tracking
    this.usageThisMonth += text.length;
    this.logUsage();
    
    try {
      // Prepare the request JSON
      const requestJson = {
        input: { text: text },
        voice: voice,
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: speakingRate,
          pitch: pitch
        }
      };
      
      // Create temporary request file
      const requestFile = path.join(this.outputDir, `request_${timestamp}.json`);
      fs.writeFileSync(requestFile, JSON.stringify(requestJson, null, 2));
      
      // Build curl command with gcloud authentication
      const curlCommand = `curl -s -X POST \\
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \\
  -H "Content-Type: application/json" \\
  --data @${requestFile} \\
  "https://texttospeech.googleapis.com/v1/text:synthesize" \\
  | python3 -c "import sys, json, base64; data=json.load(sys.stdin); print(base64.b64decode(data['audioContent']).hex())" \\
  | xxd -r -p > "${outputPath}"`;
      
      console.log(`   Command: curl to Google TTS API`);
      
      // Execute the command
      const { stdout, stderr } = await execPromise(curlCommand, { 
        shell: true,
        timeout: 30000 // 30 second timeout
      });
      
      // Clean up temp file
      fs.unlinkSync(requestFile);
      
      // Check if file was created
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`✅ Audio generated successfully!`);
        console.log(`   File size: ${(stats.size / 1024).toFixed(2)} KB`);
        console.log(`   Saved to: ${outputPath}`);
        
        return {
          success: true,
          filepath: outputPath,
          filename: filename,
          size: stats.size,
          voice: voice.name,
          characters: text.length,
          niche: niche
        };
      } else {
        console.error(`❌ Audio file not created`);
        return {
          success: false,
          error: 'Audio file not generated',
          command: curlCommand
        };
      }
      
    } catch (error) {
      console.error(`❌ Error generating audio:`, error.message);
      
      // Fallback: Create instructions for manual setup
      const fallbackFile = path.join(this.outputDir, 'SETUP_INSTRUCTIONS.txt');
      const instructions = this.getSetupInstructions();
      fs.writeFileSync(fallbackFile, instructions);
      
      console.log(`📄 Setup instructions saved to: ${fallbackFile}`);
      
      return {
        success: false,
        error: error.message,
        fallback: 'Manual setup required',
        instructionsFile: fallbackFile
      };
    }
  }
  
  /**
   * Generate audio for multiple scripts (batch processing)
   */
  async generateBatch(scripts) {
    console.log(`🔄 Processing batch of ${scripts.length} scripts...`);
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      console.log(`\n📝 Script ${i + 1}/${scripts.length}: ${script.niche}`);
      
      try {
        const result = await this.generateAudio(script.text, {
          niche: script.niche,
          outputFilename: `batch_${Date.now()}_${i}_${script.niche}.mp3`
        });
        
        if (result.success) {
          results.push(result);
          console.log(`   ✅ Success`);
        } else {
          errors.push({ script: script, error: result.error });
          console.log(`   ❌ Failed: ${result.error}`);
        }
        
        // Small delay between requests
        if (i < scripts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (error) {
        errors.push({ script: script, error: error.message });
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    console.log(`\n📊 Batch complete:`);
    console.log(`   ✅ Success: ${results.length}`);
    console.log(`   ❌ Errors: ${errors.length}`);
    
    // Save batch results
    const batchReport = {
      timestamp: new Date().toISOString(),
      totalScripts: scripts.length,
      successful: results.length,
      failed: errors.length,
      results: results.map(r => ({
        file: r.filename,
        niche: r.niche,
        size: r.size,
        characters: r.characters
      })),
      errors: errors.map(e => ({
        niche: e.script.niche,
        error: e.error
      })),
      usage: {
        charactersThisBatch: results.reduce((sum, r) => sum + r.characters, 0),
        charactersThisMonth: this.usageThisMonth,
        freeTierRemaining: Math.max(0, this.freeTierLimit - this.usageThisMonth)
      }
    };
    
    const reportFile = path.join(this.outputDir, `batch_report_${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(batchReport, null, 2));
    
    console.log(`📄 Batch report saved to: ${reportFile}`);
    
    return {
      success: results.length > 0,
      results: results,
      errors: errors,
      reportFile: reportFile
    };
  }
  
  /**
   * Log current usage statistics
   */
  logUsage() {
    const percentUsed = (this.usageThisMonth / this.freeTierLimit) * 100;
    const remaining = Math.max(0, this.freeTierLimit - this.usageThisMonth);
    
    console.log(`📊 Usage Statistics:`);
    console.log(`   This month: ${this.usageThisMonth.toLocaleString()} characters`);
    console.log(`   Free tier: ${percentUsed.toFixed(1)}% used`);
    console.log(`   Remaining: ${remaining.toLocaleString()} characters free`);
    
    if (percentUsed > 80) {
      console.warn(`⚠️  Approaching free tier limit!`);
    }
    
    if (percentUsed > 100) {
      const extraChars = this.usageThisMonth - this.freeTierLimit;
      const cost = (extraChars / 1000000) * 4.00; // $4 per 1M for standard voices
      console.warn(`💰 Estimated cost: $${cost.toFixed(2)}`);
    }
    
    // Save usage log
    const usageLog = {
      date: new Date().toISOString(),
      charactersThisMonth: this.usageThisMonth,
      percentUsed: percentUsed,
      freeTierRemaining: remaining
    };
    
    const logFile = path.join(this.outputDir, 'usage_log.json');
    const logData = fs.existsSync(logFile) 
      ? JSON.parse(fs.readFileSync(logFile, 'utf8'))
      : { monthlyLogs: [] };
    
    logData.monthlyLogs.push(usageLog);
    fs.writeFileSync(logFile, JSON.stringify(logData, null, 2));
  }
  
  /**
   * Get setup instructions for manual configuration
   */
  getSetupInstructions() {
    return `🎤 GOOGLE CLOUD TTS SETUP INSTRUCTIONS
=========================================

This agent requires Google Cloud Text-to-Speech API setup.

STEP 1: CREATE GOOGLE CLOUD ACCOUNT
-----------------------------------
1. Go to: https://cloud.google.com/free
2. Click "Get started for free"
3. Sign in with Google account
4. Accept $300 free credit offer
5. Verify account (credit card required for verification only)

STEP 2: ENABLE TEXT-TO-SPEECH API
---------------------------------
1. Go to: https://console.cloud.google.com/apis/library/texttospeech.googleapis.com
2. Click "Enable"
3. Wait for activation (~30 seconds)

STEP 3: INSTALL AND AUTHENTICATE
--------------------------------
1. Install Google Cloud SDK:
   brew install --cask google-cloud-sdk

2. Initialize gcloud:
   gcloud init

3. Authenticate:
   gcloud auth application-default login

4. Set project (if needed):
   gcloud config set project YOUR_PROJECT_ID

STEP 4: TEST THE AGENT
----------------------
1. Run the agent:
   node google_tts_agent.js test

2. Or integrate with voiceover system:
   const tts = new GoogleTTSAgent();
   tts.generateAudio("Test text", { niche: "silver" });

TROUBLESHOOTING:
---------------
- If "gcloud command not found": Install Google Cloud SDK
- If authentication errors: Run "gcloud auth login"
- If quota errors: Check usage at https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/quotas

COST INFORMATION:
----------------
- Free tier: 1 million characters/month
- After free: $4.00 per 1 million characters (Standard voices)
- Our estimated usage: ~40,000 characters/day
- Monthly cost: ~$1-5 after free tier

SUPPORT:
-------
- Google Cloud Docs: https://cloud.google.com/text-to-speech/docs
- Community: https://stackoverflow.com/questions/tagged/google-text-to-speech

Need help? The agent will work in simulation mode until setup is complete.`;
  }
  
  /**
   * Test function - generates a test audio file
   */
  async test() {
    console.log(`🧪 Running Google TTS Agent test...`);
    
    const testText = "This is a test of Google Cloud Text-to-Speech integration for the video empire. Silver prices are rising today.";
    
    const result = await this.generateAudio(testText, {
      niche: 'silver',
      outputFilename: 'test_audio.mp3'
    });
    
    if (result.success) {
      console.log(`\n🎉 TEST SUCCESSFUL!`);
      console.log(`   Audio saved to: ${result.filepath}`);
      console.log(`   Play with: open "${result.filepath}"`);
      console.log(`\n🚀 Ready for production use!`);
    } else {
      console.log(`\n⚠️ TEST FAILED - Setup required`);
      console.log(`   Error: ${result.error}`);
      console.log(`\n📄 Please follow setup instructions above.`);
    }
    
    return result;
  }
  
  /**
   * Simulation mode for testing without API
   */
  simulateAudio(text, options = {}) {
    const { niche = 'default', outputFilename = null } = options;
    const timestamp = Date.now();
    const filename = outputFilename || `SIMULATED_${niche}_${timestamp}.txt`;
    const outputPath = path.join(this.outputDir, filename);
    
    const simulation = {
      simulated: true,
      text: text,
      length: text.length,
      niche: niche,
      voice: this.getVoiceForNiche(niche).name,
      filepath: outputPath,
      instructions: 'This is a simulation. Real audio requires Google Cloud TTS setup.'
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(simulation, null, 2));
    
    console.log(`🎭 Simulation created: ${filename}`);
    console.log(`   Real audio would use: ${this.getVoiceForNiche(niche).name}`);
    console.log(`   Characters: ${text.length}`);
    
    return simulation;
  }
}

// Command line interface
if (require.main === module) {
  const agent = new GoogleTTSAgent();
  
  const args = process.argv.slice(2);
  const command = args[0] || 'test';
  
  switch (command) {
    case 'test':
      agent.test();
      break;
      
    case 'simulate':
      const text = args[1] || 'Test simulation text.';
      agent.simulateAudio(text, { niche: args[2] || 'default' });
      break;
      
    case 'batch':
      // Example batch - in real use, load from files
      const scripts = [
        { text: 'Silver update: Prices steady.', niche: 'silver' },
        { text: 'Bitcoin breaking resistance.', niche: 'crypto' },
        { text: 'Trading strategy working.', niche: 'trading' }
      ];
      agent.generateBatch(scripts);
      break;
      
    case 'usage':
      agent.logUsage();
      break;
      
    case 'setup':
      console.log(agent.getSetupInstructions());
      break;
      
    default:
      console.log(`Usage: node google_tts_agent.js [command]`);
      console.log(`Commands:`);
      console.log(`  test        - Test audio generation`);
      console.log(`  simulate    - Create simulation file`);
      console.log(`  batch       - Process batch of scripts`);
      console.log(`  usage       - Show usage statistics`);
      console.log(`  setup       - Show setup instructions`);
      break;
  }
}

module.exports = GoogleTTSAgent;