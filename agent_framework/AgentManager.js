// ⚙️ AGENT MANAGER
// Manages 1000+ agents with auto-scaling and load balancing

class AgentManager {
  constructor(config = {}) {
    this.name = 'Agent Manager';
    this.version = '1.0.0';
    
    // Configuration
    this.config = {
      maxAgents: config.maxAgents || 1000,
      minAgents: config.minAgents || 10,
      scalingThreshold: config.scalingThreshold || 0.7, // 70% load triggers scaling
      scalingCooldown: config.scalingCooldown || 60000, // 1 minute
      healthCheckInterval: config.healthCheckInterval || 30000, // 30 seconds
      logLevel: config.logLevel || 'info',
      autoScaling: config.autoScaling !== false,
      agentTypes: config.agentTypes || {},
      ...config
    };
    
    // Core data structures
    this.agents = new Map(); // agentId -> agent instance
    this.agentTypes = new Map(); // type -> configuration
    this.agentGroups = new Map(); // group -> Set of agentIds
    this.loadBalancers = new Map(); // type -> load balancer instance
    
    // Performance tracking
    this.stats = {
      startTime: Date.now(),
      agentsCreated: 0,
      agentsTerminated: 0,
      scalingEvents: 0,
      totalLoad: 0,
      samples: 0
    };
    
    // Scaling state
    this.scalingState = {
      lastScalingTime: 0,
      currentScale: this.config.minAgents,
      targetScale: this.config.minAgents,
      scalingInProgress: false
    };
    
    // Initialize agent types
    this.initializeAgentTypes();
    
    // Initialize
    this.initialize();
    
    console.log(`⚙️ ${this.name} v${this.version} initialized`);
    console.log(`   Max agents: ${this.config.maxAgents}`);
    console.log(`   Auto-scaling: ${this.config.autoScaling ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Initialize agent types from configuration
   */
  initializeAgentTypes() {
    // Default agent types
    const defaultTypes = {
      'script_generator': {
        name: 'Script Generator',
        class: null, // Would be imported
        maxInstances: 50,
        minInstances: 5,
        resources: { cpu: 'low', memory: 'medium' },
        scalingMetrics: { queueLength: 10, processingTime: 5000 }
      },
      'voiceover': {
        name: 'Voiceover Agent',
        class: null,
        maxInstances: 30,
        minInstances: 3,
        resources: { cpu: 'medium', memory: 'low' },
        scalingMetrics: { queueLength: 5, processingTime: 10000 }
      },
      'video_assembler': {
        name: 'Video Assembler',
        class: null,
        maxInstances: 20,
        minInstances: 2,
        resources: { cpu: 'high', memory: 'high' },
        scalingMetrics: { queueLength: 3, processingTime: 30000 }
      },
      'social_poster': {
        name: 'Social Poster',
        class: null,
        maxInstances: 40,
        minInstances: 4,
        resources: { cpu: 'low', memory: 'low' },
        scalingMetrics: { queueLength: 20, processingTime: 2000 }
      },
      'cex_trader': {
        name: 'CEX Trader',
        class: null,
        maxInstances: 100,
        minInstances: 10,
        resources: { cpu: 'medium', memory: 'medium' },
        scalingMetrics: { queueLength: 15, processingTime: 1000 }
      },
      'dex_scanner': {
        name: 'DEX Scanner',
        class: null,
        maxInstances: 80,
        minInstances: 8,
        resources: { cpu: 'high', memory: 'medium' },
        scalingMetrics: { queueLength: 25, processingTime: 500 }
      }
    };
    
    // Merge with provided types
    const agentTypes = { ...defaultTypes, ...this.config.agentTypes };
    
    // Store in map
    for (const [type, config] of Object.entries(agentTypes)) {
      this.agentTypes.set(type, config);
      this.loadBalancers.set(type, new LoadBalancer(type));
    }
    
    this.log('info', `Initialized ${this.agentTypes.size} agent types`);
  }
  
  /**
   * Initialize agent manager
   */
  initialize() {
    this.log('info', 'Agent manager initializing...');
    
    // Start minimum number of agents
    this.startInitialAgents();
    
    // Start monitoring intervals
    this.monitoringInterval = setInterval(() => {
      this.monitorAgents();
    }, this.config.healthCheckInterval);
    
    // Start auto-scaling check
    if (this.config.autoScaling) {
      this.scalingInterval = setInterval(() => {
        this.checkScaling();
      }, 30000); // Check every 30 seconds
    }
    
    this.log('info', 'Agent manager initialized successfully');
  }
  
  /**
   * Start initial agents
   */
  startInitialAgents() {
    this.log('info', 'Starting initial agents...');
    
    // Start at least one of each type
    for (const [type, config] of this.agentTypes) {
      const instancesToStart = Math.max(1, config.minInstances || 1);
      
      for (let i = 0; i < instancesToStart; i++) {
        this.createAgent(type);
      }
    }
    
    this.log('info', `Started ${this.agents.size} initial agents`);
  }
  
  /**
   * Create a new agent
   */
  createAgent(type, customConfig = {}) {
    // Check if type exists
    if (!this.agentTypes.has(type)) {
      this.log('error', `Agent type ${type} not found`);
      return { success: false, error: 'Agent type not found' };
    }
    
    const typeConfig = this.agentTypes.get(type);
    
    // Check max instances
    const currentInstances = this.getAgentsByType(type).length;
    if (currentInstances >= typeConfig.maxInstances) {
      this.log('warn', `Max instances reached for ${type} (${currentInstances}/${typeConfig.maxInstances})`);
      return { success: false, error: 'Max instances reached' };
    }
    
    // Generate agent ID
    const agentId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    // Create agent configuration
    const agentConfig = {
      id: agentId,
      name: `${typeConfig.name} #${currentInstances + 1}`,
      type: type,
      ...typeConfig,
      ...customConfig
    };
    
    this.log('info', `Creating agent: ${agentId} (${agentConfig.name})`);
    
    // In production, this would instantiate the actual agent class
    // For now, create a simulated agent
    const agent = this.createSimulatedAgent(agentConfig);
    
    // Store agent
    this.agents.set(agentId, agent);
    
    // Add to type group
    if (!this.agentGroups.has(type)) {
      this.agentGroups.set(type, new Set());
    }
    this.agentGroups.get(type).add(agentId);
    
    // Register with load balancer
    const loadBalancer = this.loadBalancers.get(type);
    if (loadBalancer) {
      loadBalancer.addAgent(agentId);
    }
    
    // Update stats
    this.stats.agentsCreated++;
    this.scalingState.currentScale = this.agents.size;
    
    // Emit event
    this.emit('agent_created', {
      agentId,
      type,
      name: agentConfig.name,
      timestamp: Date.now()
    });
    
    return {
      success: true,
      agentId,
      agent,
      config: agentConfig
    };
  }
  
