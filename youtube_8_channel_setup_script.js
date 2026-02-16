// 🚀 YOUTUBE 8-CHANNEL SETUP SCRIPT
// Complete creation script for 4 kids + 4 adult channels

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

console.log('🚀 YOUTUBE 8-CHANNEL SETUP SCRIPT');
console.log('==================================\n');

// Channel configurations
const CHANNELS = {
  // Kids Channels (4)
  kids: [
    {
      name: 'Junior Science Lab',
      handle: '@JuniorScienceLab',
      description: 'Fun science experiments for kids! Volcanoes, slime, Mentos + Coke, and more educational fun. Perfect for kids ages 6-9.',
      category: 'Education',
      emoji: '🧪',
      color: '#4CAF50',
      targetAge: '6-9',
      madeForKids: true
    },
    {
      name: 'Kid Entrepreneur Club',
      handle: '@KidEntrepreneurClub',
      description: 'Business basics for young minds! Learn about money, lemonade stands, goal setting, and entrepreneurship for kids ages 7-10.',
      category: 'Education',
      emoji: '💼',
      color: '#FF9800',
      targetAge: '7-10',
      madeForKids: true
    },
    {
      name: 'Storytime Adventures',
      handle: '@StorytimeAdventuresKids',
      description: 'Magical stories come to life! Educational stories, moral lessons, and fun adventures for kids ages 5-8.',
      category: 'Education',
      emoji: '📚',
      color: '#2196F3',
      targetAge: '5-8',
      madeForKids: true
    },
    {
      name: 'Art & Craft Kids',
      handle: '@ArtAndCraftKids',
      description: 'Creative fun for little artists! Easy drawing tutorials, DIY crafts, and art projects for kids ages 6-9.',
      category: 'Education',
      emoji: '🎨',
      color: '#E91E63',
      targetAge: '6-9',
      madeForKids: true
    }
  ],
  
  // Adult Channels (4)
  adult: [
    {
      name: 'AI Automation Lab',
      handle: '@AIAutomationLab',
      description: 'Build AI tools and automation systems for €0/month! Tutorials on local LLMs, n8n automation, and our complete AI toolchain.',
      category: 'Science & Technology',
      emoji: '🤖',
      color: '#9C27B0',
      targetAge: '18+',
      madeForKids: false,
      tags: ['AI', 'Automation', 'n8n', 'Local AI', 'Tools']
    },
    {
      name: 'Algorithmic Trading Hub',
      handle: '@AlgorithmicTradingHub',
      description: 'Crypto trading automation and strategies. Follow our $43 to $100 challenge, build trading bots, and learn DeFi automation.',
      category: 'Education',
      emoji: '📈',
      color: '#4CAF50',
      targetAge: '18+',
      madeForKids: false,
      tags: ['Crypto', 'Trading', 'Automation', 'DeFi', 'Bots']
    },
    {
      name: 'Digital Collectibles Studio',
      handle: '@DigitalCollectiblesStudio',
      description: 'Silver NFTs, digital collectibles, and Web3 e-commerce. Learn how we\'re building a €50K/month silver NFT business.',
      category: 'Education',
      emoji: '🖼️',
      color: '#FF9800',
      targetAge: '18+',
      madeForKids: false,
      tags: ['NFT', 'Web3', 'E-commerce', 'Silver', 'Collectibles']
    },
    {
      name: 'Local AI Revolution',
      handle: '@LocalAIRevolution',
      description: 'Privacy-focused AI tools and local models. Why we ditched ChatGPT for local AI, and how you can too.',
      category: 'Science & Technology',
      emoji: '🔒',
      color: '#2196F3',
      targetAge: '18+',
      madeForKids: false,
      tags: ['Privacy', 'Local AI', 'Ollama', 'Piper TTS', 'Open Source']
    }
  ]
};

