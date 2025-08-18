import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Logger } from '../utils/Logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * WebInterface - HTTP server and Socket.IO for web-based interaction
 */
export class WebInterface {
  constructor(coordinator, options = {}) {
    this.coordinator = coordinator;
    this.options = options;
    this.logger = new Logger('WebInterface');
    
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.port = options.port || 3000;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketHandlers();
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Serve static files
    this.app.use(express.static(path.join(__dirname, 'static')));
    
    // Request logging
    this.app.use((req, res, next) => {
      this.logger.info(`${req.method} ${req.path}`, { 
        userAgent: req.get('User-Agent'),
        ip: req.ip 
      });
      next();
    });
  }

  /**
   * Setup API routes
   */
  setupRoutes() {
    // Main dashboard
    this.app.get('/', (req, res) => {
      res.send(this.generateDashboardHTML());
    });

    // API endpoints
    this.app.get('/api/status', (req, res) => {
      res.json(this.coordinator.getStatus());
    });

    this.app.post('/api/tasks', async (req, res) => {
      try {
        const result = await this.coordinator.executeTask(req.body);
        res.json({ success: true, result });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/agents', (req, res) => {
      const agents = {};
      for (const [name, agent] of this.coordinator.agents) {
        agents[name] = agent.instance.getStatus();
      }
      res.json(agents);
    });

    // File upload endpoint
    this.app.post('/api/upload', (req, res) => {
      // Handle file uploads for debugging
      res.json({ success: true, message: 'File upload endpoint' });
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
  }

  /**
   * Setup Socket.IO event handlers
   */
  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      this.logger.info(`Client connected: ${socket.id}`);
      
      // Send current status on connection
      socket.emit('status', this.coordinator.getStatus());

      // Handle task execution
      socket.on('execute_task', async (taskData) => {
        try {
          this.logger.info('Executing task via socket:', taskData.type);
          
          // Execute task and stream progress
          const result = await this.coordinator.executeTask(taskData);
          socket.emit('task_completed', { success: true, result });
        } catch (error) {
          this.logger.error('Task execution failed:', error);
          socket.emit('task_error', { error: error.message });
        }
      });

      // Handle agent status requests
      socket.on('get_agents', () => {
        const agents = {};
        for (const [name, agent] of this.coordinator.agents) {
          agents[name] = agent.instance.getStatus();
        }
        socket.emit('agents_status', agents);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.logger.info(`Client disconnected: ${socket.id}`);
      });
    });

    // Forward coordinator events to connected clients
    this.coordinator.on('taskProgress', (data) => {
      this.io.emit('task_progress', data);
    });

    this.coordinator.on('taskCompleted', (data) => {
      this.io.emit('task_completed', data);
    });

    this.coordinator.on('taskFailed', (data) => {
      this.io.emit('task_failed', data);
    });
  }

