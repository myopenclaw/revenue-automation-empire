#!/usr/bin/env python3
# 🎤 AUDIO GENERATOR - Ik maak de audio voor je

import requests
import json
import os
from pathlib import Path

print("🎤 GENERATING AUDIO FOR VIDEO 1")
print("=" * 40)

# Jouw script
script = """🎯 Silver Price Update Today

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
#Silver #Commodities #PreciousMetals"""

print(f"📝 Script length: {len(script)} characters")
print(f"📋 First 100 chars: {script[:100]}...")
print()

# Jouw API key
API_KEY = "sk_3408987d6c0fa438dec4b179171b76a1a73a8ff7647d7502"
VOICE_ID = "EXAVITQu4vr4xnSDxMaL"  # Bella
URL = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"

headers = {
    "Accept": "audio/mpeg",
    "Content-Type": "application/json",
    "xi-api-key": API_KEY
}

data = {
    "text": script,
    "model_id": "eleven_monolingual_v1",
    "voice_settings": {
        "stability": 0.5,
        "similarity_boost": 0.75
    }
}

print("🔧 Attempting API call...")
print(f"   Voice: Bella ({VOICE_ID})")
print(f"   API Key: {API_KEY[:10]}...")

try:
    response = requests.post(URL, json=data, headers=headers, timeout=30)
    
    print(f"   Status Code: {response.status_code}")
    
    if response.status_code == 200:
        # Save the audio
        output_dir = Path("voiceover_output")
        output_dir.mkdir(exist_ok=True)
        
        filename = f"video_1_silver_tiktok_{VOICE_ID}.mp3"
        filepath = output_dir / filename
        
        with open(filepath, "wb") as f:
            f.write(response.content)
        
        print(f"✅ SUCCESS! Audio saved to: {filepath}")
        print(f"📏 File size: {len(response.content) / 1024:.2f} KB")
        print(f"🔊 Play with: open {filepath}")
        
        # Also create a text file with instructions
        instructions = f"""🎬 VIDEO 1 AUDIO READY!

Audio file: {filename}
Location: {filepath.absolute()}

📋 NEXT STEPS:
1. Open Canva.com
2. Create 9:16 video
3. Upload this MP3 file
4. Add text overlays from script
5. Export as MP4
6. Upload to TikTok

Script used:
{script}
"""
        
        instructions_file = output_dir / "INSTRUCTIONS.txt"
        with open(instructions_file, "w") as f:
            f.write(instructions)
        
        print(f"📄 Instructions saved to: {instructions_file}")
        
    else:
        print(f"❌ API Error: {response.status_code}")
        print(f"   Response: {response.text[:200]}")
        
        # Fallback: Create instructions for manual generation
        print("\n🔧 FALLBACK INSTRUCTIONS:")
        print("1. Go to: https://elevenlabs.io/speech-synthesis")
        print("2. Paste the script above")
        print("3. Click 'Generate'")
        print("4. Download MP3")
        print("5. Use in Canva")
        
except Exception as e:
    print(f"❌ Error: {e}")
    
    # Create fallback file
    output_dir = Path("voiceover_output")
    output_dir.mkdir(exist_ok=True)
    
    fallback_file = output_dir / "MANUAL_INSTRUCTIONS.txt"
    with open(fallback_file, "w") as f:
        f.write(f"""🎤 MANUAL AUDIO GENERATION NEEDED

The API call failed. Here's what to do:

1. OPEN: https://elevenlabs.io/speech-synthesis
2. PASTE this script:
{script}
3. CLICK: "Generate"
4. DOWNLOAD: MP3 file
5. USE: In Canva for video creation

Time needed: ~3 minutes
""")
    
    print(f"📄 Fallback instructions saved to: {fallback_file}")

print("\n" + "=" * 40)
print("🎯 READY FOR NEXT STEP: Canva Video Creation")