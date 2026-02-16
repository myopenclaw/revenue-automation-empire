// 🧠 AI KIDS SCRIPT GENERATOR
// Generates educational scripts for 4 YouTube channels

const fs = require('fs');
const path = require('path');

console.log('🧠 AI KIDS SCRIPT GENERATOR');
console.log('============================\n');

class AIScriptGenerator {
  constructor() {
    this.channels = [
      {
        name: 'Junior Science Lab',
        host: 'Dr. Alex',
        ageRange: '6-9 years',
        style: 'Excited, curious, educational',
        tone: 'Wow! Amazing! Let\'s discover!',
        length: '3-5 minutes (400-600 words)'
      },
      {
        name: 'Kid Entrepreneur Club',
        host: 'Biz Kid',
        ageRange: '6-9 years',
        style: 'Confident, friendly, motivational',
        tone: 'You can do it! Let\'s learn about money!',
        length: '3-5 minutes (400-600 words)'
      },
      {
        name: 'Storytime Adventures',
        host: 'Storyteller Sam',
        ageRange: '5-8 years',
        style: 'Calm, engaging, magical',
        tone: 'Once upon a time... Let\'s imagine...',
        length: '5-7 minutes (600-800 words)'
      },
      {
        name: 'Art & Craft Kids',
        host: 'Artie the Artist',
        ageRange: '5-8 years',
        style: 'Creative, encouraging, fun',
        tone: 'Let\'s create! So colorful! Amazing art!',
        length: '4-6 minutes (500-700 words)'
      }
    ];
    
    this.outputDir = path.join(__dirname, 'ai_scripts_output');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
      console.log(`📁 Created output directory: ${this.outputDir}`);
    }
    
