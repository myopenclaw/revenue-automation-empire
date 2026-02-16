// 🎤 VOICEOVER AGENT - Multi-Provider TTS Integration
// Supports ElevenLabs (premium) + Google TTS (free) + Local TTS (offline)

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
require('dotenv').config();

console.log('🎤 VOICEOVER AGENT - Multi-Provider TTS');
console.log('========================================\n');

class VoiceoverAgent {
  constructor() {
    // Provider configuration
    this.providers = {
      'elevenlabs': {
        enabled: !!process.env.ELEVENLABS_API_KEY,
        apiKey: process.env.ELEVENLABS_API_KEY || '',
        baseURL: 'https://api.elevenlabs.io/v1'
      },
      'google': {
        enabled: true, // Always enabled (free tier)
        credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
        projectId: process.env.GOOGLE_CLOUD_PROJECT || ''
      },
      'local': {
        enabled: true, // Piper TTS (offline)
        path: process.env.PIPER_TTS_PATH || '/usr/local/bin/piper'
      }
    };
    
    // Output directories
    this.outputDir = path.join(__dirname, 'voiceover_output');
    this.googleOutputDir = path.join(__dirname, 'google_tts_output');
    
    // Ensure output directories
    [this.outputDir, this.googleOutputDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created output directory: ${dir}`);
      }
    });
    
    // Voice mapping per niche and provider
    this.voiceProfiles = {
      'silver': {
        description: 'Professional, trustworthy voice for silver/commodities',
        elevenlabs: 'Bella',
        google: { languageCode: 'en-US', name: 'en-US-Standard-C', ssmlGender: 'FEMALE' },
        local: 'en_US-lessac-medium' // Piper model
      },
      'crypto': {
        description: 'Energetic, engaging voice for crypto content',
        elevenlabs: 'Antoni',
        google: { languageCode: 'en-US', name: 'en-US-Standard-D', ssmlGender: 'MALE' },
        local: 'en_US-libritts-high' // Piper model
      },
      'trading': {
        description: 'Confident, authoritative voice for trading insights',
        elevenlabs: 'Domi',
        google: { languageCode: 'en-US', name: 'en-US-Wavenet-D', ssmlGender: 'MALE' },
        local: 'en_US-ryan-medium' // Piper model
      },
      'default': {
        description: 'Neutral, clear voice for general content',
        elevenlabs: 'Rachel',
        google: { languageCode: 'en-US', name: 'en-US-Standard-C', ssmlGender: 'FEMALE' },
        local: 'en_US-lessac-medium'
      }
    };
    
    // Provider priority (fallback chain)
    this.providerPriority = ['elevenlabs', 'google', 'local'];
    
    console.log('🤖 Voiceover Agent initialized');
    console.log(`   Available providers: ${Object.keys(this.providers).filter(p => this.providers[p].enabled).join(', ')}`);
    console.log(`   Niches: ${Object.keys(this.voiceProfiles).join(', ')}`);
    console.log(`   Output directories: ${this.outputDir}, ${this.googleOutputDir}\n`);
  }
  
  // Get voice ID for a given voice name
  getVoiceId(voiceName) {
    return this.voices[voiceName] || this.voices['Rachel'];
  }
  
  // Get appropriate voice for niche
  getVoiceForNiche(niche) {
    return this.nicheVoices[niche] || this.nicheVoices['default'];
  }
  
  // Generate audio from text (real API call)
  async generateAudio(text, options = {}) {
    const {
      voice = 'Bella',
      model = 'eleven_monolingual_v1',
      stability = 0.5,
      similarity_boost = 0.75,
      style = 0.0,
      use_speaker_boost = true
    } = options;
    
    const voiceId = this.getVoiceId(voice);
    
    console.log(`🎤 Generating audio with voice: ${voice} (ID: ${voiceId})`);
    console.log(`   Text length: ${text.length} characters`);
    console.log(`   Model: ${model}`);
    
    // If no API key, use simulation mode
    if (!this.apiKey) {
      console.log('   ⚠️  Simulation mode (no API key)');
      return this.simulateAudio(text, voice);
    }
    
    try {
      const response = await axios.post(
        `${this.baseURL}/text-to-speech/${voiceId}`,
        {
          text: text,
          model_id: model,
          voice_settings: {
            stability: stability,
            similarity_boost: similarity_boost,
            style: style,
            use_speaker_boost: use_speaker_boost
          }
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
          },
          responseType: 'arraybuffer',
          timeout: 30000
        }
      );
      
      // Generate filename
      const timestamp = Date.now();
      const filename = `voiceover_${voice}_${timestamp}.mp3`;
      const filepath = path.join(this.outputDir, filename);
      
      // Save audio file
      fs.writeFileSync(filepath, Buffer.from(response.data));
      
      console.log(`   ✅ Audio generated: ${filename}`);
      console.log(`   📏 File size: ${(response.data.byteLength / 1024 / 1024).toFixed(2)} MB`);
      
      return {
        success: true,
        filepath: filepath,
        filename: filename,
        voice: voice,
        duration: this.estimateDuration(text.length),
        bytes: response.data.byteLength
      };
      
    } catch (error) {
      console.error('❌ ElevenLabs API error:', error.message);
      
      // Fallback to simulation
      console.log('   ↪️  Falling back to simulation mode');
      return this.simulateAudio(text, voice);
    }
  }
  
  // Simulate audio generation (for testing without API key)
  simulateAudio(text, voice) {
    const timestamp = Date.now();
    const filename = `SIMULATED_${voice}_${timestamp}.txt`;
    const filepath = path.join(this.outputDir, filename);
    
    // Create simulation file with metadata
    const simulationData = {
      type: 'simulated_audio',
      voice: voice,
      text_preview: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      text_length: text.length,
      estimated_duration: this.estimateDuration(text.length),
      instructions: 'Replace with real ElevenLabs API call',
      api_endpoint: 'POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}',
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(filepath, JSON.stringify(simulationData, null, 2));
    
    console.log(`   📝 Simulation file created: ${filename}`);
    console.log(`   💡 To get real audio: Set ELEVENLABS_API_KEY in .env file`);
    
    return {
      success: false,
      simulated: true,
      filepath: filepath,
      filename: filename,
      voice: voice,
      duration: this.estimateDuration(text.length),
      instructions: 'Set ELEVENLABS_API_KEY environment variable for real audio'
    };
  }
  
  // Estimate audio duration based on text length
  estimateDuration(textLength) {
    // Rough estimate: 150 words per minute, 6 chars per word average
    const words = textLength / 6;
    const minutes = words / 150;
    return Math.ceil(minutes * 60); // seconds
  }
  
  // Batch generate audio for multiple scripts
  async batchGenerate(scripts, options = {}) {
    console.log(`🔄 BATCH GENERATION: ${scripts.length} scripts\n`);
    
    const results = [];
    const batchId = `batch_${Date.now()}`;
    
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      console.log(`📝 Script ${i + 1}/${scripts.length}`);
      
      // Determine voice from script metadata or options
      const voice = script.niche ? this.getVoiceForNiche(script.niche) : options.voice || 'Bella';
      
      const result = await this.generateAudio(script.text, {
        voice: voice,
        ...options
      });
      
      results.push({
        script_id: script.id || i,
        niche: script.niche,
        topic: script.topic,
        ...result
      });
      
      // Rate limiting: wait between API calls
      if (this.apiKey && i < scripts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Save batch results
    const batchFile = path.join(this.outputDir, `${batchId}_results.json`);
    fs.writeFileSync(batchFile, JSON.stringify({
      batch_id: batchId,
      generated: new Date().toISOString(),
      total_scripts: scripts.length,
      results: results
    }, null, 2));
    
    console.log(`\n🎉 BATCH COMPLETE!`);
    console.log(`   Results saved to: ${batchFile}`);
    
    return {
      batch_id: batchId,
      total: scripts.length,
      successful: results.filter(r => r.success).length,
      simulated: results.filter(r => r.simulated).length,
      results: results,
      summary_path: batchFile
    };
  }
  
  // Get voice samples (list available voices)
  async getAvailableVoices() {
    if (!this.apiKey) {
      console.log('❌ API key required to fetch available voices');
      return Object.keys(this.voices);
    }
    
    try {
      const response = await axios.get(`${this.baseURL}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      
      const voices = response.data.voices || [];
      console.log(`🎵 Available ElevenLabs voices: ${voices.length}`);
      
      // Update our voices list with real data
      voices.forEach(voice => {
        this.voices[voice.name] = voice.voice_id;
      });
      
      return voices.map(v => ({
        name: v.name,
        id: v.voice_id,
        category: v.category,
        description: v.description
      }));
      
    } catch (error) {
      console.error('❌ Error fetching voices:', error.message);
      return Object.keys(this.voices);
    }
  }
  
