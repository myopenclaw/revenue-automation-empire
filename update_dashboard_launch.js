// 📊 Dashboard Update Script
// Update GitHub repository tracking

const fs = require('fs');
const path = require('path');

console.log('🚀 Updating GitHub Dashboard Tracking');
console.log('=====================================\n');

// Configuration
const WORKSPACE = '/Users/clarenceetnel/.openclaw/workspace';
const DASHBOARD_FILE = path.join(WORKSPACE, 'analytics_data.json');
const GITHUB_USER = 'myopenclaw';

// Repository configurations
const REPOSITORIES = [
  {
    name: 'social-media-ai-pipeline',
    description: '€0/month AI video pipeline for YouTube/TikTok/Instagram automation',
    url: `https://github.com/${GITHUB_USER}/social-media-ai-pipeline`,
    pagesUrl: `https://${GITHUB_USER}.github.io/social-media-ai-pipeline/`,
    status: 'pending',
    lastUpdated: new Date().toISOString()
  },
  {
    name: 'zero-cost-ai-toolchain',
    description: 'Complete local AI toolchain replacing €192/month external services',
    url: `https://github.com/${GITHUB_USER}/zero-cost-ai-toolchain`,
    pagesUrl: `https://${GITHUB_USER}.github.io/zero-cost-ai-toolchain/`,
    status: 'pending',
    lastUpdated: new Date().toISOString()
  },
  {
    name: 'n8n-social-automation',
    description: 'n8n workflows for social media content automation',
    url: `https://github.com/${GITHUB_USER}/n8n-social-automation`,
    pagesUrl: `https://${GITHUB_USER}.github.io/n8n-social-automation/`,
    status: 'pending',
    lastUpdated: new Date().toISOString()
  },
  {
    name: 'social-media-analytics-dashboard',
    description: 'Real-time analytics dashboard for 10+ social media accounts',
    url: `https://github.com/${GITHUB_USER}/social-media-analytics-dashboard`,
    pagesUrl: `https://${GITHUB_USER}.github.io/social-media-analytics-dashboard/`,
    status: 'pending',
    lastUpdated: new Date().toISOString()
  }
];

