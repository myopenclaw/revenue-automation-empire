// 🧪 TEST ELEVENLABS API KEY
// Quick test to verify API key works

require('dotenv').config();
const axios = require('axios');

console.log('🧪 TESTING ELEVENLABS API KEY');
console.log('==============================\n');

const API_KEY = process.env.ELEVENLABS_API_KEY;
const BASE_URL = 'https://api.elevenlabs.io/v1';

if (!API_KEY) {
  console.log('❌ No API key found in .env file');
  process.exit(1);
}

console.log('🔑 API Key:', API_KEY.substring(0, 10) + '...');
console.log('Key length:', API_KEY.length);
console.log('Starts with sk_:', API_KEY.startsWith('sk_'));
console.log('');

async function testAPI() {
  console.log('1. Testing user endpoint (basic auth)...');
  
  try {
    const userResponse = await axios.get(`${BASE_URL}/user`, {
      headers: {
        'xi-api-key': API_KEY
      },
      timeout: 10000
    });
    
    console.log('   ✅ User endpoint success!');
    console.log('   Subscription tier:', userResponse.data.subscription?.tier || 'Unknown');
    console.log('   Character limit:', userResponse.data.subscription?.character_limit || 'Unknown');
    console.log('   Characters used:', userResponse.data.subscription?.character_count || 'Unknown');
    
  } catch (error) {
    console.log('   ❌ User endpoint failed:', error.message);
    console.log('   Status:', error.response?.status);
    console.log('   Data:', error.response?.data);
    return false;
  }
  
  console.log('\n2. Testing voices endpoint...');
  
  try {
    const voicesResponse = await axios.get(`${BASE_URL}/voices`, {
      headers: {
        'xi-api-key': API_KEY
      },
      timeout: 10000
    });
    
    console.log('   ✅ Voices endpoint success!');
    console.log('   Available voices:', voicesResponse.data.voices?.length || 0);
    
    if (voicesResponse.data.voices && voicesResponse.data.voices.length > 0) {
      console.log('   First voice:', voicesResponse.data.voices[0].name);
      console.log('   Voice ID:', voicesResponse.data.voices[0].voice_id);
    }
    
  } catch (error) {
    console.log('   ❌ Voices endpoint failed:', error.message);
    console.log('   Status:', error.response?.status);
    return false;
  }
  
  console.log('\n3. Testing text-to-speech endpoint...');
  
  try {
    // Use a very short text for testing
    const testText = 'Hello, this is a test.';
    const voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Bella
    
    const ttsResponse = await axios.post(
      `${BASE_URL}/text-to-speech/${voiceId}`,
      {
        text: testText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      {
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer',
        timeout: 15000
      }
    );
    
    console.log('   ✅ Text-to-speech success!');
    console.log('   Audio size:', (ttsResponse.data.byteLength / 1024).toFixed(2), 'KB');
    
    // Save test audio
    const fs = require('fs');
    const path = require('path');
    const testDir = path.join(__dirname, 'voiceover_output');
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
    
    const filename = `TEST_SUCCESS_${Date.now()}.mp3`;
    const filepath = path.join(testDir, filename);
    fs.writeFileSync(filepath, Buffer.from(ttsResponse.data));
    
    console.log('   💾 Audio saved:', filename);
    console.log('   📁 Path:', filepath);
    
    return true;
    
  } catch (error) {
    console.log('   ❌ Text-to-speech failed:', error.message);
    console.log('   Status:', error.response?.status);
    console.log('   Error data:', JSON.stringify(error.response?.data, null, 2));
    
    // Check for specific error messages
    if (error.response?.data?.detail) {
      console.log('   Detail:', error.response.data.detail);
      
      if (error.response.data.detail.includes('subscription')) {
        console.log('\n⚠️  SUBSCRIPTION ISSUE DETECTED');
        console.log('   Your free tier might not be activated yet.');
        console.log('   Try using the web UI first to activate your account.');
      }
    }
    
    return false;
  }
}

// Run test
testAPI().then(success => {
  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('🎉 API KEY WORKS PERFECTLY!');
    console.log('🚀 Ready for voiceover automation!');
  } else {
    console.log('❌ API KEY TEST FAILED');
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Go to elevenlabs.io/speech-synthesis');
    console.log('2. Try generating audio in the web UI');
    console.log('3. Check if your account is verified');
    console.log('4. Check email for verification link');
    console.log('5. Try regenerating API key');
    console.log('6. Contact ElevenLabs support if issues persist');
  }
}).catch(console.error);