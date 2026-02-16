// 🚀 ENHANCED CONTENT GENERATOR
// Generate complete content batches for all platforms

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

console.log('🚀 ENHANCED CONTENT GENERATOR');
console.log('=============================\n');

// Channel configurations
const CHANNELS = {
  kids: [
    { 
      name: 'Junior Science Lab', 
      emoji: '🧪', 
      color: '#4CAF50',
      topics: ['Volcano Experiment', 'Magnet Magic', 'Rainbow in a Glass', 'Solar System Model'],
      hashtags: '#ScienceForKids #STEM #Education #KidsLearning #Experiment'
    },
    { 
      name: 'Kid Entrepreneur Club', 
      emoji: '💼', 
      color: '#FF9800',
      topics: ['Lemonade Stand Business', 'Dog Walking Service', 'Handmade Crafts', 'Online Store'],
      hashtags: '#KidBusiness #Entrepreneurship #MoneySkills #Education #KidsFinance'
    },
    { 
      name: 'Storytime Adventures', 
      emoji: '📚', 
      color: '#2196F3',
      topics: ['Magic Forest Adventure', 'Space Explorer', 'Underwater Kingdom', 'Dinosaur Discovery'],
      hashtags: '#KidsStories #BedtimeStories #Animation #Storytime #KidsEntertainment'
    },
    { 
      name: 'Art & Craft Kids', 
      emoji: '🎨', 
      color: '#E91E63',
      topics: ['Easy Drawing Animals', 'Paper Crafts', 'Painting Techniques', 'DIY Projects'],
      hashtags: '#KidsArt #Drawing #Crafts #ArtTutorial #CreativeKids'
    }
  ],
  adult: [
    { 
      name: 'AI Automation Lab', 
      emoji: '🤖', 
      color: '#9C27B0',
      topics: ['€0 AI Toolchain', 'Automate Social Media', 'Local LLM Setup', 'n8n Workflows'],
      hashtags: '#AI #Automation #TechTools #Productivity #DigitalTransformation'
    },
    { 
      name: 'Algorithmic Trading Hub', 
      emoji: '📈', 
      color: '#4CAF50',
      topics: ['Crypto Trading Bots', '$43 to $100 Challenge', 'Risk Management', 'DEX Strategies'],
      hashtags: '#Crypto #Trading #Investing #DeFi #AlgorithmicTrading'
    },
    { 
      name: 'Digital Collectibles Studio', 
      emoji: '🖼️', 
      color: '#FF9800',
      topics: ['Silver NFT Collection', 'Digital Art Creation', 'Web3 Monetization', 'Community Building'],
      hashtags: '#NFT #Web3 #DigitalArt #Collectibles #Blockchain'
    },
    { 
      name: 'Local AI Revolution', 
      emoji: '🔒', 
      color: '#2196F3',
      topics: ['Privacy-First AI', 'Local Model Setup', 'Data Protection', 'Open Source Tools'],
      hashtags: '#Privacy #LocalAI #OpenSource #DataProtection #TechEthics'
    }
  ]
};

