// 🚀 GENERATE FIRST BATCH CONTENT
// Create content for 8 YouTube channels + social media

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

console.log('🚀 GENERATING FIRST BATCH CONTENT');
console.log('==================================\n');

// Channel configurations
const CHANNELS = {
  kids: [
    { name: 'Junior Science Lab', emoji: '🧪', type: 'science' },
    { name: 'Kid Entrepreneur Club', emoji: '💼', type: 'business' },
    { name: 'Storytime Adventures', emoji: '📚', type: 'story' },
    { name: 'Art & Craft Kids', emoji: '🎨', type: 'art' }
  ],
  adult: [
    { name: 'AI Automation Lab', emoji: '🤖', type: 'tech' },
    { name: 'Algorithmic Trading Hub', emoji: '📈', type: 'trading' },
    { name: 'Digital Collectibles Studio', emoji: '🖼️', type: 'nft' },
    { name: 'Local AI Revolution', emoji: '🔒', type: 'privacy' }
  ]
};

// Content templates
const CONTENT_TEMPLATES = {
  youtube: {
    welcome: `Welcome to {channel}! {emoji}

Hi {audience}! I'm so excited to welcome you to our new channel.

My name is {channelName}, and I'll be your guide as we explore {topic} together.

In this channel, you'll learn:
• {learning1}
• {learning2}
• {learning3}

Our first real video will be coming soon, where we'll {firstVideoTeaser}!

Make sure to subscribe and hit the bell icon so you don't miss it!

Thanks for watching, and I'll see you in the next video! {emoji}`,
    
    content: `{channel} - {title} {emoji}

Welcome back to {channel}! Today we're going to {action}.

{contentBody}

What you'll need:
• {material1}
• {material2}
• {material3}

Step-by-step:
1. {step1}
2. {step2}
3. {step3}

{conclusion}

If you enjoyed this video, please like and subscribe for more {topic} content!

See you in the next video! {emoji}`
  },
  
  tiktok: {
    hook: `{emoji} {hookText}

{keyPoint}

Watch full tutorial on YouTube! 👇

{hashtags}`,
    
    tutorial: `{emoji} Quick {topic} tip!

{tip}

Full guide on YouTube! 👇

{hashtags}`
  },
  
  xcom: {
    thread: [
      `New {channel} video: "{title}" {emoji}`,
      `Here are the key takeaways:`,
      `1. {point1}`,
      `2. {point2}`,
      `3. {point3}`,
      `Why this matters: {importance}`,
      `Watch the full video here: {youtubeLink}`,
      `{hashtags}`
    ]
  },
  
  instagram: {
    caption: `{title} {emoji}

{description}

Watch the full video on YouTube! Link in bio 👆

{hashtags}`
  }
};

// Hashtag sets
const HASHTAGS = {
  science: '#ScienceForKids #STEM #Education #KidsLearning #Experiment',
  business: '#KidBusiness #Entrepreneurship #MoneySkills #Education #KidsFinance',
  story: '#KidsStories #BedtimeStories #Animation #Storytime #KidsEntertainment',
  art: '#KidsArt #Drawing #Crafts #ArtTutorial #CreativeKids',
  tech: '#AI #Automation #TechTools #Productivity #DigitalTransformation',
  trading: '#Crypto #Trading #Investing #DeFi #AlgorithmicTrading',
  nft: '#NFT #Web3 #DigitalArt #Collectibles #Blockchain',
  privacy: '#Privacy #LocalAI #OpenSource #DataProtection #TechEthics'
};