// Template files
const TEMPLATES = {
  description: `{Channel Description}

📌 What you'll find here:
• {Content type 1}
• {Content type 2}
• {Content type 3}

🎯 Perfect for: {Target audience}

📅 Upload schedule: {Schedule}

🔔 Subscribe and turn on notifications so you don't miss our latest {content type}!

#{ChannelNameNoSpaces} #{PrimaryCategory} #{TargetAudience}`,
  
  videoDescription: `{Video Title}

{Video description paragraph}

📚 In this video:
• {Key point 1}
• {Key point 2}
• {Key point 3}

🛠️ Resources mentioned:
• {Resource 1}
• {Resource 2}

📌 Connect with us:
• Subscribe: {Channel URL}
• Website: {Coming soon}
• Twitter: {Coming soon}

👍 If you found this helpful, please like and share!
🔔 Turn on notifications for new videos.

#{ChannelName} #{Topic1} #{Topic2} #{Topic3}

⏱️ Chapters:
0:00 - Introduction
1:30 - {Section 1}
3:15 - {Section 2}
5:00 - {Section 3}
6:45 - Conclusion`
};

async function setupYouTubeChannels() {
  console.log('🎯 SETTING UP 8 YOUTUBE CHANNELS\n');
  
  // Create setup directory
  const setupDir = path.join(__dirname, 'youtube_setup_files');
  if (!fs.existsSync(setupDir)) {
    fs.mkdirSync(setupDir, { recursive: true });
    console.log(`📁 Created setup directory: ${setupDir}`);
  }
  
  // Create channel setup files
  const allChannels = [...CHANNELS.kids, ...CHANNELS.adult];
  const setupFiles = [];
  
  console.log('📝 GENERATING SETUP FILES FOR EACH CHANNEL:\n');
  
  for (const channel of allChannels) {
    const channelDir = path.join(setupDir, channel.name.replace(/\s+/g, '_'));
    if (!fs.existsSync(channelDir)) {
      fs.mkdirSync(channelDir, { recursive: true });
    }
    
    console.log(`📺 ${channel.emoji} ${channel.name}:`);
    
    // 1. Channel info file
    const infoFile = path.join(channelDir, 'channel_info.md');
    const infoContent = `# ${channel.emoji} ${channel.name} - YouTube Channel Setup

## Basic Information
- **Channel Name**: ${channel.name}
- **Handle**: ${channel.handle}
- **Category**: ${channel.category}
- **Target Age**: ${channel.targetAge}
- **Made for Kids**: ${channel.madeForKids ? 'Yes' : 'No'}
- **Primary Color**: ${channel.color}
- **Emoji**: ${channel.emoji}

## Description (Copy & Paste)
${channel.description}

## Upload Defaults
- **Title**: {Video Title} | ${channel.name}
- **Description**: Use template below
- **Tags**: ${channel.tags ? channel.tags.join(', ') : 'education, kids, learning, fun'}
- **Category**: ${channel.category}
- **Language**: English
- **License**: Standard YouTube License
- **Age Restriction**: ${channel.madeForKids ? 'Made for kids' : 'Not made for kids'}

## Video Description Template
\`\`\`
${TEMPLATES.videoDescription.replace('{Channel Name}', channel.name).replace('{Channel URL}', `https://youtube.com/${channel.handle}`)}
\`\`\`

## First 5 Video Ideas
1. "Welcome to ${channel.name}!" (Introduction)
2. "${channel.name.split(' ')[0]} Basics: Getting Started"
3. "${channel.emoji} Tutorial: Step-by-Step Guide"
4. "Common Mistakes & How to Avoid Them"
5. "Advanced Tips for ${channel.name.split(' ')[0]}"

## Branding Assets Needed
- Profile Picture (800×800px)
- Banner Image (2560×1440px)
- Video Watermark (150×150px)
- Thumbnail Template

## Setup Checklist
- [ ] Create YouTube channel
- [ ] Upload profile picture
- [ ] Upload banner image
- [ ] Set up video watermark
- [ ] Configure upload defaults
- [ ] Create first playlist
- [ ] Upload first video
- [ ] Set up basic automation

## Notes
- Created: ${new Date().toISOString().split('T')[0]}
- Part of 8-channel network
- Using our €0/month AI toolchain`;
    
    fs.writeFileSync(infoFile, infoContent);
    console.log(`   📄 Channel info: ${path.basename(infoFile)}`);
    
    // 2. First video script
    const scriptFile = path.join(channelDir, 'first_video_script.txt');
    let scriptContent = '';
    
    if (channel.madeForKids) {
      scriptContent = `Welcome to ${channel.name}! ${channel.emoji}

Hi friends! I'm so excited to welcome you to our new channel. 

My name is ${channel.name.split(' ')[0]}, and I'll be your guide as we explore ${channel.name.toLowerCase().includes('science') ? 'amazing science experiments' : channel.name.toLowerCase().includes('entrepreneur') ? 'fun business ideas' : channel.name.toLowerCase().includes('story') ? 'magical stories' : 'creative art projects'} together.

In this channel, you'll learn:
• How to ${channel.name.toLowerCase().includes('science') ? 'do fun experiments at home' : channel.name.toLowerCase().includes('entrepreneur') ? 'start your own small business' : channel.name.toLowerCase().includes('story') ? 'enjoy wonderful stories' : 'create beautiful art'}
• Important ${channel.name.toLowerCase().includes('science') ? 'science concepts' : channel.name.toLowerCase().includes('entrepreneur') ? 'money skills' : channel.name.toLowerCase().includes('story') ? 'life lessons' : 'art techniques'}
• How to have fun while learning!

Our first real video will be coming soon, where we'll ${channel.name.toLowerCase().includes('science') ? 'make a volcano erupt!' : channel.name.toLowerCase().includes('entrepreneur') ? 'start a lemonade stand business!' : channel.name.toLowerCase().includes('story') ? 'go on a magical adventure!' : 'draw cute cartoon animals!'}

Make sure to subscribe and hit the bell icon so you don't miss it!

Thanks for watching, and I'll see you in the next video! ${channel.emoji}`;
    } else {
      scriptContent = `Welcome to ${channel.name}! ${channel.emoji}

In this channel, we're going to show you how to ${channel.name.toLowerCase().includes('automation') ? 'build AI tools and automation systems for €0/month' : channel.name.toLowerCase().includes('trading') ? 'automate crypto trading and build profitable strategies' : channel.name.toLowerCase().includes('collectibles') ? 'create and sell digital collectibles and NFTs' : 'use local AI tools for privacy and cost savings'}.

I'm ${channel.name.split(' ')[0]}, and I'll be sharing our journey as we ${channel.name.toLowerCase().includes('automation') ? 'build a complete AI toolchain from scratch' : channel.name.toLowerCase().includes('trading') ? 'take $43 to $100 with algorithmic trading' : channel.name.toLowerCase().includes('collectibles') ? 'build a €50K/month silver NFT business' : 'ditch cloud AI for local alternatives'}.

What you'll learn here:
• Practical tutorials you can follow step-by-step
• Real results from our own projects
• How to save money and increase efficiency
• The tools and strategies that actually work

This isn't theory - this is what we're actually doing, and we're documenting the entire process.

In our next video, we'll dive into ${channel.name.toLowerCase().includes('automation') ? 'setting up Ollama for local LLMs' : channel.name.toLowerCase().includes('trading') ? 'our current trading positions and strategy' : channel.name.toLowerCase().includes('collectibles') ? 'creating our first silver NFT collection' : 'installing Piper TTS for local voiceovers'}.

Subscribe and hit the bell so you don't miss it!

Thanks for watching, and let's build something amazing together. ${channel.emoji}`;
    }
    
    fs.writeFileSync(scriptFile, scriptContent);
    console.log(`   📝 First video script: ${path.basename(scriptFile)}`);
    
    // 3. Thumbnail design spec
    const thumbnailFile = path.join(channelDir, 'thumbnail_spec.json');
    const thumbnailSpec = {
      channel: channel.name,
      dimensions: { width: 1280, height: 720 },
      backgroundColor: channel.color,
      textColor: '#FFFFFF',
      accentColor: channel.madeForKids ? '#FFC107' : '#000000',
      logo: channel.emoji,
      font: 'Arial',
      titlePosition: 'center',
      logoPosition: 'bottom-center',
      channelNamePosition: 'bottom',
      style: channel.madeForKids ? 'bright and playful' : 'clean and professional'
    };
    
    fs.writeFileSync(thumbnailFile, JSON.stringify(thumbnailSpec, null, 2));
    console.log(`   🎨 Thumbnail spec: ${path.basename(thumbnailFile)}`);
    
    setupFiles.push({
      channel: channel.name,
      type: channel.madeForKids ? 'kids' : 'adult',
      files: [infoFile, scriptFile, thumbnailFile]
    });
    
    console.log(`   ✅ Setup files created\n`);
  }
  
  // Create master setup guide
  const masterGuide = path.join(setupDir, 'MASTER_SETUP_GUIDE.md');
  const guideContent = `# 🚀 MASTER SETUP GUIDE - 8 YouTube Channels
# Complete Step-by-Step Instructions

## 📋 OVERVIEW

**Total Channels**: 8 (4 kids + 4 adult)
**Setup Time**: 2-3 hours for all channels
**First Videos**: Ready to upload today
**Automation**: Full AI pipeline (€0/month cost)

## 🎯 CHANNEL LIST

### Kids Channels (Made for Kids):
1. 🧪 **Junior Science Lab** - @JuniorScienceLab
2. 💼 **Kid Entrepreneur Club** - @KidEntrepreneurClub  
3. 📚 **Storytime Adventures** - @StorytimeAdventuresKids
4. 🎨 **Art & Craft Kids** - @ArtAndCraftKids

### Adult Channels (Not Made for Kids):
5. 🤖 **AI Automation Lab** - @AIAutomationLab
6. 📈 **Algorithmic Trading Hub** - @AlgorithmicTradingHub
7. 🖼️ **Digital Collectibles Studio** - @DigitalCollectiblesStudio
8. 🔒 **Local AI Revolution** - @LocalAIRevolution

## 📝 SETUP CHECKLIST

### Phase 1: Account Preparation (15 minutes)
- [ ] Sign in to YouTube Studio: https://studio.youtube.com
- [ ] Ensure Google account has 2FA enabled
- [ ] Clear any browser cache/cookies

### Phase 2: Channel Creation (2-3 hours)
For EACH of 8 channels:

1. **Create Channel** (2 minutes):
   - Click profile icon → "Create a channel"
   - Choose "Use a business or other name"
   - Enter channel name (exact from list above)
   - Enter handle (exact from list above)
   - Click "Create"

2. **Configure Settings** (5 minutes):
   - Go to Settings → Channel
   - Basic info: Paste description from channel_info.md
   - Upload defaults: Configure as per channel_info.md
   - Advanced: Set "Made for kids" correctly
   - Comments: "Hold all for review" for kids channels

3. **Upload Branding** (5 minutes):
   - Profile picture: 800×800px (generate with our graphics engine)
   - Banner image: 2560×1440px (generate with graphics engine)
   - Video watermark: 150×150px (channel logo)

4. **Create First Playlist** (2 minutes):
   - Name: "Getting Started"
   - Add first video (once uploaded)

### Phase 3: First Video Upload (1-2 hours)
For EACH channel:

1. **Generate Assets** (using our AI pipeline):
   - Script: Use first_video_script.txt
   - Voiceover: Piper TTS with appropriate voice
   - Thumbnail: Generate per thumbnail_spec.json
   - Video: Assemble with FFmpeg

2. **Upload Video** (5 minutes):
   - Title: "Welcome to [Channel Name]! | [Channel Name]"
   - Description: Use template from channel_info.md
   - Tags: Add relevant tags
   - Category: Set correctly
   - Age restriction: Set correctly
   - Visibility: "Unlisted" first (test), then "Public"

3. **Schedule Next Videos** (2 minutes):
   - Plan next 4 videos per channel
   - Use content calendar below

## 📅 CONTENT CALENDAR (WEEK 1)

### Monday (Today):
- All 8 channels: Welcome videos
- Focus: Branding complete, first video live

### Tuesday:
- Kids: Educational content (experiments/business/stories/art)
- Adult: Tutorial content (setup guides/strategies)

### Wednesday:  
- Kids: Interactive content
- Adult: Case studies (our projects)

### Thursday:
- Kids: Skill-building content
- Adult: Tool reviews/comparisons

### Friday:
- Kids: Fun challenges
- Adult: Results/analytics

### Saturday:
- Weekly recaps
- Behind the scenes
- Community Q&A

### Sunday:
- Planning next week
- Batch content creation
