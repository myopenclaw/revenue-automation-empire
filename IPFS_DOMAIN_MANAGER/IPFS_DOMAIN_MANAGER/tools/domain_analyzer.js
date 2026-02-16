const fs = require('fs');
const csv = require('csv-parser');
const chalk = require('chalk');

class DomainAnalyzer {
  constructor() {
    this.domains = [];
    this.stats = {
      total: 0,
      byTld: {},
      byLength: {},
      estimatedValue: 0
    };
  }

  async loadDomains(filePath) {
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          this.domains.push(row);
          this.stats.total++;
          
          // Extract TLD
          const tld = row.domain.split('.').pop();
          this.stats.byTld[tld] = (this.stats.byTld[tld] || 0) + 1;
          
          // Length analysis
          const length = row.domain.length;
          const lengthGroup = Math.floor(length / 5) * 5;
          this.stats.byLength[lengthGroup] = (this.stats.byLength[lengthGroup] || 0) + 1;
          
          // Estimate value
          const value = this.estimateDomainValue(row.domain);
          this.stats.estimatedValue += value;
        })
        .on('end', () => {
          console.log(chalk.green(`✅ Loaded ${this.stats.total} domains`));
          this.printStats();
          resolve(this.domains);
        })
        .on('error', reject);
    });
  }

  estimateDomainValue(domain) {
    // Simple valuation algorithm
    let value = 50; // Base value
    
    const parts = domain.split('.');
    const name = parts[0];
    const tld = parts[1];
    
    // TLD multipliers
    const tldMultipliers = {
      'crypto': 2.0,
      'x': 1.8,
      'nft': 1.5,
      'wallet': 1.3,
      'blockchain': 1.2,
      'bitcoin': 1.5,
      'dao': 1.4,
      '888': 1.1
    };
    
    value *= tldMultipliers[tld] || 1.0;
    
    // Length multiplier (shorter = more valuable)
    if (name.length <= 5) value *= 3.0;
    else if (name.length <= 8) value *= 2.0;
    else if (name.length <= 12) value *= 1.5;
    
    // Keyword multipliers
    const valuableKeywords = [
      'crypto', 'coin', 'token', 'nft', 'web3', 'defi', 'trade',
      'silver', 'gold', 'metal', 'wealth', 'money', 'finance'
    ];
    
    valuableKeywords.forEach(keyword => {
      if (name.includes(keyword)) value *= 1.5;
    });
    
    return Math.round(value);
  }

  printStats() {
    console.log(chalk.cyan('\n📊 DOMAIN PORTFOLIO ANALYSIS'));
    console.log(chalk.cyan('============================'));
    console.log(`Total Domains: ${chalk.yellow(this.stats.total)}`);
    console.log(`Estimated Value: ${chalk.green('$' + this.stats.estimatedValue.toLocaleString())}`);
    
    console.log(chalk.cyan('\n📈 BY TLD:'));
    Object.entries(this.stats.byTld)
      .sort((a, b) => b[1] - a[1])
      .forEach(([tld, count]) => {
        console.log(`  .${tld}: ${count} domains`);
      });
    
    console.log(chalk.cyan('\n🎯 TOP 10 MOST VALUABLE DOMAINS:'));
    const sorted = this.domains
      .map(d => ({...d, value: this.estimateDomainValue(d.domain)}))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    
    sorted.forEach((domain, i) => {
      console.log(`  ${i+1}. ${chalk.yellow(domain.domain)}: $${domain.value}`);
    });
    
    // Revenue projection
    const monthlyRevenue = this.calculateRevenueProjection();
    console.log(chalk.cyan('\n💰 REVENUE PROJECTION:'));
    console.log(`  Subdomain Leasing: $${monthlyRevenue.leasing}/month`);
    console.log(`  IPFS Hosting: $${monthlyRevenue.hosting}/month`);
    console.log(`  Marketplace Flipping: $${monthlyRevenue.flipping}/month`);
    console.log(`  TOTAL: $${monthlyRevenue.total}/month`);
  }

  calculateRevenueProjection() {
    const leasing = Math.round(this.stats.total * 5 * 0.1); // 10% leased at $5/month
    const hosting = Math.round(this.stats.total * 2 * 0.2); // 20% hosted at $2/month
    const flipping = Math.round(this.stats.estimatedValue * 0.01); // 1% flipped monthly
    
    return {
      leasing,
      hosting,
      flipping,
      total: leasing + hosting + flipping
    };
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      domains: this.domains.slice(0, 100), // First 100 for report
      revenueProjection: this.calculateRevenueProjection(),
      recommendations: this.generateRecommendations()
    };
    
    fs.writeFileSync(
      'output/domain_analysis_report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log(chalk.green('✅ Report saved to output/domain_analysis_report.json'));
    return report;
  }

  generateRecommendations() {
    return {
      immediateActions: [
        "1. List top 100 domains for subdomain leasing",
        "2. Setup IPFS hosting for .crypto domains",
        "3. Create marketplace listings for rare domains",
        "4. Implement automated renewal system"
      ],
      pricingStrategy: {
        leasing: "$5-50/month based on domain quality",
        hosting: "$2-10/month for IPFS + DNS",
        premium: "$100-500/month for keyword domains"
      },
      timeline: {
        week1: "€1-5K/month revenue",
        month1: "€6.9-20K/month revenue",
        quarter1: "€20-69K/month revenue"
      }
    };
  }
}

// If run directly
if (require.main === module) {
  const analyzer = new DomainAnalyzer();
  
  // Check for domain list file
  const domainFile = process.argv[2] || 'domains.csv';
  
  if (!fs.existsSync(domainFile)) {
    console.log(chalk.yellow(`⚠️  Domain file not found: ${domainFile}`));
    console.log(chalk.cyan('Creating sample template...'));
    
    // Create sample CSV
    const sampleDomains = [
      'crypto.trading.crypto',
      'silver.invest.x',
      'nft.gallery.nft',
      'defi.bank.crypto',
      'web3.tools.x'
    ];
    
    const csvContent = sampleDomains.map(d => `domain,expiration\n${d},2027-12-31`).join('\n');
    fs.writeFileSync('domains_sample.csv', csvContent);
    
    console.log(chalk.green('✅ Sample file created: domains_sample.csv'));
    console.log(chalk.cyan('Please provide your domain list as CSV with columns: domain,expiration'));
  } else {
    analyzer.loadDomains(domainFile)
      .then(() => analyzer.generateReport())
      .catch(console.error);
  }
}

module.exports = DomainAnalyzer;
