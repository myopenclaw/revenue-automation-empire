// 🧠 AI SCRIPT GENERATOR - SIMPLE VERSION

const fs = require('fs');
const path = require('path');

console.log('🧠 AI KIDS SCRIPT GENERATOR');
console.log('============================\n');

// Channel configurations
const channels = [
  { name: 'Junior Science Lab', host: 'Dr. Alex', emoji: '🧪' },
  { name: 'Kid Entrepreneur Club', host: 'Biz Kid', emoji: '💼' },
  { name: 'Storytime Adventures', host: 'Storyteller Sam', emoji: '📚' },
  { name: 'Art & Craft Kids', host: 'Artie the Artist', emoji: '🎨' }
];

// Topic ideas per channel
const topics = {
  'Junior Science Lab': [
    'Volcano Experiment', 'Slime Making', 'Rainbow in a Glass',
    'Static Electricity', 'Growing Crystals', 'DIY Lava Lamp',
    'Mentos & Coke', 'Invisible Ink', 'Density Tower', 'Magnetic Magic'
  ],
  'Kid Entrepreneur Club': [
    'Lemonade Stand Basics', 'Saving vs Spending', 'Making a Business Plan',
    'Customer Service', 'Counting Money', 'Advertising Your Business',
    'Profit Calculation', 'Product Creation', 'Goal Setting', 'Teamwork'
  ],
  'Storytime Adventures': [
    'The Lost Teddy Bear', 'Space Adventure', 'Underwater Mystery',
    'Forest Friends', 'Magic Garden', 'Time Travel Tale',
    'Dragon & Knight', 'Pirate Treasure', 'Fairy Tale Mix', 'Animal Rescue'
  ],
  'Art & Craft Kids': [
    'Drawing Animals', 'DIY Greeting Cards', 'Painting with Tools',
    'Recycled Art', 'Clay Modeling', 'Collage Making',
    'Tie-Dye Fun', 'Seasonal Crafts', 'Paper Crafts', 'Color Mixing'
  ]
};

// Create output directory
const outputDir = path.join(__dirname, 'ai_scripts');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Created directory: ${outputDir}`);
}

console.log(`🎯 Generating scripts for ${channels.length} channels\n`);

// Generate scripts for each channel
channels.forEach(channel => {
  const channelDir = path.join(outputDir, channel.name.replace(/\s+/g, '_'));
  if (!fs.existsSync(channelDir)) {
    fs.mkdirSync(channelDir, { recursive: true });
  }
  
  console.log(`${channel.emoji} ${channel.name}:`);
  
  // Generate 3 scripts per channel
  topics[channel.name].slice(0, 3).forEach((topic, index) => {
    const script = generateScript(channel, topic, index + 1);
    const filename = `${(index + 1).toString().padStart(2, '0')}_${topic.replace(/\s+/g, '_')}.txt`;
    const filepath = path.join(channelDir, filename);
    
    fs.writeFileSync(filepath, script);
    console.log(`   ✅ ${filename}`);
  });
  
  console.log('');
});

// Generate content calendar
const calendarFile = path.join(outputDir, 'CONTENT_CALENDAR.md');
let calendarContent = `# 📅 AI CONTENT CALENDAR - 4 KIDS CHANNELS

## Weekly Schedule (12 videos/week)

### Monday
- 10:00 🧪 Junior Science Lab: ${topics['Junior Science Lab'][0]}
- 14:00 📚 Storytime Adventures: ${topics['Storytime Adventures'][0]}

### Tuesday  
- 10:00 💼 Kid Entrepreneur Club: ${topics['Kid Entrepreneur Club'][0]}
- 14:00 🎨 Art & Craft Kids: ${topics['Art & Craft Kids'][0]}

### Wednesday
- 10:00 🧪 Junior Science Lab: ${topics['Junior Science Lab'][1]}
- 14:00 📚 Storytime Adventures: ${topics['Storytime Adventures'][1]}

