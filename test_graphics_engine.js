// 🎨 TEST GRAPHICS ENGINE
// Generate sample thumbnails for all 4 channels

const GraphicsEngine = require('./graphics_engine_skeleton.js');
const fs = require('fs');
const path = require('path');

console.log('🎨 TESTING GRAPHICS ENGINE');
console.log('===========================\n');

async function testGraphicsEngine() {
  try {
    // Initialize engine
    const engine = new GraphicsEngine();
    
    console.log('🖼️  Generating sample thumbnails...\n');
    
    // Test data for each channel
    const testData = [
      {
        channel: 'Junior Science Lab',
        title: 'Volcano Experiment for Kids!',
        style: 'science'
      },
      {
        channel: 'Kid Entrepreneur Club',
        title: 'How to Start a Lemonade Stand',
        style: 'business'
      },
      {
        channel: 'Storytime Adventures',
        title: 'The Magic Garden Adventure',
        style: 'story'
      },
      {
        channel: 'Art & Craft Kids',
        title: 'Easy Drawing: Cute Animals',
        style: 'art'
      }
    ];
    
    const results = [];
    
    // Generate thumbnails
    for (const data of testData) {
      console.log(`📺 ${data.channel}:`);
      console.log(`   Title: "${data.title}"`);
      console.log(`   Style: ${data.style}`);
      
      try {
        const result = await engine.generateThumbnail(
          data.channel,
          data.title,
          data.style
        );
        
        results.push({
          channel: data.channel,
          success: true,
          file: path.basename(result.file),
          dimensions: result.dimensions
        });
        
        console.log(`   ✅ Thumbnail generated: ${path.basename(result.file)}\n`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
        results.push({
          channel: data.channel,
          success: false,
          error: error.message
        });
      }
    }
    
    // Generate banners
    console.log('🚩 Generating channel banners...\n');
    
    const bannerResults = [];
    for (const channel of ['Junior Science Lab', 'Kid Entrepreneur Club', 'Storytime Adventures', 'Art & Craft Kids']) {
      console.log(`   ${channel}...`);
      
      try {
        const result = await engine.generateBanner(channel);
        bannerResults.push({
          channel,
          success: true,
          file: path.basename(result.file)
        });
        console.log(`   ✅ Banner generated\n`);
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
        bannerResults.push({
          channel,
          success: false,
          error: error.message
        });
      }
    }
    
    // Summary
    console.log('📊 TEST RESULTS SUMMARY\n');
    
    console.log('Thumbnails:');
    results.forEach(r => {
      console.log(`   ${r.channel}: ${r.success ? '✅' : '❌'} ${r.success ? r.file : r.error}`);
    });
    
    console.log('\nBanners:');
    bannerResults.forEach(r => {
      console.log(`   ${r.channel}: ${r.success ? '✅' : '❌'} ${r.success ? r.file : r.error}`);
    });
    
    const thumbSuccess = results.filter(r => r.success).length;
    const bannerSuccess = bannerResults.filter(r => r.success).length;
    
    console.log(`\n🎉 Success Rate: ${thumbSuccess}/4 thumbnails, ${bannerSuccess}/4 banners`);
    
    if (thumbSuccess === 4 && bannerSuccess === 4) {
      console.log('✅ Graphics engine fully functional!');
      console.log('💰 Canva Pro replacement ready (€12/month saved)');
    } else {
      console.log('⚠️  Some components need debugging');
    }
    
    // Show file locations
    console.log('\n📁 Output files saved in:');
    console.log(`   Thumbnails: ${path.join(__dirname, 'graphics_output', 'thumbnails')}`);
    console.log(`   Banners: ${path.join(__dirname, 'graphics_output', 'banners')}`);
    console.log(`   Logos: ${path.join(__dirname, 'graphics_output', 'logos')}`);
    
    return {
      thumbnails: results,
      banners: bannerResults,
      success: thumbSuccess === 4 && bannerSuccess === 4
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run test if executed directly
if (require.main === module) {
  testGraphicsEngine();
}

module.exports = testGraphicsEngine;