    console.log(`🎯 Generating scripts for ${this.channels.length} channels\n`);
  }
  
  /**
   * Generate script template for a channel
   */
  generateScriptTemplate(channel, topic) {
    const templates = {
      'Junior Science Lab': `# 🧪 ${channel.name} - ${topic}

## Video Title
"${this.getScienceTitle(topic)}"

## Host Introduction
[Upbeat music starts]
${channel.host}: "Hi friends! Welcome back to ${channel.name}! I'm ${channel.host}, and today we're going to do something AMAZING! We're going to learn about ${topic}!"

## Educational Hook
"Did you know that ${this.getScienceFact(topic)}? Isn't that COOL? Today, we're going to see this in action with a fun experiment!"

## Materials Needed
"Before we start, let's make sure we have everything we need:
1. ${this.getMaterial(1)}
2. ${this.getMaterial(2)}
3. ${this.getMaterial(3)}
4. ${this.getMaterial(4)}

Always remember to do experiments with a grownup!"

## Step-by-Step Experiment
"Okay, let's begin!

STEP 1: First, we ${this.getStep(1, topic)}

STEP 2: Next, we ${this.getStep(2, topic)}

STEP 3: Now watch carefully as we ${this.getStep(3, topic)}

STEP 4: Finally, we ${this.getStep(4, topic)}"

## The Big Reveal
[Excited tone]
"WOW! Look at that! Did you see what happened? We just ${this.getResult(topic)}!"

## Science Explanation (Simple)
"So why did that happen? Well, it's because ${this.getExplanation(topic, 'simple')}"

## Real-World Connection
"You know, this same science is used in ${this.getRealWorld(topic)}! So when you see ${this.getRealWorldExample(topic)}, you'll know the science behind it!"

## Call to Action
"I hope you enjoyed our experiment today! If you want to try this at home, make sure to ask a grownup for help.

Don't forget to:
1. 👍 LIKE this video if you learned something new!
2. 🔔 SUBSCRIBE for more awesome science experiments!
3. 💬 COMMENT below: What experiment should we do next?

See you next time on ${channel.name}! Keep exploring, scientists!"

## Video Description Template
\`\`\`
Welcome to ${channel.name}! 🧪

In this episode, we explore ${topic} through a fun, safe experiment perfect for kids ages ${channel.ageRange}.

📚 What we learn:
• ${this.getLearningPoint(1, topic)}
• ${this.getLearningPoint(2, topic)}
• ${this.getLearningPoint(3, topic)}

⚠️ Safety First: Always do experiments with adult supervision!

👨‍🔬 Host: ${channel.host}
🎬 Channel: ${channel.name}

👍 If you enjoyed this video, please like and subscribe!
🔔 Turn on notifications so you don't miss our next experiment!

#${channel.name.replace(/\s+/g, '')} #KidsScience #STEM #${topic.replace(/\s+/g, '')}
\`\`\`

## Tags
${channel.name}, kids science, ${topic}, STEM education, fun experiments, learning for kids, educational content, science for children

## Thumbnail Ideas
1. Big eyes looking at experiment
2. Colorful explosion/result
3. ${channel.host} pointing at something amazing
4. Text: "WOW! ${topic.toUpperCase()} EXPERIMENT!"

---
*AI Generated Script - ${new Date().toISOString()}*
*Channel: ${channel.name}*
*Host: ${channel.host}*
*Target Age: ${channel.ageRange}*`,
      
      'Kid Entrepreneur Club': `# 💼 ${channel.name} - ${topic}

## Video Title
"${this.getBusinessTitle(topic)}"

## Host Introduction
[Upbeat business music]
${channel.host}: "Hello future entrepreneurs! Welcome to ${channel.name}! I'm ${channel.host}, and today we're going to learn about ${topic} - an important skill for any business kid!"

## Concept Introduction
"Have you ever wondered ${this.getBusinessQuestion(topic)}? Well, today we're going to find out! Understanding ${topic} can help you with your lemonade stand, toy sales, or any business idea!"

## Simple Explanation
"Let me explain ${topic} in a simple way: ${this.getBusinessExplanation(topic, 'simple')}"

## Example Story
"Let me tell you a story about a kid named Alex. Alex wanted to sell homemade cookies. Here's what happened:

1. First, Alex ${this.getStoryStep(1, topic)}
2. Then, Alex ${this.getStoryStep(2, topic)}
3. Because of this, Alex ${this.getStoryStep(3, topic)}
4. And in the end, Alex ${this.getStoryStep(4, topic)}"

## Key Lessons
"From Alex's story, we learn:
• LESSON 1: ${this.getBusinessLesson(1, topic)}
• LESSON 2: ${this.getBusinessLesson(2, topic)}
• LESSON 3: ${this.getBusinessLesson(3, topic)}"

## Activity for Viewers
"Now it's your turn! Here's a fun activity:
1. Grab a piece of paper
2. Draw or write: ${this.getActivity(topic)}
3. Share your idea in the comments!

Remember, every big business started with a small idea!"

## Call to Action
"Great job learning about ${topic} today! You're one step closer to becoming an entrepreneur!

Don't forget to:
1. 👍 LIKE this video if you learned something about business!
2. 🔔 SUBSCRIBE for more kid entrepreneur lessons!
3. 💬 COMMENT below: What business would you like to start?

Keep dreaming big, entrepreneurs! See you next time on ${channel.name}!"

## Video Description Template
\`\`\`
Welcome to ${channel.name}! 💼

In this episode, we learn about ${topic} - an essential concept for young entrepreneurs ages ${channel.ageRange}.

📊 What we cover:
• ${this.getBusinessLesson(1, topic)}
• ${this.getBusinessLesson(2, topic)}
• ${this.getBusinessLesson(3, topic)}

🎯 Practical activity included!

👔 Host: ${channel.host}
🎬 Channel: ${channel.name}

👍 If this helps your business dreams, please like and subscribe!
🔔 Turn on notifications for more entrepreneur lessons!

#${channel.name.replace(/\s+/g, '')} #KidEntrepreneur #BusinessForKids #${topic.replace(/\s+/g, '')}
\`\`\`

## Tags
${channel.name}, kid entrepreneur, business for kids, ${topic}, money skills, financial literacy, young entrepreneurs, education

## Thumbnail Ideas
1. ${channel.host} with money or calculator
2. Kid with lemonade stand
3. Text: "Become a Kid Entrepreneur!"
4. Graph going up with smiley face

---
*AI Generated Script - ${new Date().toISOString()}*
*Channel: ${channel.name}*
*Host: ${channel.host}*
*Target Age: ${channel.ageRange}*`,
      
      'Storytime Adventures': `# 📚 ${channel.name} - ${topic}

## Video Title
"${this.getStoryTitle(topic)}"

## Host Introduction
[Magical, calming music]
${channel.host}: "Hello, story friends! Welcome to ${channel.name}! I'm ${channel.host}, and today I have a special story for you about ${topic}. Get cozy and let's begin our adventure..."

## Story Opening
"Once upon a time, in a ${this.getStorySetting(topic)}, there lived ${this.getMainCharacter(topic)}. ${this.getCharacterDescription(topic)}"

## The Beginning
"One sunny morning, ${this.getMainCharacter(topic)} decided to ${this.getStoryGoal(topic)}. But little did ${this.getPronoun(topic)} know, an adventure was about to begin!"

## The Adventure
"As ${this.getMainCharacter(topic)} set out, ${this.getPronoun(topic)} encountered:
1. First, ${this.getChallenge(1, topic)}
2. Then, ${this.getChallenge(2, topic)}
3. Next, ${this.getChallenge(3, topic)}"

## The Solution
"But ${this.getMainCharacter(topic)} was clever! ${this.getPronoun(topic).toUpperCase()} remembered that ${this.getSolutionHint(topic)}. So ${this.getPronoun(topic)} decided to ${this.getSolution(topic)}"

## The Resolution
"And because of this brave decision, ${this.getResolution(topic)}. The ${this.getStorySetting(topic)} was safe once more, and ${this.getMainCharacter(topic)} learned an important lesson."

## The Moral
"The moral of our story is: ${this.getMoral(topic)}. Just like ${this.getMainCharacter(topic)}, you too can ${this.getMoralApplication(topic)}"

## Call to Action
"I hope you enjoyed our story about ${topic}! Stories teach