### Thursday
- 10:00 💼 Kid Entrepreneur Club: ${topics['Kid Entrepreneur Club'][1]}
- 14:00 🎨 Art & Craft Kids: ${topics['Art & Craft Kids'][1]}

### Friday
- 10:00 🧪 Junior Science Lab: ${topics['Junior Science Lab'][2]}
- 14:00 📚 Storytime Adventures: ${topics['Storytime Adventures'][2]}

### Saturday
- 10:00 💼 Kid Entrepreneur Club: ${topics['Kid Entrepreneur Club'][2]}
- 14:00 🎨 Art & Craft Kids: ${topics['Art & Craft Kids'][2]}

### Sunday
- **Planning Day**: Script generation for next week
- **Analytics Review**: What worked best?
- **Optimization**: Update based on performance

## Monthly Production Goals
- **Videos**: 48 (12/week × 4 weeks)
- **Scripts**: 48 AI-generated scripts
- **Voiceovers**: 48 AI voice recordings
- **Editing**: 48 videos edited & optimized
- **Upload**: 48 scheduled posts

## AI Tools Required
1. **Script Generation**: ChatGPT Plus (€20/month)
2. **Voiceovers**: ElevenLabs (€22/month) - child voices available
3. **Visuals**: Canva Pro (€12/month) + Pictory AI (€29/month)
4. **Editing**: CapCut (free) + Descript (€15/month)
5. **Automation**: n8n (free/€20 cloud)

**Total**: €98-€118/month

## Batch Production Workflow

### Day 1-2: Script Generation
- Use ChatGPT to generate 12 scripts
- Review and adjust for kid-friendliness
- Save to organized folders

### Day 3: Voice Recording
- Use ElevenLabs with child voice settings
- Record all 12 scripts
- Save as MP3 files

### Day 4: Visual Creation
- Use Pictory AI: Script → Video with stock footage
- Use Canva: Thumbnails, graphics, animations
- Create consistent branding per channel

### Day 5: Editing & Optimization
- Use CapCut/Descript for final editing
- Add captions, transitions, effects
- Optimize for each platform (YouTube, TikTok, Instagram)

### Day 6: Scheduling
- Upload to YouTube Studio
- Schedule for optimal times
- Set up cross-posting to other platforms

### Day 7: Analytics & Improvement
- Review performance metrics
- Adjust strategy based on data
- Plan next week's topics

## Monetization Timeline

### Month 1-2: Growth Phase
- **Goal**: 1,000 total subscribers
- **Focus**: Content quality, consistency
- **Revenue**: €0-€200 (affiliate links only)

### Month 3-4: Monetization Phase
- **Goal**: 4,000 subscribers (1,000 per channel)
- **Focus**: Enable YouTube AdSense
- **Revenue**: €500-€2,000/month

### Month 5-6: Scaling Phase
- **Goal**: 10,000 subscribers
- **Focus**: Sponsorships, affiliate programs
- **Revenue**: €2,000-€5,000/month

### Month 7-12: Optimization Phase
- **Goal**: 50,000+ subscribers
- **Focus**: Merchandise, digital products
- **Revenue**: €5,000-€20,000/month

## Kids Introduction Plan (Optional)

### Phase 1: Behind-the-Scenes (Month 3-4)
- Show kids doing experiments/art off-camera
- Voice cameos in audio
- No pressure, only if interested

### Phase 2: Gradual Appearances (Month 5-6)
- Occasional on-camera moments
- Educational focus (learning together)
- Always with parent present

### Phase 3: Regular Features (Month 7+)
- If kids enjoy and want to participate
- Controlled, positive environment
- Emphasis on fun and learning

---

