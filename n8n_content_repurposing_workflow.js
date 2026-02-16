// 🤖 n8n CONTENT REPURPOSING WORKFLOW
// Automatically repurpose YouTube videos to TikTok, X.com, Instagram

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

console.log('🤖 n8n CONTENT REPURPOSING WORKFLOW');
console.log('====================================\n');

class ContentRepurposingWorkflow {
  constructor() {
    this.config = {
      platforms: {
        tiktok: {
          enabled: true,
          videoDuration: 60, // seconds
          aspectRatio: '9:16',
          maxFileSize: 287.6, // MB
          formats: ['mp4']
        },
        xcom: {
          enabled: true,
          maxThreadLength: 10, // tweets
          includeHashtags: true,
          includeLinks: true
        },
        instagram: {
          enabled: true,
          reelsDuration: 90, // seconds
          carouselSlides: 10,
          storiesEnabled: true
        }
      },
      directories: {
        input: './youtube_videos',
        output: './repurposed_content',
        tiktok: './repurposed_content/tiktok',
        xcom: './repurposed_content/xcom',
        instagram: './repurposed_content/instagram'
      }
    };
    
    // Create directories
    Object.values(this.config.directories).forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    });
    
    console.log('🎯 Content repurposing workflow initialized\n');
  }
  
  /**
   * Main workflow: YouTube video → All platforms
   */
  async processYouTubeVideo(youtubeVideoPath, metadata) {
    console.log(`🎬 Processing YouTube video: ${path.basename(youtubeVideoPath)}`);
    console.log(`   Title: ${metadata.title}`);
    console.log(`   Channel: ${metadata.channel}`);
    console.log(`   Duration: ${metadata.duration}s\n`);
    
    const results = {
      youtube: { original: youtubeVideoPath, metadata },
      tiktok: [],
      xcom: [],
      instagram: []
    };
    
    // 1. Extract best moments for TikTok/Reels
    console.log('1️⃣  EXTRACTING BEST MOMENTS...');
    const clips = await this.extractBestMoments(youtubeVideoPath, metadata);
    console.log(`   ✅ Extracted ${clips.length} clips\n`);
    
    // 2. Create TikTok videos
    if (this.config.platforms.tiktok.enabled) {
      console.log('2️⃣  CREATING TIKTOK VERSIONS...');
      results.tiktok = await this.createTikTokVideos(clips, metadata);
      console.log(`   ✅ Created ${results.tiktok.length} TikTok videos\n`);
    }
    
    // 3. Create X.com thread
    if (this.config.platforms.xcom.enabled) {
      console.log('3️⃣  CREATING X.COM THREAD...');
      results.xcom = await this.createXcomThread(metadata);
      console.log(`   ✅ Created X.com thread (${results.xcom.tweets.length} tweets)\n`);
    }
    
    // 4. Create Instagram content
    if (this.config.platforms.instagram.enabled) {
      console.log('4️⃣  CREATING INSTAGRAM CONTENT...');
      results.instagram = await this.createInstagramContent(clips, metadata);
      console.log(`   ✅ Created Instagram Reel + ${results.instagram.carouselSlides} carousel slides\n`);
    }
    
    // 5. Generate analytics report
    console.log('5️⃣  GENERATING ANALYTICS REPORT...');
    const analytics = this.generateAnalyticsReport(results);
    console.log(`   ✅ Analytics report generated\n`);
    
    console.log('🎉 CONTENT REPURPOSING COMPLETE!');
    console.log('===============================\n');
    
    console.log('📊 RESULTS SUMMARY:');
    console.log(`   • TikTok videos: ${results.tiktok.length}`);
    console.log(`   • X.com tweets: ${results.xcom?.tweets?.length || 0}`);
    console.log(`   • Instagram Reels: ${results.instagram?.reel ? 1 : 0}`);
    console.log(`   • Carousel slides: ${results.instagram?.carouselSlides || 0}`);
    console.log(`   • Total files created: ${this.countTotalFiles(results)}`);
    
    return {
      success: true,
      results,
      analytics,
      outputDir: this.config.directories.output
    };
  }
  
  /**
   * Extract best moments from YouTube video
   */
  async extractBestMoments(videoPath, metadata) {
    const clips = [];
    const duration = metadata.duration;
    
    // For now, create simple clips (start, middle, end)
    // In production: Use AI to detect engaging moments
    
    const clipPoints = [
      { start: 0, duration: 60, name: 'intro' },
      { start: Math.floor(duration / 3), duration: 60, name: 'middle' },
      { start: duration - 60, duration: 60, name: 'outro' }
    ];
    
    for (const point of clipPoints) {
      if (point.start < duration) {
        const clipPath = path.join(this.config.directories.tiktok, 
          `clip_${metadata.channel}_${point.name}_${Date.now()}.mp4`);
        
        // Extract clip with FFmpeg
        const command = `ffmpeg -i "${videoPath}" -ss ${point.start} -t ${point.duration} -c:v libx264 -c:a aac "${clipPath}"`;
        
        try {
          await execPromise(command);
          clips.push({
            path: clipPath,
            start: point.start,
            duration: point.duration,
            name: point.name
          });
        } catch (error) {
          console.log(`   ⚠️  Failed to extract clip ${point.name}: ${error.message}`);
        }
      }
    }
    
    return clips;
  }
  
  /**
   * Create TikTok-optimized videos
   */
  async createTikTokVideos(clips, metadata) {
    const tiktokVideos = [];
    
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const outputPath = path.join(this.config.directories.tiktok,
        `tiktok_${metadata.channel}_${i}_${Date.now()}.mp4`);
      
      // Add TikTok-style captions and effects
      const caption = this.getTikTokCaption(metadata, i, clips.length);
      const captionFile = path.join(this.config.directories.tiktok, `caption_${i}.txt`);
      fs.writeFileSync(captionFile, caption);
      
      // Process video for TikTok (add captions, resize, etc.)
      const command = `ffmpeg -i "${clip.path}" -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,drawtext=textfile='${captionFile}':fontcolor=white:fontsize=48:box=1:boxcolor=black@0.5:boxborderw=5:x=(w-text_w)/2:y=h-text_h-100" -c:v libx264 -c:a aac "${outputPath}"`;
      
      try {
        await execPromise(command);
        
        tiktokVideos.push({
          path: outputPath,
          caption,
          duration: clip.duration,
          platform: 'tiktok',
          channel: metadata.channel,
          index: i
        });
        
        // Clean up caption file
        fs.unlinkSync(captionFile);
      } catch (error) {
        console.log(`   ⚠️  Failed to create TikTok video ${i}: ${error.message}`);
      }
    }
    
    return tiktokVideos;
  }
  
  /**
   * Generate TikTok caption
   */
  getTikTokCaption(metadata, index, totalClips) {
    const channel = metadata.channel;
    const title = metadata.title;
    
    const captions = {
      'Junior Science Lab': [
        `🧪 Science experiment for kids!`,
        `Watch the full tutorial on YouTube! 👇`,
        `#scienceforkids #experiment #education`
      ],
      'Kid Entrepreneur Club': [
        `💼 Business tip for young minds!`,
        `Full lesson on YouTube! 👇`,
        `#kidbusiness #entrepreneur #moneytips`
      ],
      'Storytime Adventures': [
        `📚 Story time!`,
        `Full story on YouTube! 👇`,
        `#kidsstories #bedtimestories #animation`
      ],
      'Art & Craft Kids': [
        `🎨 Art tutorial for kids!`,
        `Step-by-step on YouTube! 👇`,
        `#kidsart #drawing #crafts`
      ],
      'AI Automation Lab': [
        `🤖 AI tool tip!`,
        `Full tutorial on YouTube! 👇`,
        `#ai #automation #techtools`
      ],
      'Algorithmic Trading Hub': [
        `📈 Trading insight!`,
        `Full analysis on YouTube! 👇`,
        `#crypto #trading #investing`
      ],
      'Digital Collectibles Studio': [
        `🖼️ NFT news!`,
        `Full details on YouTube! 👇`,
        `#nft #web3 #digitalart`
      ],
      'Local AI Revolution': [
        `🔒 Privacy tip!`,
        `Full guide on YouTube! 👇`,
        `#privacy #localai #opensource`
      ]
    };
    
    const channelCaptions = captions[channel] || [
      `${title}`,
      `Watch full video on YouTube!`,
      `#education #learning #tutorial`
    ];
    
    return channelCaptions.join('\n\n');
  }
  
  /**
   * Create X.com thread from video content
   */
  async createXcomThread(metadata) {
    const thread = {
      tweets: [],
      hashtags: this.getHashtagsForChannel(metadata.channel),
      link: metadata.youtubeUrl || `https://youtube.com/${metadata.channel}`
    };
    
    // Tweet 1: Hook
    thread.tweets.push({
      number: 1,
      text: `New video: "${metadata.title}"\n\n${this.getThreadHook(metadata.channel)}`,
      type: 'hook'
    });
    
    // Tweets 2-4: Key points (extracted from script/summary)
    const keyPoints = this.extractKeyPoints(metadata);
    keyPoints.forEach((point, index) => {
      thread.tweets.push({
        number: index + 2,
        text: point,
        type: 'key_point'
      });
    });
    
    // Final tweet: Call to action
    thread.tweets.push({
      number: thread.tweets.length + 1,
      text: `Watch the full video here: ${thread.link}\n\n${thread.hashtags.join(' ')}`,
      type: 'cta'
    });
    
    // Save thread to file
    const threadFile = path.join(this.config.directories.xcom,
      `thread_${metadata.channel}_${Date.now()}.json`);
    fs.writeFileSync(threadFile, JSON.stringify(thread, null, 2));
    
    return {
      ...thread,
      file: threadFile
    };
  }
  
  /**
   * Extract key points from metadata
   */
  extractKeyPoints(metadata) {
    // In production: Use AI to extract key points from script
    // For now, return placeholder points
    
    const pointsByChannel = {
      'Junior Science Lab': [
        '1. Safe, fun experiments kids can do at home',
        '2. Teaches real science concepts in simple terms',
        '3. Encourages curiosity and critical thinking'
      ],
      'AI Automation Lab': [
        '1. How to save €100+/month on AI tools',
        '2. Setting up local LLMs with Ollama',
        '3. Automating workflows with n8n'
      ]
      // Add more channels as needed
    };
    
    return pointsByChannel[metadata.channel] || [
      'Key point 1 from the video',
      'Key point 2 from the video',
      'Key point 3 from the video'
    ];
  }
  
  /**
   * Get hashtags for channel
   */
  getHashtagsForChannel(channel) {
    const hashtags = {
      'Junior Science Lab': ['#ScienceForKids', '#STEM', '#Education', '#KidsLearning'],
      'Kid Entrepreneur Club': ['#KidBusiness', '#Entrepreneurship', '#MoneySkills', '#Education'],
      'AI Automation Lab': ['#AI', '#Automation', '#TechTools', '#Productivity'],
      'Algorithmic Trading Hub': ['#Crypto', '#Trading', '#Investing', '#DeFi']
      // Add more channels
    };
    
    return hashtags[channel] || ['#Education', '#Learning', '#Tutorial'];
  }
  
  /**
   * Get thread hook for channel
   */
  getThreadHook(channel) {
    const hooks = {
      'Junior Science Lab': 'Here are 3 science experiments every kid should try:',
      'AI Automation Lab': 'Here\'s how we saved €103/month on AI tools:',
      'Algorithmic Trading Hub': 'Our $43→$100 trading challenge update:'
    };
    
    return hooks[channel] || 'Key takeaways from our latest video:';
  }
  
  /**
   * Create Instagram content
   */
  async createInstagramContent(clips, metadata) {
    const instagramContent = {
      reel: null,
      carouselSlides: [],
      stories: []
    };
    
    // Create Reel (use first TikTok clip)
    if (clips.length > 0) {
      const reelPath = path.join(this.config.directories.instagram,
        `reel_${metadata.channel}_${Date.now()}.mp4`);
      
      // Copy and optionally process for Instagram
      const command = `ffmpeg -i "${clips[0].path}" -c:v libx264 -c:a aac "${reelPath}"`;
      
      try {
        await execPromise(command);
        instagramContent.reel = {
          path: reelPath,
          caption: this.getInstagramCaption(metadata),
          duration: clips[0].duration
        };
      } catch (error) {
        console.log(`   ⚠️  Failed to create Instagram Reel: ${error.message}`);
      }
    }
    
    // Create carousel slides (from video frames)
    instagramContent.carouselSlides = await this.createCarouselSlides(metadata);
    
    return instagramContent;
  }
  
  /**
   * Create carousel slides for Instagram
   */
  async createCarouselSlides(metadata) {
    const slides = [];
    
    // Create 5 placeholder slides (in production: extract frames from video)
    for (let i = 0; i < 5; i++) {
      const slidePath = path.join(this.config.directories.instagram,
        `slide_${metadata.channel}_${i}_${Date.now()}.png`);
      
      // Create simple slide with text (in production: use Canvas)
      const { createCanvas } = require('canvas');
      const canvas = createCanvas(1080, 1080);
      const ctx = canvas.getContext('2d');
      
      // Background
      ctx.fillStyle = this.getChannelColor(metadata.channel);
      ctx.fillRect(0, 0, 1080, 1080);
      
      // Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Slide ${i + 1}`, 540, 540);
      ctx.font = '40px Arial';
      ctx.fillText(metadata.channel, 540, 650);
      
      // Save
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(slidePath, buffer);
      
      slides.push({
        path: slidePath,
        index: i,
        text: `Key point ${i + 1} from ${metadata.title}`
      });
    }
    
    return slides;
  }
  
  /**
   * Get Instagram caption
   */
  getInstagramCaption(metadata) {
    return `${metadata.title}\n\n${this.getChannelDescription(metadata.channel)}\n\nWatch the full video on YouTube! Link in bio 👆\n\n${this.getHashtagsForChannel(metadata.channel).join(' ')}`;
  }
  
  /**
   * Get channel description
   */
  getChannelDescription(channel) {
    const descriptions = {
      'Junior Science Lab': 'Fun science experiments for kids! 🧪',
      'AI Automation Lab': 'AI tools & automation tutorials 🤖'
    };
    
    return descriptions[channel] || 'Educational content for curious minds';
  }
  
  /**
   * Get channel color
   */
  getChannelColor(channel) {
    const colors = {
      'Junior Science Lab': '#4CAF50',
      'Kid Entrepreneur Club': '#FF9800',
      'AI Automation Lab': '#9C27B0',
      'Algorithmic Trading Hub': '#4CAF50'
    };
    
    return colors[channel] || '#2196F3';
  }
  
  /**
   * Generate analytics report
   */
  generateAnalyticsReport(results) {
    return {
      timestamp: new Date().toISOString(),
      videoProcessed: path.basename(results.youtube.original),
      platforms: {
        tiktok: {
          videosCreated: results.tiktok.length,
          totalDuration: results.tiktok.reduce((sum, v) => sum + v.duration, 0)
        },
        xcom: {
          tweetsCreated: results.xcom?.tweets?.length || 0,
          hashtags: results.xcom?.hashtags?.length || 0
        },
        instagram: {
          reelCreated: results.instagram