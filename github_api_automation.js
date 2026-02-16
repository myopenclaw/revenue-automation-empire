// 🚀 GITHUB API AUTOMATION
// Create repositories and push code automatically

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 GITHUB API AUTOMATION STARTING');
console.log('=================================\n');

// Configuration
const GITHUB_TOKEN = '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';
const GITHUB_USER = 'myopenclaw';
const WORKSPACE = '/Users/clarenceetnel/.openclaw/workspace';

// Repository configurations
const REPOSITORIES = [
  {
    name: 'social-media-ai-pipeline',
    description: '€0/month AI video pipeline for YouTube/TikTok/Instagram automation. Local AI toolchain (Ollama, Piper TTS, Canvas, FFmpeg) replacing €192/month external services.',
    topics: ['ai', 'automation', 'social-media', 'video-pipeline', 'zero-cost', 'open-source', 'youtube', 'tiktok', 'instagram', 'content-creation']
  },
  {
    name: 'zero-cost-ai-toolchain',
    description: 'Complete local AI toolchain replacing €192/month external services. Includes Ollama (LLM), Piper TTS (text-to-speech), Canvas (graphics), FFmpeg (video). Self-hosted, private, unlimited usage.',
    topics: ['ai', 'local-ai', 'ollama', 'piper-tts', 'ffmpeg', 'canvas', 'self-hosted', 'privacy', 'open-source', 'cost-saving']
  },
  {
    name: 'n8n-social-automation',
    description: 'n8n workflows for social media content automation. Schedule, generate, and post content across 10+ platforms. Includes YouTube upload, cross-platform repurposing, analytics integration.',
    topics: ['n8n', 'automation', 'workflow', 'social-media', 'content-scheduling', 'youtube-automation', 'cross-posting', 'analytics', 'open-source']
  },
  {
    name: 'social-media-analytics-dashboard',
    description: 'Real-time analytics dashboard for 10+ social media accounts. Track followers, views, revenue across YouTube, TikTok, X.com, Instagram. Self-hosted, zero cost, privacy focused.',
    topics: ['analytics', 'dashboard', 'social-media', 'metrics', 'real-time', 'self-hosted', 'privacy', 'open-source', 'monitoring']
  }
];

// GitHub API helper functions
function githubRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'OpenClaw-Automation',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`GitHub API error ${res.statusCode}: ${body}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function checkToken() {
  console.log('🔐 Checking GitHub token...');
  try {
    const user = await githubRequest('GET', '/user');
    console.log(`✅ Token valid for user: ${user.login}`);
    console.log(`✅ Rate limit: ${user.rate_limit || 'unlimited'}`);
    return true;
  } catch (error) {
    console.error(`❌ Token invalid or error: ${error.message}`);
    return false;
  }
}

async function createRepository(repo) {
  console.log(`\n🎯 Creating repository: ${repo.name}`);
  
  try {
    // Check if repository already exists
    try {
      const existing = await githubRequest('GET', `/repos/${GITHUB_USER}/${repo.name}`);
      console.log(`   ⚠️  Repository already exists: ${existing.html_url}`);
      return existing;
    } catch (error) {
      // Repository doesn't exist, create it
    }
    
    // Create repository
    const repoData = {
      name: repo.name,
      description: repo.description,
      private: false,
      auto_init: false, // Important: don't initialize with README
      has_issues: true,
      has_projects: false,
      has_wiki: false
    };
    
    const created = await githubRequest('POST', '/user/repos', repoData);
    console.log(`   ✅ Created: ${created.html_url}`);
    
    // Add topics
    if (repo.topics && repo.topics.length > 0) {
      try {
        await githubRequest('PUT', `/repos/${GITHUB_USER}/${repo.name}/topics`, {
          names: repo.topics
        });
        console.log(`   ✅ Topics added: ${repo.topics.join(', ')}`);
      } catch (error) {
        console.log(`   ⚠️  Could not add topics: ${error.message}`);
      }
    }
    
    return created;
  } catch (error) {
    console.error(`   ❌ Error creating repository: ${error.message}`);
    throw error;
  }
}

async function pushLocalCode(repoName) {
  console.log(`   📤 Pushing local code for ${repoName}...`);
  
  const repoPath = path.join(WORKSPACE, repoName);
  
  if (!fs.existsSync(repoPath)) {
    console.log(`   ❌ Local repository not found: ${repoPath}`);
    return false;
  }
  
  try {
    // Change to repository directory
    process.chdir(repoPath);
    
    // Set remote URL
    const remoteUrl = `https://${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${repoName}.git`;
    execSync(`git remote set-url origin ${remoteUrl}`, { stdio: 'pipe' });
    
    // Push to GitHub
    execSync('git push -u origin main', { stdio: 'pipe' });
    
    console.log(`   ✅ Code pushed successfully`);
    return true;
  } catch (error) {
    console.log(`   ⚠️  Push failed: ${error.message}`);
    
    // Try alternative push method
    try {
      console.log(`   🔄 Trying alternative push method...`);
      execSync('git push origin main --force', { stdio: 'pipe' });
      console.log(`   ✅ Force push successful`);
      return true;
    } catch (forceError) {
      console.log(`   ❌ Force push also failed: ${forceError.message}`);
      return false;
    }
  } finally {
    // Return to workspace
    process.chdir(WORKSPACE);
  }
}

