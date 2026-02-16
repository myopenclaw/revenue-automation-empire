// ⚖️ LOAD BALANCER
// Distributes tasks across agents of the same type

class LoadBalancer {
  constructor(type, strategy = 'round-robin') {
    this.type = type;
    this.strategy = strategy;
    
    // Agent tracking
    this.agents = new Map(); // agentId -> agent stats
    this.availableAgents = new Set();
    
    // Performance metrics
    this.metrics = {
      totalAssignments: 0,
      totalCompletions: 0,
      totalFailures: 0,
      totalProcessingTime: 0,
      assignmentsByAgent: new Map(),
      completionTimes: []
    };
    
    // Strategy state
    this.roundRobinIndex = 0;
    this.lastAssignmentTime = Date.now();
    
    console.log(`⚖️ Load balancer created for ${type} (strategy: ${strategy})`);
  }
  
  /**
   * Add an agent to the load balancer
   */
  addAgent(agentId) {
    if (this.agents.has(agentId)) {
      console.warn(`Agent ${agentId} already in load balancer`);
      return;
    }
    
    // Initialize agent stats
    this.agents.set(agentId, {
      assignments: 0,
      completions: 0,
      failures: 0,
      totalProcessingTime: 0,
      lastAssignment: null,
      lastCompletion: null,
      successRate: 1.0,
      averageProcessingTime: 0,
      currentLoad: 0
    });
    
    this.availableAgents.add(agentId);
    
    console.log(`➕ Agent ${agentId} added to ${this.type} load balancer`);
  }
  
  /**
   * Remove an agent from the load balancer
   */
  removeAgent(agentId) {
    if (!this.agents.has(agentId)) {
      console.warn(`Agent ${agentId} not found in load balancer`);
      return;
    }
    
    this.agents.delete(agentId);
    this.availableAgents.delete(agentId);
    
    // Adjust round-robin index if needed
    if (this.roundRobinIndex >= this.availableAgents.size) {
      this.roundRobinIndex = 0;
    }
    
    console.log(`➖ Agent ${agentId} removed from ${this.type} load balancer`);
  }
  
  /**
   * Select an agent using the configured strategy
   */
  selectAgent() {
    if (this.availableAgents.size === 0) {
      return null;
    }
    
    let selectedAgentId = null;
    
    switch (this.strategy) {
      case 'round-robin':
        selectedAgentId = this.selectRoundRobin();
        break;
        
      case 'least-connections':
        selectedAgentId = this.selectLeastConnections();
        break;
        
      case 'weighted':
        selectedAgentId = this.selectWeighted();
        break;
        
      case 'random':
        selectedAgentId = this.selectRandom();
        break;
        
      default:
        selectedAgentId = this.selectRoundRobin();
    }
    
    if (selectedAgentId) {
      this.lastAssignmentTime = Date.now();
    }
    
    return selectedAgentId;
  }
  
  /**
   * Round-robin selection
   */
  selectRoundRobin() {
    if (this.availableAgents.size === 0) return null;
    
    const agentsArray = Array.from(this.availableAgents);
    const selectedAgentId = agentsArray[this.roundRobinIndex];
    
    // Update index for next selection
    this.roundRobinIndex = (this.roundRobinIndex + 1) % agentsArray.length;
    
    return selectedAgentId;
  }
  
  /**
   * Least connections selection
   */
  selectLeastConnections() {
    let minLoad = Infinity;
    let selectedAgentId = null;
    
    for (const agentId of this.availableAgents) {
      const agentStats = this.agents.get(agentId);
      if (agentStats.currentLoad < minLoad) {
        minLoad = agentStats.currentLoad;
        selectedAgentId = agentId;
      }
    }
    
    return selectedAgentId;
  }
  
  /**
   * Weighted selection based on performance
   */
  selectWeighted() {
    if (this.availableAgents.size === 0) return null;
    
    // Calculate weights based on success rate and processing time
    const weightedAgents = [];
    let totalWeight = 0;
    
    for (const agentId of this.availableAgents) {
      const agentStats = this.agents.get(agentId);
      
      // Higher success rate = higher weight
      // Lower processing time = higher weight
      const weight = agentStats.successRate * (1000 / (agentStats.averageProcessingTime || 1000));
      
      weightedAgents.push({ agentId, weight });
      totalWeight += weight;
    }
    
    // Normalize weights
    const normalized = weightedAgents.map(a => ({
      ...a,
      normalizedWeight: a.weight / totalWeight
    }));
    
    // Select using weighted random
    const random = Math.random();
    let cumulative = 0;
    
    for (const agent of normalized) {
      cumulative += agent.normalizedWeight;
      if (random <= cumulative) {
        return agent.agentId;
      }
    }
    
    // Fallback to first agent
    return normalized[0]?.agentId || null;
  }
  
  /**
   * Random selection
   */
  selectRandom() {
    if (this.availableAgents.size === 0) return null;
    
    const agentsArray = Array.from(this.availableAgents);
    const randomIndex = Math.floor(Math.random() * agentsArray.length);
    
    return agentsArray[randomIndex];
  }
  
