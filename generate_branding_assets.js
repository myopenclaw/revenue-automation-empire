// 🎨 GENERATE BRANDING ASSETS
// Create logos, banners, thumbnails for 10 social media accounts

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

console.log('🎨 GENERATING BRANDING ASSETS');
console.log('==============================\n');

// Channel configurations
const CHANNELS = [
  // Kids Channels
  {
    name: 'Junior Science Lab',
    type: 'kids',
    emoji: '🧪',
    color: '#4CAF50',
    secondaryColor: '#8BC34A',
    accentColor: '#FFC107',
    description: 'Fun science experiments for kids!'
  },
  {
    name: 'Kid Entrepreneur Club',
    type: 'kids',
    emoji: '💼',
    color: '#FF9800',
    secondaryColor: '#FFB74D',
    accentColor: '#4CAF50',
    description: 'Business basics for young minds!'
  },
  {
    name: 'Storytime Adventures',
    type: 'kids',
    emoji: '📚',
    color: '#2196F3',
    secondaryColor: '#64B5F6',
    accentColor: '#FF9800',
    description: 'Magical stories come to life!'
  },
  {
    name: 'Art & Craft Kids',
    type: 'kids',
    emoji: '🎨',
    color: '#E91E63',
    secondaryColor: '#F48FB1',
    accentColor: '#9C27B0',
    description: 'Creative fun for little artists!'
  },
  
  // Adult Channels
  {
    name: 'AI Automation Lab',
    type: 'adult',
    emoji: '🤖',
    color: '#9C27B0',
    secondaryColor: '#BA68C8',
    accentColor: '#4CAF50',
    description: 'AI tools & automation for €0/month'
  },
  {
    name: 'Algorithmic Trading Hub',
    type: 'adult',
    emoji: '📈',
    color: '#4CAF50',
    secondaryColor: '#8BC34A',
    accentColor: '#FF9800',
    description: 'Crypto trading automation & education'
  },
  {
    name: 'Digital Collectibles Studio',
    type: 'adult',
    emoji: '🖼️',
    color: '#FF9800',
    secondaryColor: '#FFB74D',
    accentColor: '#9C27B0',
    description: 'Silver NFTs & digital collectibles'
  },
  {
    name: 'Local AI Revolution',
    type: 'adult',
    emoji: '🔒',
    color: '#2196F3',
    secondaryColor: '#64B5F6',
    accentColor: '#4CAF50',
    description: 'Privacy-focused AI tools'
  },
  
  // Instagram Combined
  {
    name: 'Kids Edu Network',
    type: 'instagram',
    emoji: '🧪💼📚🎨',
    color: 'linear-gradient(135deg, #4CAF50, #FF9800, #2196F3, #E91E63)',
    description: 'Fun learning for kids! All our channels in one place.'
  },
  {
    name: 'AI Tech Creators',
    type: 'instagram',
    emoji: '🤖📈🖼️🔒',
    color: '#1a1a1a',
    secondaryColor: '#333333',
    accentColor: '#4FC3F7',
    description: 'AI automation • Crypto trading • NFTs • Local AI'
  }
];