async function generateFirstBatchContent() {
  console.log('🎯 GENERATING CONTENT FOR ALL PLATFORMS\n');
  
  // Create output directory
  const outputDir = path.join(__dirname, 'first_batch_content');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${outputDir}`);
  }
  
  const allContent = {
    youtube: [],
    tiktok: [],
    xcom: [],
    instagram: []
  };
  
  // Generate for all channels
  const allChannels = [...CHANNELS.kids, ...CHANNELS.adult];
  
  for (const channel of allChannels) {
    console.log(`📺 ${channel.emoji} ${channel.name}:`);
    
    // Create channel directory
    const channelDir = path.join(outputDir, channel.name.replace(/\s+/g, '_'));
    if (!fs.existsSync(channelDir)) {
      fs.mkdirSync(channelDir, { recursive: true });
    }
    
    // 1. YouTube content
    console.log('   🎬 YouTube scripts...');
    const youtubeContent = await generateYouTubeContent(channel, channelDir);
    allContent.youtube.push(...youtubeContent);
    
    // 2. TikTok content
    console.log('   🎵 TikTok captions...');
    const tiktokContent = await generateTikTokContent(channel, channelDir);
    allContent.tiktok.push(...tiktokContent);
    
    // 3. X.com content
    console.log('   🐦 X.com threads...');
    const xcomContent = await generateXcomContent(channel, channelDir);
    allContent.xcom.push(...xcomContent);
    
    // 4. Instagram content
    console.log('   📸 Instagram captions...');
    const instagramContent = await generateInstagramContent(channel, channelDir);
    allContent.instagram.push(...instagramContent);
    
    console.log(`   ✅ ${channel.name} content generated\n`);
  }
  
  // Generate summary report
  console.log('📊 CONTENT GENERATION SUMMARY');
  console.log('=============================\n');
  
  console.log('YouTube:');
  console.log(`   • Welcome videos: ${allContent.youtube.filter(c => c.type === 'welcome').length}`);
  console.log(`   • Content videos: ${allContent.youtube.filter(c => c.type === 'content').length}`);
  console.log(`   • Total scripts: ${allContent.youtube.length}`);
  
  console.log('\nTikTok:');
  console.log(`   • Videos planned: ${allContent.tiktok.length}`);
  console.log(`   • Daily output: ${Math.ceil(allContent.tiktok.length / 7)}/day`);
  
  console.log('\nX.com:');
  console.log(`   • Threads: ${allContent.xcom.length}`);
  console.log(`   • Total tweets: ${allContent.xcom.reduce((sum, t) => sum + t.tweets.length, 0)}`);
  
  console.log('\nInstagram:');
  console.log(`   • Posts: ${allContent.instagram.length}`);
  console.log(`   • Reels + Carousels: ${allContent.instagram.length * 2}`);
  
  console.log('\n🎉 TOTAL CONTENT GENERATED:');
  console.log(`   • YouTube scripts: ${allContent.youtube.length}`);
  console.log(`   • TikTok captions: ${allContent.tiktok.length}`);
  console.log(`   • X.com threads: ${allContent.xcom.length}`);
  console.log(`   • Instagram captions: ${allContent.instagram.length}`);
  console.log(`   • Total pieces: ${allContent.youtube.length + allContent.tiktok.length + allContent.xcom.length + allContent.instagram.length}`);
  
  console.log('\n📁 All content saved in:', outputDir);
  
  return {
    success: true,
    content: allContent,
    outputDir,
    channels: allChannels.length
  };
}

async function generateYouTubeContent(channel, channelDir) {
  const content = [];
  const isKids = CHANNELS.kids.some(c => c.name === channel.name);
  
  // Welcome video
  const welcomeScript = CONTENT_TEMPLATES.youtube.welcome
    .replace(/{channel}/g, channel.name)
    .replace(/{emoji}/g, channel.emoji)
    .replace(/{audience}/g, isKids ? 'friends' : 'everyone')
    .replace(/{channelName}/g, channel.name.split(' ')[0])
    .replace(/{topic}/g, getTopicForChannel(channel.type))
    .replace(/{learning1}/g, getLearningPoint(channel.type, 1))
    .replace(/{learning2}/g, getLearningPoint(channel.type, 2))
    .replace(/{learning3}/g, getLearningPoint(channel.type, 3))
    .replace(/{firstVideoTeaser}/g, getFirstVideoTeaser(channel.type));
  
  const welcomeFile = path.join(channelDir, 'youtube_welcome.txt');
  fs.writeFileSync(welcomeFile, welcomeScript);
  
  content.push({
    channel: channel.name,
    type: 'welcome',
    file: welcomeFile,
    script: welcomeScript
  });
  
  // First content video
  const contentTitle = getContentTitle(channel.type);
  const contentScript = CONTENT_TEMPLATES.youtube.content
    .replace(/{channel}/g, channel.name)
    .replace(/{title}/g, contentTitle)
    .replace(/{emoji}/g, channel.emoji)
    .replace(/{action}/g, getActionForChannel(channel.type))
    .replace(/{contentBody}/g, getContentBody(channel.type))
    .replace(/{material1}/g, getMaterial(channel.type, 1))
    .replace(/{material2}/g, getMaterial(channel.type, 2))
    .replace(/{material3}/g, getMaterial(channel.type, 3))
    .replace(/{step1}/g, getStep(channel.type, 1))
    .replace(/{step2}/g, getStep(channel.type, 2))
    .replace(/{step3}/g, getStep(channel.type, 3))
    .replace(/{conclusion}/g, getConclusion(channel.type))
    .replace(/{topic}/g, channel.type);
  
  const contentFile = path.join(channelDir, 'youtube_content_1.txt');
  fs.writeFileSync(contentFile, contentScript);
  
  content.push({
    channel: channel.name,
    type: 'content',
    title: contentTitle,
    file: contentFile,
    script: contentScript
  });
  
  return content;
}

async function generateTikTokContent(channel, channelDir) {
  const content = [];
  const hashtags = HASHTAGS[channel.type] || '#Education #Learning #Tutorial';
  
  // 3 TikTok videos per channel
  for (let i = 1; i <= 3; i++) {
    const isHook = i === 1;
    const template = isHook ? CONTENT_TEMPLATES.tiktok.hook : CONTENT_TEMPLATES.tiktok.tutorial;
    
    const tiktokCaption = template
      .replace(/{emoji}/g, channel.emoji)
      .replace(/{hookText}/g, getTikTokHook(channel.type))
      .replace(/{keyPoint}/g, getKeyPoint(channel.type, i))
      .replace(/{tip}/g, getTip(channel.type, i))
      .replace(/{topic}/g, channel.type)
      .replace(/{hashtags}/g, hashtags);
    
    const tiktokFile = path.join(channelDir, `tiktok_${i}.txt`);
    fs.writeFileSync(tiktokFile, tiktokCaption);
    
    content.push({
      channel: channel.name,
      number: i,
      file: tiktokFile,
      caption: tiktokCaption,
      hashtags
    });
  }
  
  return content;
}

async function generateXcomContent(channel, channelDir) {
  const content = [];
  const hashtags = HASHTAGS[channel.type] || '#Education #Learning #Tutorial';
  const youtubeLink = `https://youtube.com/${channel.name.replace(/\s+/g, '')}`;
  
  const thread = CONTENT_TEMPLATES.xcom.thread.map((tweet, index) => 
    tweet
      .replace(/{channel}/g, channel.name)
      .replace(/{title}/g, getContentTitle(channel.type))
      .replace(/{emoji}/g, channel.emoji)
      .replace(/{point1}/g, getKeyPoint(channel.type, 1))
      .replace(/{point2}/g, getKeyPoint(channel.type, 2))
      .replace(/{point3}/g, getKeyPoint(channel.type, 3))
      .replace(/{importance}/g, getImportance(channel.type))
      .replace(/{youtubeLink}/g, youtubeLink)
      .replace(/{hashtags}/g, hashtags)
  );
  
  const threadFile = path.join(channelDir, 'xcom_thread.json');
  fs.writeFileSync(threadFile, JSON.stringify({
    channel: channel.name,
    tweets: thread.map((text, i) => ({ number: i + 1, text })),
    hashtags: hashtags.split(' '),
    youtubeLink
  }, null, 2));
  
  content.push({
    channel: channel.name,
    file: threadFile,
    tweets: thread,
    hashtags
  });
  
  return content;
}