  /**
   * Record task assignment to agent
   */
  recordAssignment(agentId) {
    if (!this.agents.has(agentId)) {
      console.warn(`Agent ${agentId} not found for assignment recording`);
      return;
    }
    
    const agentStats = this.agents.get(agentId);
    
    // Update agent stats
    agentStats.assignments++;
    agentStats.lastAssignment = Date.now();
    agentStats.currentLoad++;
    
    // Update global metrics
    this.metrics.totalAssignments++;
    
    // Update assignments by agent
    const agentAssignments = this.metrics.assignmentsByAgent.get(agentId) || 0;
    this.metrics.assignmentsByAgent.set(agentId, agentAssignments + 1);
    
    return agentStats;
  }
  
  /**
   * Record task completion
   */
  recordCompletion(agentId, success = true, processingTime = 0) {
    if (!this.agents.has(agentId)) {
      console.warn(`Agent ${agentId} not found for completion recording`);
      return;
    }
    
    const agentStats = this.agents.get(agentId);
    
    // Update agent stats
    agentStats.currentLoad = Math.max(0, agentStats.currentLoad - 1);
    agentStats.lastCompletion = Date.now();
    
    if (success) {
      agentStats.completions++;
      agentStats.totalProcessingTime += processingTime;
      
      // Update average processing time
      if (agentStats.completions > 0) {
        agentStats.averageProcessingTime = 
          agentStats.totalProcessingTime / agentStats.completions;
      }
      
      // Update success rate
      if (agentStats.assignments > 0) {
        agentStats.successRate = agentStats.completions / agentStats.assignments;
      }
      
      // Update global metrics
      this.metrics.totalCompletions++;
      this.metrics.totalProcessingTime += processingTime;
      this.metrics.completionTimes.push({
        agentId,
        processingTime,
        timestamp: Date.now()
      });
      
      // Keep only last 1000 completion times
      if (this.metrics.completionTimes.length > 1000) {
        this.metrics.completionTimes = this.metrics.completionTimes.slice(-500);
      }
      
    } else {
      agentStats.failures++;
      this.metrics.totalFailures++;
    }
    
    return agentStats;
  }
  
  /**
   * Record task failure
   */
  recordFailure(agentId) {
    return this.recordCompletion(agentId, false);
  }
  
  /**
   * Get agent statistics
   */
  getAgentStats(agentId) {
    if (!this.agents.has(agentId)) {
      return null;
    }
    
    const agentStats = this.agents.get(agentId);
    const now = Date.now();
    
    return {
      agentId,
      assignments: agentStats.assignments,
      completions: agentStats.completions,
      failures: agentStats.failures,
      successRate: agentStats.successRate,
      averageProcessingTime: agentStats.averageProcessingTime,
      currentLoad: agentStats.currentLoad,
      lastAssignment: agentStats.lastAssignment,
      lastAssignmentAgo: agentStats.lastAssignment ? now - agentStats.lastAssignment : null,
      lastCompletion: agentStats.lastCompletion,
      lastCompletionAgo: agentStats.lastCompletion ? now - agentStats.lastCompletion : null,
      idle: agentStats.currentLoad === 0
    };
  }
  
  /**
   * Get all agents statistics
   */
  getAllAgentStats() {
    const stats = {};
    
    for (const agentId of this.agents.keys()) {
      stats[agentId] = this.getAgentStats(agentId);
    }
    
    return stats;
  }
  
  /**
   * Get load balancer metrics
   */
  getMetrics() {
    const now = Date.now();
    const activeAgents = Array.from(this.agents.values()).filter(a => a.currentLoad > 0).length;
    const totalAgents = this.agents.size;
    
    // Calculate averages
    let totalQueueLength = 0;
    let totalProcessingTime = 0;
    let totalSuccessRate = 0;
    let agentsWithData = 0;
    
    for (const agentStats of this.agents.values()) {
      if (agentStats.assignments > 0) {
        totalQueueLength += agentStats.currentLoad;
        totalProcessingTime += agentStats.averageProcessingTime;
        totalSuccessRate += agentStats.successRate;
        agentsWithData++;
      }
    }
    
    const averageQueueLength = agentsWithData > 0 ? totalQueueLength / agentsWithData : 0;
    const averageProcessingTime = agentsWithData > 0 ? totalProcessingTime / agentsWithData : 0;
    const averageSuccessRate = agentsWithData > 0 ? totalSuccessRate / agentsWithData : 1.0;
    
    // Calculate overall success rate
    const overallSuccessRate = this.metrics.totalAssignments > 0
      ? this.metrics.totalCompletions / this.metrics.totalAssignments
      : 1.0;
    
    return {
      type: this.type,
      strategy: this.strategy,
      timestamp: now,
      
      // Agent counts
      totalAgents,
      availableAgents: this.availableAgents.size,
      activeAgents,
      inactiveAgents: totalAgents - activeAgents,
      
      // Performance metrics
      totalAssignments: this.metrics.totalAssignments,
      totalCompletions: this.metrics.totalCompletions,
      totalFailures: this.metrics.totalFailures,
      overallSuccessRate,
      
      // Averages
      averageQueueLength,
      averageProcessingTime,
      averageSuccessRate,
      
      // Recent performance (last 100 completions)
      recentCompletionTimes: this.metrics.completionTimes
        .slice(-100)
        .map(ct => ct.processingTime),
      
      // Distribution
      assignmentsDistribution: Object.fromEntries(this.metrics.assignmentsByAgent),
      
      // Load information
      totalLoad: Array.from(this.agents.values()).reduce((sum, a) => sum + a.currentLoad, 0),
      maxLoad: Math.max(...Array.from(this.agents.values()).map(a => a.currentLoad)),
      minLoad: Math.min(...Array.from(this.agents.values()).map(a => a.currentLoad))
    };
  }
  