// Content templates
const TEMPLATES = {
  youtube: {
    welcome: `🎬 WELCOME TO {CHANNEL}! {EMOJI}

Hi {AUDIENCE}! Welcome to our brand new channel - {CHANNEL}!

I'm so excited to have you here as we embark on this journey together.

In this channel, we'll explore:
🔬 {TOPIC1}
💡 {TOPIC2}
🚀 {TOPIC3}

Our mission is to {MISSION}.

Make sure to:
1. 👍 LIKE this video
2. 🔔 SUBSCRIBE to the channel
3. 💬 COMMENT what you want to see next!

First real video coming soon: "{FIRST_VIDEO}"

Thank you for joining us! See you in the next video! {EMOJI}`,

    content: `🎬 {CHANNEL} - {TITLE} {EMOJI}

Welcome back to {CHANNEL}! Today we're learning about: {TITLE}

{INTRODUCTION}

📋 WHAT YOU'LL NEED:
• {MATERIAL1}
• {MATERIAL2}
• {MATERIAL3}

🔧 STEP-BY-STEP:
1. {STEP1}
2. {STEP2}
3. {STEP3}
4. {STEP4}

💡 PRO TIP:
{PRO_TIP}

🎯 KEY TAKEAWAYS:
• {TAKEAWAY1}
• {TAKEAWAY2}
• {TAKEAWAY3}

📈 NEXT STEPS:
{NEXT_STEPS}

👉 If you enjoyed this video, please:
1. 👍 LIKE
2. 🔔 SUBSCRIBE
3. 💬 COMMENT your questions
4. 📤 SHARE with friends

Thanks for watching! {EMOJI}`
  },

  tiktok: {
    hook: `{EMOJI} {HOOK_TEXT}

{KEY_POINT}

Watch the full tutorial on YouTube! 👇

{HASHTAGS}`,

    tutorial: `{EMOJI} Quick {TOPIC} Tutorial!

{STEP}

Full guide on YouTube! 👇

{HASHTAGS}`,

    question: `{EMOJI} QUESTION OF THE DAY:

{QUESTION}

Comment your answer below! 👇

{HASHTAGS}`
  },

  xcom: {
    thread: `🎬 New {CHANNEL} video: "{TITLE}" {EMOJI}

Thread 🧵 (1/10)

{INTRODUCTION}

(2/10)
Here's what we cover:

(3/10)
1. {POINT1}

(4/10)
2. {POINT2}

(5/10)
3. {POINT3}

(6/10)
Why this matters:
{IMPORTANCE}

(7/10)
Pro tip:
{PRO_TIP}

(8/10)
Key takeaway:
{TAKEAWAY}

(9/10)
Watch the full video here:
{YOUTUBE_LINK}

(10/10)
{HASHTAGS}

Follow @{HANDLE} for more {TOPIC} content!`
  },

  instagram: {
    reel: `{TITLE} {EMOJI}

{DESCRIPTION}

Watch full video on YouTube! Link in bio 👆

{HASHTAGS}`,

    carousel: `🎬 {CHANNEL} - {TITLE}

Swipe through for key takeaways 👉

1. {POINT1}
2. {POINT2}
3. {POINT3}
4. {POINT4}

Full tutorial on YouTube! Link in bio 👆

{HASHTAGS}`
  }
};

