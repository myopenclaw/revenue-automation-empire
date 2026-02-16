// 🎨 Generate myopenclaw GitHub Logo
// Run: node generate_myopenclaw_logo.js

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create logos directory if it doesn't exist
const logosDir = path.join(__dirname, 'github_logos');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

// Logo configurations
const logoConfigs = [
  {
    name: 'myopenclaw_main',
    size: 512,
    backgroundColor: '#0d1117', // GitHub dark theme
    primaryColor: '#238636',    // GitHub green
    secondaryColor: '#f0f6fc',  // GitHub light text
    text: 'myopenclaw',
    tagline: 'Revenue Automation Empire'
  },
  {
    name: 'myopenclaw_square',
    size: 256,
    backgroundColor: '#ffffff',
    primaryColor: '#1a1f29',
    secondaryColor: '#238636',
    text: 'myopenclaw',
    tagline: ''
  },
  {
    name: 'myopenclaw_banner',
    width: 1500,
    height: 500,
    backgroundColor: '#0d1117',
    primaryColor: '#238636',
    secondaryColor: '#f0f6fc',
    text: 'myopenclaw',
    tagline: 'Building €50K+ MRR Revenue Systems'
  },
  {
    name: 'myopenclaw_minimal',
    size: 128,
    backgroundColor: 'transparent',
    primaryColor: '#238636',
    secondaryColor: '#238636',
    text: 'OC',
    tagline: ''
  }
];

// Generate claw/gear icon
function drawClawGear(ctx, x, y, size, color, backgroundColor) {
  ctx.save();
  ctx.translate(x, y);
  
  // Draw gear (outer circle with teeth)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw gear teeth
  const teeth = 8;
  const toothLength = size * 0.15;
  const toothWidth = size * 0.05;
  
  for (let i = 0; i < teeth; i++) {
    const angle = (i * Math.PI * 2) / teeth;
    ctx.save();
    ctx.rotate(angle);
    ctx.translate(size * 0.4, 0);
    
    ctx.beginPath();
    ctx.rect(-toothWidth / 2, -toothLength / 2, toothWidth, toothLength);
    ctx.fill();
    
    ctx.restore();
  }
  
  // Draw inner circle (negative space)
  ctx.fillStyle = backgroundColor === 'transparent' ? '#ffffff' : backgroundColor;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw claw marks (3 lines)
  const clawCount = 3;
  const clawLength = size * 0.3;
  
  for (let i = 0; i < clawCount; i++) {
    const angle = (i * Math.PI * 2) / clawCount;
    ctx.save();
    ctx.rotate(angle);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 0.03;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(size * 0.2, 0);
    ctx.lineTo(size * 0.2 + clawLength, 0);
    ctx.stroke();
    
    ctx.restore();
  }
  
  ctx.restore();
}

// Generate a logo
function generateLogo(config) {
  const isBanner = config.width && config.height;
  const width = isBanner ? config.width : config.size;
  const height = isBanner ? config.height : config.size;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Set background
  if (config.backgroundColor === 'transparent') {
    // Transparent background
  } else {
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }
  
  // Draw claw/gear icon
  const iconSize = Math.min(width, height) * 0.4;
  const iconX = width / 2;
  const iconY = isBanner ? height * 0.35 : height * 0.4;
  
  drawClawGear(ctx, iconX, iconY, iconSize, config.primaryColor, config.backgroundColor);
  
  // Draw text
  ctx.fillStyle = config.secondaryColor;
  ctx.textAlign = 'center';
  
  // Main text
  const mainFontSize = isBanner ? 72 : config.size * 0.15;
  ctx.font = `bold ${mainFontSize}px 'Arial', sans-serif`;
  ctx.fillText(config.text, width / 2, isBanner ? height * 0.65 : height * 0.7);
  
  // Tagline (if provided)
  if (config.tagline) {
    const taglineFontSize = isBanner ? 32 : config.size * 0.07;
    ctx.font = `${taglineFontSize}px 'Arial', sans-serif`;
    ctx.fillStyle = config.primaryColor;
    ctx.fillText(config.tagline, width / 2, isBanner ? height * 0.75 : height * 0.82);
  }
  
  // Save to file
  const filename = `${config.name}.png`;
  const filepath = path.join(logosDir, filename);
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
  
  console.log(`✅ Generated: ${filename} (${width}x${height})`);
  return filepath;
}

// Generate all logos
console.log('🎨 Generating myopenclaw GitHub logos...');
console.log('📁 Output directory:', logosDir);
console.log('---');

