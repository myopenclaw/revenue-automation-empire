// 🎬 YOUTUBE KIDS CHANNEL SETUP SCRIPT
// Creates 4 channels for 6 & 7 year old sons

const fs = require('fs');
const path = require('path');

console.log('🎬 YOUTUBE KIDS CHANNEL SETUP');
console.log('==============================\n');

class YouTubeKidsSetup {
  constructor() {
    this.channels = [
      {
        name: 'Junior Science Lab',
        targetAge: '6-9 years',
        niche: 'Science experiments for kids',
        son: '7-year-old (turning 8)',
        description: 'Fun science experiments that kids can do at home! Volcanoes, slime, Mentos + Coke, and more educational fun.',
        keywords: ['science', 'experiments', 'kids', 'education', 'STEM', 'fun'],
        colorTheme: '#4CAF50', // Green
        uploadSchedule: 'Monday, Wednesday, Friday'
      },
      {
        name: 'Kid Entrepreneur Club',
        targetAge: '6-9 years',
        niche: 'Business basics for kids',
        son: '7-year-old (turning 8)',
        description: 'Learn about money, business, and entrepreneurship! From lemonade stands to saving money, we make finance fun for kids.',
        keywords: ['entrepreneur', 'money', 'business', 'kids', 'education', 'finance'],
        colorTheme: '#FF9800', // Orange
        uploadSchedule: 'Tuesday, Thursday, Saturday'
      },
      {
        name: 'Storytime Adventures',
        targetAge: '5-8 years',
        niche: 'Storytelling with animations',
        son: '6-year-old (turning 7)',
        description: 'Magical stories come to life with animations! Bedtime stories, fairy tales, and original adventures for young minds.',
        keywords: ['stories', 'bedtime', 'kids', 'animation', 'reading', 'education'],
        colorTheme: '#2196F3', // Blue
        uploadSchedule: 'Monday, Wednesday, Friday'
      },
      {
        name: 'Art & Craft Kids',
        targetAge: '5-8 years',
        niche: 'Creative arts and crafts',
        son: '6-year-old (turning 7)',
        description: 'Let\'s get creative! Drawing, painting, DIY crafts, and fun art projects that kids can make at home.',
        keywords: ['art', 'craft', 'drawing', 'kids', 'DIY', 'creative'],
        colorTheme: '#E91E63', // Pink
        uploadSchedule: 'Tuesday, Thursday, Saturday'
      }
    ];
    
    this.outputDir = path.join(__dirname, 'youtube_channels_setup');
    this.equipmentList = [
      { item: 'Camera', description: 'Smartphone (iPhone/Android) or basic camera', budget: '€0-€200' },
      { item: 'Microphone', description: 'Lavalier lapel mic for clear audio', budget: '€50' },
      { item: 'Lighting', description: 'Ring light or softbox lighting kit', budget: '€100' },
      { item: 'Tripod', description: 'Smartphone tripod with adjustable height', budget: '€30' },
      { item: 'Backdrop', description: 'Green screen or simple colored backdrop', budget: '€50' },
      { item: 'Editing Software', description: 'Canva Pro, CapCut (free), Descript', budget: '€0-€30/month' }
    ];
    
    // Create output directory
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
      console.log(`📁 Created setup directory: ${this.outputDir}`);
    }
    
