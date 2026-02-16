# 🤖 n8n WORKFLOW PLAN - 8 YouTube Channel Automation
# Complete automation system for our €0/month AI pipeline

## 🎯 OVERVIEW

**Goal**: Fully automate content production for 8 YouTube channels
**Workflows**: 5 main workflows covering entire pipeline
**Integration**: Our local AI tools (Ollama, Piper, Canvas, FFmpeg)
**Cost**: €0/month (self-hosted n8n vs €20/month cloud)

## 🔧 WORKFLOW ARCHITECTURE

### Workflow 1: Content Planning & Script Generation
```
Trigger: Weekly schedule (Monday 9:00 AM)
  ↓
Read content calendar (Google Sheets/CSV)
  ↓
Generate scripts for all channels (Ollama API)
  ↓
Save scripts to local storage
  ↓
Send notification: Scripts ready
```

### Workflow 2: Voiceover Production
```
Trigger: Scripts ready notification
  ↓
For each script (parallel processing):
  ↓
Generate voiceover (Piper TTS API)
  ↓
Convert to MP3 (FFmpeg)
  ↓
Save to voiceovers directory
  ↓
Update status: Voiceover complete
```

### Workflow 3: Visual Assets Generation
```
Trigger: Voiceovers complete
  ↓
For each video (parallel):
  ↓
Generate thumbnail (Canvas API)
  ↓
Generate channel banner updates (if needed)
  ↓
Create video intro/outro (FFmpeg templates)
  ↓
Save assets to directory
```

### Workflow 4: Video Assembly & Processing
```
Trigger: All assets ready
  ↓
For each video:
  ↓
Assemble video (FFmpeg: audio + visuals + effects)
  ↓
Add captions/subtitles (optional)
  ↓
Quality check (duration, audio levels)
  ↓
Save final video file
```

### Workflow 5: YouTube Upload & Optimization
```
Trigger: Videos ready for upload
  ↓
For each channel/video:
  ↓
Upload to YouTube (API)
  ↓
Set metadata (title, description, tags)
  ↓
Set visibility (scheduled/public)
  ↓
Add to playlists
  ↓
Post to social media (Twitter, etc.)
  ↓
Log analytics data
```

## 🛠️ TECHNICAL SETUP

### n8n Custom Nodes Needed:

#### 1. Ollama Node (Script Generation)
```javascript
class OllamaNode {
  async execute() {
    const topic = this.getNodeParameter('topic');
    const channel = this.getNodeParameter('channel');
    const tone = this.getNodeParameter('tone', 'educational');
    
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: `Write a YouTube script for ${channel} about ${topic} in ${tone} tone`,
        stream: false
      })
    });
    
    const data = await response.json();
    return [[{ json: { script: data.response, topic, channel } }]];
  }
}
```

#### 2. Piper TTS Node (Voiceover Generation)
```javascript
class PiperTTSNode {
  async execute() {
    const text = this.getNodeParameter('text');
    const voice = this.getNodeParameter('voice', 'en_US-child-medium');
    const outputDir = this.getNodeParameter('outputDir', './voiceovers');
    
    // Call Piper TTS via command line or API
    const command = `echo "${text}" | piper --model ~/.piper/models/${voice}.onnx --output_file ${outputDir}/${Date.now()}.wav`;
    
    const { stdout, stderr } = await execPromise(command);
    
    // Convert to MP3
    const mp3Command = `ffmpeg -i ${outputDir}/${Date.now()}.wav -codec:a libmp3lame ${outputDir}/${Date.now()}.mp3`;
    await execPromise(mp3Command);
    
    return [[{ json: { 
      success: true, 
      audioFile: `${outputDir}/${Date.now()}.mp3`,
      voice,
      characters: text.length 
    } }]];
  }
}
```