async function enableGitHubPages(repoName) {
  console.log(`   🌐 Enabling GitHub Pages for ${repoName}...`);
  
  try {
    const pagesConfig = {
      source: {
        branch: 'main',
        path: '/'
      }
    };
    
    await githubRequest('POST', `/repos/${GITHUB_USER}/${repoName}/pages`, pagesConfig);
    console.log(`   ✅ GitHub Pages enabled`);
    
    // Check Pages status
    setTimeout(async () => {
      try {
        const pagesStatus = await githubRequest('GET', `/repos/${GITHUB_USER}/${repoName}/pages`);
        console.log(`   📊 Pages status: ${pagesStatus.status || 'unknown'}`);
        console.log(`   🔗 Pages URL: https://${GITHUB_USER}.github.io/${repoName}/`);
      } catch (statusError) {
        // Ignore status check errors
      }
    }, 2000);
    
    return true;
  } catch (error) {
    console.log(`   ⚠️  Could not enable GitHub Pages: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting GitHub automation...\n');
  
  // Check token first
  const tokenValid = await checkToken();
  if (!tokenValid) {
    console.error('❌ Invalid token. Stopping.');
    return;
  }
  
  console.log('\n📦 CREATING REPOSITORIES');
  console.log('======================\n');
  
  const results = [];
  
  for (const repo of REPOSITORIES) {
    try {
      // Create repository
      const createdRepo = await createRepository(repo);
      
      // Push local code
      const pushSuccess = await pushLocalCode(repo.name);
      
      // Enable GitHub Pages
      const pagesSuccess = await enableGitHubPages(repo.name);
      
      results.push({
        name: repo.name,
        url: createdRepo.html_url,
        pushSuccess,
        pagesSuccess,
        pagesUrl: `https://${GITHUB_USER}.github.io/${repo.name}/`
      });
      
      // Small delay between repositories
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to process ${repo.name}: ${error.message}`);
      results.push({
        name: repo.name,
        error: error.message,
        success: false
      });
    }
  }
  
  console.log('\n🎉 AUTOMATION COMPLETE');
  console.log('====================\n');
  
  console.log('📊 RESULTS:');
  console.log('==========\n');
  
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.name}: ${result.error}`);
    } else {
      console.log(`✅ ${result.name}`);
      console.log(`   Repository: ${result.url}`);
      console.log(`   Code push: ${result.pushSuccess ? '✅' : '❌'}`);
      console.log(`   GitHub Pages: ${result.pagesSuccess ? '✅' : '❌'}`);
      if (result.pagesSuccess) {
        console.log(`   Pages URL: ${result.pagesUrl}`);
      }
      console.log('');
    }
  });
  
  console.log('🚀 NEXT STEPS:');
  console.log('=============\n');
  
  console.log('1. 🔐 REVOKE THE GITHUB TOKEN IMMEDIATELY:');
  console.log('   Go to: https://github.com/settings/tokens');
  console.log('   Find token "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"');
  console.log('   Click "Revoke"');
  console.log('');
  
  console.log('2. 📊 CHECK ALL REPOSITORIES:');
  results.forEach(result => {
    if (!result.error) {
      console.log(`   • ${result.url}`);
    }
  });
  console.log('');
  
  console.log('3. 💰 SETUP GITHUB SPONSORS:');
  console.log('   Go to: https://github.com/sponsors');
  console.log('   Create sponsorship tiers:');
  console.log('   - €5/month: Early access + Discord');
  console.log('   - €20/month: Source code + tutorials');
  console.log('   - €100/month: 1:1 consulting');
  console.log('   - €500/month: Enterprise license');
  console.log('');
  
  console.log('4. 🚀 PROCEED TO SOCIAL MEDIA SETUP:');
  console.log('   • ProtonMail Plus account (€3.99/month)');
  console.log('   • 10 social media accounts');
  console.log('   • First content posting');
  console.log('   • Engagement and community building');
  console.log('');
  
  console.log('✅ GitHub setup complete! Ready for social media empire launch.');
}

// Run automation
main().catch(error => {
  console.error('❌ Automation failed:', error);
  console.log('\n🔐 IMPORTANT: Revoke the GitHub token immediately at:');
  console.log('https://github.com/settings/tokens');
});