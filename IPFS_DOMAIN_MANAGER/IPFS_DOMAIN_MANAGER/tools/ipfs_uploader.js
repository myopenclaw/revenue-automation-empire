const fs = require('fs');
const { create } = require('ipfs-http-client');
const chalk = require('chalk');
const cron = require('node-cron');

class IPFSUploader {
  constructor() {
    this.ipfs = create({ url: 'http://localhost:5001' });
    this.uploads = [];
  }

  async testConnection() {
    try {
      const version = await this.ipfs.version();
      console.log(chalk.green(`✅ Connected to IPFS ${version.version}`));
      return true;
    } catch (error) {
      console.log(chalk.yellow('⚠️  Local IPFS node not found, using Infura...'));
      this.ipfs = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
          authorization: `Basic ${Buffer.from(
            `${process.env.INFURA_PROJECT_ID}:${process.env.INFURA_PROJECT_SECRET}`
          ).toString('base64')}`
        }
      });
      return true;
    }
  }

  async uploadFile(filePath, domainName) {
    try {
      const file = fs.readFileSync(filePath);
      const result = await this.ipfs.add(file);
      
      const uploadRecord = {
        domain: domainName,
        cid: result.cid.toString(),
        timestamp: new Date().toISOString(),
        size: result.size
      };
      
      this.uploads.push(uploadRecord);
      console.log(chalk.green(`✅ Uploaded ${domainName}: ${uploadRecord.cid}`));
      
      // Save to log
      this.saveUploadLog();
      
      return uploadRecord;
    } catch (error) {
      console.log(chalk.red(`❌ Error uploading ${domainName}:`, error.message));
      return null;
    }
  }

  async uploadWebsite(domainName, htmlContent) {
    // Create simple website for domain
    const websiteFiles = [
      {
        path: 'index.html',
        content: htmlContent || this.generateDefaultWebsite(domainName)
      },
      {
        path: 'style.css',
        content: this.generateCSS()
      },
      {
        path: 'script.js',
        content: this.generateJavaScript(domainName)
      }
    ];

    try {
      const results = [];
      for (const file of websiteFiles) {
        const result = await this.ipfs.add(Buffer.from(file.content));
        results.push({
          path: file.path,
          cid: result.cid.toString()
        });
      }

      // Create directory listing
      const directoryResult = await this.ipfs.add({
        path: domainName,
        content: JSON.stringify(results)
      });

      const uploadRecord = {
        domain: domainName,
        directoryCid: directoryResult.cid.toString(),
        files: results,
        timestamp: new Date().toISOString(),
        type: 'website'
      };

      this.uploads.push(uploadRecord);
      console.log(chalk.green(`✅ Website uploaded for ${domainName}: ${uploadRecord.directoryCid}`));
      
      this.saveUploadLog();
      return uploadRecord;
    } catch (error) {
      console.log(chalk.red(`❌ Error uploading website for ${domainName}:`, error.message));
      return null;
    }
  }

  generateDefaultWebsite(domainName) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${domainName} | Web3 Domain</title>
    <link rel="stylesheet" href="style.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌐</text></svg>">
</head>
<body>
    <div class="container">
        <header>
            <h1>${domainName}</h1>
            <p class="subtitle">Web3 Domain on IPFS</p>
        </header>
        
        <main>
            <div class="card">
                <h2>🚀 This Domain is Available for Lease</h2>
                <p>Rent this premium Web3 domain for your project, brand, or DAO.</p>
                
                <div class="features">
                    <div class="feature">
                        <span class="emoji">🌐</span>
                        <h3>IPFS Hosted</h3>
                        <p>Decentralized, censorship-resistant hosting</p>
                    </div>
                    <div class="feature">
                        <span class="emoji">🔗</span>
                        <h3>DNS Configured</h3>
                        <p>Works in any Web3 browser</p>
                    </div>
                    <div class="feature">
                        <span class="emoji">💸</span>
                        <h3>Revenue Share</h3>
                        <p>Earn from subdomain leases</p>
                    </div>
                </div>
                
                <div class="pricing">
                    <h3>Pricing</h3>
                    <ul>
                        <li>Subdomain Lease: $5-50/month</li>
                        <li>Full Domain Lease: $100-500/month</li>
                        <li>Custom Development: Contact for quote</li>
                    </ul>
                </div>
                
                <div class="cta">
                    <a href="mailto:leasing@empire.crypto?subject=Lease%20${domainName}" class="button">
                        Lease This Domain
                    </a>
                    <a href="https://unstoppabledomains.com/search?searchTerm=${domainName}" class="button secondary" target="_blank">
                        View on Marketplace
                    </a>
                </div>
            </div>
            
            <div class="info">
                <h3>📊 Domain Statistics</h3>
                <table>
                    <tr>
                        <td>TLD:</td>
                        <td><strong>${domainName.split('.').pop()}</strong></td>
                    </tr>
                    <tr>
                        <td>Length:</td>
                        <td><strong>${domainName.length} characters</strong></td>
                    </tr>
                    <tr>
                        <td>IPFS CID:</td>
                        <td><code>${this.uploads.length > 0 ? this.uploads[this.uploads.length-1].directoryCid : 'Pending...'}</code></td>
                    </tr>
                    <tr>
                        <td>Status:</td>
                        <td><span class="status available">Available for Lease</span></td>
                    </tr>
                </table>
            </div>
        </main>
        
        <footer>
            <p>Powered by <strong>Empire Domain Manager</strong> • <a href="https://empire.crypto">empire.crypto</a></p>
            <p class="small">This website is hosted on IPFS and managed by AI agents.</p>
        </footer>
    </div>
    
    <script src="script.js"></script>
</body>
</html>
    `;
  }

  generateCSS() {
    return `
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

header {
    text-align: center;
    margin-bottom: 3rem;
    color: white;
}

header h1 {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    text-shadow: 2px 2px
