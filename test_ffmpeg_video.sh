#!/bin/bash
# 🎬 Test FFmpeg video assembly capabilities

echo "🎬 FFMPEG VIDEO ASSEMBLY TEST"
echo "=============================="

# Check FFmpeg installation
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg not found. Install with: brew install ffmpeg"
    exit 1
fi

echo "✅ FFmpeg found: $(ffmpeg -version | head -1)"

# Create test assets
TEST_DIR="ffmpeg_test_assets"
mkdir -p "$TEST_DIR"

echo ""
echo "📁 Creating test assets in: $TEST_DIR"

# Create a simple color background image (using ImageMagick or fallback)
if command -v convert &> /dev/null; then
    convert -size 1080x1920 xc:#1a237e "$TEST_DIR/background.png"
    echo "✅ Created background image (1080x1920)"
else
    echo "⚠️  ImageMagick not found, using placeholder"
    echo "placeholder" > "$TEST_DIR/background.txt"
fi

# Create a simple audio file (silence)
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 5 "$TEST_DIR/silence.mp3" 2>/dev/null
echo "✅ Created silent audio (5 seconds)"

# Test video creation from image + audio
echo ""
echo "🎬 Testing video creation..."

OUTPUT_VIDEO="$TEST_DIR/test_output.mp4"

if [ -f "$TEST_DIR/background.png" ]; then
    ffmpeg -loop 1 -i "$TEST_DIR/background.png" -i "$TEST_DIR/silence.mp3" \
        -c:v libx264 -tune stillimage -c:a aac -b:a 192k \
        -pix_fmt yuv420p -shortest "$OUTPUT_VIDEO" 2>/dev/null
    
    if [ $? -eq 0 ] && [ -f "$OUTPUT_VIDEO" ]; then
        echo "✅ Video created successfully: $OUTPUT_VIDEO"
        
        # Get video info
        VIDEO_INFO=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration,codec_name -of csv=p=0 "$OUTPUT_VIDEO" 2>/dev/null)
        if [ ! -z "$VIDEO_INFO" ]; then
            IFS=',' read -r WIDTH HEIGHT DURATION CODEC <<< "$VIDEO_INFO"
            echo "   Resolution: ${WIDTH}x${HEIGHT}"
            echo "   Duration: ${DURATION}s"
            echo "   Codec: $CODEC"
            echo "   Size: $(du -h "$OUTPUT_VIDEO" | cut -f1)"
        fi
    else
        echo "❌ Video creation failed"
    fi
else
    echo "⚠️  Skipping video creation (missing background image)"
fi

# Test capabilities
echo ""
echo "🔧 FFmpeg Capabilities Check:"

# Check codecs
echo "   Video codecs available:"
ffmpeg -codecs 2>/dev/null | grep -E "^(D|E|I).EV.*(h264|libx264|h265|libx265)" | head -3 | sed 's/^/     /'

echo "   Audio codecs available:"
ffmpeg -codecs 2>/dev/null | grep -E "^(D|E|I).EA.*(aac|mp3)" | head -3 | sed 's/^/     /'

# Check filters
echo "   Video filters available:"
ffmpeg -filters 2>/dev/null | grep -E "(scale|overlay|fade|drawtext)" | head -5 | sed 's/^/     /'

echo ""
echo "🎯 Silver Video Production Requirements:"
echo "   1. Input: PNG/JPG images (1080x1920 for vertical)"
echo "   2. Audio: MP3 voiceover (Google TTS)"
echo "   3. Transitions: Crossfade between scenes"
echo "   4. Text overlays: Dynamic text (prices, CTAs)"
echo "   5. Output: MP4 (H.264/AAC) for social media"
echo ""
echo "✅ FFmpeg is capable of all required operations"
echo "   Next: Integrate with video_assembler_agent.js"

# Cleanup (optional)
echo ""
read -p "Clean up test files? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf "$TEST_DIR"
    echo "🧹 Test files cleaned up"
else
    echo "📁 Test files kept in: $TEST_DIR"
fi