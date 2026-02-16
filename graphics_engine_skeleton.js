// 🎨 GRAPHICS ENGINE SKELETON
// Local thumbnail, banner, logo generation (replaces Canva Pro €12/month)

const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

console.log('🎨 GRAPHICS ENGINE SKELETON');
console.log('============================\n');

class GraphicsEngine {
  constructor() {
    // Channel configurations
    this.channels = {
      'Junior Science Lab': {
        primaryColor: '#4CAF50', // Green
        secondaryColor: '#8BC34A',
        accentColor: '#FFC107',
        font: 'Arial',
        logo: '🧪'
      },
      'Kid Entrepreneur Club': {
        primaryColor: '#FF9800', // Orange
        secondaryColor: '#FFB74D',
        accentColor: '#4CAF50',
        font: 'Arial',
        logo: '💼'
      },
      'Storytime Adventures': {
        primaryColor: '#2196F3', // Blue
        secondaryColor: '#64B5F6',
        accentColor: '#FF9800',
        font: 'Arial',
        logo: '📚'
      },
      'Art & Craft Kids': {
        primaryColor: '#E91E63', // Pink
        secondaryColor: '#F48FB1',
        accentColor: '#9C27B0',
        font: 'Arial',
        logo: '🎨'
      }
    };
    
    // Output directories
    this.outputDir = path.join(__dirname, 'graphics_output');
    this.thumbnailsDir = path.join(__dirname, 'graphics_output', 'thumbnails');
    this.bannersDir = path.join(__dirname, 'graphics_output', 'banners');
    this.logosDir = path.join(__dirname, 'graphics_output', 'logos');
    
    // Create directories
    [this.outputDir, this.thumbnailsDir, this.bannersDir, this.logosDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    });
    