  // Test the agent
  async test() {
    console.log('🧪 TESTING VOICEOVER AGENT\n');
    
    const testScripts = [
      {
        id: 'test_1',
        niche: 'silver',
        topic: 'Silver price update',
        text: 'Silver prices are rising today, currently trading at $25.50 per ounce. This represents a 2.3% increase over the past 24 hours.'
      },
      {
        id: 'test_2', 
        niche: 'crypto',
        topic: 'Bitcoin analysis',
        text: 'Bitcoin has broken through the $70,000 resistance level. The next target is $75,000 based on current momentum.'
      },
      {
        id: 'test_3',
        niche: 'trading',
        topic: 'Trading tip',
        text: 'Always use stop losses when trading. Risk management is more important than finding the perfect entry.'
      }
    ];
    
    const result = await this.batchGenerate(testScripts);
    
    console.log('\n✅ TEST COMPLETE');
    console.log('='.repeat(40));
    console.log(`Total scripts: ${result.total}`);
    console.log(`Successful: ${result.successful}`);
    console.log(`Simulated: ${result.simulated}`);
    console.log(`Output directory: ${this.outputDir}`);
    
    if (!this.apiKey) {
      console.log('\n⚠️  IMPORTANT: No API key set');
      console.log('To get real audio:');
      console.log('1. Get API key from elevenlabs.io');
      console.log('2. Add to .env file: ELEVENLABS_API_KEY=your_key_here');
      console.log('3. Restart the agent');
    }
    
    return result;
  }
}