  /**
   * Create simulated agent (for testing)
   */
  createSimulatedAgent(config) {
    return {
      id: config.id,
      name: config.name,
      type: config.type,
      status: 'idle',
      stats: {
        tasksCompleted: 0,
        tasksFailed: 0,
        totalProcessingTime: 0,
        lastActivity: Date.now()
      },
      queue: [],
      config: config,
      
      // Simulated methods
      async execute(task) {
        const startTime = Date.now();
        this.status = 'busy';
        
        // Simulate processing time
        const processingTime = Math.random() * 1000 + 500;
        await new Promise(resolve => setTimeout(resolve, processingTime));
        
        // Simulate success/failure
        const success = Math.random() > 0.1; // 90% success rate
        
        this.status = 'idle';
        this.stats.lastActivity = Date.now();
        
        if (success) {
          this.stats.tasksCompleted++;
          this.stats.totalProcessingTime += processingTime;
          return { success: true, processingTime };
        } else {
          this.stats.tasksFailed++;
          return { success: false, error: 'Simulated failure' };
        }
      },
      
      getStatus() {
        return {
          id: this.id,
          name: this.name,
          type: this.type,
          status: this.status,
          stats: this.stats,
          queueLength: this.queue.length,
          timestamp: Date.now()
        };
      },
      
      healthCheck() {
        return {
          healthy: this.status !== 'error',
          status: this.status,
          uptime: Date.now() - this.stats.lastActivity < 60000
        };
      }
    };
  }
  
