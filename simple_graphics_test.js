// 🎨 SIMPLE GRAPHICS TEST
// Quick thumbnail generation test

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

console.log('🎨 SIMPLE GRAPHICS ENGINE TEST');
console.log('===============================\n');

// Create output directory
const outputDir = path.join(__dirname, 'graphics_test_output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Created directory: ${outputDir}`);
}

// Channel configurations
const channels = [
  { name: 'Junior Science Lab', color: '#4CAF50', emoji: '🧪' },
  { name: 'Kid Entrepreneur Club', color: '#FF9800', emoji: '💼' },
  { name: 'Storytime Adventures', color: '#2196F3', emoji: '📚' },
  { name: 'Art & Craft Kids', color: '#E91E63', emoji: '🎨' }
];

// Sample titles
const titles = [
  'Fun Science Experiments for Kids!',
  'Start Your First Business Today!',
  'Magical Bedtime Stories',
  'Easy Art Projects for Beginners'
];

console.log('🖼️  Generating test thumbnails...\n');

channels.forEach((channel, index) => {
  // Create canvas
  const width = 1280;
  const height = 720;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = channel.color;
  ctx.fillRect(0, 0, width, height);
  
  // Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 60px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Simple text wrapping
  const words = titles[index].split(' ');
  let lines = [];
  let currentLine = words[0];
  
  for (let i = 1; i < words.length; i++) {
    const testWidth = ctx.measureText(currentLine + ' ' + words[i]).width;
    if (testWidth < 1000) {
      currentLine += ' ' + words[i];
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);
  
  // Draw lines
  const lineHeight = 65;
  const startY = height / 2 - (lines.length - 1) * lineHeight / 2;
  
  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, startY + i * lineHeight);
  });
  
  // Channel emoji
  ctx.font = '100px Arial';
  ctx.fillText(channel.emoji, width / 2, height - 150);
  
  // Channel name
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(channel.name, width / 2, height - 60);
  
  // Save thumbnail
  const filename = `thumbnail_${channel.name.replace(/\s+/g, '_')}.png`;
  const filepath = path.join(outputDir, filename);
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
  
  console.log(`✅ ${channel.name}:`);
  console.log(`   File: ${filename}`);
  console.log(`   Size: ${width}x${height}`);
  console.log(`   Color: ${channel.color}`);
  console.log(`   Emoji: ${channel.emoji}\n`);
});

// Generate simple banner
console.log('🚩 Generating test banner...');

const bannerWidth = 2560;
const bannerHeight = 1440;
const bannerCanvas = createCanvas(bannerWidth, bannerHeight);
const bannerCtx = bannerCanvas.getContext('2d');

// Gradient background
const gradient = bannerCtx.createLinearGradient(0, 0, bannerWidth, bannerHeight);
gradient.addColorStop(0, '#4CAF50');
gradient.addColorStop(0.5, '#2196F3');
gradient.addColorStop(1, '#E91E63');

bannerCtx.fillStyle = gradient;
bannerCtx.fillRect(0, 0, bannerWidth, bannerHeight);

// Title
bannerCtx.fillStyle = '#FFFFFF';
bannerCtx.font = 'bold 100px Arial';
bannerCtx.textAlign = 'center';
bannerCtx.textBaseline = 'middle';
bannerCtx.fillText('Kids Educational Channels', bannerWidth / 2, bannerHeight / 2);

// Subtitle
bannerCtx.font = '48px Arial';
bannerCtx.fillStyle = '#FFC107';
bannerCtx.fillText('Fun Learning for Ages 5-9', bannerWidth / 2, bannerHeight / 2 + 100);

// Emojis
bannerCtx.font = '80px Arial';
const emojis = ['🧪', '💼', '📚', '🎨'];
emojis.forEach((emoji, i) => {
  bannerCtx.fillText(emoji, 500 + i * 400, bannerHeight - 200);
});

// Save banner
const bannerFile = path.join(outputDir, 'youtube_banner.png');
const bannerBuffer = bannerCanvas.toBuffer('image/png');
fs.writeFileSync(bannerFile, bannerBuffer);

console.log(`✅ Banner generated: youtube_banner.png`);
console.log(`   Size: ${bannerWidth}x${bannerHeight}\n`);

console.log('🎉 GRAPHICS ENGINE TEST COMPLETE!');
console.log(`📁 Files saved in: ${outputDir}`);
console.log('\n💰 Canva Pro replacement ready:');
console.log('   • Thumbnail generation: ✅ Working');
console.log('   • Banner generation: ✅ Working');
console.log('   • Batch processing: Ready to implement');
console.log('   • Monthly savings: €12 (Canva Pro cost)');
console.log('\n🚀 Next: Integrate with video pipeline');