  /**
   * Get agent recommendations (for scaling)
   */
  getRecommendations() {
    const metrics = this.getMetrics();
    const recommendations = [];
    
    // Check if we need more agents
    if (metrics.averageQueueLength > 5) {
      recommendations.push({
        type: 'scale_up',
        reason: `High queue length (${metrics.averageQueueLength.toFixed(2)})`,
        priority: 'high'
      });
    }
    
    if (metrics.averageProcessingTime > 5000) { // 5 seconds
      recommendations.push({
        type: 'scale_up',
        reason: `Slow processing (${metrics.averageProcessingTime.toFixed(0)}ms average)`,
        priority: 'medium'
      });
    }
    
    if (metrics.overallSuccessRate < 0.9) {
      recommendations.push({
        type: 'investigate',
        reason: `Low success rate (${(metrics.overallSuccessRate * 100).toFixed(1)}%)`,
        priority: 'high'
      });
    }
    
    // Check if we can scale down
    if (metrics.averageQueueLength < 1 && metrics.totalAgents > 1) {
      recommendations.push({
        type: 'scale_down',
        reason: `Low queue length (${metrics.averageQueueLength.toFixed(2)})`,
        priority: 'low'
      });
    }
    
    // Identify underperforming agents
    const agentStats = this.getAllAgentStats();
    const underperformingAgents = Object.entries(agentStats)
      .filter(([_, stats]) => stats.successRate < 0.8 && stats.assignments > 10)
      .map(([agentId, stats]) => ({
        agentId,
        successRate: stats.successRate,
        averageProcessingTime: stats.averageProcessingTime
      }));
    
    if (underperformingAgents.length > 0) {
      recommendations.push({
        type: 'replace_agents',
        reason: `${underperformingAgents.length} underperforming agents`,
        agents: underperformingAgents,
        priority: 'medium'
      });
    }
    
    return {
      timestamp: Date.now(),
      recommendations,
      metrics
    };
  }
  
  /**
   * Reset metrics (for testing or periodic reset)
   */
  resetMetrics() {
    // Reset agent stats
    for (const agentStats of this.agents.values()) {
      agentStats.assignments = 0;
      agentStats.completions = 0;
      agentStats.failures = 0;
      agentStats.totalProcessingTime = 0;
      agentStats.averageProcessingTime = 0;
      agentStats.successRate = 1.0;
    }
    
    // Reset global metrics
    this.metrics = {
      totalAssignments: 0,
      totalCompletions: 0,
      totalFailures: 0,
      totalProcessingTime: 0,
      assignmentsByAgent: new Map(),
      completionTimes: []
    };
    
    console.log(`📊 Metrics reset for ${this.type} load balancer`);
  }
  
  /**
   * Update load balancing strategy
   */
  updateStrategy(newStrategy) {
    const validStrategies = ['round-robin', 'least-connections', 'weighted', 'random'];
    
    if (!validStrategies.includes(newStrategy)) {
      throw new Error(`Invalid strategy: ${newStrategy}. Valid strategies: ${validStrategies.join(', ')}`);
    }
    
    const oldStrategy = this.strategy;
    this.strategy = newStrategy;
    
    console.log(`🔄 Load balancer strategy changed from ${oldStrategy} to ${newStrategy}`);
    
    return {
      success: true,
      oldStrategy,
      newStrategy: this.strategy,
      timestamp: Date.now()
    };
  }
  
  /**
   * Health check
   */
  healthCheck() {
    const now = Date.now();
    const metrics = this.getMetrics();
    
    const checks = {
      hasAgents: this.agents.size > 0,
      hasAvailableAgents: this.availableAgents.size > 0,
      recentActivity: now - this.lastAssignmentTime < 300000, // 5 minutes
      successRateHealthy: metrics.overallSuccessRate > 0.8,
      processingTimeHealthy: metrics.averageProcessingTime < 10000 // 10 seconds
    };
    
    const allHealthy = Object.values(checks).every(v => v === true);
    
    return {
      healthy: allHealthy,
      checks,
      metrics,
      timestamp: now
    };
  }
}

module.exports = LoadBalancer;