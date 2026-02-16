// 🚀 QUICK CONTENT BATCH
// Generate sample content for social media accounts

const fs = require('fs');
const path = require('path');

console.log('🚀 QUICK CONTENT BATCH GENERATOR');
console.log('=================================\n');

const CHANNELS = [
  { name: 'Junior Science Lab', emoji: '🧪', type: 'kids' },
  { name: 'Kid Entrepreneur Club', emoji: '💼', type: 'kids' },
  { name: 'Storytime Adventures', emoji: '📚', type: 'kids' },
  { name: 'Art & Craft Kids', emoji: '🎨', type: 'kids' },
  { name: 'AI Automation Lab', emoji: '🤖', type: 'adult' },
  { name: 'Algorithmic Trading Hub', emoji: '📈', type: 'adult' },
  { name: 'Digital Collectibles Studio', emoji: '🖼️', type: 'adult' },
  { name: 'Local AI Revolution', emoji: '🔒', type: 'adult' }
];

// Create output directory
const outputDir = path.join(__dirname, 'content_batch_sample');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Created directory: ${outputDir}`);
}

console.log(`🎯 Generating sample content for ${CHANNELS.length} channels\n`);

CHANNELS.forEach((channel, index) => {
  console.log(`🎬 ${channel.emoji} ${channel.name}`);
  
  const channelDir = path.join(outputDir, channel.name.replace(/\s+/g, '_'));
  if (!fs.existsSync(channelDir)) {
    fs.mkdirSync(channelDir, { recursive: true });
  }
  
  // 1. YouTube Welcome Script
  const youtubeWelcome = `🎬 WELCOME TO ${channel.name}! ${channel.emoji}

Hi ${channel.type === 'kids' ? 'friends' : 'everyone'}! Welcome to our brand new channel!

I'm so excited to have you here as we embark on this journey together.

In this channel, we'll explore amazing ${channel.type === 'kids' ? 'fun' : 'professional'} content about ${getTopic(channel)}.

Make sure to:
1. 👍 LIKE this video
2. 🔔 SUBSCRIBE to the channel  
3. 💬 COMMENT what you want to see next!

First real video coming soon!

Thank you for joining us! See you in the next video! ${channel.emoji}`;
  
  const welcomeFile = path.join(channelDir, 'youtube_welcome.txt');
  fs.writeFileSync(welcomeFile, youtubeWelcome);
  console.log(`   ✅ YouTube welcome script`);
  
  // 2. YouTube Content Script
  const youtubeContent = `🎬 ${channel.name} - Getting Started ${channel.emoji}

Welcome back to ${channel.name}! Today we're going to learn the basics.

${getIntroduction(channel)}

What you'll need:
• ${getMaterial(1)}
• ${getMaterial(2)}
• ${getMaterial(3)}

Step-by-step:
1. ${getStep(1)}
2. ${getStep(2)}
3. ${getStep(3)}

Key takeaways:
• ${getTakeaway(1)}
• ${getTakeaway(2)}
• ${getTakeaway(3)}

If you enjoyed this video, please like and subscribe for more!

Thanks for watching! ${channel.emoji}`;
  
  const contentFile = path.join(channelDir, 'youtube_content_1.txt');
  fs.writeFileSync(contentFile, youtubeContent);
  console.log(`   ✅ YouTube content script`);
  
  // 3. TikTok Caption
  const tiktokCaption = `${channel.emoji} Quick tip from ${channel.name}!

${getQuickTip(channel)}

Watch full tutorial on YouTube! 👇

${getHashtags(channel)}`;
  
  const tiktokFile = path.join(channelDir, 'tiktok_1.txt');
  fs.writeFileSync(tiktokFile, tiktokCaption);
  console.log(`   ✅ TikTok caption`);
  
  // 4. X.com Thread
  const xcomThread = `🎬 New ${channel.name} video! ${channel.emoji}

Thread 🧵 (1/5)

We just launched our new channel! ${channel.emoji}

(2/5)
In our first video, we cover:
• ${getTakeaway(1)}
• ${getTakeaway(2)}

(3/5)
Why this matters:
${getImportance(channel)}

(4/5)
Watch the full video here:
https://youtube.com/${channel.name.replace(/\s+/g, '')}

(5/5)
${getHashtags(channel)}

Follow for more ${getTopic(channel)} content!`;
  
  const xcomFile = path.join(channelDir, 'xcom_thread.txt');
  fs.writeFileSync(xcomFile, xcomThread);
  console.log(`   ✅ X.com thread`);
  
  // 5. Instagram Caption
  const instagramCaption = `🎬 ${channel.name} is live! ${channel.emoji}

We're excited to announce our new channel!

${getInstagramDescription(channel)}

Watch our first video on YouTube! Link in bio 👆