async function generateInstagramContent(channel, channelDir) {
  const content = [];
  const hashtags = HASHTAGS[channel.type] || '#Education #Learning #Tutorial';
  
  const instagramCaption = CONTENT_TEMPLATES.instagram.caption
    .replace(/{title}/g, getContentTitle(channel.type))
    .replace(/{emoji}/g, channel.emoji)
    .replace(/{description}/g, getInstagramDescription(channel.type))
    .replace(/{hashtags}/g, hashtags);
  
  const instagramFile = path.join(channelDir, 'instagram_caption.txt');
  fs.writeFileSync(instagramFile, instagramCaption);
  
  content.push({
    channel: channel.name,
    file: instagramFile,
    caption: instagramCaption,
    hashtags
  });
  
  return content;
}

// Helper functions
function getTopicForChannel(type) {
  const topics = {
    science: 'amazing science experiments',
    business: 'fun business ideas and money skills',
    story: 'magical stories and adventures',
    art: 'creative art projects and drawing',
    tech: 'AI tools and automation',
    trading: 'crypto trading and investment',
    nft: 'NFTs and digital collectibles',
    privacy: 'privacy-focused AI tools'
  };
  return topics[type] || 'exciting topics';
}

function getLearningPoint(type, number) {
  const points = {
    science: ['how to do safe experiments at home', 'important science concepts', 'how to think like a scientist'],
    business: ['how to start a small business', 'basic money management', 'goal setting and achievement'],
    tech: ['how to save money on AI tools', 'automating workflows', 'building custom solutions']
  };
  
  return points[type]?.[number - 1] || `Learning point ${number}`;
}