    console.log(`📊 Setting up ${this.channels.length} YouTube channels\n`);
  }
  
  /**
   * Generate channel setup files
   */
  generateSetupFiles() {
    console.log('📋 Generating channel setup files...\n');
    
    // 1. Channel details file
    const channelsFile = path.join(this.outputDir, 'CHANNEL_DETAILS.md');
    let channelsContent = '# 🎬 YOUTUBE KIDS CHANNELS SETUP\n\n';
    
    channelsContent += `## Overview\n`;
    channelsContent += `- **Total Channels**: ${this.channels.length}\n`;
    channelsContent += `- **Target Age**: 5-9 years\n`;
    channelsContent += `- **Upload Schedule**: 3 videos/week per channel (12 total/week)\n`;
    channelsContent += `- **Initial Budget**: €500 for equipment\n`;
    channelsContent += `- **Revenue Goal**: €20,000-€50,000/month within 12 months\n\n`;
    
    channelsContent += `## Channel Details\n\n`;
    
    this.channels.forEach((channel, index) => {
      channelsContent += `### ${index + 1}. ${channel.name}\n`;
      channelsContent += `- **Son**: ${channel.son}\n`;
      channelsContent += `- **Niche**: ${channel.niche}\n`;
      channelsContent += `- **Target Age**: ${channel.targetAge}\n`;
      channelsContent += `- **Upload Schedule**: ${channel.uploadSchedule}\n`;
      channelsContent += `- **Color Theme**: ${channel.colorTheme}\n`;
      channelsContent += `- **Description**: ${channel.description}\n`;
      channelsContent += `- **Keywords**: ${channel.keywords.join(', ')}\n\n`;
      
      // Create individual channel file
      const channelFile = path.join(this.outputDir, `${channel.name.replace(/\s+/g, '_')}.md`);
      const channelContent = this.generateChannelFile(channel);
      fs.writeFileSync(channelFile, channelContent);
      
      console.log(`   ✅ ${channel.name}`);
    });
    
    fs.writeFileSync(channelsFile, channelsContent);
    console.log(`\n📄 Channel details saved: ${channelsFile}`);
    
    // 2. Equipment list
    this.generateEquipmentList();
    
    // 3. Content calendar template
    this.generateContentCalendar();
    
    // 4. YouTube setup checklist
    this.generateSetupChecklist();
    
    // 5. Monetization plan
    this.generateMonetizationPlan();
    
    console.log('\n✅ All setup files generated!\n');
  }
  
  /**
   * Generate individual channel file
   */
  generateChannelFile(channel) {
    return `# 🎬 ${channel.name} - YouTube Channel Plan

## Channel Identity
- **Name**: ${channel.name}
- **Target Audience**: ${channel.targetAge}
- **Niche**: ${channel.niche}
- **Color Theme**: ${channel.colorTheme}
- **Upload Schedule**: ${channel.uploadSchedule}

## Channel Description
${channel.description}

## Video Ideas (First Month)

### Week 1: Foundation Videos
1. **Channel Introduction**: "Welcome to ${channel.name}!"
2. **Basic Tutorial**: Simple project to start
3. **Equipment Tour**: Show what we use (makes it relatable)

### Week 2-4: Core Content
${this.getVideoIdeasForChannel(channel.name)}

## SEO & Keywords
**Primary Keywords**: ${channel.keywords.slice(0, 3).join(', ')}
**Secondary Keywords**: ${channel.keywords.slice(3).join(', ')}

**Title Templates**:
- "How to [DO SOMETHING] for Kids | ${channel.name}"
- "[AGE] Year Old [DOES ACTIVITY] | ${channel.name}"
- "Easy [ACTIVITY] Tutorial for Beginners"

**Description Template**:
\`\`\`
Welcome to ${channel.name}! 🎬

In this video, we [BRIEF DESCRIPTION].

📚 What you'll learn:
• [BENEFIT 1]
• [BENEFIT 2] 
• [BENEFIT 3]

👶 Perfect for kids ages ${channel.targetAge}

📌 Materials needed:
• [MATERIAL 1]
• [MATERIAL 2]

👍 If you enjoyed this video, please like and subscribe!
🔔 Turn on notifications so you don't miss our next adventure!

#${channel.name.replace(/\s+/g, '')} #KidsEducation #${channel.keywords[0]}
\`\`\`

## Thumbnail Design
- **Style**: Bright, colorful, large text
- **Elements**: Kid-friendly fonts, channel logo, action shot
- **Colors**: Use ${channel.colorTheme} as primary color
- **Text**: 3-5 words maximum, large and clear

## Monetization Strategy
1. **YouTube AdSense** (at 1,000 subscribers)
2. **Sponsorships**: Relevant educational brands
3. **Affiliate Marketing**: Product links in descriptions
4. **Merchandise**: Channel-branded items
5. **Digital Products**: Printables, activity sheets

## Growth Targets
- **Month 1**: 100 subscribers
- **Month 3**: 1,000 subscribers (monetization eligible)
- **Month 6**: 5,000 subscribers
- **Month 12**: 25,000 subscribers

## Parental Considerations
- **Privacy**: No last names, personal details
- **Safety**: Comments moderated, no personal messaging
- **Balance**: Limited filming time, focus on education
- **Involvement**: Sons participate but don't feel pressured

---
*Generated: ${new Date().toISOString()}*
`;
  }
  
  /**
   * Get video ideas based on channel
   */
  getVideoIdeasForChannel(channelName) {
    const ideas = {
      'Junior Science Lab': [
        'Make a volcano with baking soda & vinegar',
        'Create slime with different textures',
        'Mentos + Coke explosion (outdoors!)',
        'Rainbow in a glass (density experiment)',
        'Growing crystals with salt or sugar',
        'Static electricity with balloons',
        'DIY lava lamp with oil and water',
        'Invisible ink with lemon juice'
      ],
      'Kid Entrepreneur Club': [
        'How to start a lemonade stand',
        'Making a simple business plan',
        'Counting money and making change',
        'Saving vs spending lesson',
        'Creating simple products to sell',
        'Customer service basics',
        'Advertising your business',
        'Profit calculation for kids'
      ],
      'Storytime Adventures': [
        'The Lost Teddy Bear (original story)',
        'Classic fairy tale retelling',
        'Interactive choose-your-own-adventure',
        'Bedtime story with calming visuals',
        'Story about friendship and sharing',
        'Adventure in space or under the sea',
        'Moral lesson stories',
        'Holiday-themed stories'
      ],
      'Art & Craft Kids': [
        'How to draw simple animals',
        'DIY greeting cards for family',
        'Painting with unusual tools (forks, sponges)',
        'Recycled art from household items',
        'Seasonal crafts (holidays, seasons)',
        'Clay modeling basics',
        'Collage making with magazines',
        'Tie-dye t-shirt tutorial'
      ]
    };
    
    return ideas[channelName]?.map((idea, i) => `${i + 1}. ${idea}`).join('\n') || 'No ideas found';
  }
  
  /**
   * Generate equipment list
   */
  generateEquipmentList() {
    const equipmentFile = path.join(this.outputDir, 'EQUIPMENT_LIST.md');
    
    let equipmentContent = '# 🎥 EQUIPMENT LIST FOR YOUTUBE CHANNELS\n\n';
    equipmentContent += `## Total Budget: €500\n\n`;
    equipmentContent += `| Item | Description | Budget | Priority |\n`;
    equipmentContent += `|------|-------------|--------|----------|\n`;
    
    this.equipmentList.forEach((item, index) => {
      const priority = index < 3 ? 'High' : index < 5 ? 'Medium' : 'Low';
      equipmentContent += `| ${item.item} | ${item.description} | ${item.budget} | ${priority} |\n`;
    });
    
    equipmentContent += `\n## Recommended Brands\n`;
    equipmentContent += `- **Camera**: iPhone (if available), Canon PowerShot, Sony ZV-1\n`;
    equipmentContent += `- **Microphone**: Rode SmartLav+, Boya BY-M1\n`;
    equipmentContent