${getHashtags(channel)}`;
  
  const instagramFile = path.join(channelDir, 'instagram_caption.txt');
  fs.writeFileSync(instagramFile, instagramCaption);
  console.log(`   ✅ Instagram caption`);
  
  console.log();
});

console.log('🎉 CONTENT BATCH GENERATED!');
console.log('============================\n');
console.log(`📁 All content saved in: ${outputDir}`);
console.log(`📊 Total: ${CHANNELS.length * 5} content pieces`);
console.log(`   • YouTube scripts: ${CHANNELS.length * 2}`);
console.log(`   • TikTok captions: ${CHANNELS.length}`);
console.log(`   • X.com threads: ${CHANNELS.length}`);
console.log(`   • Instagram captions: ${CHANNELS.length}`);
console.log('\n🚀 Ready for social media account creation!');

// Helper functions
function getTopic(channel) {
  const topics = {
    'Junior Science Lab': 'fun science experiments',
    'Kid Entrepreneur Club': 'business ideas for kids',
    'Storytime Adventures': 'magical stories',
    'Art & Craft Kids': 'creative art projects',
    'AI Automation Lab': 'AI tools and automation',
    'Algorithmic Trading Hub': 'crypto trading',
    'Digital Collectibles Studio': 'NFTs and digital art',
    'Local AI Revolution': 'privacy-focused AI tools'
  };
  return topics[channel.name] || 'amazing content';
}

function getIntroduction(channel) {
  const intros = {
    'Junior Science Lab': 'Today we\'re going to explore the exciting world of science through fun, safe experiments you can do at home!',
    'Kid Entrepreneur Club': 'Let\'s learn how to turn your ideas into real businesses, starting with simple concepts anyone can understand!',
    'AI Automation Lab': 'I\'ll show you how to build a complete AI toolchain for €0/month using only local, open-source tools!'
  };
  return intros[channel.name] || 'Let\'s dive into today\'s topic and learn something new together!';
}

function getMaterial(num) {
  const materials = [
    'Basic supplies',
    'Your creativity',
    'A positive attitude',
    'Notebook and pen',
    'Computer with internet',
    'Curiosity to learn'
  ];
  return materials[num - 1] || `Material ${num}`;
}

function getStep(num) {
  const steps = [
    'Get started with the basics',
    'Follow along with our tutorial',
    'Practice what you\'ve learned',
    'Share your results with us'
  ];
  return steps[num - 1] || `Step ${num}`;
}

function getTakeaway(num) {
  const takeaways = [
    'Learn fundamental concepts',
    'Gain practical skills',
    'Build confidence in the topic',
    'Join our growing community'
  ];
  return takeaways[num - 1] || `Takeaway ${num}`;
}

function getQuickTip(channel) {
  const tips = {
    'Junior Science Lab': 'Always have an adult supervise experiments!',
    'Kid Entrepreneur Club': 'Start small and learn as you grow!',
    'AI Automation Lab': 'Local tools = €0 monthly costs!'
  };
  return tips[channel.name] || 'Practice makes perfect!';
}

function getImportance(channel) {
  const importance = {
    'Junior Science Lab': 'Science education builds critical thinking skills from a young age.',
    'Kid Entrepreneur Club': 'Business skills prepare kids for future success in any career.',
    'AI Automation Lab': 'Local AI tools give you control, privacy, and unlimited scaling.'
  };
  return importance[channel.name] || 'This knowledge will help you grow and succeed.';
}

function getHashtags(channel) {
  const hashtags = {
    'Junior Science Lab': '#ScienceForKids #STEM #Education #KidsLearning',
    'Kid Entrepreneur Club': '#KidBusiness #Entrepreneurship #MoneySkills',
    'Storytime Adventures': '#KidsStories #BedtimeStories #Storytime',
    'Art & Craft Kids': '#KidsArt #Drawing #Crafts #ArtTutorial',
    'AI Automation Lab': '#AI #Automation #TechTools #Productivity',
    'Algorithmic Trading Hub': '#Crypto #Trading #Investing #DeFi',
    'Digital Collectibles Studio': '#NFT #Web3 #DigitalArt #Collectibles',
    'Local AI Revolution': '#Privacy #LocalAI #OpenSource #DataProtection'
  };
  return hashtags[channel.name] || '#Education #Learning #Tutorial';
}

function getInstagramDescription(channel) {
  const descs = {
    'Junior Science Lab': 'Making science fun and accessible for curious young minds!',
    'Kid Entrepreneur Club': 'Teaching business basics to the next generation of innovators!',
    'AI Automation Lab': 'Building €0/month AI tools for unlimited creativity and automation!'
  };
  return descs[channel.name] || 'Join us for amazing content and learning opportunities!';
}