async function generateContentBatch() {
  console.log('🎯 GENERATING CONTENT BATCH FOR ALL PLATFORMS\n');
  
  // Create output directory
  const outputDir = path.join(__dirname, 'content_batch_' + new Date().toISOString().split('T')[0]);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${outputDir}`);
  }
  
  const allChannels = [...CHANNELS.kids, ...CHANNELS.adult];
  const batchSummary = {
    generated: new Date().toISOString(),
    channels: allChannels.length,
    content: {
      youtube: 0,
      tiktok: 0,
      xcom: 0,
      instagram: 0
    },
    files: []
  };
  
  console.log(`📊 Generating content for ${allChannels.length} channels\n`);
  
  for (const channel of allChannels) {
    console.log(`🎬 ${channel.emoji} ${channel.name}:`);
    
    // Create channel directory
    const channelDir = path.join(outputDir, channel.name.replace(/\s+/g, '_'));
    if (!fs.existsSync(channelDir)) {
      fs.mkdirSync(channelDir, { recursive: true });
    }
    
    // Generate content for each platform
    const channelContent = await generateChannelContent(channel, channelDir);
    
    // Update summary
    batchSummary.content.youtube += channelContent.youtube.length;
    batchSummary.content.tiktok += channelContent.tiktok.length;
    batchSummary.content.xcom += channelContent.xcom.length;
    batchSummary.content.instagram += channelContent.instagram.length;
    
    batchSummary.files.push({
      channel: channel.name,
      files: channelContent.files
    });
    
    console.log(`   ✅ Generated: ${channelContent.youtube.length} YouTube, ${channelContent.tiktok.length} TikTok, ${channelContent.xcom.length} X.com, ${channelContent.instagram.length} Instagram\n`);
  }
  
  // Generate batch summary
  const summaryPath = path.join(outputDir, 'BATCH_SUMMARY.md');
  fs.writeFileSync(summaryPath, generateBatchSummary(batchSummary));
  
  console.log('🎉 CONTENT BATCH GENERATION COMPLETE!');
  console.log('=====================================\n');
  
  const totalContent = Object.values(batchSummary.content).reduce((a, b) => a + b, 0);
  console.log('📊 BATCH SUMMARY:');
  console.log(`   • Channels: ${batchSummary.channels}`);
  console.log(`   • YouTube scripts: ${batchSummary.content.youtube}`);
  console.log(`   • TikTok captions: ${batchSummary.content.tiktok}`);
  console.log(`   • X.com threads: ${batchSummary.content.xcom}`);
  console.log(`   • Instagram posts: ${batchSummary.content.instagram}`);
  console.log(`   • Total content pieces: ${totalContent}`);
  console.log(`   • Daily output potential: ${Math.ceil(totalContent / 7)} pieces/day`);
  console.log(`\n📁 All content saved in: ${outputDir}`);
  console.log(`📋 Summary: ${summaryPath}`);
  
  return {
    success: true,
    summary: batchSummary,
    outputDir,
    totalContent
  };
}

async function generateChannelContent(channel, channelDir) {
  const content = {
    youtube: [],
    tiktok: [],
    xcom: [],
    instagram: [],
    files: []
  };
  
  const isKids = CHANNELS.kids.some(c => c.name === channel.name);
  const audience = isKids ? 'friends' : 'everyone';
  const handle = channel.name.replace(/\s+/g, '');
  const youtubeLink = `https://youtube.com/${handle}`;
  
  // 1. YouTube Welcome Video
  const welcomeScript = TEMPLATES.youtube.welcome
    .replace(/{CHANNEL}/g, channel.name)
    .replace(/{EMOJI}/g, channel.emoji)
    .replace(/{AUDIENCE}/g, audience)
    .replace(/{TOPIC1}/g, channel.topics[0])
    .replace(/{TOPIC2}/g, channel.topics[1])
    .replace(/{TOPIC3}/g, channel.topics[2])
    .replace(/{MISSION}/g, getMission(channel))
    .replace(/{FIRST_VIDEO}/g, channel.topics[0]);
  
  const welcomeFile = path.join(channelDir, 'youtube_welcome.txt');
  fs.writeFileSync(welcomeFile, welcomeScript);
  content.youtube.push({ type: 'welcome', file: welcomeFile });
  content.files.push(welcomeFile);
  
  // 2. YouTube Content Videos (2 per channel)
  for (let i = 0; i < 2; i++) {
    const topic = channel.topics[i];
    const contentScript = TEMPLATES.youtube.content
      .replace(/{CHANNEL}/g, channel.name)
      .replace(/{EMOJI}/g, channel.emoji)
      .replace(/{TITLE}/g, topic)
      .replace(/{INTRODUCTION}/g, getIntroduction(channel, topic))
      .replace(/{MATERIAL1}/g, getMaterial(channel, 1))
      .replace(/{MATERIAL2}/g, getMaterial(channel, 2))
      .replace(/{MATERIAL3}/g, getMaterial(channel, 3))
      .replace(/{STEP1}/g, getStep(channel, 1))
      .replace(/{STEP2}/g, getStep(channel, 2))
      .replace(/{STEP3}/g, getStep(channel, 3))
      .replace(/{STEP4}/g, getStep(channel, 4))
      .replace(/{PRO_TIP}/g, getProTip(channel))
      .replace(/{TAKEAWAY1}/g, getTakeaway(channel, 1))
      .replace(/{TAKEAWAY2}/g, getTakeaway(channel, 2))
      .replace(/{TAKEAWAY3}/g, getTakeaway(channel, 3))
      .replace(/{NEXT_STEPS}/g, getNextSteps(channel));
    
    const contentFile = path.join(channelDir, `youtube_content_${i + 1}.txt`);
    fs.writeFileSync(contentFile, contentScript);
    content.youtube.push({ type: 'content', topic, file: contentFile });
    content.files.push(contentFile);
  }
  
  // 3. TikTok Content (3 per channel)
  for (let i = 0; i < 3; i++) {
    const template = i === 0 ? TEMPLATES.tiktok.hook : 
                    i === 1 ? TEMPLATES.tiktok.tutorial : 
                    TEMPLATES.tiktok.question;
    
    const tiktokCaption = template
      .replace(/{EMOJI}/g, channel.emoji)
      .replace(/{HOOK_TEXT}/g, getHookText(channel))
      .replace(/{KEY_POINT}/g, getKeyPoint(channel))
      .replace(/{TOPIC}/g, channel.topics[0].toLowerCase())
      .replace(/{STEP}/g, getTikTokStep(channel))
      .replace(/{QUESTION}/g, getQuestion(channel))
      .replace(/{HASHTAGS}/g, channel.hashtags);
    
    const tiktokFile = path.join(channelDir, `tiktok_${i + 1}.txt`);
    fs.writeFileSync(tiktokFile, tiktokCaption);
    content.tiktok.push({ number: i + 1, file: tiktokFile });
    content.files.push(tiktokFile);
  }
  
  // 4. X.com Thread (1 per channel)
  const xcomThread = TEMPLATES.xcom.thread
    .replace(/{CHANNEL}/g, channel.name)
    .replace(/{EMOJI}/g, channel.emoji)
    .replace(/{TITLE}/g, channel.topics[0])
    .replace(/{INTRODUCTION}/g, getXcomIntro(channel))
    .replace(/{POINT1}/g, getXcomPoint(channel, 1))
    .replace(/{POINT2}/g, getXcomPoint(channel, 2))
    .replace(/{POINT3}/g, getXcomPoint(channel, 3))
    .replace(/{IMPORTANCE}/g, getImportance(channel))
    .replace(/{PRO_TIP}/g, getProTip(channel))
    .replace(/{TAKEAWAY}/g, getTakeaway(channel, 1))
    .replace(/{YOUTUBE_LINK}/g, youtubeLink)
    .replace(/{HASHTAGS}/g, channel.hashtags)
    .replace(/{HANDLE}/g, handle)
    .replace(/{TOPIC}/g, channel.topics[0].toLowerCase());
  
  const xcomFile = path.join(channelDir, 'xcom_thread.txt');
  fs.writeFileSync(xcomFile, xcomThread);
  content.xcom.push({ file: xcomFile });
  content.files.push(xcomFile);
  
  // 5. Instagram Content (2 per channel)
  const instagramReel = TEMPLATES.instagram.reel
    .replace(/{TITLE}/g, channel.topics[0])
    .replace(/{EMOJI}/g, channel.emoji)
    .replace(/{DESCRIPTION}/g, getInstagramDescription(channel))
    .replace(/{HASHTAGS}/g, channel.hashtags);
  
  const instagramReelFile = path.join(channelDir, 'instagram_reel.txt');
  fs.writeFileSync(instagramReelFile, instagramReel);
  content.instagram.push({ type: 'reel', file: instagramReelFile });
  content.files.push(instagramReelFile);
  
  const instagramCarousel = TEMPLATES.instagram.carousel
    .replace(/{CHANNEL}/g, channel.name)
    .replace(/{TITLE}/g, channel.topics[0])
    .replace(/{POINT1}/g, getCarouselPoint(channel, 1))
    .replace(/{POINT2}/g, getCarouselPoint(channel, 2))
    .replace(/{POINT3}/g, getCarouselPoint(channel, 3))
    .replace(/{POINT4}/g, getCarouselPoint(channel, 4))
    .replace(/{HASHTAGS}/g, channel.hashtags);
  
  const instagramCarouselFile = path.join(channelDir, 'instagram_carousel.txt');
  fs.writeFileSync(instagramCarouselFile, instagramCarousel);
  content.instagram.push({ type: 'carousel', file: instagramCarouselFile });
  content.files.push(instagramCarouselFile);
  
  return content;
}

// Helper functions
function getMission(channel) {
  const missions = {
    'Junior Science Lab': 'make science fun and accessible for kids',
    'Kid Entrepreneur Club': 'teach business skills to young minds',
    'Storytime Adventures': 'spark imagination through magical stories',
    'Art & Craft Kids': 'unlock creativity in every child',
    'AI Automation Lab': 'democratize AI tools for everyone',
    'Algorithmic Trading Hub': 'simplify crypto