    console.log(`🎯 Graphics engine initialized for ${Object.keys(this.channels).length} channels\n`);
  }
  
  /**
   * Generate YouTube thumbnail (1280x720)
   */
  async generateThumbnail(channelName, title, style = 'default') {
    console.log(`🖼️  Generating thumbnail for: ${channelName}`);
    
    const channel = this.channels[channelName];
    if (!channel) {
      throw new Error(`Channel ${channelName} not found`);
    }
    
    // Create canvas
    const width = 1280;
    const height = 720;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Apply style template
    switch (style) {
      case 'science':
        await this.renderScienceThumbnail(ctx, width, height, channel, title);
        break;
      case 'business':
        await this.renderBusinessThumbnail(ctx, width, height, channel, title);
        break;
      case 'story':
        await this.renderStoryThumbnail(ctx, width, height, channel, title);
        break;
      case 'art':
        await this.renderArtThumbnail(ctx, width, height, channel, title);
        break;
      default:
        await this.renderDefaultThumbnail(ctx, width, height, channel, title);
    }
    
    // Save thumbnail
    const filename = `thumbnail_${channelName.replace(/\s+/g, '_')}_${Date.now()}.png`;
    const filepath = path.join(this.thumbnailsDir, filename);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);
    
    console.log(`   ✅ Thumbnail saved: ${filename}`);
    console.log(`   📏 Size: ${width}x${height}`);
    console.log(`   🎨 Colors: ${channel.primaryColor}, ${channel.secondaryColor}\n`);
    
    return {
      success: true,
      file: filepath,
      channel: channelName,
      dimensions: { width, height },
      style
    };
  }
  
  /**
   * Default thumbnail template
   */
  async renderDefaultThumbnail(ctx, width, height, channel, title) {
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, channel.primaryColor);
    gradient.addColorStop(1, channel.secondaryColor);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Title text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Wrap text if too long
    const words = title.split(' ');
    let lines = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < 1000) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    
    // Draw lines
    const lineHeight = 80;
    const startY = height / 2 - (lines.length - 1) * lineHeight / 2;
    
    lines.forEach((line, i) => {
      ctx.fillText(line, width / 2, startY + i * lineHeight);
    });
    
    // Channel logo/emoji
    ctx.font = '120px Arial';
    ctx.fillText(channel.logo, width / 2, height - 150);
    
    // Channel name
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = channel.accentColor;
    ctx.fillText(channelName, width / 2, height - 60);
    
    // Add some visual interest
    this.addDecoration(ctx, width, height, channel);
  }
  
  /**
   * Science channel thumbnail
   */
  async renderScienceThumbnail(ctx, width, height, channel, title) {
    // Science-themed background
    ctx.fillStyle = '#1A237E'; // Dark blue
    ctx.fillRect(0, 0, width, height);
    
    // Stars/particles
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3 + 1;
      ctx.fillRect(x, y, size, size);
    }
    
    // Title with science vibe
    ctx.fillStyle = '#4FC3F7'; // Light blue
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const lines = this.wrapText(ctx, title, 1000);
    const lineHeight = 70;
    const startY = height / 2 - (lines.length - 1) * lineHeight / 2;
    
    lines.forEach((line, i) => {
      // Glow effect
      ctx.shadowColor = '#4FC3F7';
      ctx.shadowBlur = 15;
      ctx.fillText(line, width / 2, startY + i * lineHeight);
      ctx.shadowBlur = 0;
    });
    
    // Science emojis
    const emojis = ['🧪', '🔬', '⚗️', '🌡️', '🧫'];
    ctx.font = '80px Arial';
    emojis.forEach((emoji, i) => {
      ctx.fillText(emoji, 200 + i * 180, height - 100);
    });
    
    // Channel name
    ctx.font = 'bold 42px Arial';
    ctx.fillStyle = channel.accentColor;
    ctx.fillText('Junior Science Lab', width / 2, 100);
  }
  
  /**
   * Business channel thumbnail
   */
  async renderBusinessThumbnail(ctx, width, height, channel, title) {
    // Professional background
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#FF9800'); // Orange
    gradient.addColorStop(1, '#FFB74D'); // Light orange
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Grid pattern (subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Title with business look
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    
    const lines = this.wrapText(ctx, title, 1100);
    const lineHeight = 65;
    const startY = height / 2 - (lines.length - 1) * lineHeight / 2;
    
    lines.forEach((line, i) => {
      // Text shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 4;
      ctx.fillText(line, width / 2, startY + i * lineHeight);
      ctx.shadowColor = 'transparent';
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 0;
    });
    
    // Business emojis
    ctx.font = '70px Arial';
    const businessEmojis = ['💼', '💰', '📈', '💡', '🏆'];
    businessEmojis.forEach((emoji, i) => {
      ctx.fillText(emoji, 150 + i * 200, height - 120);
    });
    
    // Channel name with badge
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(width / 2 - 200, 40, 400, 60);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Kid Entrepreneur Club', width / 2, 75);
  }
  
  /**
   * Add decorative elements
   */
  addDecoration(ctx, width, height, channel) {
    // Corner accents
    ctx.fillStyle = channel.accentColor;
    const cornerSize = 40;
    
    // Top-left
    ctx.fillRect(0, 0, cornerSize, cornerSize);
    // Top-right
    ctx.fillRect(width - cornerSize, 0, cornerSize, cornerSize);
    // Bottom-left
    ctx.fillRect(0, height - cornerSize, cornerSize, cornerSize);
    // Bottom-right
    ctx.fillRect(width - cornerSize, height - cornerSize, cornerSize, cornerSize);
    
    // Dots pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 10 + 5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  /**
   * Wrap text to fit width
   */
  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }
  
  /**
   * Generate YouTube channel banner (2560x1440)
   */
  async generateBanner(channelName) {
    console.log(`🚩 Generating banner for: ${channelName}`);
    
    const channel = this.channels[channelName];
    if (!channel) {
      throw new Error(`Channel ${channelName} not found`);
    }
    
    // YouTube banner dimensions
    const width = 2560;
    const height = 1440;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, channel.primaryColor);
    gradient.addColorStop(0.5, channel.secondaryColor);
    gradient.addColorStop(1, channel.primaryColor);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Channel name (large)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(channelName, width / 2, height / 2);
    
    // Tagline
    ctx.font = '48px Arial';
    ctx.fillStyle = channel.accentColor;
    
    const taglines = {
      'Junior Science Lab': 'Fun Experiments for Curious Kids!',
      'Kid Entrepreneur Club': 'Business Basics for Young Minds!',
      'Storytime Adventures': 'Magical Stories Come to Life!',
      'Art & Craft Kids': 'Creative Fun for Little Artists!'
    };
    
    ctx.fillText(taglines[channelName] || 'Educational Fun for Kids!', width / 2, height / 2 + 100);
    
    // Channel logo/emoji
    ctx.font = '200px Arial';
    ctx.fillText(channel.logo, width / 2, height / 2 - 200);
    
    // Save banner
    const filename = `banner_${channelName.replace(/\s+/g, '_')}.png`;
    const filepath = path.join(this.bannersDir, filename);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);
    
    console.log(`   ✅ Banner saved: ${filename}`);
    console.log(`   📏 Size: ${width}x${height}\n`);
    
    return {
      success: true,
      file: filepath,
      channel: channelName,
      dimensions: { width, height }
    };
  }
  
  /**
   * Generate channel logo (1000x1000)
   */
  async generateLogo(channelName) {
    console.log(`🔷 Generating logo for: ${channelName}`);
    
    const channel = this.channels[channelName];
    if (!channel) {
      throw new Error(`Channel ${channelName} not found`);
    }
    
    const size = 1000;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Circular background
    ctx.fillStyle = channel.primaryColor;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 50, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner circle
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 100, 0, Math.PI * 2);
    ctx.fill();
    
    // Channel logo/emoji
    ctx.fillStyle = channel.primaryColor;
    ctx.font = `bold ${size / 3}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(channel.logo, size / 2, size / 2);
    
    // Channel name (around circle)
    ctx.font = 'bold 80px Arial';
    ctx.fillStyle = '#FFFFFF';
    
    const name = channelName.toUpperCase();
    const radius = size / 2 - 30;
    const angleStep = (Math.PI * 2) / name.length;
    
    for (let i = 0; i < name.length; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = size / 2 + radius * Math.cos(angle);
      const y = size / 2 + radius * Math.sin(angle);
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillText(name[i], 0, 0);
      ctx.restore();
    }
    
    // Save logo
