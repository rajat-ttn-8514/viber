import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

/**
 * BaseAgent - Abstract base class for all specialized agents
 */
export class BaseAgent {
  constructor(options = {}) {
    this.name = this.constructor.name.replace('Agent', '').toLowerCase();
    this.coordinator = options.coordinator;
    this.logger = options.logger;
    this.config = options.config || {};
    
    // AI client initialization
    this.aiProvider = this.config.ai_provider || process.env.AI_PROVIDER || 'openai';
    this.model = this.config.model || process.env.DEFAULT_MODEL || 'gpt-4';
    
    this.initialized = false;
    this.busy = false;
    this.currentTask = null;
    
    this.initializeAI();
  }

  /**
   * Initialize AI client based on provider
   */
  initializeAI() {
    try {
      if (this.aiProvider === 'openai') {
        this.aiClient = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
      } else if (this.aiProvider === 'anthropic') {
        this.aiClient = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY
        });
      } else {
        throw new Error(`Unsupported AI provider: ${this.aiProvider}`);
      }
    } catch (error) {
      this.logger?.error('Failed to initialize AI client:', error);
      throw error;
    }
  }

  /**
   * Initialize the agent (to be implemented by subclasses)
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      this.logger?.info(`Initializing ${this.name} agent...`);
      
      // Perform any agent-specific initialization
      await this.setup();
      
      this.initialized = true;
      this.logger?.info(`${this.name} agent initialized successfully`);
    } catch (error) {
      this.logger?.error(`Failed to initialize ${this.name} agent:`, error);
      throw error;
    }
  }

  /**
   * Setup method for agent-specific initialization (override in subclasses)
   */
  async setup() {
    // Override in subclasses for specific setup
  }

  /**
   * Generate AI response using configured provider
   */
  async generateResponse(prompt, options = {}) {
    try {
      const requestOptions = {
        model: options.model || this.model,
        temperature: options.temperature || this.config.temperature || 0.7,
        max_tokens: options.max_tokens || this.config.max_tokens || 4000,
        ...options
      };

      let response;

      if (this.aiProvider === 'openai') {
        const completion = await this.aiClient.chat.completions.create({
          ...requestOptions,
          messages: Array.isArray(prompt) ? prompt : [{ role: 'user', content: prompt }]
        });
        response = completion.choices[0].message.content;
      } else if (this.aiProvider === 'anthropic') {
        const completion = await this.aiClient.messages.create({
          ...requestOptions,
          messages: Array.isArray(prompt) ? prompt : [{ role: 'user', content: prompt }]
        });
        response = completion.content[0].text;
      }

      return response;
    } catch (error) {
      this.logger?.error('AI generation failed:', error);
      throw new Error(`AI response generation failed: ${error.message}`);
    }
  }

  /**
   * Execute a task (to be implemented by subclasses)
   */
  async executeTask(task) {
    if (this.busy) {
      throw new Error(`${this.name} agent is currently busy`);
    }

    try {
      this.busy = true;
      this.currentTask = task;
      
      this.logger?.info(`${this.name} agent executing task: ${task.type}`);
      
      // Call the specific agent implementation
      const result = await this.processTask(task);
      
      this.logger?.info(`${this.name} agent completed task: ${task.type}`);
      
      // Notify coordinator of completion
      this.coordinator?.emit('agentTaskCompleted', {
        agentName: this.name,
        taskId: task.id,
        result
      });
      
      return result;
    } catch (error) {
      this.logger?.error(`${this.name} agent task failed:`, error);
      
      // Notify coordinator of error
      this.coordinator?.emit('agentError', {
        agentName: this.name,
        taskId: task.id,
        error: error.message
      });
      
      throw error;
    } finally {
      this.busy = false;
      this.currentTask = null;
    }
  }

  /**
   * Process task implementation (override in subclasses)
   */
  async processTask(task) {
    throw new Error(`processTask must be implemented by ${this.name} agent`);
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      name: this.name,
      initialized: this.initialized,
      busy: this.busy,
      currentTask: this.currentTask?.id || null,
      config: this.config,
      capabilities: this.getCapabilities()
    };
  }

  /**
   * Get agent capabilities (override in subclasses)
   */
  getCapabilities() {
    return this.config.capabilities || [];
  }

  /**
   * Validate task input (override in subclasses for specific validation)
   */
  validateTask(task) {
    if (!task || typeof task !== 'object') {
      throw new Error('Invalid task object');
    }

    if (!task.type) {
      throw new Error('Task type is required');
    }

    return true;
  }

  /**
   * Create structured prompt for AI
   */
  createPrompt(instruction, context = {}, examples = []) {
    let prompt = `You are a ${this.name} agent specialized in ${this.config.specialization || 'software development'}.

INSTRUCTION:
${instruction}

CONTEXT:
${JSON.stringify(context, null, 2)}`;

    if (examples.length > 0) {
      prompt += `\n\nEXAMPLES:
${examples.map((ex, i) => `Example ${i + 1}:\n${JSON.stringify(ex, null, 2)}`).join('\n\n')}`;
    }

    prompt += `\n\nPlease provide a detailed and practical response that addresses the instruction using the given context. Format your response as JSON when appropriate for structured data.`;

    return prompt;
  }

  /**
   * Parse AI response as JSON safely
   */
  parseJSONResponse(response) {
    try {
      // Try to extract JSON from response if it's wrapped in text
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/({[\s\S]*})/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Try parsing the entire response
      return JSON.parse(response);
    } catch (error) {
      this.logger?.warn('Failed to parse JSON response, returning raw text');
      return { content: response };
    }
  }

  /**
   * Create file content with metadata
   */
  createFile(path, content, metadata = {}) {
    return {
      path,
      content,
      metadata: {
        generatedBy: this.name,
        timestamp: new Date().toISOString(),
        ...metadata
      }
    };
  }
}