function getFirstVideoTeaser(type) {
  const teasers = {
    science: 'make a volcano erupt!',
    business: 'start a lemonade stand business!',
    story: 'go on a magical adventure!',
    art: 'draw cute cartoon animals!',
    tech: 'set up our €0 AI toolchain!',
    trading: 'analyze our trading positions!',
    nft: 'create our first NFT collection!',
    privacy: 'install local AI tools!'
  };
  return teasers[type] || 'create something amazing!';
}

function getContentTitle(type) {
  const titles = {
    science: 'Easy Volcano Experiment for Kids',
    business: 'How to Start a Lemonade Stand Business',
    story: 'The Lost Teddy Bear Adventure',
    art: 'Easy Drawing: Cartoon Animals',
    tech: 'Building a €0/Month AI Toolchain',
    trading: '$43 to $100 Trading Challenge: Week 1',
    nft: 'Creating Our First Silver NFT Collection',
    privacy: 'Why We Ditched ChatGPT for Local AI'
  };
  return titles[type] || 'Getting Started Guide';
}

function getActionForChannel(type) {
  const actions = {
    science: 'make a volcano erupt using simple ingredients',
    business: 'start a lemonade stand business from scratch',
    tech: 'build a complete AI toolchain for €0/month'
  };
  return actions[type] || 'learn something new';
}

function getContentBody(type) {
  const bodies = {
    science: 'Today we\'re going to explore the exciting reaction between baking soda and vinegar, and learn about chemical reactions in a fun, safe way!',
    business: 'In this video, we\'ll cover everything from planning your stand to making your first sale and counting your profits.',
    tech: 'I\'ll show you exactly how we replaced €103/month in AI tool costs with our own local setup using Ollama, Piper TTS, and other open-source tools.'
  };
  return bodies[type] || 'Let\'s dive right in!';
}

function getMaterial(type, number) {
  const materials = {
    science: ['Baking soda', 'Vinegar', 'Red food coloring', 'A small container'],
    business: ['Lemonade ingredients', 'Cups and pitcher', 'Signs and decorations', 'Money box'],
    tech: ['Computer with internet', 'Basic terminal knowledge', 'Patience to follow along']
  };
  
  return materials[type]?.[number - 1] || `Material ${number}`;
}

function getStep(type, number) {
  const steps