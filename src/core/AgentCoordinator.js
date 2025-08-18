import EventEmitter from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/Logger.js';
import { ConfigManager } from '../utils/ConfigManager.js';
import { ProjectArchitectAgent } from '../agents/ProjectArchitectAgent.js';
import { FrontendDeveloperAgent } from '../agents/FrontendDeveloperAgent.js';
import { BackendDeveloperAgent } from '../agents/BackendDeveloperAgent.js';
import { DatabaseDesignerAgent } from '../agents/DatabaseDesignerAgent.js';
import { DevOpsAgent } from '../agents/DevOpsAgent.js';
import { QATestingAgent } from '../agents/QATestingAgent.js';
import { DebugDetectiveAgent } from '../agents/DebugDetectiveAgent.js';
import { CodeReviewerAgent } from '../agents/CodeReviewerAgent.js';

/**
 * AgentCoordinator - The central orchestration system for all agents
 * Manages agent lifecycle, communication, and task distribution
 */
export class AgentCoordinator extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = options;
    this.logger = new Logger('AgentCoordinator');
    this.configManager = new ConfigManager(options.configPath);
    
    // Agent registry
    this.agents = new Map();
    this.runningTasks = new Map();
    this.taskQueue = [];
    
    // Coordination state
    this.initialized = false;
    this.maxConcurrentTasks = parseInt(process.env.MAX_CONCURRENT_AGENTS) || 5;
    this.taskTimeout = parseInt(process.env.AGENT_TIMEOUT) || 300000; // 5 minutes
    
    this.setupEventHandlers();
  }

  /**
   * Initialize the coordinator and all agents
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      this.logger.info('🚀 Initializing Agent Coordinator...');
      
      // Load configuration
      await this.configManager.load();
      
      // Initialize all agents
      await this.initializeAgents();
      
      // Start task processing
      this.startTaskProcessor();
      
      this.initialized = true;
      this.emit('initialized');
      
      this.logger.info('✅ Agent Coordinator initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize Agent Coordinator:', error);
      throw error;
    }
  }

  /**
   * Initialize all available agents
   */
  async initializeAgents() {
    const agentClasses = [
      { name: 'architect', class: ProjectArchitectAgent, description: 'Designs application structure and architecture' },
      { name: 'frontend', class: FrontendDeveloperAgent, description: 'Creates UI/UX components and interfaces' },
      { name: 'backend', class: BackendDeveloperAgent, description: 'Builds APIs, databases, and server logic' },
      { name: 'database', class: DatabaseDesignerAgent, description: 'Optimizes data models and queries' },
      { name: 'devops', class: DevOpsAgent, description: 'Handles deployment and infrastructure' },
      { name: 'tester', class: QATestingAgent, description: 'Writes tests and ensures code quality' },
      { name: 'debugger', class: DebugDetectiveAgent, description: 'Finds and fixes bugs in existing code' },
      { name: 'reviewer', class: CodeReviewerAgent, description: 'Provides code quality feedback' }
    ];

    for (const agentConfig of agentClasses) {
      try {
        const agent = new agentConfig.class({
          coordinator: this,
          logger: this.logger.createChild(agentConfig.name),
          config: this.configManager.getAgentConfig(agentConfig.name)
        });

        await agent.initialize();
        
        this.agents.set(agentConfig.name, {
          instance: agent,
          description: agentConfig.description,
          status: 'ready',
          currentTask: null,
          completedTasks: 0,
          errors: []
        });

        this.logger.info(`✅ Agent '${agentConfig.name}' initialized`);
      } catch (error) {
        this.logger.error(`❌ Failed to initialize agent '${agentConfig.name}':`, error);
      }
    }
  }

  /**
   * Execute a task using appropriate agents
   */
  async executeTask(taskRequest) {
    const taskId = uuidv4();
    
    try {
      this.logger.info(`🎯 Executing task: ${taskId}`, { type: taskRequest.type });

      // Validate task request
      if (!this.validateTaskRequest(taskRequest)) {
        throw new Error('Invalid task request');
      }

      // Determine required agents
      const requiredAgents = this.determineRequiredAgents(taskRequest);
      
      // Create task context
      const task = {
        id: taskId,
        type: taskRequest.type,
        description: taskRequest.description,
        requirements: taskRequest.requirements || {},
        agents: requiredAgents,
        status: 'pending',
        createdAt: new Date(),
        progress: 0,
        results: {},
        errors: []
      };

      // Add to running tasks
      this.runningTasks.set(taskId, task);
      
      // Execute task workflow
      const result = await this.executeTaskWorkflow(task);
      
      // Update task status
      task.status = 'completed';
      task.completedAt = new Date();
      task.result = result;

      this.emit('taskCompleted', { taskId, result });
      
      this.logger.info(`✅ Task completed: ${taskId}`);
      
      return result;

    } catch (error) {
      this.logger.error(`❌ Task failed: ${taskId}`, error);
      
      if (this.runningTasks.has(taskId)) {
        const task = this.runningTasks.get(taskId);
        task.status = 'failed';
        task.error = error.message;
        task.completedAt = new Date();
      }

      this.emit('taskFailed', { taskId, error });
      throw error;
    } finally {
      // Cleanup after timeout
      setTimeout(() => {
        this.runningTasks.delete(taskId);
      }, 60000); // Keep for 1 minute for status queries
    }
  }

  /**
   * Execute the task workflow with multiple agents
   */
  async executeTaskWorkflow(task) {
    const results = {};
    
    switch (task.type) {
      case 'create_project':
        return await this.executeCreateProjectWorkflow(task);
      
      case 'debug_code':
        return await this.executeDebugWorkflow(task);
      
      case 'review_code':
        return await this.executeCodeReviewWorkflow(task);
      
      case 'optimize_performance':
        return await this.executeOptimizationWorkflow(task);
        
      case 'deploy_application':
        return await this.executeDeploymentWorkflow(task);
        
      default:
        throw new Error(`Unsupported task type: ${task.type}`);
    }
  }

  /**
   * Execute create project workflow
   */
  async executeCreateProjectWorkflow(task) {
    const { requirements } = task;
    let context = { projectId: uuidv4(), requirements };

    // Step 1: Architecture Design
    if (this.agents.has('architect')) {
      this.logger.info('🏗️  Designing project architecture...');
      const architectAgent = this.agents.get('architect').instance;
      context.architecture = await architectAgent.designArchitecture(requirements);
      task.progress = 20;
      this.emit('taskProgress', { taskId: task.id, progress: task.progress });
    }

    // Step 2: Database Design (if needed)
    if (requirements.database && this.agents.has('database')) {
      this.logger.info('🗄️  Designing database schema...');
      const dbAgent = this.agents.get('database').instance;
      context.database = await dbAgent.designSchema(context.architecture, requirements);
      task.progress = 35;
      this.emit('taskProgress', { taskId: task.id, progress: task.progress });
    }

    // Step 3: Backend Development
    if (requirements.backend && this.agents.has('backend')) {
      this.logger.info('⚙️  Creating backend structure...');
      const backendAgent = this.agents.get('backend').instance;
      context.backend = await backendAgent.createProject(context);
      task.progress = 60;
      this.emit('taskProgress', { taskId: task.id, progress: task.progress });
    }

    // Step 4: Frontend Development
    if (requirements.frontend && this.agents.has('frontend')) {
      this.logger.info('🎨 Creating frontend structure...');
      const frontendAgent = this.agents.get('frontend').instance;
      context.frontend = await frontendAgent.createProject(context);
      task.progress = 85;
      this.emit('taskProgress', { taskId: task.id, progress: task.progress });
    }

    // Step 5: Testing Setup
    if (this.agents.has('tester')) {
      this.logger.info('🧪 Setting up testing framework...');
      const testerAgent = this.agents.get('tester').instance;
      context.testing = await testerAgent.setupTesting(context);
      task.progress = 95;
      this.emit('taskProgress', { taskId: task.id, progress: task.progress });
    }

    task.progress = 100;
    this.emit('taskProgress', { taskId: task.id, progress: task.progress });

    return {
      projectId: context.projectId,
      structure: context.architecture,
      files: this.collectGeneratedFiles(context),
      instructions: this.generateSetupInstructions(context),
      nextSteps: this.generateNextSteps(context)
    };
  }

  /**
   * Execute debug workflow
   */
  async executeDebugWorkflow(task) {
    const { requirements } = task;
    
    if (!this.agents.has('debugger')) {
      throw new Error('Debug agent not available');
    }

    const debugAgent = this.agents.get('debugger').instance;
    
    // Analyze code for issues
    this.logger.info('🔍 Analyzing code for bugs...');
    const analysis = await debugAgent.analyzeCode(requirements.files, requirements.issues);
    task.progress = 50;
    this.emit('taskProgress', { taskId: task.id, progress: task.progress });

    // Generate fixes
    this.logger.info('🔧 Generating fixes...');
    const fixes = await debugAgent.generateFixes(analysis);
    task.progress = 100;
    this.emit('taskProgress', { taskId: task.id, progress: task.progress });

    return {
      analysis,
      fixes,
      recommendations: debugAgent.getRecommendations(analysis)
    };
  }

  /**
   * Determine which agents are required for a task
   */
  determineRequiredAgents(taskRequest) {
    const agentMap = {
      'create_project': ['architect', 'frontend', 'backend', 'database', 'tester'],
      'debug_code': ['debugger', 'reviewer'],
      'review_code': ['reviewer'],
      'optimize_performance': ['reviewer', 'backend', 'database'],
      'deploy_application': ['devops']
    };

    return agentMap[taskRequest.type] || [];
  }

  /**
   * Validate task request structure
   */
  validateTaskRequest(taskRequest) {
    if (!taskRequest.type) {
      this.logger.error('Task request missing type');
      return false;
    }

    if (!taskRequest.description) {
      this.logger.error('Task request missing description');
      return false;
    }

    return true;
  }

  /**
   * Get current system status
   */
  getStatus() {
    const agentStatus = {};
    for (const [name, agent] of this.agents) {
      agentStatus[name] = {
        status: agent.status,
        completedTasks: agent.completedTasks,
        currentTask: agent.currentTask,
        errors: agent.errors.length
      };
    }

    return {
      initialized: this.initialized,
      agents: agentStatus,
      runningTasks: this.runningTasks.size,
      queuedTasks: this.taskQueue.length
    };
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    this.on('agentError', (data) => {
      this.logger.error(`Agent ${data.agentName} error:`, data.error);
      
      if (this.agents.has(data.agentName)) {
        const agent = this.agents.get(data.agentName);
        agent.errors.push({
          timestamp: new Date(),
          error: data.error,
          taskId: data.taskId
        });
      }
    });

    this.on('agentTaskCompleted', (data) => {
      this.logger.info(`Agent ${data.agentName} completed task: ${data.taskId}`);
      
      if (this.agents.has(data.agentName)) {
        const agent = this.agents.get(data.agentName);
        agent.completedTasks++;
        agent.currentTask = null;
        agent.status = 'ready';
      }
    });
  }

  /**
   * Start the task processor
   */
  startTaskProcessor() {
    setInterval(() => {
      this.processTaskQueue();
    }, 1000);
  }

  /**
   * Process queued tasks
   */
  processTaskQueue() {
    if (this.taskQueue.length === 0 || this.runningTasks.size >= this.maxConcurrentTasks) {
      return;
    }

    const task = this.taskQueue.shift();
    if (task) {
      this.executeTask(task).catch(error => {
        this.logger.error('Task execution failed:', error);
      });
    }
  }

  /**
   * Helper methods for workflow execution
   */
  collectGeneratedFiles(context) {
    const files = {};
    
    // Collect files from all agents
    Object.keys(context).forEach(key => {
      if (context[key] && context[key].files) {
        files[key] = context[key].files;
      }
    });

    return files;
  }

  generateSetupInstructions(context) {
    return [
      '1. Install dependencies: npm install',
      '2. Set up environment variables: cp .env.example .env',
      '3. Initialize database (if applicable)',
      '4. Start development server: npm run dev'
    ];
  }

  generateNextSteps(context) {
    return [
      'Review the generated code structure',
      'Customize the configuration files',
      'Add your specific business logic',
      'Run tests to ensure everything works',
      'Deploy to your preferred platform'
    ];
  }
}
