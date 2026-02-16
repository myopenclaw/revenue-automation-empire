// 🗺️ CONTENT GRAPH
// Central hub for all content assets and their relationships

class ContentGraph {
  constructor(config = {}) {
    this.name = 'Content Graph';
    this.version = '2.0.0';
    
    // Configuration
    this.config = {
      storage: config.storage || 'memory', // memory, json, database
      maxAssets: config.maxAssets || 100000,
      autoCleanup: config.autoCleanup !== false,
      cleanupAge: config.cleanupAge || 30 * 24 * 60 * 60 * 1000, // 30 days
      logLevel: config.logLevel || 'info',
      ...config
    };
    
    // Data structures
    this.assets = new Map(); // assetId -> asset object
    this.tags = new Map(); // tag -> Set of assetIds
    this.relationships = new Map(); // assetId -> Set of related assetIds
    this.metrics = new Map(); // assetId -> performance metrics
    
    // Indexes for fast lookup
    this.indexes = {
      byPlatform: new Map(), // platform -> Set of assetIds
      byNiche: new Map(), // niche -> Set of assetIds  
      byFormat: new Map(), // format -> Set of assetIds
      byStatus: new Map(), // status -> Set of assetIds
      byScore: new Map() // score range -> Set of assetIds
    };
    
    // Statistics
    this.stats = {
      startTime: Date.now(),
      assetsCreated: 0,
      assetsUpdated: 0,
      assetsDeleted: 0,
      relationshipsCreated: 0,
      tagsApplied: 0,
      queries: 0
    };
    
    // Initialize
    this.initialize();
    
    console.log(`🗺️ ${this.name} v${this.version} initialized`);
  }
  
  /**
   * Initialize content graph
   */
  initialize() {
    this.log('info', 'Content Graph initializing...');
    
    // Set up cleanup interval
    if (this.config.autoCleanup) {
      this.cleanupInterval = setInterval(() => {
        this.cleanupOldAssets();
      }, 24 * 60 * 60 * 1000); // Daily
    }
    
    // Set up stats logging
    this.statsInterval = setInterval(() => {
      this.logStats();
    }, 60 * 60 * 1000); // Hourly
    
    this.log('info', 'Content Graph initialized successfully');
  }
  