  /**
   * Terminate an agent
   */
  terminateAgent(agentId, reason = 'manual') {
    if (!this.agents.has(agentId)) {
      this.log('warn', `Agent ${agentId} not found`);
      return { success: false, error: 'Agent not found' };
    }
    
    const agent = this.agents.get(agentId);
    
    this.log('info', `Terminating agent: ${agentId} (${agent.name}) - Reason: ${reason}`);
    
    // Remove from groups
    if (this.agentGroups.has(agent.type)) {
      this.agentGroups.get(agent.type).delete(agentId);
    }
    
    // Remove from load balancer
    const loadBalancer = this.loadBalancers.get(agent.type);
    if (loadBalancer) {
      loadBalancer.removeAgent(agentId);
    }
    
    // Remove agent
    this.agents.delete(agentId);
    
    // Update stats
    this.stats.agentsTerminated++;
    this.scalingState.currentScale = this.agents.size;
    
    // Emit event
    this.emit('agent_terminated', {
      agentId,
      type: agent.type,
      name: agent.name,
      reason,
      timestamp: Date.now()
    });
    
    return { success: true, agentId, reason };
  }
  
  /**
   * Route task to appropriate agent
   */
  async routeTask(task) {
    const { type, priority = 'normal' } = task;
    
    if (!this.agentTypes.has(type)) {
      this.log('error', `No agents available for type: ${type}`);
      return { success: false, error: 'No agents available for this task type' };
    }
    
    // Get load balancer for this type
    const loadBalancer = this.loadBalancers.get(type);
    if (!loadBalancer) {
      this.log('error', `No load balancer for type: ${type}`);
      return { success: false, error: 'Load balancer not found' };
    }
    
    // Select agent using load balancing strategy
    const agentId = loadBalancer.selectAgent();
    if (!agentId) {
      this.log('warn', `No available agents for type: ${type}`);
      
      // Auto-scale if enabled
      if (this.config.autoScaling) {
        this.log('info', `Triggering auto-scale for ${type}`);
        this.scaleUp(type);
      }
      
      return { success: false, error: 'No available agents, scaling triggered' };
    }
    
    // Get agent
    const agent = this.agents.get(agentId);
    if (!agent) {
      this.log('error', `Selected agent ${agentId} not found`);
      loadBalancer.removeAgent(agentId);
      return { success: false, error: 'Selected agent not found' };
    }
    
    // Update load balancer stats
    loadBalancer.recordAssignment(agentId);
    
    this.log('debug', `Routing task to ${agentId} (${agent.name})`);
    
    // Execute task
    try {
      const result = await agent.execute(task);
      
      // Update load balancer with result
      loadBalancer.recordCompletion(agentId, result.success);
      
      return {
        success: true,
        agentId,
        agentName: agent.name,
        ...result
      };
      
    } catch (error) {
      this.log('error', `Task execution failed: ${error.message}`);
      loadBalancer.recordFailure(agentId);
      
      return {
        success: false,
        agentId,
        error: error.message
      };
    }
  }
  