// Create output directory
const outputDir = path.join(__dirname, 'branding_assets');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Created branding directory: ${outputDir}`);
}

// Create style guide
const styleGuide = {
  generated: new Date().toISOString(),
  channels: {}
};

async function generateBrandingAssets() {
  console.log(`🎯 Generating assets for ${CHANNELS.length} channels\n`);
  
  const results = [];
  
  for (const channel of CHANNELS) {
    console.log(`🎨 ${channel.emoji} ${channel.name}:`);
    
    // Create channel directory
    const channelDir = path.join(outputDir, channel.name.replace(/\s+/g, '_'));
    if (!fs.existsSync(channelDir)) {
      fs.mkdirSync(channelDir, { recursive: true });
    }
    
    const channelResults = {
      channel: channel.name,
      files: []
    };
    
    // 1. Generate Profile Picture (800×800px)
    console.log('   👤 Profile picture...');
    const profilePic = await generateProfilePicture(channel, channelDir);
    channelResults.files.push(profilePic);
    
    // 2. Generate YouTube Banner (2560×1440px)
    console.log('   🚩 YouTube banner...');
    const youtubeBanner = await generateYouTubeBanner(channel, channelDir);
    channelResults.files.push(youtubeBanner);
    
    // 3. Generate Thumbnail Template (1280×720px)
    console.log('   🖼️  Thumbnail template...');
    const thumbnail = await generateThumbnailTemplate(channel, channelDir);
    channelResults.files.push(thumbnail);
    
    // 4. Generate Social Media Banner (1500×500px for X.com)
    console.log('   📱 Social media banner...');
    const socialBanner = await generateSocialBanner(channel, channelDir);
    channelResults.files.push(socialBanner);
    
    // 5. Generate Color Palette
    console.log('   🎨 Color palette...');
    const colorPalette = generateColorPalette(channel, channelDir);
    channelResults.files.push(colorPalette);
    
    // Add to style guide
    styleGuide.channels[channel.name] = {
      colors: {
        primary: channel.color,
        secondary: channel.secondaryColor,
        accent: channel.accentColor
      },
      emoji: channel.emoji,
      type: channel.type,
      files: channelResults.files.map(f => path.basename(f))
    };
    
    results.push(channelResults);
    console.log(`   ✅ ${channelResults.files.length} assets generated\n`);
  }
  
  // Save style guide
  const styleGuideFile = path.join(outputDir, 'BRANDING_STYLE_GUIDE.md');
  fs.writeFileSync(styleGuideFile, generateStyleGuideMarkdown(styleGuide));
  console.log(`📋 Style guide saved: ${styleGuideFile}`);
  
  // Summary
  console.log('🎉 BRANDING ASSETS GENERATION COMPLETE!');
  console.log('=======================================\n');
  
  const totalFiles = results.reduce((sum, r) => sum + r.files.length, 0);
  console.log(`📊 SUMMARY:`);
  console.log(`   • Channels: ${CHANNELS.length}`);
  console.log(`   • Total files: ${totalFiles}`);
  console.log(`   • Profile pictures: ${CHANNELS.length}`);
  console.log(`   • YouTube banners: ${CHANNELS.length}`);
  console.log(`   • Thumbnail templates: ${CHANNELS.length}`);
  console.log(`   • Social banners: ${CHANNELS.length}`);
  console.log(`   • Color palettes: ${CHANNELS.length}`);
  console.log(`\n📁 All assets saved in: ${outputDir}`);
  
  return {
    success: true,
    results,
    styleGuide: styleGuideFile,
    outputDir
  };
}

async function generateProfilePicture(channel, channelDir) {
  const size = 800;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  if (channel.color.includes('gradient')) {
    // For Instagram combined accounts with gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(0.33, '#FF9800');
    gradient.addColorStop(0.66, '#2196F3');
    gradient.addColorStop(1, '#E91E63');
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = channel.color;
  }
  ctx.fillRect(0, 0, size, size);
  
  // Circle in center
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 50, 0, Math.PI * 2);
  ctx.fill();
  
  // Emoji(s)
  ctx.fillStyle = channel.color.includes('gradient') ? '#333333' : channel.color;
  ctx.font = `bold ${size / 3}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Handle multiple emojis for combined accounts
  const emojis = channel.emoji.split('');
  if (emojis.length === 1) {
    // Single emoji
    ctx.fillText(channel.emoji, size / 2, size / 2);
  } else {
    // Multiple emojis (for combined accounts)
    const emojiSize = size / 4;
    ctx.font = `bold ${emojiSize}px Arial`;
    
    emojis.forEach((emoji, index) => {
      const angle = (index / emojis.length) * Math.PI * 2;
      const radius = size / 3;
      const x = size / 2 + radius * Math.cos(angle);
      const y = size / 2 + radius * Math.sin(angle);
      ctx.fillText(emoji, x, y);
    });
  }
  
  // Save
  const filename = `profile_${channel.name.replace(/\s+/g, '_')}.png`;
  const filepath = path.join(channelDir, filename);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
  
  return filepath;
}

