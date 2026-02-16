// 🏗️ AGENT BASE CLASS
// Foundation for all 1000+ agents

class AgentBase {
  constructor(config = {}) {
    // Core properties
    this.id = config.id || `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.name = config.name || 'Unnamed Agent';
    this.type = config.type || 'generic';
    this.version = '1.0.0';
    
    // Performance tracking
    this.stats = {
      startTime: Date.now(),
      tasksCompleted: 0,
      tasksFailed: 0,
      totalProcessingTime: 0,
      lastActivity: Date.now(),
      uptime: 0
    };
    
    // State management
    this.state = {
      status: 'idle', // idle, busy, error, terminated
      currentTask: null,
      resources: {},
      dependencies: []
    };
    
    // Configuration
    this.config = {
      maxConcurrentTasks: config.maxConcurrentTasks || 1,
      autoRecover: config.autoRecover !== false,
      logLevel: config.logLevel || 'info',
      heartbeatInterval: config.heartbeatInterval || 30000, // 30 seconds
      timeout: config.timeout || 300000, // 5 minutes
      ...config
    };
    
    // Communication
    this.messageQueue = [];
    this.eventListeners = new Map();
    
    // Initialize
    this.initialize();
    
    console.log(`🤖 Agent ${this.name} (${this.id}) initialized`);
  }
  
  /**
   * Initialize agent - override in child classes
   */
  initialize() {
    this.log('info', 'Agent initializing...');
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Register with framework if available
    this.registerWithFramework();
    
    this.log('info', 'Agent initialized successfully');
  }
  
  /**
   * Start heartbeat for monitoring
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.stats.uptime = Date.now() - this.stats.startTime;
      this.stats.lastActivity = Date.now();
      
      // Send heartbeat to framework
      this.emit('heartbeat', {
        agentId: this.id,
        status: this.state.status,
        stats: this.stats,
        timestamp: Date.now()
      });
      
      // Auto-recover if in error state
      if (this.state.status === 'error' && this.config.autoRecover) {
        this.log('warn', 'Auto-recovering from error state');
        this.recover();
      }
      
    }, this.config.heartbeatInterval);
  }
  
  /**
   * Register with framework
   */
  registerWithFramework() {
    // This would connect to a central agent registry
    // For now, just log
    this.log('info', 'Registered with framework');
  }
  
  /**
   * Execute a task
   */
  async execute(task) {
    const taskId = task.id || `task_${Date.now()}`;
    const startTime = Date.now();
    
    this.log('info', `Starting task ${taskId}: ${task.type}`);
    
    // Update state
    this.state.status = 'busy';
    this.state.currentTask = taskId;
    
    try {
      // Process the task
      const result = await this.processTask(task);
      
      // Update stats
      const processingTime = Date.now() - startTime;
      this.stats.tasksCompleted++;
      this.stats.totalProcessingTime += processingTime;
      
      this.log('info', `Task ${taskId} completed in ${processingTime}ms`);
      
      // Emit completion event
      this.emit('task_completed', {
        taskId,
        result,
        processingTime,
        agentId: this.id
      });
      
      // Return result
      return {
        success: true,
        taskId,
        result,
        processingTime,
        agentId: this.id
      };
      
    } catch (error) {
      // Update stats
      this.stats.tasksFailed++;
      
      this.log('error', `Task ${taskId} failed: ${error.message}`);
      
      // Emit error event
      this.emit('task_failed', {
        taskId,
        error: error.message,
        agentId: this.id
      });
      
      // Update state
      this.state.status = 'error';
      this.state.lastError = error.message;
      
      return {
        success: false,
        taskId,
        error: error.message,
        agentId: this.id
      };
      
    } finally {
      // Clean up
      this.state.status = 'idle';
      this.state.currentTask = null;
    }
  }
  
  /**
   * Process task - override in child classes
   */
  async processTask(task) {
    throw new Error('processTask must be implemented in child class');
  }
  
  /**
   * Handle incoming message
   */
  async handleMessage(message) {
    this.log('debug', `Received message: ${message.type}`);
    
    // Add to queue
    this.messageQueue.push({
      ...message,
      receivedAt: Date.now(),
      agentId: this.id
    });
    
    // Process if idle
    if (this.state.status === 'idle' && this.messageQueue.length > 0) {
      const nextMessage = this.messageQueue.shift();
      return await this.execute({
        id: `msg_${nextMessage.id || Date.now()}`,
        type: 'message',
        data: nextMessage
      });
    }
    
    return { queued: true, queueLength: this.messageQueue.length };
  }
  
  /**
   * Send message to another agent
   */
  async sendMessage(targetAgentId, message) {
    this.log('debug', `Sending message to ${targetAgentId}`);
    
    // This would go through a message bus
    // For now, just emit event
    this.emit('message_sent', {
      from: this.id,
      to: targetAgentId,
      message,
      timestamp: Date.now()
    });
    
    return { sent: true, to: targetAgentId };
  }
  
  /**
   * Recover from error state
   */
  async recover() {
    this.log('info', 'Attempting recovery...');
    
    try {
      // Reset state
      this.state.status = 'idle';
      this.state.currentTask = null;
      this.state.lastError = null;
      
      // Clear message queue if needed
      if (this.messageQueue.length > 10) {
        this.log('warn', `Clearing ${this.messageQueue.length} queued messages`);
        this.messageQueue = [];
      }
      
      // Re-initialize
      await this.initialize();
      
      this.log('info', 'Recovery successful');
      return { success: true };
      
    } catch (error) {
      this.log('error', `Recovery failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get agent status
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      version: this.version,
      state: this.state,
      stats: {
        ...this.stats,
        uptime: Date.now() - this.stats.startTime,
        avgProcessingTime: this.stats.tasksCompleted > 0 
          ? this.stats.totalProcessingTime / this.stats.tasksCompleted 
          : 0,
        successRate: this.stats.tasksCompleted > 0
          ? (this.stats.tasksCompleted / (this.stats.tasksCompleted + this.stats.tasksFailed)) * 100
          : 100
      },
      config: {
        maxConcurrentTasks: this.config.maxConcurrentTasks,
        autoRecover: this.config.autoRecover,
        logLevel: this.config.logLevel
      },
      queueLength: this.messageQueue.length,
      timestamp: Date.now()
    };
  }
  
  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };
    
    this.log('info', 'Configuration updated');
    
    // Restart heartbeat if interval changed
    if (newConfig.heartbeatInterval && newConfig.heartbeatInterval !== oldConfig.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.startHeartbeat();
    }
    
    return { success: true, oldConfig, newConfig: this.config };
  }
  
  /**
   * Graceful shutdown
   */
  async shutdown() {
    this.log('info', 'Shutting down...');
    
    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Complete current task if possible
    if (this.state.status === 'busy') {
      this.log('warn', 'Agent busy, waiting for task completion...');
      // In production, would have timeout
    }
    
    // Save state if needed
    await this.saveState();
    
    // Update status
    this.state.status = 'terminated';
    
    // Emit shutdown event
    this.emit('shutdown', {
      agentId: this.id,
      reason: 'graceful',
      timestamp: Date.now()
    });
    
    this.log('info', 'Shutdown complete');
    
    return { success: true, agentId: this.id };
  }
  
  /**
   * Save agent state - override if needed
   */
  async saveState() {
    // Default: no persistence
    return { success: true };
  }
  
  /**
   * Event emitter methods
   */
  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  }
  
  off(event, listener) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          this.log('error', `Event listener error for ${event}: ${error.message}`);
        }
      });
    }
  }
  
  /**
   * Logging utility
   */
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      agentId: this.id,
      agentName: this.name,
      message,
      data,
      state: this.state.status
    };
    
    // Console output based on log level
    const logLevels = { error: 0, warn: 1, info: 2, debug: 3 };
    const currentLevel = logLevels[this.config.logLevel] || 2;
    const messageLevel = logLevels[level] || 2;
    
    if (messageLevel <= currentLevel) {
      const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.name}]`;
      console.log(`${prefix} ${message}`, data && Object.keys(data).length > 0 ? data : '');
    }
    
    // Emit log event
    this.emit('log', logEntry);
    
    return logEntry;
  }
  
  /**
   * Health check
   */
  async healthCheck() {
    const checks = {
      agent: true,
      memory: process.memoryUsage().heapUsed < 100 * 1024 * 1024, // < 100MB
      queue: this.messageQueue.length < 100,
      uptime: Date.now() - this.stats.startTime > 60000, // > 1 minute
      status: this.state.status === 'idle' || this.state.status === 'busy'
    };
    
    const allHealthy = Object.values(checks).every(v => v === true);
    
    return {
      healthy: allHealthy,
      checks,
      status: this.getStatus(),
      timestamp: Date.now()
    };
  }
}

module.exports = AgentBase;