**Generated**: ${new Date().toISOString()}
**Channels**: ${channels.length}
**Weekly Videos**: 12
**Monthly Cost**: €98-€118
**Revenue Potential**: €20,000-€50,000/month within 12 months
`;

fs.writeFileSync(calendarFile, calendarContent);
console.log(`📅 Content calendar: ${calendarFile}`);

console.log('🎉 AI script generation complete!');
console.log(`📁 Scripts saved in: ${outputDir}`);
console.log(`\n🚀 NEXT: Set up AI tools and start production!`);

// Helper function to generate script
function generateScript(channel, topic, episode) {
  const templates = {
    'Junior Science Lab': `🧪 ${channel.name} - Episode ${episode}: ${topic}

HOST: ${channel.host}
TONE: Excited, curious, educational

[UPBEAT SCIENCE MUSIC]

${channel.host}: "Hi science friends! Welcome to ${channel.name}! I'm ${channel.host}, and today we're going to explore ${topic}!"

"Did you know that ${getScienceFact(topic)}? Today, we're going to see this amazing science in action!"

"Before we start, make sure you have:
• ${getMaterial(1, topic)}
• ${getMaterial(2, topic)}
• ${getMaterial(3, topic)}

Always do experiments with a grownup!"

"Okay, let's begin our experiment!
1. First, we ${getStep(1, topic)}
2. Next, we ${getStep(2, topic)}
3. Now watch carefully: ${getStep(3, topic)}
4. Finally, we ${getStep(4, topic)}"

"WOW! Look at that! We just ${getResult(topic)}! Amazing!"

"So why did that happen? It's because ${getExplanation(topic)}"

"This same science is used in ${getRealWorld(topic)}. Cool, right?"

"Thanks for experimenting with me today! Remember:
👍 LIKE if you learned something new!
🔔 SUBSCRIBE for more science fun!
💬 COMMENT: What should we experiment with next?

Keep exploring, scientists! See you next time!"

---
TAGS: ${channel.name}, kids science, ${topic}, STEM, education, fun experiments
DURATION: 3-4 minutes
TARGET AGE: 6-9 years`,
    
    'Kid Entrepreneur Club': `💼 ${channel.name} - Episode ${episode}: ${topic}

HOST: ${channel.host}
TONE: Confident, friendly, motivational

[UPBEAT BUSINESS MUSIC]

${channel.host}: "Hello future entrepreneurs! Welcome to ${channel.name}! I'm ${channel.host}, and today we're learning about ${topic}!"

"Have you ever wondered ${getBusinessQuestion(topic)}? Well, today we're going to find out!"

"${topic} is important because ${getBusinessReason(topic)}"

"Let me tell you about a kid named Alex who wanted to start a business:
1. First, Alex ${getStoryStep(1, topic)}
2. Then, Alex ${getStoryStep(2, topic)}
3. Because of this, Alex ${getStoryStep(3, topic)}"

"From this story, we learn:
• ${getLesson(1, topic)}
• ${getLesson(2, topic)}
• ${getLesson(3, topic)}"

"Now it's your turn! Try this:
1. Grab paper and pen
2. ${getActivity(topic)}
3. Share your idea in comments!"

"Great job learning about ${topic}! You're becoming an entrepreneur!"

"Don't forget:
👍 LIKE if this helps your business dreams!
🔔 SUBSCRIBE for more entrepreneur lessons!
💬 COMMENT: What business would you start?

Keep dreaming big! See you next time!"

---
TAGS: ${channel.name}, kid entrepreneur, business, ${topic}, money, education
DURATION: 3-4 minutes
TARGET AGE: 6-9 years`,
    
    'Storytime Adventures': `📚 ${channel.name} - Episode ${episode}: ${topic}

HOST: ${channel.host}
TONE: Calm, engaging, magical

[CALM, MAGICAL MUSIC]

${channel.host}: "Hello story friends! Welcome to ${channel.name}! I'm ${channel.host}, and today I have a special story about ${topic}..."

"Once upon a time, in ${getSetting(topic)}, there lived ${getCharacter(topic)}. ${getCharacterDesc(topic)}"