async function generateYouTubeBanner(channel, channelDir) {
  const width = 2560;
  const height = 1440;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  
  if (channel.color.includes('gradient')) {
    // Instagram combined gradient
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(0.25, '#FF9800');
    gradient.addColorStop(0.5, '#2196F3');
    gradient.addColorStop(0.75, '#E91E63');
    gradient.addColorStop(1, '#9C27B0');
  } else {
    gradient.addColorStop(0, channel.color);
    gradient.addColorStop(1, channel.secondaryColor || channel.color);
  }
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Channel name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 120px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(channel.name, width / 2, height / 2);
  
  // Description
  ctx.font = '48px Arial';
  ctx.fillStyle = channel.accentColor || '#FFC107';
  ctx.fillText(channel.description, width / 2, height / 2 + 100);
  
  // Emoji(s)
  ctx.font = '100px Arial';
  ctx.fillStyle = '#FFFFFF';
  
  const emojis = channel.emoji.split('');
  if (emojis.length === 1) {
    ctx.fillText(channel.emoji, width / 2, height / 2 - 200);
  } else {
    // Multiple emojis spaced out
    const spacing = 150;
    const startX = width / 2 - ((emojis.length - 1) * spacing) / 2;
    
    emojis.forEach((emoji, index) => {
      ctx.fillText(emoji, startX + index * spacing, height / 2 - 200);
    });
  }
  
  // Save
  const filename = `banner_${channel.name.replace(/\s+/g, '_')}.png`;
  const filepath = path.join(channelDir, filename);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
  
  return filepath;
}

async function generateThumbnailTemplate(channel, channelDir) {
  const width = 1280;
  const height = 720;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background
  if (channel.type === 'kids') {
    // Bright, playful background for kids
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, channel.color);
    gradient.addColorStop(1, channel.secondaryColor || channel.color);
    ctx.fillStyle = gradient;
  } else {
    // Professional, darker for adult channels
    ctx.fillStyle = '#1a1a1a';
  }
  
  ctx.fillRect(0, 0, width, height);
  
  // Title area (top)
  ctx.fillStyle = channel.type === 'kids' ? '#FFFFFF' : channel.accentColor;
  ctx.font = 'bold 60px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('YOUR VIDEO TITLE HERE', width / 2, 50);
  
  // Emoji/logo area
  ctx.font = '120px Arial';
  ctx.fillStyle = channel.type === 'kids' ? channel.accentColor : '#FFFFFF';
  
  const emojis = channel.emoji.split('');
  if (emojis.length === 1) {
    ctx.fillText(channel.emoji, width / 2, height / 2 - 60);
  } else {
    const spacing = 100;
    const startX = width / 2 - ((emojis.length - 1) * spacing) / 2;
    
    emojis.forEach((emoji, index) => {
      ctx.fillText(emoji, startX + index * spacing, height / 2 - 60);
    });
  }
  
  // Channel name (bottom)
  ctx.font = 'bold 48px Arial';
  ctx.fillStyle = channel.type === 'kids' ? '#FFFFFF' : channel.accentColor;
  ctx.fillText(channel.name, width / 2, height - 100);
  
  // Template indicator
  ctx.font = '24px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillText('Thumbnail Template - Replace with actual content', width / 2, height - 30);
  
  // Save
  const filename = `thumbnail_template_${channel.name.replace(/\s+/g, '_')}.png`;
  const filepath = path.join(channelDir, filename);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
  
  return filepath;
}

async function generateSocialBanner(channel, channelDir) {
  const width = 1500;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background
  if (channel.type === 'instagram') {
    // Special treatment for Instagram combined accounts
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    if (channel.name === 'Kids Edu Network') {
      gradient.addColorStop(0, '#4CAF50');
      gradient.addColorStop(0.33, '#FF9800');
      gradient.addColorStop(0.66, '#2196F3');
      gradient.addColorStop(1, '#E91E63');
    } else {
      // AI Tech Creators - dark tech theme
      gradient.addColorStop(0, '#1a1a1a');
      gradient.addColorStop(1, '#333333');
    }
    ctx.fillStyle = gradient;
  } else {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, channel.color);
    gradient.addColorStop(1, channel.secondaryColor || channel.color);
    ctx.fillStyle = gradient;
  }
  
  ctx.fillRect(0, 0, width, height);
  
  // Channel name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 72px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(channel.name, width / 2, height / 2);
  
  // Emoji(s)
  ctx.font = '60px Arial';
  
  const emojis = channel.emoji.split('');
  if (emojis.length === 1) {
    ctx.fillText(channel.emoji, width / 2, height / 2 - 80);
  } else {
    const spacing = 80;
    const startX = width / 2 - ((emojis.length - 1) * spacing) / 2;
    
    emojis.forEach((emoji, index) => {
      ctx.fillText(emoji, startX + index * spacing, height / 2 - 80);
    });
  }
  
  // Save
  const filename = `social_banner_${channel.name.replace(/\s+/g, '_')}.png`;
  const filepath = path.join(channelDir, filename);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
  
  return filepath;
}

function generateColorPalette(channel, channelDir) {
  const palette