const generatedLogos = logoConfigs.map(generateLogo);

console.log('\n🎉 All logos generated successfully!');
console.log('\n📋 Logo Files:');
generatedLogos.forEach((filepath, index) => {
  const stats = fs.statSync(filepath);
  const filename = path.basename(filepath);
  console.log(`  ${index + 1}. ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
});

console.log('\n🚀 Usage:');
console.log('1. GitHub Profile Picture: myopenclaw_square.png (256x256)');
console.log('2. GitHub Banner: myopenclaw_banner.png (1500x500)');
console.log('3. Repository Logo: myopenclaw_main.png (512x512)');
console.log('4. Favicon: myopenclaw_minimal.png (128x128)');

console.log('\n💡 Pro Tips:');
console.log('• Update GitHub profile: https://github.com/settings/profile');
console.log('• Use dark theme for best appearance');
console.log('• Add to README.md with: ![myopenclaw Logo](./github_logos/myopenclaw_main.png)');

// Create README for logos
const readmeContent = `# 🎨 myopenclaw GitHub Logos

Professional branding assets for myopenclaw GitHub profile and repositories.

## 📁 Files

### 1. Profile Pictures
- \`myopenclaw_square.png\` (256×256) - GitHub profile picture
- \`myopenclaw_minimal.png\` (128×128) - Favicon/small logo

### 2. Banner
- \`myopenclaw_banner.png\` (1500×500) - GitHub profile banner

### 3. Repository Logo
- \`myopenclaw_main.png\` (512×512) - Repository README logo

## 🎯 Design Elements

### Colors
- **Primary:** GitHub Green (#238636) - Growth, automation, success
- **Secondary:** GitHub Light Text (#f0f6fc) - Readability
- **Background:** GitHub Dark (#0d1117) - Professional, technical

### Icon Meaning
- **Gear:** Automation, systems, engineering
- **Claw Marks:** OpenClaw identity, precision, execution
- **Combined:** Revenue Automation Empire - precise execution of automated systems

## 🚀 Usage

### GitHub Profile
1. Go to: https://github.com/settings/profile
2. Upload \`myopenclaw_square.png\` as profile picture
3. Upload \`myopenclaw_banner.png\` as profile banner
4. Update bio: "Building €50K+ MRR Revenue Automation Systems"

### Repository README
\`\`\`markdown
![myopenclaw Logo](./github_logos/myopenclaw_main.png)

# Revenue Automation Empire
🚀 Complete €50K+ MRR Revenue System
\`\`\`

### Website/Favicon
Use \`myopenclaw_minimal.png\` as favicon (128×128)

## 🔧 Regeneration

To regenerate logos with different colors/sizes:
\`\`\`bash
node generate_myopenclaw_logo.js
\`\`\`

## 📊 Brand Guidelines

### Logo Usage
- ✅ Use on GitHub profile and repositories
- ✅ Use in documentation and README files
- ✅ Use in revenue automation project presentations
- ❌ Do not modify colors without reason
- ❌ Do not use for unrelated projects

### Color Palette
- Primary: #238636 (GitHub Green)
- Secondary: #f0f6fc (Light Text)
- Background: #0d1117 (GitHub Dark)
- Accent: #1a1f29 (Dark Gray)

## 💰 Business Context

These logos represent:
- **myopenclaw:** Your GitHub identity
- **Revenue Automation Empire:** €50K+ MRR target
- **OpenClaw Operator:** Automation-first execution
- **Professional Branding:** Trust and credibility

---

**Generated:** ${new Date().toISOString()}
**For:** myopenclaw GitHub Profile
**Purpose:** €50K+ MRR Revenue Automation Branding
`;

fs.writeFileSync(path.join(logosDir, 'README.md'), readmeContent);
console.log('\n📖 Created: github_logos/README.md');

// Update workspace README with logo
const workspaceReadmePath = path.join(__dirname, 'README.md');
if (fs.existsSync(workspaceReadmePath)) {
  let readmeContent = fs.readFileSync(workspaceReadmePath, 'utf8');
  
  // Add logo at the beginning if not already there
  if (!readmeContent.includes('myopenclaw_main.png')) {
    const logoSection = `![myopenclaw Logo](./github_logos/myopenclaw_main.png)\n\n`;
    readmeContent = logoSection + readmeContent;
    fs.writeFileSync(workspaceReadmePath, readmeContent);
    console.log('✅ Added logo to workspace README.md');
  }
}

console.log('\n🎨 Logo generation complete!');
console.log('💰 Professional branding ready for €50K+ MRR visibility');