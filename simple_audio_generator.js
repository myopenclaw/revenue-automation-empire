// 🎤 SIMPLE AUDIO GENERATOR - Node.js versie
// Ik maak het makkelijk voor je

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

console.log('🎤 GENERATING AUDIO FOR VIDEO 1');
console.log('='.repeat(40));

// Jouw script
const script = `🎯 Silver Price Update Today

💰 Current Price: $25.16 USD/oz
📈 24h Change: -0.86%%
📊 7d Change: -2.86%%

💡 Key Insight:
Industrial demand from solar panels rising 15% YoY

🚀 What to Watch:
- CPI inflation data
- Fed interest rate decisions

📈 Technical Levels:
Support: $22.85
Resistance: $28.27

🔔 Follow for daily updates!
#Silver #Commodities #PreciousMetals`;

console.log(`📝 Script length: ${script.length} characters`);
console.log(`📋 Preview: ${script.substring(0, 80)}...`);
console.log();

// Output directory
const outputDir = path.join(__dirname, 'voiceover_output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Created directory: ${outputDir}`);
}

async function generateAudio() {
  console.log('🔧 TWO OPTIONS:');
  console.log();
  
  // Option 1: Manual instructions (simplest)
  console.log('1. 🖱️  MANUAL (Recommended - 3 minutes):');
  console.log('   a. Go to: https://elevenlabs.io/speech-synthesis');
  console.log('   b. Paste this script:');
  console.log('      ' + script.substring(0, 100).replace(/\n/g, ' ') + '...');
  console.log('   c. Click "Generate"');
  console.log('   d. Download MP3');
  console.log('   e. Save to:', outputDir);
  console.log();
  
  // Option 2: Try curl command
  console.log('2. ⚡ QUICK COMMAND (Terminal):');
  console.log('   Copy and paste this in Terminal:');
  console.log();
  
  const curlCommand = `curl -X POST \\
  "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL" \\
  -H "xi-api-key: sk_3408987d6c0fa438dec4b179171b76a1a73a8ff7647d7502" \\
  -H "Content-Type: application/json" \\
  -H "Accept: audio/mpeg" \\
  -d '{
    "text": "${script.replace(/\n/g, ' ').replace(/"/g, '\\"')}",
    "model_id": "eleven_monolingual_v1",
    "voice_settings": {
      "stability": 0.5,
      "similarity_boost": 0.75
    }
  }' \\
  --output "${path.join(outputDir, 'video_1_audio.mp3")}"`;
  
  console.log(curlCommand);
  console.log();
  
  // Save everything to files
  const timestamp = Date.now();
  
  // Save script
  const scriptFile = path.join(outputDir, `video_1_script_${timestamp}.txt`);
  fs.writeFileSync(scriptFile, script);
  console.log(`📄 Script saved to: ${scriptFile}`);
  
  // Save instructions
  const instructions = `🎬 VIDEO 1 - COMPLETE INSTRUCTIONS
================================

📝 SCRIPT:
${script}

🎤 AUDIO GENERATION:
1. Go to: https://elevenlabs.io/speech-synthesis
2. Paste the entire script above
3. Select voice: "Bella"
4. Click "Generate"
5. Download MP3 file
6. Save to this folder: ${outputDir}

🎬 CANVA VIDEO:
1. Go to: https://canva.com
2. Create design → Video → 9:16
3. Upload the MP3 audio
4. Add text overlays (use script as guide)
5. Add background visuals
6. Export as MP4

📱 TIKTOK UPLOAD:
1. Open TikTok app or tiktok.com/upload
2. Upload the MP4 video
3. Add caption (copy from script)
4. Add hashtags: #Silver #Commodities #PreciousMetals
5. Click "Post"

⏰ TIME ESTIMATE: 15-20 minutes total
✅ GOAL: 1 video posted today!

Need help? Just ask! 🚀`;

  const instructionsFile = path.join(outputDir, `INSTRUCTIONS_${timestamp}.txt`);
  fs.writeFileSync(instructionsFile, instructions);
  
  console.log(`📋 Instructions saved to: ${instructionsFile}`);
  console.log();
  
  // Try the curl command
  console.log('🔄 Trying curl command...');
  try {
    // Simplify the command for testing
    const testCommand = `curl -X GET "https://api.elevenlabs.io/v1/voices" \\
      -H "xi-api-key: sk_3408987d6c0fa438dec4b179171b76a1a73a8ff7647d7502" \\
      --silent | head -c 200`;
    
    const { stdout, stderr } = await execPromise(testCommand, { timeout: 10000 });
    
    if (stdout.includes('voices') || stdout.includes('Bella')) {
      console.log('✅ API key works for reading voices!');
      console.log('   Now trying to generate audio...');
      
      // Try actual TTS with shorter text
      const shortText = "Silver prices update test.";
      const simpleCurl = `curl -X POST \\
        "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL" \\
        -H "xi-api-key: sk_3408987d6c0fa438dec4b179171b76a1a73a8ff7647d7502" \\
        -H "Content-Type: application/json" \\
        -H "Accept: audio/mpeg" \\
        -d '{"text": "${shortText}", "model_id": "eleven_monolingual_v1"}' \\
        --output "${path.join(outputDir, 'test_audio.mp3")}" 2>&1`;
      
      try {
        const ttsResult = await execPromise(simpleCurl, { timeout: 15000 });
        if (fs.existsSync(path.join(outputDir, 'test_audio.mp3'))) {
          const stats = fs.statSync(path.join(outputDir, 'test_audio.mp3'));
          console.log(`✅ Audio generated! File size: ${stats.size} bytes`);
          console.log(`🔊 Test file: ${path.join(outputDir, 'test_audio.mp3')}`);
        } else {
          console.log('⚠️  Audio generation might need web UI activation first');
        }
      } catch (ttsError) {
        console.log('⚠️  TTS API needs activation via web UI');
      }
      
    } else {
      console.log('❌ API key issue detected');
      console.log('💡 Solution: Use the manual method (Option 1)');
    }
    
  } catch (error) {
    console.log('⚠️  Curl test failed:', error.message);
    console.log('💡 Use the manual method - it always works!');
  }
  
  console.log();
  console.log('='.repeat(40));
  console.log('🎯 NEXT STEP:');
  console.log('Open the instructions file and follow step-by-step:');
  console.log(`open "${instructionsFile}"`);
  console.log();
  console.log('🚀 YOU CAN DO THIS! Just follow the instructions.');
}

generateAudio().catch(console.error);