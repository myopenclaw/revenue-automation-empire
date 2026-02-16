// Check GitHub repositories status
const https = require('https');

const REPOS = [
  'social-media-ai-pipeline',
  'zero-cost-ai-toolchain',
  'n8n-social-automation',
  'social-media-analytics-dashboard'
];

const USER = 'myopenclaw';

console.log('🔍 Checking GitHub repositories...');
console.log('===============================\n');

REPOS.forEach(repo => {
  const url = `https://github.com/${USER}/${repo}`;
  
  console.log(`📦 ${repo}:`);
  console.log(`   URL: ${url}`);
  
  // Try to fetch repository page
  const req = https.get(url, (res) => {
    if (res.statusCode === 200) {
      console.log(`   ✅ EXISTS (Status: ${res.statusCode})`);
    } else if (res.statusCode === 404) {
      console.log(`   ❌ NOT FOUND (Status: ${res.statusCode})`);
      console.log(`   ➡️ Create at: https://github.com/new`);
      console.log(`   Name: ${repo}`);
      console.log(`   Public repository`);
      console.log(`   DO NOT initialize with README`);
    } else {
      console.log(`   ⚠️  Status: ${res.statusCode}`);
    }
    console.log('');
  });
  
  req.on('error', (err) => {
    console.log(`   ⚠️  Error checking: ${err.message}`);
    console.log('');
  });
  
  req.end();
});

console.log('🎯 INSTRUCTIES:');
console.log('==============\n');

console.log('1. Ga naar elke URL hierboven');
console.log('2. Als "NOT FOUND": maak repository aan');
console.log('3. Als "EXISTS": repository is al aangemaakt');
console.log('');
console.log('4. Voor push commands:');
console.log('   cd /Users/clarenceetnel/.openclaw/workspace');
REPOS.forEach(repo => {
  console.log(`   cd ${repo} && git push -u origin main && cd ..`);
});
console.log('');
console.log('5. Eerste push vraagt om credentials:');
console.log('   Username: myopenclaw');
console.log('   Password: [je GitHub password of token]');