  /**
   * Start the web server
   */
  async start() {
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, (err) => {
        if (err) {
          reject(err);
        } else {
          this.logger.info(`Web interface started on port ${this.port}`);
          resolve();
        }
      });
    });
  }

  /**
   * Stop the web server
   */
  async stop() {
    return new Promise((resolve) => {
      this.server.close(() => {
        this.logger.info('Web interface stopped');
        resolve();
      });
    });
  }

  /**
   * Generate dashboard HTML
   */
  generateDashboardHTML() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vibe Coder Agent Dashboard</title>
        <script src="/socket.io/socket.io.js"></script>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
                color: #333;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 20px;
                padding: 30px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
            }
            
            .header {
                text-align: center;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 2px solid #f0f0f0;
            }
            
            .header h1 {
                font-size: 2.5rem;
                background: linear-gradient(45deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 10px;
            }
            
            .header p {
                color: #666;
                font-size: 1.1rem;
            }
            
            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .card {
                background: white;
                border-radius: 15px;
                padding: 25px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
                border: 1px solid #f0f0f0;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }
            
            .card h3 {
                color: #333;
                margin-bottom: 15px;
                font-size: 1.3rem;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .status-indicator {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #4caf50;
            }
            
            .status-indicator.error { background: #f44336; }
            .status-indicator.warning { background: #ff9800; }
            
            .task-form {
                background: white;
                border-radius: 15px;
                padding: 25px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
                border: 1px solid #f0f0f0;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #333;
            }
            
            .form-group select,
            .form-group input,
            .form-group textarea {
                width: 100%;
                padding: 12px;
                border: 2px solid #f0f0f0;
                border-radius: 8px;
                font-size: 14px;
                transition: border-color 0.3s ease;
            }
            
            .form-group select:focus,
            .form-group input:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #667eea;
            }
            
            .btn {
                background: linear-gradient(45deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.3s ease;
            }
            
            .btn:hover {
                transform: translateY(-2px);
            }
            
            .btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
            
            .progress-bar {
                width: 100%;
                height: 6px;
                background: #f0f0f0;
                border-radius: 3px;
                overflow: hidden;
                margin: 15px 0;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(45deg, #667eea, #764ba2);
                width: 0%;
                transition: width 0.3s ease;
            }
            
            .log-container {
                background: #1a1a1a;
                border-radius: 10px;
                padding: 20px;
                margin-top: 20px;
                max-height: 300px;
                overflow-y: auto;
                font-family: 'Monaco', 'Consolas', monospace;
                font-size: 12px;
            }
            
            .log-entry {
                color: #00ff00;
                margin-bottom: 5px;
                white-space: pre-wrap;
            }
            
            .log-entry.error { color: #ff6b6b; }
            .log-entry.warning { color: #ffa500; }
            .log-entry.info { color: #87ceeb; }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            
            .loading {
                animation: pulse 2s infinite;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🤖 Vibe Coder Agent</h1>
                <p>Multi-Agent Development Assistant</p>
            </div>
            
            <div class="grid">
                <div class="card">
                    <h3>
                        <span class="status-indicator" id="system-status"></span>
                        System Status
                    </h3>
                    <div id="status-info">Loading...</div>
                </div>
                
                <div class="card">
                    <h3>
                        <span class="status-indicator" id="agents-status"></span>
                        Active Agents
                    </h3>
                    <div id="agents-info">Loading...</div>
                </div>
                
                <div class="card">
                    <h3>
                        <span class="status-indicator" id="tasks-status"></span>
                        Task Queue
                    </h3>
                    <div id="tasks-info">0 running tasks</div>
                </div>
            </div>
            
            <div class="task-form">
                <h3>🚀 Create New Task</h3>
                <form id="task-form">
                    <div class="form-group">
                        <label for="task-type">Task Type</label>
                        <select id="task-type" required>
                            <option value="">Select a task type...</option>
                            <option value="create_project">Create New Project</option>
                            <option value="debug_code">Debug Code</option>
                            <option value="review_code">Review Code</option>
                            <option value="optimize_performance">Optimize Performance</option>
                            <option value="deploy_application">Deploy Application</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="task-description">Description</label>
                        <textarea id="task-description" rows="3" 
                                placeholder="Describe what you want to build or fix..." required></textarea>
                    </div>
                    
                    <div id="project-requirements" class="form-group" style="display: none;">
                        <label for="project-type">Project Type</label>
                        <select id="project-type">
                            <option value="web_app">Web Application</option>
                            <option value="mobile_app">Mobile Application</option>
                            <option value="api_service">API Service</option>
                        </select>
                    </div>
                    
                    <button type="submit" class="btn" id="submit-btn">
                        Execute Task
                    </button>
                </form>
                
                <div class="progress-bar" id="progress-bar" style="display: none;">
                    <div class="progress-fill" id="progress-fill"></div>
                </div>
            </div>
            
            <div class="log-container" id="log-container">
                <div class="log-entry info">🤖 Vibe Coder Agent ready! Connect your task above to get started.</div>
            </div>
        </div>
        
        <script>
            const socket = io();
            const logContainer = document.getElementById('log-container');
            const progressBar = document.getElementById('progress-bar');
            const progressFill = document.getElementById('progress-fill');
            const submitBtn = document.getElementById('submit-btn');
            const taskForm = document.getElementById('task-form');
            const taskType = document.getElementById('task-type');
            const projectRequirements = document.getElementById('project-requirements');
            
            // Task type change handler
            taskType.addEventListener('change', function() {
                if (this.value === 'create_project') {
                    projectRequirements.style.display = 'block';
                } else {
                    projectRequirements.style.display = 'none';
                }
            });
            
            // Socket event handlers
            socket.on('connect', () => {
                addLog('🔗 Connected to Vibe Coder Agent', 'info');
            });
            
            socket.on('status', (status) => {
                updateSystemStatus(status);
            });
            
            socket.on('agents_status', (agents) => {
                updateAgentsStatus(agents);
            });
            
            socket.on('task_progress', (data) => {
                updateProgress(data.progress);
                addLog(\`📊 Progress: \${data.progress}%\`, 'info');
            });
            
            socket.on('task_completed', (data) => {
                addLog('✅ Task completed successfully!', 'info');
                resetForm();
                hideProgress();
            });
            
            socket.on('task_error', (data) => {
                addLog(\`❌ Task failed: \${data.error}\`, 'error');
                resetForm();
                hideProgress();
            });
            
            // Form submission
            taskForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(taskForm);
                const taskData = {
                    type: document.getElementById('task-type').value,
                    description: document.getElementById('task-description').value,
                    requirements: {}
                };
                
                if (taskData.type === 'create_project') {
                    taskData.requirements.type = document.getElementById('project-type').value;
                }
                
                addLog(\`🚀 Executing task: \${taskData.type}\`, 'info');
                showProgress();
                disableForm();
                
                socket.emit('execute_task', taskData);
            });
            
            // Helper functions
            function addLog(message, type = 'info') {
                const logEntry = document.createElement('div');
                logEntry.className = \`log-entry \${type}\`;
                logEntry.textContent = \`[\${new Date().toLocaleTimeString()}] \${message}\`;
                logContainer.appendChild(logEntry);
                logContainer.scrollTop = logContainer.scrollHeight;
            }
            
            function updateSystemStatus(status) {
                const statusIndicator = document.getElementById('system-status');
                const statusInfo = document.getElementById('status-info');
                
                if (status.initialized) {
                    statusIndicator.className = 'status-indicator';
                    statusInfo.innerHTML = \`
                        <strong>✅ Online</strong><br>
                        Running Tasks: \${status.runningTasks}<br>
                        Queued Tasks: \${status.queuedTasks}
                    \`;
                } else {
                    statusIndicator.className = 'status-indicator error';
                    statusInfo.innerHTML = '<strong>❌ Offline</strong>';
                }
            }
            
            function updateAgentsStatus(agents) {
                const agentsInfo = document.getElementById('agents-info');
                const agentCount = Object.keys(agents).length;
                const readyAgents = Object.values(agents).filter(a => a.initialized).length;
                
                agentsInfo.innerHTML = \`
                    <strong>\${readyAgents}/\${agentCount} Ready</strong><br>
                    \${Object.keys(agents).join(', ')}
                \`;
            }
            
            function updateProgress(progress) {
                progressFill.style.width = \`\${progress}%\`;
            }
            
            function showProgress() {
                progressBar.style.display = 'block';
                updateProgress(0);
            }
            
            function hideProgress() {
                progressBar.style.display = 'none';
            }
            
            function disableForm() {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Executing...';
                submitBtn.classList.add('loading');
            }
            
            function resetForm() {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Execute Task';
                submitBtn.classList.remove('loading');
            }
            
            // Initial status request
            socket.emit('get_agents');
        </script>
    </body>
    </html>
    `;
  }
}
