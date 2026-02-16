// 📦 N8N WORKFLOW IMPORT SCRIPT
// Import workflows once n8n is ready

const fs = require('fs');
const path = require('path');
const axios = require('axios');

console.log('📦 N8N WORKFLOW IMPORT PREPARATION');
console.log('===================================\n');

const N8N_BASE_URL = 'http://localhost:5678';
const API_KEY = 'your-api-key-here'; // Will be set after n8n setup

const WORKFLOWS = [
  {
    name: 'first_n8n_workflow.json',
    description: 'YouTube Video Pipeline - Complete local AI workflow'
  },
  {
    name: 'social_media_automation_plan.md',
    description: 'Social Media Automation Blueprint'
  }
];

async function waitForN8n() {
  console.log('⏳ Waiting for n8n to be ready...');
  
  let attempts = 0;
  const maxAttempts = 30; // 30 * 10s = 5 minutes
  
  while (attempts < maxAttempts) {
    try {
      const response = await axios.get(`${N8N_BASE_URL}/health`, {
        timeout: 5000
      });
      
      if (response.status === 200) {
        console.log('✅ n8n is ready and healthy!');
        console.log(`   Status: ${JSON.stringify(response.data, null, 2)}`);
        return true;
      }
    } catch (error) {
      // n8n not ready yet
      if (attempts % 5 === 0) {
        console.log(`   Attempt ${attempts + 1}/${maxAttempts}: n8n not ready yet...`);
      }
    }
    
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
  }
  
  console.log('❌ n8n did not start within timeout');
  return false;
}

async function setupN8nUser() {
  console.log('\n👤 Setting up n8n user...');
  
  // Check if user already exists
  try {
    const response = await axios.post(`${N8N_BASE_URL}/rest/login`, {
      email: 'admin@yourdomain.com',
      password: 'password123'
    });
    
    console.log('✅ User login successful');
    return response.data.data.token;
  } catch (error) {
    console.log('⚠️  Login failed, may need to create user');
    
    // Try to create user (first-time setup)
    try {
      const response = await axios.post(`${N8N_BASE_URL}/rest/owner/setup`, {
        email: 'admin@yourdomain.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'password123'
      });
      
      console.log('✅ Owner user created');
      return response.data.data.token;
    } catch (setupError) {
      console.log('❌ Failed to setup user:', setupError.message);
      return null;
    }
  }
}