"One day, ${getCharacter(topic)} decided to ${getGoal(topic)}. But an adventure was about to begin!"

"As ${getCharacter(topic)} journeyed, ${getPronoun(topic)} encountered:
• First, ${getChallenge(1, topic)}
• Then, ${getChallenge(2, topic)}
• Next, ${getChallenge(3, topic)}"

"But ${getCharacter(topic)} was clever! ${getPronoun(topic).toUpperCase()} remembered that ${getSolutionHint(topic)}, so ${getPronoun(topic)} ${getSolution(topic)}"

"And because of this brave choice, ${getResolution(topic)}. ${getCharacter(topic)} learned an important lesson."

"The moral of our story is: ${getMoral(topic)}"

"I hope you enjoyed our story about ${topic}! Stories teach us so much."

"Remember:
👍 LIKE if you enjoyed the story!
🔔 SUBSCRIBE for more adventures!
💬 COMMENT: What should our next story be about?

Sweet dreams, story friends! See you next time!"

---
TAGS: ${channel.name}, stories for kids, ${topic}, bedtime stories, education
DURATION: 5-6 minutes
TARGET AGE: 5-8 years`,
    
    'Art & Craft Kids': `🎨 ${channel.name} - Episode ${episode}: ${topic}

HOST: ${channel.host}
TONE: Creative, encouraging, fun

[CREATIVE, FUN MUSIC]

${channel.host}: "Hello creative friends! Welcome to ${channel.name}! I'm ${channel.host}, and today we're going to make ${topic}!"

"Get ready for some artistic fun! Today we're creating ${topic}, which is perfect for ${getArtPurpose(topic)}"

"Here's what you'll need:
• ${getArtMaterial(1, topic)}
• ${getArtMaterial(2, topic)}
• ${getArtMaterial(3, topic)}
• ${getArtMaterial(4, topic)}"

"Let's start creating!
STEP 1: ${getArtStep(1, topic)}
STEP 2: ${getArtStep(2, topic)}
STEP 3: ${getArtStep(3, topic)}
STEP 4: ${getArtStep(4, topic)}"

"Look at that! You just created ${topic}! It's so ${getArtAdjective(topic)}!"

"You can use this for ${getArtUse(topic)}. Get creative with colors and designs!"

"Amazing work today! I love seeing what you create."

"Don't forget:
👍 LIKE if you enjoyed this art project!
🔔 SUBSCRIBE for more creative fun!
💬 COMMENT: Show us your creation!

Keep creating, artists! See you next time!"

---
TAGS: ${channel.name}, art for kids, ${topic}, crafts, DIY, creativity
DURATION: 4-5 minutes
TARGET AGE: 5-8 years`
  };
  
  return templates[channel.name] || `Script template for ${channel.name}: ${topic}`;
}

// Helper functions (simplified)
function getScienceFact(topic) {
  const facts = {
    'Volcano Experiment': 'volcanoes erupt when pressure builds up inside',
    'Slime Making': 'slime is a non-Newtonian fluid - it acts like both liquid and solid',
    'Rainbow in a Glass': 'different liquids have different densities, causing them to layer'
  };
  return facts[topic] || 'science is amazing and full of surprises';
}

function getMaterial(num, topic) {
  const materials = ['paper', 'pencil', 'water', 'food coloring', 'baking soda', 'vinegar'];
  return materials[(num + topic.length) % materials.length];
}

function getStep(num, topic) {
  const steps = ['prepare our materials', 'mix carefully', 'observe what happens', 'record our results'];
  return steps[(num + topic.length) % steps.length];
}

// Similar helper functions for other channels...
function getBusinessQuestion(topic) {
  return `how ${topic.toLowerCase()} can help your business`;
}

function getBusinessReason(topic) {
  return `it helps you make smart decisions and grow your business`;
}

// Export for use
module.exports = { generateScript };

if (require.main === module) {
  console.log('Script generator ready. Use as module or run directly.');
}