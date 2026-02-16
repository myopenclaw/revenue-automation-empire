// 🔗 MESSAGE BUS SYSTEM
// Handles communication between 1000+ agents

class MessageBus {
  constructor(config = {}) {
    this.name = 'Agent Message Bus';
    this.version = '1.0.0';
    
    // Configuration
    this.config = {
      maxQueueSize: config.maxQueueSize || 10000,
      deliveryTimeout: config.deliveryTimeout || 30000, // 30 seconds
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000, // 1 second
      persistence: config.persistence !== false,
      logLevel: config.logLevel || 'info',
      ...config
    };
    
    // Core data structures
    this.agents = new Map(); // agentId -> agent reference
    this.channels = new Map(); // channelName -> Set of agentIds
    this.queues = new Map(); // agentId -> message queue
    this.messageHistory = []; // For debugging/monitoring
    
    // Statistics
    this.stats = {
      startTime: Date.now(),
      messagesSent: 0,
      messagesDelivered: 0,
      messagesFailed: 0,
      agentsRegistered: 0,
      channelsCreated: 0
    };
    
    // Initialize
    this.initialize();
    
    console.log(`🔗 ${this.name} v${this.version} initialized`);
  }
  
  /**
   * Initialize message bus
   */
  initialize() {
    this.log('info', 'Message bus initializing...');
    
    // Set up cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldMessages();
    }, 60000); // Every minute
    
    // Set up stats logging
    this.statsInterval = setInterval(() => {
      this.logStats();
    }, 300000); // Every 5 minutes
    
    this.log('info', 'Message bus initialized successfully');
  }
  
  /**
   * Register an agent with the message bus
   */
  registerAgent(agent) {
    const agentId = agent.id;
    
    if (this.agents.has(agentId)) {
      this.log('warn', `Agent ${agentId} already registered`);
      return { success: false, error: 'Agent already registered' };
    }
    
    // Store agent reference
    this.agents.set(agentId, agent);
    
    // Create message queue for agent
    this.queues.set(agentId, []);
    
    // Subscribe agent to its own private channel
    this.subscribeToChannel(agentId, `private_${agentId}`);
    
    // Update stats
    this.stats.agentsRegistered++;
    
    this.log('info', `Agent registered: ${agentId} (${agent.name})`);
    
    // Emit event
    this.emit('agent_registered', { agentId, agentName: agent.name });
    
    return { 
      success: true, 
      agentId, 
      message: `Agent ${agent.name} registered successfully` 
    };
  }
  
  /**
   * Unregister an agent
   */
  unregisterAgent(agentId) {
    if (!this.agents.has(agentId)) {
      this.log('warn', `Agent ${agentId} not found`);
      return { success: false, error: 'Agent not found' };
    }
    
    const agent = this.agents.get(agentId);
    
    // Remove from all channels
    for (const [channelName, subscribers] of this.channels) {
      if (subscribers.has(agentId)) {
        subscribers.delete(agentId);
      }
    }
    
    // Clear message queue
    this.queues.delete(agentId);
    
    // Remove agent reference
    this.agents.delete(agentId);
    
    this.log('info', `Agent unregistered: ${agentId} (${agent.name})`);
    
    // Emit event
    this.emit('agent_unregistered', { agentId, agentName: agent.name });
    
    return { success: true, agentId };
  }
  
  /**
   * Create a channel
   */
  createChannel(channelName) {
    if (this.channels.has(channelName)) {
      this.log('warn', `Channel ${channelName} already exists`);
      return { success: false, error: 'Channel already exists' };
    }
    
    this.channels.set(channelName, new Set());
    this.stats.channelsCreated++;
    
    this.log('info', `Channel created: ${channelName}`);
    
    return { success: true, channelName };
  }
  
  /**
   * Subscribe agent to channel
   */
  subscribeToChannel(agentId, channelName) {
    if (!this.agents.has(agentId)) {
      this.log('error', `Agent ${agentId} not registered`);
      return { success: false, error: 'Agent not registered' };
    }
    
    if (!this.channels.has(channelName)) {
      // Create channel if it doesn't exist
      this.createChannel(channelName);
    }
    
    const channel = this.channels.get(channelName);
    channel.add(agentId);
    
    this.log('debug', `Agent ${agentId} subscribed to channel ${channelName}`);
    
    return { success: true, agentId, channelName };
  }
  
  /**
   * Unsubscribe agent from channel
   */
  unsubscribeFromChannel(agentId, channelName) {
    if (!this.channels.has(channelName)) {
      this.log('warn', `Channel ${channelName} not found`);
      return { success: false, error: 'Channel not found' };
    }
    
    const channel = this.channels.get(channelName);
    channel.delete(agentId);
    
    this.log('debug', `Agent ${agentId} unsubscribed from channel ${channelName}`);
    
    return { success: true, agentId, channelName };
  }
  
  /**
   * Send message to specific agent
   */
  async sendToAgent(fromAgentId, toAgentId, message) {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const messageObj = {
      id: messageId,
      from: fromAgentId,
      to: toAgentId,
      type: 'direct',
      data: message.data || message,
      timestamp: Date.now(),
      metadata: message.metadata || {},
      deliveryAttempts: 0
    };
    
    this.log('debug', `Sending message ${messageId} from ${fromAgentId} to ${toAgentId}`);
    
    // Check if recipient exists
    if (!this.agents.has(toAgentId)) {
      this.log('error', `Recipient agent ${toAgentId} not found`);
      this.stats.messagesFailed++;
      return { 
        success: false, 
        messageId, 
        error: 'Recipient agent not found' 
      };
    }
    
    // Add to recipient's queue
    const recipientQueue = this.queues.get(toAgentId);
    if (recipientQueue.length >= this.config.maxQueueSize) {
      this.log('error', `Recipient ${toAgentId} queue full`);
      this.stats.messagesFailed++;
      return { 
        success: false, 
        messageId, 
        error: 'Recipient queue full' 
      };
    }
    
    recipientQueue.push(messageObj);
    this.stats.messagesSent++;
    
    // Try to deliver immediately
    await this.deliverToAgent(toAgentId);
    
    // Add to history
    this.messageHistory.push({
      ...messageObj,
      status: 'queued'
    });
    
    // Trim history if too large
    if (this.messageHistory.length > 1000) {
      this.messageHistory = this.messageHistory.slice(-500);
    }
    
    return { 
      success: true, 
      messageId, 
      queued: true,
      queuePosition: recipientQueue.length
    };
  }
  
  /**
   * Broadcast message to channel
   */
  async broadcastToChannel(fromAgentId, channelName, message) {
    if (!this.channels.has(channelName)) {
      this.log('error', `Channel ${channelName} not found`);
      return { success: false, error: 'Channel not found' };
    }
    
    const subscribers = this.channels.get(channelName);
    const messageId = `broadcast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const messageObj = {
      id: messageId,
      from: fromAgentId,
      channel: channelName,
      type: 'broadcast',
      data: message.data || message,
      timestamp: Date.now(),
      metadata: message.metadata || {}
    };
    
    this.log('info', `Broadcasting message ${messageId} to channel ${channelName} (${subscribers.size} subscribers)`);
    
    // Send to all subscribers
    const results = [];
    for (const agentId of subscribers) {
      if (agentId !== fromAgentId) { // Don't send to self
        const result = await this.sendToAgent(fromAgentId, agentId, {
          ...messageObj,
          type: 'broadcast_delivery'
        });
        results.push({ agentId, ...result });
      }
    }
    
    // Add to history
    this.messageHistory.push({
      ...messageObj,
      status: 'broadcasted',
      recipientCount: subscribers.size - (subscribers.has(fromAgentId) ? 1 : 0)
    });
    
    return {
      success: true,
      messageId,
      channel: channelName,
      recipients: subscribers.size,
      results
    };
  }
  
  /**
   * Deliver messages to an agent
   */
  async deliverToAgent(agentId) {
    const queue = this.queues.get(agentId);
    if (!queue || queue.length === 0) {
      return { delivered: 0 };
    }
    
    const agent = this.agents.get(agentId);
    if (!agent) {
      this.log('error', `Agent ${agentId} not found for delivery`);
      return { delivered: 0, error: 'Agent not found' };
    }
    
    let delivered = 0;
    const failed = [];
    
    // Process messages (up to 10 at a time)
    const messagesToProcess = queue.splice(0, Math.min(10, queue.length));
    
    for (const message of messagesToProcess) {
      try {
        // Check if message is expired
        if (Date.now() - message.timestamp > this.config.deliveryTimeout) {
          this.log('warn', `Message ${message.id} expired`);
          this.stats.messagesFailed++;
          failed.push({ messageId: message.id, reason: 'expired' });
          continue;
        }
        
        // Increment delivery attempts
        message.deliveryAttempts = (message.deliveryAttempts || 0) + 1;
        
        // Deliver to agent
        await agent.handleMessage(message);
        
        // Update stats
        this.stats.messagesDelivered++;
        delivered++;
        
        // Update history
        const historyEntry = this.messageHistory.find(m => m.id === message.id);
        if (historyEntry) {
          historyEntry.status = 'delivered';
          historyEntry.deliveredAt = Date.now();
          historyEntry.deliveryAttempts = message.deliveryAttempts;
        }
        
      } catch (error) {
        this.log('error', `Failed to deliver message ${message.id}: ${error.message}`);
        
        // Retry logic
        if (message.deliveryAttempts < this.config.retryAttempts) {
          this.log('info', `Retrying message ${message.id} (attempt ${message.deliveryAttempts + 1})`);
          
          // Requeue with delay
          setTimeout(() => {
            queue.unshift(message);
          }, this.config.retryDelay * message.deliveryAttempts);
          
        } else {
          this.log('error', `Message ${message.id} failed after ${message.deliveryAttempts} attempts`);
          this.stats.messagesFailed++;
          failed.push({ 
            messageId: message.id, 
            reason: 'delivery_failed',
            error: error.message,
            attempts: message.deliveryAttempts
          });
          
          // Update history
          const historyEntry = this.messageHistory.find(m => m.id === message.id);
          if (historyEntry) {
            historyEntry.status = 'failed';
            historyEntry.error = error.message;
            historyEntry.attempts = message.deliveryAttempts;
          }
        }
      }
    }
    
    this.log('debug', `Delivered ${delivered} messages to ${agentId}, ${failed.length} failed`);
    
    return { delivered, failed, queueLength: queue.length };
  }
  
  /**
   * Clean up old messages
   */
  cleanupOldMessages() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [agentId, queue] of this.queues) {
      const originalLength = queue.length;
      
      // Remove expired messages
      for (let i = queue.length - 1; i >= 0; i--) {
        const message = queue[i];
        if (now - message.timestamp > this.config.deliveryTimeout) {
          queue.splice(i, 1);
          cleaned++;
          
          // Update history
          const historyEntry = this.messageHistory.find(m => m.id === message.id);
          if (historyEntry) {
            historyEntry.status = 'expired_cleaned';
            historyEntry.cleanedAt = now;
          }
        }
      }
      
      if (queue.length !== originalLength) {
        this.log('debug', `Cleaned ${originalLength - queue.length} messages from ${agentId} queue`);
      }
    }
    
    // Clean old history entries
    const maxHistoryAge = 24 * 60 * 60 * 1000; // 24 hours
    this.messageHistory = this.messageHistory.filter(
      entry => now - entry.timestamp < maxHistoryAge
    );
    
    if (cleaned > 0) {
      this.log('info', `Cleaned ${cleaned} expired messages`);
    }
    
    return { cleaned };
  }
  
  /**
   * Get agent queue status
   */
  getAgentQueueStatus(agentId) {
    if (!this.queues.has(agentId)) {
      return { error: 'Agent not found' };
    }
    
    const queue = this.queues.get(agentId);
    const now = Date.now();
    
    const analysis = {
      agentId,
      queueLength: queue.length,
      oldestMessage: queue.length > 0 ? now - queue[0].timestamp : 0,
      newestMessage: queue.length > 0 ? now - queue[queue.length - 1].timestamp : 0,
      messagesByType: {},
      expiredCount: 0
    };
    
    // Analyze queue
    for (const message of queue) {
      // Count by type
      analysis.messagesByType[message.type] = (analysis.messagesByType[message.type] || 0) + 1;
      
      // Count expired
      if (now - message.timestamp > this.config.deliveryTimeout) {
        analysis.expiredCount++;
      }
    }
    
    return analysis;
  }
  
  /**
   * Get system status
   */
  getStatus() {
    const now = Date.now();
    
    // Calculate queue statistics
    let totalQueued = 0;
    let maxQueueLength = 0;
    let agentWithMaxQueue = null;
    
    for (const [agentId, queue] of this.queues) {
      totalQueued += queue.length;
      if (queue.length > maxQueueLength) {
        maxQueueLength = queue.length;
        agentWithMaxQueue = agentId;
      }
    }
    
    // Calculate delivery rate
    const uptime = now - this.stats.startTime;
    const deliveryRate = uptime > 0 
      ? (this.stats.messagesDelivered / (uptime / 1000)).toFixed(2)
      : 0;
    
    return {
      name: this.name,
      version: this.version,
      uptime,
      stats: {
        ...this.stats,
        deliveryRate: `${deliveryRate} msg/sec`,
        successRate: this.stats.messagesSent > 0
          ? ((this.stats.messagesDelivered / this.stats.messagesSent) * 100).toFixed(2) + '%'
          : '100%'
      },
      agents: {
        registered: this.agents.size,
        withQueues: Array.from(this.queues.entries()).filter(([_, q]) => q.length > 0).length
      },
      channels: this.channels.size,
      queues: {
        totalQueued,
        maxQueueLength,
        agentWithMaxQueue,
        averageQueueLength: this.queues.size > 0 ? (totalQueued / this.queues.size).toFixed(2) : 0
      },
      history: {
        totalMessages: this.messageHistory.length,
        lastHour: this.messageHistory.filter(m => now - m.timestamp < 3600000).length
      },
      timestamp: now
    };
  }
  
  /**
   * Log statistics
   */
  logStats() {
    const status = this.getStatus();
    this.log('info', 'Message Bus Statistics', status);
  }
  
  /**
   * Shutdown message bus
   */
  async shutdown() {
    this.log('info', 'Shutting down message bus...');
    
    // Clear intervals
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    if (this.statsInterval) clearInterval(this.statsInterval);
    
    // Deliver remaining messages
    this.log('info', 'Delivering remaining messages...');
    let totalDelivered = 0;
    
    for (const [agentId, queue] of this.queues) {
      if (queue.length > 0) {
        const result = await this.deliverToAgent(agentId);
        totalDelivered += result.delivered || 0;
      }
    }
    
    this.log('info', `Delivered ${totalDelivered} remaining messages`);
    
    // Save state if persistence enabled
    if (this.config.persistence) {
      await this.saveState();
    }
    
    this.log('info', 'Message bus shutdown complete');
    
    return { 
      success: true, 
      messagesDelivered: totalDelivered,
      agents: this.agents.size,