  /**
   * Monitor all agents
   */
  async monitorAgents() {
    const now = Date.now();
    let healthyCount = 0;
    let unhealthyCount = 0;
    const unhealthyAgents = [];
    
    // Check each agent
    for (const [agentId, agent] of this.agents) {
      try {
        const health = await agent.healthCheck();
        
        if (health.healthy) {
          healthyCount++;
        } else {
          unhealthyCount++;
          unhealthyAgents.push({
            agentId,
            name: agent.name,
            type: agent.type,
            issue: health.issue || 'unknown'
          });
          
          // Attempt recovery
          this.recoverAgent(agentId);
        }
        
      } catch (error) {
        this.log('error', `Health check failed for ${agentId}: ${error.message}`);
        unhealthyCount++;
        unhealthyAgents.push({
          agentId,
          name: agent.name,
          type: agent.type,
          issue: 'health_check_failed'
        });
      }
    }
    
    // Calculate system load
    const totalAgents = this.agents.size;
    const load = totalAgents > 0 ? unhealthyCount / totalAgents : 0;
    
    // Update stats
    this.stats.totalLoad += load;
    this.stats.samples++;
    
    // Log monitoring results
    if (unhealthyCount > 0) {
      this.log('warn', `Found ${unhealthyCount} unhealthy agents`, { unhealthyAgents });
    }
    
    return {
      timestamp: now,
      totalAgents,
      healthyCount,
      unhealthyCount,
      systemLoad: load,
      unhealthyAgents
    };
  }
  
  /**
   * Recover an unhealthy agent
   */
  recoverAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) return { success: false, error: 'Agent not found' };
    
    this.log('info', `Attempting to recover agent: ${agentId}`);
    
    // Strategy 1: Restart the agent
    try {
      // Terminate and recreate
      this.terminateAgent(agentId, 'unhealthy_recovery');
      this.createAgent(agent.type, { ...agent.config, id: agentId });
      
      this.log('info', `Agent ${agentId} recovered via restart`);
      return { success: true, method: 'restart' };
      
    } catch (error) {
      this.log('error', `Recovery failed for ${agentId}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Check if scaling is needed
   */
  async checkScaling() {
    if (!this.config.autoScaling) return;
    
    const now = Date.now();
    
    // Check cooldown
    if (now - this.scalingState.lastScalingTime < this.config.scalingCooldown) {
      return;
    }
    
    // Check each agent type
    for (const [type, typeConfig] of this.agentTypes) {
      await this.checkTypeScaling(type, typeConfig);
    }
  }
  
  /**
   * Check scaling for specific agent type
   */
  async checkTypeScaling(type, typeConfig) {
    const agents = this.getAgentsByType(type);
    const currentInstances = agents.length;
    
    // Get load balancer for metrics
    const loadBalancer = this.loadBalancers.get(type);
    if (!loadBalancer) return;
    
    const metrics = loadBalancer.getMetrics();
    
    // Check if scaling up is needed
    const shouldScaleUp = (
      metrics.averageQueueLength > (typeConfig.scalingMetrics?.queueLength || 10) ||
      metrics.averageProcessingTime > (typeConfig.scalingMetrics?.processingTime || 5000) ||
      metrics.successRate < 0.9
    );
    
    // Check if scaling down is possible
    const shouldScaleDown = (
      currentInstances > typeConfig.minInstances &&
      metrics.averageQueueLength < 2 &&
      metrics.averageProcessingTime < 1000 &&
      metrics.successRate > 0.95
    );
    
    if (shouldScaleUp && currentInstances < typeConfig.maxInstances) {
      this.log('info', `Scaling up ${type} from ${currentInstances} to ${currentInstances + 1}`);
      this.scaleUp(type);
      
    } else if (shouldScaleDown && currentInstances > typeConfig.minInstances) {
      this.log('info', `Scaling down ${type} from ${currentInstances} to ${currentInstances - 1}`);
      this.scaleDown(type);
    }
  }
  
  /**
   * Scale up a specific agent type
   */
  scaleUp(type) {
    if (this.scalingState.scalingInProgress) {
