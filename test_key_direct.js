// 🧪 DIRECT API KEY TEST
// Bypass dotenv caching issue

const axios = require('axios');

// DIRECT KEY - paste your actual key here
const API_KEY = 'sk_0db936dda244e9b2060763dbc73b5709a6391d4fc3b6e3fd';
const BASE_URL = 'https://api.elevenlabs.io/v1';

console.log('🔑 DIRECT API KEY TEST');
console.log('=====================\n');
console.log('Key (first 10 chars):', API_KEY.substring(0, 10) + '...');
console.log('Full length:', API_KEY.length);
console.log('Starts with sk_:', API_KEY.startsWith('sk_'));
console.log('');

async function quickTest() {
  console.log('1. Quick voices test...');
  
  try {
    const response = await axios.get(`${BASE_URL}/voices`, {
      headers: {
        'xi-api-key': API_KEY
      },
      timeout: 10000
    });
    
    console.log('   ✅ SUCCESS! API key works!');
    console.log('   Available voices:', response.data.voices?.length || 0);
    
    // Try a very short TTS
    console.log('\n2. Testing text-to-speech...');
    
    const ttsResponse = await axios.post(
      `${BASE_URL}/text-to-speech/EXAVITQu4vr4xnSDxMaL`, // Bella
      {
        text: 'Test successful. API key is working.',
        model_id: 'eleven_monolingual_v1'
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
    
    console.log('   ✅ TTS success!');
    console.log('   Audio size:', (ttsResponse.data.byteLength / 1024).toFixed(2), 'KB');
    
    // Save it
    const fs = require('fs');
    const path = require('path');
    const filename = `DIRECT_TEST_${Date.now()}.mp3`;
    const filepath = path.join(__dirname, 'voiceover_output', filename);
    
    if (!fs.existsSync(path.dirname(filepath))) {
      fs.mkdirSync(path.dirname(filepath), { recursive: true });
    }
    
    fs.writeFileSync(filepath, Buffer.from(ttsResponse.data));
    console.log('   💾 Saved to:', filename);
    console.log('\n🎉 API KEY IS VALID AND WORKING!');
    
    return true;
    
  } catch (error) {
    console.log('   ❌ FAILED:', error.message);
    console.log('   Status:', error.response?.status);
    
    if (error.response?.data?.detail) {
      console.log('   Detail:', JSON.stringify(error.response.data.detail, null, 2));
      
      // Common issues
      if (error.response.status === 401) {
        console.log('\n⚠️  INVALID API KEY');
        console.log('   Possible reasons:');
        console.log('   1. Key not activated (use web UI first)');
        console.log('   2. Account not verified (check email)');
        console.log('   3. Key regenerated (get new one)');
        console.log('   4. Free tier not activated');
      }
    }
    
    return false;
  }
}

quickTest().then(success => {
  if (!success) {
    console.log('\n🔧 NEXT STEPS:');
    console.log('1. Go to elevenlabs.io/speech-synthesis');
    console.log('2. Generate audio in web UI (activates account)');
    console.log('3. Check email for verification');
    console.log('4. Try regenerating API key');
    console.log('5. Contact support if still issues');
  }
}).catch(console.error);