  /**
   * Create a new content asset
   */
  createAsset(data) {
    const assetId = data.id || `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    // Validate required fields
    if (!data.hook || !data.niche || !data.platform || !data.format) {
      throw new Error('Missing required fields: hook, niche, platform, format');
    }
    
    // Create asset object
    const asset = {
      id: assetId,
      hook: data.hook,
      script: data.script || '',
      caption: data.caption || '',
      cta: data.cta || 'Shop now',
      visuals: data.visuals || '',
      landing: data.landing || '',
      tags: data.tags || [],
      niche: data.niche,
      platform: data.platform,
      format: data.format,
      status: 'draft', // draft, scheduled, published, archived
      score: 0, // 0-10 quality score
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
      metadata: data.metadata || {},
      variations: data.variations || [],
      parentId: data.parentId || null,
      source: data.source || 'manual'
    };
    
    // Generate UTM if not provided
    if (!asset.landing.includes('utm_')) {
      asset.landing = this.generateUTM(asset);
    }
    
    // Store asset
    this.assets.set(assetId, asset);
    
    // Update indexes
    this.updateIndexes(assetId, asset);
    
    // Apply tags
    if (asset.tags.length > 0) {
      this.applyTags(assetId, asset.tags);
    }
    
    // Update stats
    this.stats.assetsCreated++;
    
    this.log('info', `Asset created: ${assetId} (${asset.hook.substring(0, 50)}...)`);
    
    // Emit event
    this.emit('asset_created', { assetId, asset });
    
    return { success: true, assetId, asset };
  }
  
  /**
   * Update an existing asset
   */
  updateAsset(assetId, updates) {
    if (!this.assets.has(assetId)) {
      this.log('error', `Asset ${assetId} not found`);
      return { success: false, error: 'Asset not found' };
    }
    
    const asset = this.assets.get(assetId);
    const now = Date.now();
    
    // Remove from old indexes
    this.removeFromIndexes(assetId, asset);
    
    // Apply updates
    const updatedAsset = {
      ...asset,
      ...updates,
      updatedAt: now
    };
    
    // Update status-specific timestamps
    if (updates.status === 'published' && asset.status !== 'published') {
      updatedAsset.publishedAt = now;
    }
    
    // Store updated asset
    this.assets.set(assetId, updatedAsset);
    
    // Update indexes
    this.updateIndexes(assetId, updatedAsset);
    
    // Update tags if changed
    if (updates.tags && JSON.stringify(updates.tags) !== JSON.stringify(asset.tags)) {
      this.removeTags(assetId, asset.tags);
      this.applyTags(assetId, updates.tags);
    }
    
    // Update stats
    this.stats.assetsUpdated++;
    
    this.log('info', `Asset updated: ${assetId}`);
    
    // Emit event
    this.emit('asset_updated', { assetId, oldAsset: asset, newAsset: updatedAsset });
    
    return { success: true, assetId, asset: updatedAsset };
  }
  
  /**
   * Delete an asset
   */
  deleteAsset(assetId) {
    if (!this.assets.has(assetId)) {
      this.log('warn', `Asset ${assetId} not found`);
      return { success: false, error: 'Asset not found' };
    }
    
    const asset = this.assets.get(assetId);
    
    // Remove from indexes
    this.removeFromIndexes(assetId, asset);
    
    // Remove tags
    this.removeTags(assetId, asset.tags);
    
    // Remove relationships
    this.relationships.delete(assetId);
    
    // Remove metrics
    this.metrics.delete(assetId);
    
    // Remove asset
    this.assets.delete(assetId);
    
    // Update stats
    this.stats.assetsDeleted++;
    
    this.log('info', `Asset deleted: ${assetId}`);
    
    // Emit event
    this.emit('asset_deleted', { assetId, asset });
    
    return { success: true, assetId };
  }
  
  /**
   * Get asset by ID
   */
  getAsset(assetId) {
    this.stats.queries++;
    
    if (!this.assets.has(assetId)) {
      return null;
    }
    
    const asset = this.assets.get(assetId);
    const metrics = this.metrics.get(assetId) || {};
    
    return {
      ...asset,
      metrics,
      relatedAssets: this.getRelatedAssets(assetId),
      performance: this.calculatePerformance(assetId)
    };
  }
  
  /**
   * Search assets by criteria
   */
  searchAssets(criteria = {}) {
    this.stats.queries++;
    
    let results = new Set(this.assets.keys());
    
    // Apply filters
    if (criteria.niche) {
      const nicheAssets = this.indexes.byNiche.get(criteria.niche) || new Set();
      results = this.intersectSets(results, nicheAssets);
    }
    
    if (criteria.platform) {
      const platformAssets = this.indexes.byPlatform.get(criteria.platform) || new Set();
      results = this.intersectSets(results, platformAssets);
    }
    
    if (criteria.format) {
      const formatAssets = this.indexes.byFormat.get(criteria.format) || new Set();
      results = this.intersectSets(results, formatAssets);
    }
    
    if (criteria.status) {
      const statusAssets = this.indexes.byStatus.get(criteria.status) || new Set();
      results = this.intersectSets(results, statusAssets);
    }
    
    if (criteria.tags && criteria.tags.length > 0) {
      for (const tag of criteria.tags) {
        const tagAssets = this.tags.get(tag) || new Set();
        results = this.intersectSets(results, tagAssets);
      }
    }
    
    if (criteria.minScore !== undefined) {
      const scoreAssets = new Set();
      for (const [range, assets] of this.indexes.byScore) {
        const [min, max] = range.split('-').map(Number);
        if (min >= criteria.minScore) {
          assets.forEach(id => scoreAssets.add(id));
        }
      }
      results = this.intersectSets(results, scoreAssets);
    }
    
    if (criteria.searchText) {
      const searchLower = criteria.searchText.toLowerCase();
      const filtered = new Set();
      
      for (const assetId of results) {
        const asset = this.assets.get(assetId);
        if (
          asset.hook.toLowerCase().includes(searchLower) ||
          asset.script.toLowerCase().includes(searchLower) ||
          asset.caption.toLowerCase().includes(searchLower) ||
          asset.tags.some(tag => tag.toLowerCase().includes(searchLower))
        ) {
          filtered.add(assetId);
        }
      }
      results = filtered;
    }
    
    // Convert to array and sort
    const resultArray = Array.from(results).map(id => this.getAsset(id));
    
    // Apply sorting
    if (criteria.sortBy) {
      resultArray.sort((a, b) => {
        switch (criteria.sortBy) {
          case 'score':
            return (b.score || 0) - (a.score || 0);
          case 'createdAt':
            return b.createdAt - a.createdAt;
          case 'publishedAt':
            return (b.publishedAt || 0) - (a.publishedAt || 0);
          case 'performance':
            const perfA = this.calculatePerformance(a.id).totalScore || 0;
            const perfB = this.calculatePerformance(b.id).totalScore || 0;
            return perfB - perfA;
          default:
            return 0;
        }
      });
    }
    
    // Apply limit
    if (criteria.limit) {
      return resultArray.slice(0, criteria.limit);
    }
    
    return resultArray;
  }
  
  /**
   * Create relationship between assets
   */
  createRelationship(sourceAssetId, targetAssetId, type = 'variation') {
    if (!this.assets.has(sourceAssetId) || !this.assets.has(targetAssetId)) {
      this.log('error', 'One or both assets not found');
      return { success: false, error: 'Asset not found' };
    }
    
    if (!this.relationships.has(sourceAssetId)) {
      this.relationships.set(sourceAssetId, new Set());
    }
    
    const relationships = this.relationships.get(sourceAssetId);
    relationships.add({
      assetId: targetAssetId,
      type,
      createdAt: Date.now()
    });
    
    this.stats.relationshipsCreated++;
    
    this.log('debug', `Relationship created: ${sourceAssetId} -> ${targetAssetId} (${type})`);
    
    return { success: true, sourceAssetId, targetAssetId, type };
  }
  
  /**
   * Get related assets
   */
  getRelatedAssets(assetId, type = null) {
    if (!this.relationships.has(assetId)) {
      return [];
    }
    
    const relationships = this.relationships.get(assetId);
    let related = Array.from(relationships);
    
    if (type) {
      related = related.filter(r => r.type === type);
    }
    
    return related.map(r => ({
      ...r,
      asset: this.getAsset(r.assetId)
    }));
  }
  
  /**
   * Apply tags to asset
   */
  applyTags(assetId, tags) {
    if (!this.assets.has(assetId)) {
      return { success: false, error: 'Asset not found' };
    }
    
    for (const tag of tags) {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, new Set());
      }
      
      this.tags.get(tag).add(assetId);
      this.stats.tagsApplied++;
    }
    
    return { success: true, assetId, tags };
  }
  
  /**
   * Remove tags from asset
   */
  removeTags(assetId, tags) {
    for (const tag of tags) {
      if (this.tags.has(tag)) {
        this.tags.get(tag).delete(assetId);
        
        // Clean up empty tag sets
        if (this.tags.get(tag).size === 0) {
          this.tags.delete(tag);
        }
      }
    }
    
    return { success: true, assetId, tags };
  }
  
  /**
   * Update asset metrics (performance data)
   */
  updateMetrics(assetId, metrics) {
    if (!this.assets.has(assetId)) {
      return { success: false, error: 'Asset not found' };
    }
    
    const existingMetrics = this.metrics.get(assetId) || {};
    const updatedMetrics = {
      ...existingMetrics,
      ...metrics,
      lastUpdated: Date.now()
    };
    
    this.metrics.set(assetId, updatedMetrics);
    
    // Update asset score based on metrics
    this.updateAssetScore(assetId);
    
    return { success: true, assetId, metrics: updatedMetrics };
  }
  
  /**
   * Update asset score based on metrics
   */
  updateAssetScore(assetId) {
    const asset = this.assets.get(assetId);
    if (!asset) return;
    
    const metrics = this.metrics.get(assetId) || {};
    const performance = this.calculatePerformance(assetId);
    
    // Calculate new score (0-10)
    let newScore = asset.score;
    
    // Base score from quality assessment
    if (asset.status === 'published') {
      // Engagement metrics
      const engagementScore = Math.min(5, (performance.engagementRate || 0) * 100);
      
      // Conversion metrics  
      const conversionScore = Math.min(3, (performance.conversionRate || 0) * 100);
      
      // Recency bonus (recent performance weighted higher)
      const recencyBonus = performance.last7Days ? 1 : 0;
      
      newScore = engagementScore + conversionScore + recencyBonus;
    }
    
    // Update asset if score changed
    if (newScore !== asset.score) {
      this.updateAsset(assetId, { score: newScore });
    }
    
    return newScore;
  }
  
  /**
   * Calculate performance metrics for asset
   */
  calculatePerformance(assetId) {
    const metrics = this.metrics.get(assetId) || {};
    const now = Date.now();
    
    // Calculate rates
    const views = metrics.views || 0;
    const likes = metrics.likes || 0;
    const comments = metrics.comments || 0;
    const shares = metrics.shares || 0;
    const clicks = metrics.clicks || 0;
    const conversions = metrics.conversions || 0;
    
    const engagementRate = views > 0 ? (likes + comments + shares) / views : 0;
    const ctr = views > 0 ? clicks / views : 0;
    const conversionRate = clicks > 0 ? conversions / clicks : 0;
    
    // Calculate recency
    const lastActivity = metrics.lastActivity || 0;
    const daysSinceActivity = (now - lastActivity) / (24 * 60 * 60 * 1000);
    
    // Calculate total score (0-100)
    const totalScore = (
      (engagementRate * 40) + // 40 points for engagement
      (ctr * 30) + // 30 points for CTR
      (conversionRate * 30) // 30 points for conversion
    ) * 100;
    
    // Determine if performing well recently
    const last7Days = daysSinceActivity <= 7 && totalScore > 50;
    const last30Days = daysSinceActivity <= 30 && totalScore > 30;
    
    return {
      views,
      likes,
      comments,
      shares,
      clicks,
      conversions,
      engagementRate,
      ctr,
      conversionRate,
      totalScore,
      lastActivity,
      daysSinceActivity,
      last7Days,
      last30Days,
      roi: conversions > 0 ? (metrics.revenue || 0) / (metrics.cost || 1) : 0
    };
  }
  
  /**
   * Generate UTM parameters for asset
   */
  generateUTM(asset) {
    const baseUrl = asset.landing || 'https://silverempire.com';
    const params = new URLSearchParams();
    
    params.set('utm_source', asset.platform);
    params.set('utm_medium', 'social');
    params.set('utm_campaign', `${asset.niche}_${asset.format}`);
    params.set('utm_content', asset.id);
    params.set('utm_term', asset.tags.join(','));
    
    // Add timestamp for uniqueness
    params.set('_t', Date.now().toString(36));
    
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${params.toString()}`;
  }
  
  /**
   * Find top performing assets
   */
  findTopPerformers(criteria = {}) {
    const allAssets = this.searchAssets({
      status: 'published',
      minScore: criteria.minScore || 5,
      ...criteria
    });
