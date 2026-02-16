# 🎤 GOOGLE CLOUD TTS SETUP GUIDE
# Free Tier: 1,000,000 characters/month

## 📋 REQUIREMENTS

### 1. Google Cloud Account
- **If you don't have one**: Create at https://cloud.google.com
- **Free tier**: $300 credit for 90 days, then pay-as-you-go
- **TTS free tier**: 1,000,000 characters/month (enough for ~1,358 videos)

### 2. Project Setup
1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Click **"Select a project"** → **"New Project"**
3. Name: `silver-video-tts` (or similar)
4. Location: Organization (optional)
5. Click **"Create"**

### 3. Enable Billing
**⚠️ IMPORTANT:** Free tier requires billing to be enabled (you won't be charged within limits)
1. In Cloud Console, go to **"Billing"**
2. Click **"Link a billing account"**
3. Create new billing account or use existing
4. Link to your project

### 4. Enable Text-to-Speech API
1. Go to **"APIs & Services"** → **"Library"**
2. Search for **"Cloud Text-to-Speech API"**
3. Click **"Enable"**

### 5. Create Service Account
1. Go to **"IAM & Admin"** → **"Service Accounts"**
2. Click **"Create Service Account"**
   - Name: `silver-tts-service`
   - Description: "Text-to-Speech for Silver Video Pipeline"
   - Click **"Create and Continue"**
3. Add role: **"Cloud Text-to-Speech User"**
4. Click **"Continue"** → **"Done"**

### 6. Create and Download Credentials
1. In Service Accounts list, click your new service account
2. Go to **"Keys"** tab
3. Click **"Add Key"** → **"Create new key"**
4. Select **"JSON"** format
5. Click **"Create"** (automatically downloads `silver-tts-service-*.json`)
6. **SAVE THIS FILE SECURELY** - Contains private key

## 🔧 LOCAL SETUP

### 1. Install Google Cloud SDK (if not installed)
```bash
# macOS with Homebrew
brew install --cask google-cloud-sdk

# Initialize
gcloud init

# Or skip SDK and use API directly
```

### 2. Set Environment Variables
Add to your `.env` file (or system environment):
```bash
# Google Cloud TTS
GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/silver-tts-service-*.json"
GOOGLE_CLOUD_PROJECT="your-project-id"
GOOGLE_TTS_LANGUAGE_CODE="en-US"
GOOGLE_TTS_VOICE_NAME="en-US-Neural2-J"  # Professional male voice
```

### 3. Test TTS Installation
```bash
# Install Google Cloud TTS library
npm install @google-cloud/text-to-speech

# Run test
node test_google_tts.js
```

## 🎯 VOICE SELECTION FOR SILVER CONTENT

### Recommended Voices:
1. **en-US-Neural2-J** - Professional, trustworthy (male)
2. **en-US-Neural2-A** - Professional, clear (female)  
3. **en-US-Studio-O** - Premium, engaging (male)
4. **en-US-Wavenet-D** - Natural, authoritative (male)

### Voice Parameters:
```javascript
const voiceConfig = {
  languageCode: 'en-US',
  name: 'en-US-Neural2-J',
  ssmlGender: 'MALE',
  speakingRate: 1.0,  // Normal speed
  pitch: 0.0,         // Neutral pitch
  volumeGainDb: 0.0   // Normal volume
};
```

## 💰 COST STRUCTURE

### Free Tier (Monthly):
- **Standard voices**: 1,000,000 characters FREE
- **Neural voices**: 1,000,000 characters FREE
- **WaveNet voices**: 1,000,000 characters FREE

### Beyond Free Tier:
- **Standard**: $4.00 per 1M characters
- **Neural**: $16.00 per 1M characters  
- **WaveNet**: $16.00 per 1M characters

### Our Usage Estimate:
- **Per video**: 736 characters (silver script)
- **Monthly capacity**: 1,358 videos within free tier
- **Cost**: €0 (within free tier)
- **Revenue potential**: €50-€500 per video

## 🚀 INTEGRATION WITH VOICEOVER AGENT

### Update `voiceover_agent.js`:
```javascript
// Google TTS Provider
async generateGoogleTTS(text, voiceConfig) {
  const textToSpeech = require('@google-cloud/text-to-speech');
  const client = new textToSpeech.TextToSpeechClient();
  
  const request = {
    input: { text: text },
    voice: voiceConfig,
    audioConfig: { audioEncoding: 'MP3' }
  };
  
  const [response] = await client.synthesizeSpeech(request);
  return response.audioContent;
}
```

### n8n Workflow Integration:
1. **Trigger**: New video script ready
2. **Node**: Google TTS node (or HTTP Request to our API)
3. **Output**: MP3 file saved to `voiceover_output/`
4. **Next**: Video assembly with FFmpeg

## 📊 MONITORING USAGE

### Check Monthly Usage:
```bash
# Google Cloud Console
1. Go to "Billing" → "Reports"
2. Filter by service: "Cloud Text-to-Speech API"
3. Set date range to current month
```

### Usage Alerts:
1. Set up billing alerts at 80% of free tier (800,000 chars)
2. Email notification when approaching limits
3. Auto-switch to cheaper provider if needed

## 🔒 SECURITY NOTES

### Credentials Security:
- **Never commit** JSON key file to git
- Use `.env` file (add to `.gitignore`)
- Rotate keys every 90 days
- Restrict IP addresses if possible

### API Security:
- Use service accounts (not user accounts)
- Restrict permissions to only TTS
- Monitor API usage for anomalies
- Set up audit logging

## 🛠️ TROUBLESHOOTING

### Common Issues:

#### 1. "Permission Denied"
```bash
# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"

# Or authenticate with gcloud
gcloud auth application-default login
```

#### 2. "Billing Not Enabled"
- Enable billing for the project
- Wait 5-10 minutes for propagation

#### 3. "API Not Enabled"
```bash
# Enable via gcloud
gcloud services enable texttospeech.googleapis.com
```

#### 4. "Quota Exceeded"
- Check usage in Cloud Console
- Request quota increase if needed
- Or switch to standard voices (cheaper)

## 🎉 NEXT STEPS AFTER SETUP

1. **Test with sample script**: Verify audio quality
2. **Integrate with video_assembler_agent.js**: Full pipeline
3. **Create n8n workflow**: Automation from script to video
4. **Batch production**: Schedule 1-2 videos/day
5. **Monitor results**: Track views, engagement, sales

## 📞 SUPPORT

- **Google Cloud Support**: https://cloud.google.com/support
- **TTS Documentation**: https://cloud.google.com/text-to-speech
- **Community**: Stack Overflow tag `google-cloud-tts`

---

**Estimated Setup Time**: 15-30 minutes  
**Monthly Cost**: €0 (within free tier)  
**Revenue Potential**: €2,000-€20,000/month from silver sales  
**ROI**: Infinite (free tier) → €50K+ MRR potential