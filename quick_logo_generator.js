// 🎨 QUICK LOGO GENERATOR
// Generate basic logos for 10 channels

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

console.log('🎨 QUICK LOGO GENERATOR');
console.log('=======================\n');

const CHANNELS = [
  { name: 'Junior Science Lab', emoji: '🧪', color: '#4CAF50' },
  { name: 'Kid Entrepreneur Club', emoji: '💼', color: '#FF9800' },
  { name: 'Storytime Adventures', emoji: '📚', color: '#2196F3' },
  { name: 'Art & Craft Kids', emoji: '🎨', color: '#E91E63' },
  { name: 'AI Automation Lab', emoji: '🤖', color: '#9C27B0' },
  { name: 'Algorithmic Trading Hub', emoji: '📈', color: '#4CAF50' },
  { name: 'Digital Collectibles Studio', emoji: '🖼️', color: '#FF9800' },
  { name: 'Local AI Revolution', emoji: '🔒', color: '#2196F3' },
  { name: 'Kids Edu Network', emoji: '🧪💼📚🎨', color: 'gradient' },
  { name: 'AI Tech Creators', emoji: '🤖📈🖼️🔒', color: '#1a1a1a' }
];

// Create output directory
const outputDir = path.join(__dirname, 'quick_logos');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Created directory: ${outputDir}`);
}

console.log(`🎯 Generating logos for ${CHANNELS.length} channels\n`);

CHANNELS.forEach(channel => {
  console.log(`🎨 ${channel.emoji} ${channel.name}`);
  
  // 1. Profile Picture (800×800)
  const profileCanvas = createCanvas(800, 800);
  const profileCtx = profileCanvas.getContext('2d');
  
  // Background
  if (channel.color === 'gradient') {
    const gradient = profileCtx.createLinearGradient(0, 0, 800, 800);
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(0.33, '#FF9800');
    gradient.addColorStop(0.66, '#2196F3');
    gradient.addColorStop(1, '#E91E63');
    profileCtx.fillStyle = gradient;
  } else {
    profileCtx.fillStyle = channel.color;
  }
  profileCtx.fillRect(0, 0, 800, 800);
  
  // White circle
  profileCtx.fillStyle = '#FFFFFF';
  profileCtx.beginPath();
  profileCtx.arc(400, 400, 350, 0, Math.PI * 2);
  profileCtx.fill();
  
  // Emoji
  profileCtx.fillStyle = channel.color === 'gradient' ? '#333333' : channel.color;
  profileCtx.font = 'bold 200px Arial';
  profileCtx.textAlign = 'center';
  profileCtx.textBaseline = 'middle';
  
  if (channel.emoji.length <= 3) {
    profileCtx.fillText(channel.emoji, 400, 400);
  } else {
    // Multiple emojis
    profileCtx.font = 'bold 100px Arial';
    const emojis = channel.emoji.split('');
    emojis.forEach((emoji, i) => {
      const angle = (i / emojis.length) * Math.PI * 2;
      const x = 400 + 200 * Math.cos(angle);
      const y = 400 + 200 * Math.sin(angle);
      profileCtx.fillText(emoji, x, y);
    });
  }
  
  // Save
  const profileFile = path.join(outputDir, `profile_${channel.name.replace(/\s+/g, '_')}.png`);
  fs.writeFileSync(profileFile, profileCanvas.toBuffer('image/png'));
  console.log(`   ✅ Profile: ${path.basename(profileFile)}`);
  
  // 2. Simple Banner (1500×500)
  const bannerCanvas = createCanvas(1500, 500);
  const bannerCtx = bannerCanvas.getContext('2d');
  
  // Background
  if (channel.color === 'gradient') {
    const gradient = bannerCtx.createLinearGradient(0, 0, 1500, 500);
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(0.25, '#FF9800');
    gradient.addColorStop(0.5, '#2196F3');
    gradient.addColorStop(0.75, '#E91E63');
    gradient.addColorStop(1, '#9C27B0');
    bannerCtx.fillStyle = gradient;
  } else if (channel.color === '#1a1a1a') {
    const gradient = bannerCtx.createLinearGradient(0, 0, 1500, 500);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#333333');
    bannerCtx.fillStyle = gradient;
  } else {
    const gradient = bannerCtx.createLinearGradient(0, 0, 1500, 500);
    gradient.addColorStop(0, channel.color);
    gradient.addColorStop(1, lightenColor(channel.color, 30));
    bannerCtx.fillStyle = gradient;
  }
  bannerCtx.fillRect(0, 0, 1500, 500);
  
  // Channel name
  bannerCtx.fillStyle = '#FFFFFF';
  bannerCtx.font = 'bold 72px Arial';
  bannerCtx.textAlign = 'center';
  bannerCtx.textBaseline = 'middle';
  bannerCtx.fillText(channel.name, 750, 250);
  
  // Emoji
  bannerCtx.font = '60px Arial';
  if (channel.emoji.length <= 3) {
    bannerCtx.fillText(channel.emoji, 750, 150);
  } else {
    bannerCtx.font = '40px Arial';
    const emojis = channel.emoji.split('');
    const spacing = 60;
    const startX = 750 - ((emojis.length - 1) * spacing) / 2;
    emojis.forEach((emoji, i) => {
      bannerCtx.fillText(emoji, startX + i * spacing, 150);
    });
  }
  
  // Save
  const bannerFile = path.join(outputDir, `banner_${channel.name.replace(/\s+/g, '_')}.png`);
  fs.writeFileSync(bannerFile, bannerCanvas.toBuffer('image/png'));
  console.log(`   ✅ Banner: ${path.basename(bannerFile)}`);
  
  console.log();
});

console.log('🎉 LOGO GENERATION COMPLETE!');
console.log('============================\n');
console.log(`📁 All logos saved in: ${outputDir}`);
console.log(`📊 Total: ${CHANNELS.length * 2} files generated`);
console.log('\n🎨 Ready for social media account creation!');

// Helper function
function lightenColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)
  ).toString(16).slice(1);
}