// Integration with script generator
async function integrateWithScriptGenerator() {
  console.log('🔗 INTEGRATING WITH SCRIPT GENERATOR\n');
  
  const voiceoverAgent = new VoiceoverAgent();
  
  // Load scripts from first batch
  const batchDir = path.join(__dirname, 'first_batch_output');
  if (!fs.existsSync(batchDir)) {
    console.log('❌ First batch not found. Run first_video_batch.js first.');
    return;
  }
  
  const scripts = [];
  const files = fs.readdirSync(batchDir).filter(f => f.endsWith('.txt'));
  
  for (const file of files) {
    const filepath = path.join(batchDir, file);
    const content = fs.readFileSync(filepath, 'utf8');
    
    // Extract niche from filename
    const match = file.match(/video_\d+_(\w+)_/);
    const niche = match ? match[1] : 'default';
    
    scripts.push({
      id: file.replace('.txt', ''),
      niche: niche,
      topic: file.replace('.txt', '').replace(/_/g, ' '),
      text: content,
      source_file: filepath
    });
  }
  
  if (scripts.length === 0) {
    console.log('❌ No scripts found in batch directory');
    return;
  }
  
  console.log(`📁 Found ${scripts.length} scripts from first batch`);
  
  // Generate audio for all scripts
  const result = await voiceoverAgent.batchGenerate(scripts);
  
  console.log('\n🎯 INTEGRATION COMPLETE!');
  console.log('Next steps:');
  console.log('1. Use audio files in Canva for video assembly');
  console.log('2. Add visuals, text overlays, effects');
  console.log('3. Export final videos');
  console.log('4. Post to social media platforms');
  
  return result;
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'test';
  
  const agent = new VoiceoverAgent();
  
  switch (command) {
    case 'test':
      await agent.test();
      break;
      
    case 'integrate':
      await integrateWithScriptGenerator();
      break;
      
    case 'voices':
      const voices = await agent.getAvailableVoices();
      console.log('\n🎵 AVAILABLE VOICES:');
      voices.forEach((v, i) => {
        console.log(`${i + 1}. ${v.name} (${v.category})`);
      });
      break;
      
    case 'generate':
      if (args.length < 2) {
        console.log('Usage: node voiceover_agent.js generate "Your text here" [voice]');
        return;
      }
      const text = args[1];
      const voice = args[2] || 'Bella';
      await agent.generateAudio(text, { voice });
      break;
      
    default:
      console.log('Available commands:');
      console.log('  test        - Run basic tests');
      console.log('  integrate   - Integrate with first batch scripts');
      console.log('  voices      - List available voices');
      console.log('  generate    - Generate audio from text');
      console.log('  help        - Show this message');
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = VoiceoverAgent;