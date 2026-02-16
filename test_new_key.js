// 🧪 TEST NIEUWE ELEVENLABS API KEY
// Direct test with new key

const axios = require('axios');

// NIEUWE KEY
const NEW_API_KEY = 'sk_3408987d6c0fa438dec4b179171b76a1a73a8ff7647d7502';
const BASE_URL = 'https://api.elevenlabs.io/v1';

console.log('🔑 TESTING NEW ELEVENLABS API KEY');
console.log('==================================\n');
console.log('Key:', NEW_API_KEY.substring(0, 10) + '...');
console.log('Length:', NEW_API_KEY.length);
console.log('Starts with sk_:', NEW_API_KEY.startsWith('sk_'));
console.log('');

async function comprehensiveTest() {
  console.log('📊 COMPREHENSIVE API TEST\n');
  
  // Test 1: Basic authentication
  console.log('1. 🔐 Testing authentication...');
  try {
    const userResponse = await axios.get(`${BASE_URL}/user`, {
      headers: { 'xi-api-key': NEW_API_KEY },
      timeout: 10000
    });
    console.log('   ✅ Authentication SUCCESS');
    console.log('   Tier:', userResponse.data.subscription?.tier || 'Free');
    console.log('   Character limit:', userResponse.data.subscription?.character_limit || '10,000');
    console.log('   Characters used:', userResponse.data.subscription?.character_count || '0');
  } catch (error) {
    console.log('   ❌ Authentication FAILED:', error.message);
    console.log('   Status:', error.response?.status);
    return false;
  }
  
  // Test 2: List voices
  console.log('\n2. 🎵 Testing voices endpoint...');
  try {
    const voicesResponse = await axios.get(`${BASE_URL}/voices`, {
      headers: { 'xi-api-key': NEW_API_KEY },
      timeout: 10000
    });
    console.log('   ✅ Voices SUCCESS');
    console.log('   Available voices:', voicesResponse.data.voices?.length || 0);
    
    // Show first 3 voices
    if (voicesResponse.data.voices && voicesResponse.data.voices.length > 0) {
      console.log('   Sample voices:');
      voicesResponse.data.voices.slice(0, 3).forEach((voice, i) => {
        console.log(`     ${i+1}. ${voice.name} (${voice.category})`);
      });
    }
  } catch (error) {
    console.log('   ❌ Voices FAILED:', error.message);
    return false;
  }
  
  // Test 3: Text-to-speech
  console.log('\n3. 🎤 Testing text-to-speech...');
  try {
    const testText = 'This is a test of the new API key. Silver prices are rising.';
    const voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Bella
    
    console.log('   Text:', testText);
    console.log('   Voice: Bella');
    
    const ttsResponse = await axios.post(
      `${BASE_URL}/text-to-speech/${voiceId}`,
      {
        text: testText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      },
      {
        headers: {
          'xi-api-key': NEW_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer',
        timeout: 20000
      }
    );
    
    console.log('   ✅ TTS SUCCESS!');
    console.log('   Audio size:', (ttsResponse.data.byteLength / 1024).toFixed(2), 'KB');
    
    // Save the audio
    const fs = require('fs');
    const path = require('path');
    const outputDir = path.join(__dirname, 'voiceover_output');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    
    const timestamp = Date.now();
    const filename = `NEW_KEY_TEST_${timestamp}.mp3`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, Buffer.from(ttsResponse.data));
    
    console.log('   💾 Saved to:', filename);
    console.log('   📁 Full path:', filepath);
    
    // Verify file exists
    const stats = fs.statSync(filepath);
    console.log('   📏 File size on disk:', (stats.size / 1024).toFixed(2), 'KB');
    
    return {
      success: true,
      audioFile: filepath,
      audioSize: ttsResponse.data.byteLength
    };
    
  } catch (error) {
    console.log('   ❌ TTS FAILED:', error.message);
    console.log('   Status:', error.response?.status);
    
    if (error.response?.data) {
      console.log('   Error details:', JSON.stringify(error.response.data, null, 2));
      
      // Specific error handling
      if (error.response.status === 401) {
        console.log('\n⚠️  TTS PERMISSION DENIED');
        console.log('   The key works for reading but not for text-to-speech.');
        console.log('   Possible solutions:');
        console.log('   1. Use the web UI first to activate TTS permissions');
        console.log('   2. Check account verification status');
        console.log('   3. Contact ElevenLabs support');
      } else if (error.response.status === 429) {
        console.log('\n⚠️  RATE LIMIT EXCEEDED');
        console.log('   Too many requests. Wait a few minutes.');
      }
    }
    
    return false;
  }
}

// Run the test
comprehensiveTest().then(result => {
  console.log('\n' + '='.repeat(60));
  
  if (result && result.success) {
    console.log('🎉🎉🎉 NEW API KEY WORKS PERFECTLY! 🎉🎉🎉');
    console.log('\n🚀 READY FOR VOICEOVER AUTOMATION!');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Test voiceover_agent.js with new key');
    console.log('2. Generate audio for first batch scripts');
    console.log('3. Integrate with Canva for video assembly');
    console.log('4. Start producing real videos!');
    
    console.log('\n🔧 QUICK TEST COMMANDS:');
    console.log('node voiceover_agent.js generate "Test message" Bella');
    console.log('node voiceover_agent.js integrate');
    
  } else {
    console.log('❌ API KEY TEST FAILED');
    console.log('\n🔧 TROUBLESHOOTING REQUIRED:');
    console.log('1. Key might need web UI activation');
    console.log('2. Account verification might be pending');
    console.log('3. Try using the key in web UI first');
    console.log('4. Contact ElevenLabs support if persistent');
    
    console.log('\n💡 IMMEDIATE ACTION:');
    console.log('Go to: https://elevenlabs.io/speech-synthesis');
    console.log('Generate audio in web UI, then retest API.');
  }
  
  console.log('\n' + '='.repeat(60));
  
}).catch(console.error);