#### 3. Canvas Graphics Node (Thumbnail Generation)
```javascript
class CanvasGraphicsNode {
  async execute() {
    const { createCanvas } = require('canvas');
    const channel = this.getNodeParameter('channel');
    const title = this.getNodeParameter('title');
    const style = this.getNodeParameter('style', 'default');
    
    const canvas = createCanvas(1280, 720);
    const ctx = canvas.getContext('2d');
    
    // Apply template based on channel/style
    const template = this.getTemplate(channel, style);
    template.render(ctx, title);
    
    const buffer = canvas.toBuffer('image/png');
    const filename = `thumbnail_${channel}_${Date.now()}.png`;
    fs.writeFileSync(`./thumbnails/${filename}`, buffer);
    
    return [[{ json: { thumbnail: filename, channel, title } }]];
  }
}
```

#### 4. FFmpeg Video Node (Video Assembly)
```javascript
class FFmpegVideoNode {
  async execute() {
    const audioFile = this.getNodeParameter('audioFile');
    const thumbnail = this.getNodeParameter('thumbnail');
    const outputFile = this.getNodeParameter('outputFile');
    
    // Create video from audio + thumbnail + effects
    const command = `ffmpeg -loop 1 -i ${thumbnail} -i ${audioFile} -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest ${outputFile}`;
    
    const { stdout, stderr } = await execPromise(command);
    
    return [[{ json: { 
      videoFile: outputFile,
      duration: await this.getDuration(outputFile),
      size: fs.statSync(outputFile).size
    } }]];
  }
}
```

#### 5. YouTube Upload Node
```javascript
class YouTubeUploadNode {
  async execute() {
    const videoFile = this.getNodeParameter('videoFile');
    const title = this.getNodeParameter('title');
    const description = this.getNodeParameter('description');
    const channelId = this.getNodeParameter('channelId');
    
    // Using YouTube Data API v3
    const youtube = google.youtube({ version: 'v3', auth: youtubeAuth });
    
    const response = await youtube.videos.insert({
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title,
          description,
          tags: this.getTagsForChannel(channelId),
          categoryId: '27' // Education
        },
        status: {
          privacyStatus: 'private', // Will schedule later
          madeForKids: this.isKidsChannel(channelId)
        }
      },
      media: {
        body: fs.createReadStream(videoFile)
      }
    });
    
    return [[{ json: { 
      videoId: response.data.id,
      title,
      channelId,
      uploadTime: new Date().toISOString()
    } }]];
  }
}
```

## 📋 WORKFLOW CONFIGURATION

### Workflow 1: Weekly Content Planning
**Schedule**: Every Monday 9:00 AM
**Inputs**: 
- Content calendar (CSV/Google Sheets)
- Channel configurations (JSON)
- Previous performance data

**Outputs**:
- 16 scripts (2 per channel × 8 channels)
- Content schedule for week
- Resource requirements list