async function importWorkflow(token, workflowPath) {
  console.log(`\n📥 Importing workflow: ${path.basename(workflowPath)}`);
  
  try {
    const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
    
    const response = await axios.post(`${N8N_BASE_URL}/rest/workflows`, workflowData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Workflow imported: ${response.data.data.name}`);
    console.log(`   ID: ${response.data.data.id}`);
    return response.data.data;
  } catch (error) {
    console.log(`❌ Failed to import workflow: ${error.message}`);
    return null;
  }
}

async function createBasicWorkflows(token) {
  console.log('\n🛠️ Creating basic automation workflows...');
  
  const basicWorkflows = [
    {
      name: 'Daily Content Schedule',
      nodes: [
        {
          name: 'Cron Trigger',
          type: 'n8n-nodes-base.cron',
          position: [250, 300],
          parameters: {
            rule: {
              timezone: 'Europe/Amsterdam',
              mode: 'everyDay',
              hour: 8,
              minute: 0
            }
          }
        },
        {
          name: 'Generate Content',
          type: 'n8n-nodes-base.code',
          position: [450, 300],
          parameters: {
            jsCode: `// Generate daily content plan
const channels = [
  'Junior Science Lab',
  'Kid Entrepreneur Club', 
  'Storytime Adventures',
  'Art & Craft Kids',
  'AI Automation Lab',
  'Algorithmic Trading Hub',
  'Digital Collectibles Studio',
  'Local AI Revolution'
];

const topics = [
  'science experiment',
  'business idea',
  'story adventure',
  'art project',
  'AI tool tutorial',
  'trading analysis',
  'NFT creation',
  'privacy tool'
];

const plan = channels.map((channel, index) => ({
  channel,
  topic: topics[index],
  platform: 'YouTube',
  schedule: 'today 14:00'
}));

return [{ json: { dailyPlan: plan, totalVideos: plan.length } }];`
          }
        },
        {
          name: 'Log Plan',
          type: 'n8n-nodes-base.set',
          position: [650, 300],
          parameters: {
            assignments: {
              values: [
                {
                  name: 'message',
                  value: '=Daily content plan generated for {{$json.totalVideos}} videos'
                }
              ]
            }
          }
        }
      ],
      connections: {
        'Cron Trigger': {
          main: [[{ node: 'Generate Content', type: 'main', index: 0 }]]
        },
        'Generate Content': {
          main: [[{ node: 'Log Plan', type: 'main', index: 0 }]]
        }
      }
    },
    {
      name: 'Social Media Analytics',
      nodes: [
        {
          name: 'Schedule',
          type: 'n8n-nodes-base.cron',
          position: [250, 300],
          parameters: {
            rule: {
              timezone: 'Europe/Amsterdam',
              mode: 'everyHour',
              minute: 0
            }
          }
        },
        {
          name: 'Collect Metrics',
          type: 'n8n-nodes-base.httpRequest',
          position: [450, 300],
          parameters: {
            method: 'GET',
            url: 'http://localhost:3000/api/analytics',
            authentication: 'none'
          }
        },
        {
          name: 'Save to Database',
          type: 'n8n-nodes-base.postgres',
          position: [650, 300],
          parameters: {
            operation: 'insert',
            table: 'platform_metrics',
            columns: 'metrics, collected_at',
            values: '={{$json.metrics}}, NOW()'
          }
        }
      ],
      connections: {
        'Schedule': {
          main: [[{ node: 'Collect Metrics', type: 'main', index: 0 }]]
        },
        'Collect Metrics': {
          main: [[{ node: 'Save to Database', type: 'main', index: 0 }]]
        }
      }
    }
  ];
  
  const results = [];
  
  for (const workflow of basicWorkflows) {
    try {
      const response = await axios.post(`${N8N_BASE_URL}/rest/workflows`, workflow, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Created workflow: ${workflow.name}`);
      results.push(response.data.data);
    } catch (error) {
      console.log(`❌ Failed to create workflow ${workflow.name}: ${error.message}`);
    }
  }
  
  return results;
}

async function main() {
  console.log('🚀 N8N AUTOMATION SETUP');
  console.log('=======================\n');
  
  // Step 1: Wait for n8n
  const isReady = await waitForN8n();
  if (!isReady) {
    console.log('Exiting - n8n not ready');
    return;
  }
  
  // Step 2: Setup user
  const token = await setupN8nUser();
  if (!token) {
    console.log('Exiting - failed to setup user');
    return;
  }
  
  // Step 3: Import existing workflows
  console.log('\n📦 IMPORTING EXISTING WORKFLOWS');
  console.log('===============================');
  
  for (const workflow of WORKFLOWS) {
    const workflowPath = path.join(__dirname, workflow.name);
    if (fs.existsSync(workflowPath)) {
      await importWorkflow(token, workflowPath);
    }
  }
  
  // Step 4: Create basic workflows
  await createBasicWorkflows(token);
  
  // Step 5: Summary
  console.log('\n🎉 N8N SETUP COMPLETE!');
  console.log('=====================\n');
  console.log('✅ n8n is running on: http://localhost:5678');
  console.log('✅ Default credentials:');
  console.log('   Email: admin@yourdomain.com');
  console.log('   Password: password123');
  console.log('\n📊 Next steps:');
  console.log('   1. Login to n8n interface');
  console.log('   2. Change default password');
  console.log('   3. Configure API credentials');
  console.log('   4. Test workflows');
  console.log('   5. Schedule automation');
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  waitForN8n,
  setupN8nUser,
  importWorkflow,
  createBasicWorkflows
};