// Check if repositories exist on GitHub
async function checkRepositoryExists(repoName) {
  return new Promise((resolve) => {
    const https = require('https');
    
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${GITHUB_USER}/${repoName}`,
      method: 'GET',
      headers: {
        'User-Agent': 'OpenClaw-Dashboard'
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
    
    req.on('error', () => resolve(false));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Update dashboard data
async function updateDashboard() {
  console.log('🔍 Checking repository status...\n');
  
  const dashboardData = {
    github: {
      user: GITHUB_USER,
      totalRepositories: REPOSITORIES.length,
      repositories: [],
      lastUpdated: new Date().toISOString(),
      overallStatus: 'in-progress'
    },
    socialMediaEmpire: {
      phase: 'github-setup',
      nextPhase: 'account-creation',
      timeline: '30-minutes',
      successMetrics: {
        repositoriesCreated: 0,
        codePushed: 0,
        pagesEnabled: 0,
        sponsorsReady: false
      }
    }
  };
  
  let createdCount = 0;
  let pushedCount = 0;
  
  for (const repo of REPOSITORIES) {
    console.log(`🎯 Checking: ${repo.name}`);
    
    // Check if repository exists on GitHub
    const exists = await checkRepositoryExists(repo.name);
    
    // Check if local repository has been pushed
    const repoPath = path.join(WORKSPACE, repo.name);
    const hasGit = fs.existsSync(path.join(repoPath, '.git'));
    let isPushed = false;
    
    if (hasGit) {
      try {
        // Simple check - look for remote
        const gitConfig = fs.readFileSync(path.join(repoPath, '.git/config'), 'utf8');
        isPushed = gitConfig.includes('github.com');
      } catch (error) {
        isPushed = false;
      }
    }
    
    // Update repo status
    const repoStatus = {
      name: repo.name,
      description: repo.description,
      url: repo.url,
      pagesUrl: repo.pagesUrl,
      status: exists ? (isPushed ? 'live' : 'created-not-pushed') : 'not-created',
      existsOnGitHub: exists,
      codePushed: isPushed,
      lastChecked: new Date().toISOString(),
      actions: []
    };
    
    if (exists) {
      createdCount++;
      repoStatus.actions.push('✅ Repository exists on GitHub');
    } else {
      repoStatus.actions.push('❌ Repository not created yet');
    }
    
    if (isPushed) {
      pushedCount++;
      repoStatus.actions.push('✅ Code pushed to GitHub');
    } else {
      repoStatus.actions.push('❌ Code not pushed yet');
    }
    
    dashboardData.github.repositories.push(repoStatus);
    console.log(`   Status: ${repoStatus.status}`);
    console.log(`   Actions: ${repoStatus.actions.join(', ')}\n`);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Update overall status
  dashboardData.github.overallStatus = createdCount === REPOSITORIES.length ? 
    (pushedCount === REPOSITORIES.length ? 'complete' : 'partial') : 
    'in-progress';
  
  dashboardData.socialMediaEmpire.successMetrics.repositoriesCreated = createdCount;
  dashboardData.socialMediaEmpire.successMetrics.codePushed = pushedCount;
  dashboardData.socialMediaEmpire.successMetrics.pagesEnabled = 0; // Would need API check
  
  // Save to file
  fs.writeFileSync(DASHBOARD_FILE, JSON.stringify(dashboardData, null, 2));
  
  console.log('📊 DASHBOARD SUMMARY');
  console.log('===================\n');
  
  console.log(`👤 GitHub User: ${GITHUB_USER}`);
  console.log(`📦 Total Repositories: ${REPOSITORIES.length}`);
  console.log(`✅ Created: ${createdCount}/${REPOSITORIES.length}`);
  console.log(`📤 Pushed: ${pushedCount}/${REPOSITORIES.length}`);
  console.log(`🎯 Overall Status: ${dashboardData.github.overallStatus}`);
  
  console.log('\n🔗 Repository URLs:');
  REPOSITORIES.forEach(repo => {
    console.log(`   • ${repo.name}: ${repo.url}`);
  });
  
  console.log('\n🚀 NEXT ACTIONS:');
  
  if (createdCount < REPOSITORIES.length) {
    console.log('   1. 🔐 Create new GitHub token: https://github.com/settings/tokens');
    console.log('   2. 🛠️ Create repositories manually: https://github.com/new');
    console.log('   3. 📤 Push local code using: ./github_push_script.sh');
  } else if (pushedCount < REPOSITORIES.length) {
    console.log('   1. 📤 Push remaining repositories:');
    REPOSITORIES.forEach((repo, index) => {
      const repoStatus = dashboardData.github.repositories[index];
      if (!repoStatus.codePushed) {
        console.log(`      • ${repo.name}: cd ${repo.name} && git push -u origin main`);
      }
    });
  } else {
    console.log('   1. 🌐 Enable GitHub Pages for each repository');
    console.log('   2. 💰 Setup GitHub Sponsors: https://github.com/sponsors');
    console.log('   3. 🚀 Proceed to social media account creation');
  }
  
  console.log('\n📁 Dashboard data saved to: analytics_data.json');
  console.log('\n✅ Dashboard update complete!');
}

// Run update
updateDashboard().catch(error => {
  console.error('❌ Error updating dashboard:', error);
  console.log('\n⚠️  Continuing with manual setup...');
  
  // Create basic dashboard file anyway
  const basicData = {
    github: {
      user: GITHUB_USER,
      totalRepositories: REPOSITORIES.length,
      repositories: REPOSITORIES,
      lastUpdated: new Date().toISOString(),
      overallStatus: 'manual-setup-required'
    },
    note: 'GitHub API check failed. Proceed with manual setup using GITHUB_MANUAL_SETUP_GUIDE.md'
  };
  
  fs.writeFileSync(DASHBOARD_FILE, JSON.stringify(basicData, null, 2));
  console.log('📁 Basic dashboard created: analytics_data.json');
});