### Workflow 2: Daily Production
**Schedule**: Daily 10:00 AM (process next day's content)
**Parallel Processing**: 8 channels simultaneously
**Error Handling**: Retry failed items, notifications

**Steps**:
1. Get today's scripts
2. Generate voiceovers (parallel)
3. Generate thumbnails (parallel)
4. Assemble videos (sequential)
5. Quality check
6. Prepare for upload

### Workflow 3: Upload & Scheduling
**Schedule**: Daily 14:00 PM (upload for next day)
**Platforms**: YouTube, with social media cross-posting

**Steps**:
1. Upload to YouTube (API)
2. Set metadata
3. Schedule publication
4. Cross-post to Twitter/Instagram
5. Update analytics

### Workflow 4: Analytics & Optimization
**Schedule**: Daily 18:00 PM
**Data Sources**: YouTube Analytics, social media metrics

**Steps**:
1. Collect performance data
2. Analyze trends
3. Generate reports
4. Suggest optimizations
5. Update content strategy

### Workflow 5: Maintenance & Monitoring
**Schedule**: Hourly
**Monitoring**: System health, API limits, storage

**Alerts**:
- Low storage (<10GB free)
- API rate limits approaching
- Failed uploads
- Quality issues detected

## 🔌 INTEGRATION POINTS

### Local Services:
- **Ollama**: http://localhost:11434 (LLM API)
- **Piper TTS**: Command line interface
- **Canvas**: Node.js library
- **FFmpeg**: Command line
- **File System**: Local storage for assets

### External APIs:
- **YouTube Data API v3**: Upload, metadata, analytics
- **Twitter API**: Cross-posting
- **Instagram API**: Reels posting
- **Google Sheets**: Content calendar
- **Database**: SQLite for tracking

### Data Flow:
```
Content Calendar → Scripts → Voiceovers → Thumbnails → Videos → YouTube → Analytics
```

## 🗄️ DATA STORAGE STRUCTURE

### Directory Structure:
```
youtube_automation/
├── content_calendar/          # Weekly plans
├── scripts/                   # Generated scripts
│   ├── kids/
│   └── adult/
├── voiceovers/               # Audio files
│   ├── raw/                  # WAV files
│   └── mp3/                  # MP3 files
├── thumbnails/               # Generated thumbnails
├── videos/                   # Final videos
│   ├── raw/                  # Unprocessed
│   └── final/                # Ready for upload
├── uploads/                  # Upload tracking
├── analytics/                # Performance data
└── logs/                     # System logs
```

### Database Schema (SQLite):
```sql
-- Channels table
CREATE TABLE channels (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('kids', 'adult')),
  youtube_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Videos table
CREATE TABLE videos (
  id INTEGER PRIMARY KEY,
  channel_id INTEGER REFERENCES channels(id),
  title TEXT NOT NULL,
  script TEXT,
  audio_file TEXT,
  thumbnail_file TEXT,
  video_file TEXT,
  youtube_id TEXT,
  scheduled_time TIMESTAMP,
  uploaded_at TIMESTAMP,
  views INTEGER DEFAULT 0,
  revenue REAL DEFAULT 0.0
);

-- Analytics table
CREATE TABLE analytics (
  id INTEGER PRIMARY KEY,
  video_id INTEGER REFERENCES videos(id),
  date DATE,
  views INTEGER,
  watch_time INTEGER,
  revenue REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## ⚙️ CONFIGURATION FILES

### channels.json:
```json
{
  "kids": [
    {
      "name": "Junior Science Lab",
      "youtube_id": "UC_...",
      "voice_model": "en_US-child-medium",
      "thumbnail_style": "science",
      "upload_schedule": "10:00",
      "tags": ["science", "kids", "education", "STEM"]
    }
  ],
  "adult": [
    {
      "name": "AI Automation Lab",
      "youtube_id": "UC_...",
      "voice_model": "en_US-lessac-medium",
      "thumbnail_style": "tech",
      "upload_schedule": "18:00",
      "tags": ["AI", "automation", "tools", "tutorial"]
    }
  ]
}
```

### content_calendar.csv:
```csv
date,channel,topic,keywords,status
2026-02-17,Junior Science Lab,Volcano Experiment,science,experiment,kids,pending
2026-02-17,AI Automation Lab,Ollama Setup Guide,AI,LLM,local,tutorial,pending
```

## 🚀 DEPLOYMENT STEPS

### Phase 1: n8n Setup (Today)
1. **Install n8n** (already done - starting)
2. **Configure database** (SQLite)
3. **Set up custom nodes** (Ollama, Piper, Canvas, FFmpeg)
4. **Configure YouTube API** credentials
5. **Test basic workflow**

### Phase 2: Workflow Creation (Tomorrow)
1. **Create Workflow 1**: Content planning
2. **Create Workflow 2**: Production pipeline
3. **Create Workflow 3**: Upload system
4. **Create Workflow 4**: Analytics
5. **Create Workflow 5**: Monitoring

### Phase 3: Testing (Day 3)
1. **Test with 1 channel** (Junior Science Lab)
2. **Debug issues**
3. **Optimize performance**
4. **Scale to 8 channels**

### Phase 4: Full Automation (Week 2)
1. **Run complete weekly cycle**
2. **Monitor and adjust**
3. **Add error handling**
4. **Implement optimizations**

## 📊 MONITORING & ALERTS

### Key Metrics to Monitor:
1. **Production Speed**: Time from script to uploaded video
2. **Success Rate**: Percentage of successful uploads
3. **Resource Usage**: CPU, memory, storage
4. **API Limits**: YouTube API quota usage
5. **Quality Metrics**: Video duration, audio levels, thumbnail quality

### Alert Conditions:
- ❌ Production time > 2 hours per video
- ❌ Success rate < 90%
- ❌ Storage < 10GB free
- ❌ API quota > 80% used
- ❌ Any workflow failure

### Notification Channels:
- **Telegram**: Immediate alerts
- **Email**: Daily summaries
- **Dashboard**: Real-time monitoring
- **Logs**: Detailed debugging

## 💰 COST ANALYSIS

### Without n8n (Manual):
- **Time**: 4-6 hours/day for 8 channels
- **Cost**: €50-€100/day (time value)
- **Errors**: High (human error)
- **Scalability**: Limited

### With n8n Automation:
- **Time**: 1-2 hours/day (monitoring)
- **Cost**: €0/month (self-hosted)
- **Errors**: Low (automated checks)
- **Scalability**: Unlimited

### Savings:
- **Monthly time saved**: 90-120 hours
- **Value**: €1,800-€2,400/month
- **n8n Cloud cost avoided**: €20/month
- **Total savings**: €1,820-€2,420/month

## 🎯 SUCCESS CRITERIA

### Phase 1 Success (Week 1):
- ✅ n8n installed and running
- ✅ Basic workflow for 1 channel working
- ✅ First automated video produced
- ✅ Monitoring system active

### Phase 2 Success (Week 2):
- ✅ All 5 workflows implemented
- ✅ 8 channels automated
- ✅ Daily production running smoothly
- ✅ Analytics collection working

### Phase 3 Success (Month 1):
- ✅ Full weekly cycle automated
- ✅ Error handling robust
- ✅ Performance optimized
- ✅ Ready for scaling

### Phase 4 Success (Month 2):
- ✅ Add new channels easily
- ✅ Multiple content types supported
- ✅ Advanced analytics
- ✅ Predictive content planning

## 🚨 TROUBLESHOOTING

### Common Issues:

#### 1. Ollama API Timeout
**Solution**: Increase timeout, check Ollama service

#### 2. Piper TTS Quality Issues
**Solution**: Adjust voice model, speed, pitch

#### 3. YouTube API Quota Limits
**Solution**: Space out uploads, request quota increase

#### 4. Storage Full
**Solution**: Automatic cleanup of old files

#### 5. Network Issues
**Solution**: Retry logic, offline queue

### Debugging Tools:
- **n8n Execution Logs**: Detailed step-by-step
- **File System Monitoring**: Check generated files
- **API Response Logging**: External service responses
- **Performance Metrics**: Time per step

## 🎉 READY FOR AUTOMATION?

### Current Status:
1. **n8n**: 🔄 Starting (migrations in progress)
2. **Ollama**: ✅ Ready
3. **Piper TTS**: ✅ Ready
4. **Canvas**: ✅ Ready
5. **FFmpeg**: ✅ Ready
6. **YouTube API**: ⚠️ Needs credentials

### Immediate Actions:
1. **Wait for n8n** to finish starting
2. **Set up YouTube API** credentials
3. **Create first workflow** (Content Planning)
4. **Test with one channel**
5. **Scale to 8 channels**

### Timeline:
- **Today**: n8n setup + basic workflow
- **Tomorrow**: Complete workflow for 1 channel
- **Day 3**: Scale to 8 channels
- **Week 2**: Full automation + optimization

**Let's automate!** 🤖