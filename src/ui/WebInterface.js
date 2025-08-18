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
        <title>Vibe Coder Agent - AI Development Studio</title>
        <script src="/socket.io/socket.io.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                --dark-gradient: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
                --accent-gradient: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7);
                --glass-bg: rgba(255, 255, 255, 0.1);
                --glass-border: rgba(255, 255, 255, 0.2);
                --text-light: rgba(255, 255, 255, 0.9);
                --text-muted: rgba(255, 255, 255, 0.7);
                --shadow-glow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background: var(--dark-gradient);
                min-height: 100vh;
                overflow-x: hidden;
                color: var(--text-light);
                position: relative;
            }
            
            /* Animated Background */
            .bg-animation {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                opacity: 0.3;
            }
            
            .floating-shapes {
                position: absolute;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }
            
            .shape {
                position: absolute;
                border-radius: 50%;
                background: var(--accent-gradient);
                animation: float 20s infinite linear;
                filter: blur(1px);
            }
            
            @keyframes float {
                0% { transform: translateY(0px) rotate(0deg); }
                33% { transform: translateY(-30px) rotate(120deg); }
                66% { transform: translateY(-60px) rotate(240deg); }
                100% { transform: translateY(0px) rotate(360deg); }
            }
            
            @keyframes pulse-glow {
                0% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
                50% { box-shadow: 0 0 60px rgba(102, 126, 234, 0.6); }
                100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
            }
            
            .container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 0 20px;
                position: relative;
                z-index: 10;
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
            
            /* Navigation Bar */
            .navbar {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 70px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(20px);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 2rem;
            }
            
            .nav-brand {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .logo-icon {
                font-size: 2rem;
                animation: pulse-glow 3s infinite;
            }
            
            .brand-text {
                font-size: 1.5rem;
                font-weight: 700;
                background: var(--accent-gradient);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .nav-status {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                font-size: 0.9rem;
            }
            
            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #4ade80;
                animation: pulse 2s infinite;
            }
            
            /* Hero Section */
            .hero {
                padding: 120px 0 80px;
                text-align: center;
            }
            
            .hero-content {
                max-width: 800px;
                margin: 0 auto;
            }
            
            .hero-title {
                font-size: 4rem;
                font-weight: 800;
                line-height: 1.1;
                margin-bottom: 1.5rem;
            }
            
            .gradient-text {
                background: var(--accent-gradient);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                background-size: 200% auto;
                animation: gradient-slide 3s linear infinite;
            }
            
            .subtitle {
                color: var(--text-muted);
                font-weight: 500;
            }
            
            .hero-description {
                font-size: 1.25rem;
                color: var(--text-muted);
                line-height: 1.6;
                margin-bottom: 2rem;
            }
            
            @keyframes gradient-slide {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            /* Sections */
            .agents-section,
            .task-panel,
            .activity-section {
                margin-bottom: 4rem;
            }
            
            .section-title {
                font-size: 2rem;
                font-weight: 700;
                margin-bottom: 2rem;
                background: var(--accent-gradient);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            /* Agents Grid */
            .agents-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 1.5rem;
            }
            
            .agent-card {
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: 20px;
                padding: 2rem;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .agent-card:hover {
                transform: translateY(-10px) scale(1.02);
                box-shadow: var(--shadow-glow);
            }
            
            .agent-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1rem;
            }
            
            .agent-icon {
                font-size: 2.5rem;
            }
            
            .agent-info h3 {
                font-size: 1.25rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
            }
            
            .agent-role {
                color: var(--text-muted);
                font-size: 0.9rem;
            }
            
            .agent-status {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-top: 1rem;
            }
            
            .status-badge {
                padding: 0.25rem 0.75rem;
                border-radius: 12px;
                font-size: 0.8rem;
                font-weight: 500;
            }
            
            .status-badge.active {
                background: rgba(74, 222, 128, 0.2);
                color: #4ade80;
            }
            
            .status-badge.busy {
                background: rgba(251, 191, 36, 0.2);
                color: #fbbf24;
            }
            
            /* Task Panel */
            .panel-glass {
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: 24px;
                padding: 2.5rem;
                box-shadow: var(--shadow-glow);
            }
            
            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
            }
            
            .panel-header h3 {
                font-size: 1.75rem;
                font-weight: 700;
            }
            
            .task-stats {
                display: flex;
                gap: 2rem;
            }
            
            .stat-item {
                text-align: center;
            }
            
            .stat-number {
                display: block;
                font-size: 1.5rem;
                font-weight: 700;
                background: var(--accent-gradient);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .stat-label {
                font-size: 0.8rem;
                color: var(--text-muted);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            /* Form Styling */
            .task-form {
                background: transparent;
                padding: 0;
                border: none;
                box-shadow: none;
            }
            
            .form-row {
                display: grid;
                gap: 1.5rem;
                margin-bottom: 1.5rem;
            }
            
            .form-group {
                margin-bottom: 1.5rem;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 0.75rem;
                font-weight: 600;
                color: var(--text-light);
                font-size: 1rem;
            }
            
            .select-wrapper,
            .form-group input,
            .form-group textarea,
            .form-group select {
                width: 100%;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 1rem;
                color: var(--text-light);
                font-size: 1rem;
                transition: all 0.3s ease;
            }
            
            .form-group input:focus,
            .form-group textarea:focus,
            .form-group select:focus {
                outline: none;
                border-color: rgba(102, 126, 234, 0.5);
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                background: rgba(255, 255, 255, 0.15);
            }
            
            .form-group textarea {
                resize: vertical;
                min-height: 120px;
            }
            
            /* Project Type Cards */
            .project-type-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 1rem;
                margin-top: 1rem;
            }
            
            .project-card {
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid transparent;
                border-radius: 16px;
                padding: 1.5rem;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .project-card:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: translateY(-5px);
            }
            
            .project-card.active {
                border-color: rgba(102, 126, 234, 0.5);
                background: rgba(102, 126, 234, 0.1);
            }
            
            .project-icon {
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }
            
            .project-name {
                font-weight: 600;
                margin-bottom: 0.25rem;
            }
            
            .project-desc {
                font-size: 0.8rem;
                color: var(--text-muted);
            }
            
            /* Primary Button */
            .btn-primary {
                background: var(--accent-gradient);
                border: none;
                border-radius: 16px;
                padding: 1rem 2rem;
                color: white;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
                min-width: 200px;
                min-height: 56px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .btn-primary:hover:not(:disabled) {
                transform: translateY(-3px);
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
            }
            
            .btn-primary:disabled {
                opacity: 0.7;
                cursor: not-allowed;
                transform: none;
            }
            
            .btn-loader {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .loader-dots {
                display: flex;
                gap: 0.25rem;
            }
            
            .loader-dots div {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: white;
                animation: loader-bounce 1.4s infinite both;
            }
            
            .loader-dots div:nth-child(1) { animation-delay: -0.32s; }
            .loader-dots div:nth-child(2) { animation-delay: -0.16s; }
            
            @keyframes loader-bounce {
                0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                40% { transform: scale(1); opacity: 1; }
            }
            
            /* Progress Container */
            .progress-container {
                margin-top: 2rem;
                padding: 1.5rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 16px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .progress-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }
            
            .progress-label {
                font-weight: 600;
                color: var(--text-light);
            }
            
            .progress-percentage {
                font-weight: 700;
                color: var(--text-light);
                font-size: 1.1rem;
            }
            
            .progress-bar {
                height: 8px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 1rem;
            }
            
            .progress-fill {
                height: 100%;
                background: var(--accent-gradient);
                border-radius: 4px;
                transition: width 0.5s ease;
                box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
            }
            
            .progress-steps {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 0.5rem;
            }
            
            .step {
                padding: 0.5rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                text-align: center;
                font-size: 0.8rem;
                color: var(--text-muted);
                transition: all 0.3s ease;
            }
            
            .step.active {
                background: rgba(102, 126, 234, 0.2);
                color: var(--text-light);
            }
            
            /* Activity Log */
            .log-panel {
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: 20px;
                overflow: hidden;
            }
            
            .log-container {
                background: transparent;
                padding: 1.5rem;
                max-height: 400px;
                overflow-y: auto;
                font-family: 'JetBrains Mono', monospace;
            }
            
            .log-entry {
                display: flex;
                align-items: flex-start;
                gap: 1rem;
                padding: 1rem 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                margin-bottom: 0;
                color: var(--text-light);
            }
            
            .log-entry:last-child {
                border-bottom: none;
            }
            
            .log-entry.welcome {
                background: rgba(102, 126, 234, 0.1);
                border-radius: 12px;
                padding: 1rem;
                border-bottom: none;
            }
            
            .log-icon {
                font-size: 1.2rem;
                flex-shrink: 0;
            }
            
            .log-content {
                flex: 1;
            }
            
            .log-message {
                margin-bottom: 0.25rem;
                line-height: 1.4;
            }
            
            .log-time {
                font-size: 0.8rem;
                color: var(--text-muted);
            }
            
            .log-entry.error .log-icon { color: #ef4444; }
            .log-entry.warning .log-icon { color: #f59e0b; }
            .log-entry.info .log-icon { color: #3b82f6; }
            .log-entry.success .log-icon { color: #10b981; }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .container {
                    padding: 0 1rem;
                }
                
                .hero-title {
                    font-size: 2.5rem;
                }
                
                .navbar {
                    padding: 0 1rem;
                }
                
                .nav-brand .brand-text {
                    font-size: 1.2rem;
                }
                
                .task-stats {
                    gap: 1rem;
                }
                
                .project-type-grid {
                    grid-template-columns: 1fr;
                }
                
                .progress-steps {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        </style>
    </head>
    <body>
        <!-- Animated Background -->
        <div class="bg-animation">
            <div class="floating-shapes">
                <div class="shape" style="width: 60px; height: 60px; left: 10%; top: 20%; animation-delay: -0.5s;"></div>
                <div class="shape" style="width: 80px; height: 80px; left: 20%; top: 80%; animation-delay: -2s;"></div>
                <div class="shape" style="width: 40px; height: 40px; left: 60%; top: 30%; animation-delay: -4s;"></div>
                <div class="shape" style="width: 100px; height: 100px; left: 80%; top: 70%; animation-delay: -1s;"></div>
                <div class="shape" style="width: 50px; height: 50px; left: 30%; top: 50%; animation-delay: -3s;"></div>
            </div>
        </div>
        
        <!-- Navigation Bar -->
        <nav class="navbar">
            <div class="nav-brand">
                <div class="logo-icon">🤖</div>
                <span class="brand-text">Vibe Coder Agent</span>
            </div>
            <div class="nav-status">
                <div class="status-dot" id="nav-status-dot"></div>
                <span id="nav-status-text">Initializing...</span>
            </div>
        </nav>
        
        <!-- Hero Section -->
        <section class="hero">
            <div class="container">
                <div class="hero-content">
                    <h1 class="hero-title">
                        <span class="gradient-text">AI Development Studio</span>
                        <br>
                        <span class="subtitle">Multi-Agent Code Generation</span>
                    </h1>
                    <p class="hero-description">
                        Transform your ideas into modern applications with our intelligent agent system
                    </p>
                </div>
            </div>
        </section>
        
        <!-- Main Content -->
        <main class="container">
            <!-- Agents Grid -->
            <section class="agents-section">
                <h2 class="section-title">Active Agents</h2>
                <div class="agents-grid" id="agents-grid">
                    <!-- Agent cards will be dynamically generated -->
                </div>
            </section>
            
            <!-- Task Creation Panel -->
            <section class="task-panel">
                <div class="panel-glass">
                    <div class="panel-header">
                        <h3>🚀 Create New Task</h3>
                        <div class="task-stats">
                            <span class="stat-item">
                                <span class="stat-number" id="running-tasks">0</span>
                                <span class="stat-label">Running</span>
                            </span>
                            <span class="stat-item">
                                <span class="stat-number" id="completed-tasks">0</span>
                                <span class="stat-label">Completed</span>
                            </span>
                        </div>
                    </div>
                    
                    <form id="task-form" class="task-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="task-type">Task Type</label>
                                <div class="select-wrapper">
                                    <select id="task-type" required>
                                        <option value="">Choose your task...</option>
                                        <option value="create_project">🏗️ Create New Project</option>
                                        <option value="debug_code">🐛 Debug Code</option>
                                        <option value="review_code">👁️ Review Code</option>
                                        <option value="optimize_performance">⚡ Optimize Performance</option>
                                        <option value="deploy_application">🚀 Deploy Application</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="task-description">Project Description</label>
                            <textarea id="task-description" rows="4" 
                                    placeholder="Describe your vision... What kind of application do you want to build?" 
                                    required></textarea>
                        </div>
                        
                        <div id="project-requirements" class="form-group project-options" style="display: none;">
                            <label>Project Type</label>
                            <div class="project-type-grid">
                                <div class="project-card" data-type="web_app">
                                    <div class="project-icon">🌐</div>
                                    <div class="project-name">Web App</div>
                                    <div class="project-desc">React, Vue, or Angular</div>
                                </div>
                                <div class="project-card" data-type="mobile_app">
                                    <div class="project-icon">📱</div>
                                    <div class="project-name">Mobile App</div>
                                    <div class="project-desc">React Native or Flutter</div>
                                </div>
                                <div class="project-card" data-type="api_service">
                                    <div class="project-icon">🔌</div>
                                    <div class="project-name">API Service</div>
                                    <div class="project-desc">REST or GraphQL API</div>
                                </div>
                            </div>
                            <input type="hidden" id="project-type" value="web_app">
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn-primary" id="submit-btn">
                                <span class="btn-text">Generate Project</span>
                                <div class="btn-loader" style="display: none;">
                                    <div class="loader-dots">
                                        <div></div><div></div><div></div>
                                    </div>
                                </div>
                            </button>
                        </div>
                        
                        <div class="progress-container" id="progress-container" style="display: none;">
                            <div class="progress-header">
                                <span class="progress-label">Generating your project...</span>
                                <span class="progress-percentage" id="progress-percentage">0%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" id="progress-fill"></div>
                            </div>
                            <div class="progress-steps" id="progress-steps">
                                <div class="step active">Planning architecture</div>
                                <div class="step">Generating code</div>
                                <div class="step">Setting up project</div>
                                <div class="step">Final touches</div>
                            </div>
                        </div>
                    </form>
                </div>
            </section>
            
            <!-- Activity Log -->
            <section class="activity-section">
                <h2 class="section-title">Activity Log</h2>
                <div class="log-panel">
                    <div class="log-container" id="log-container">
                        <div class="log-entry welcome">
                            <div class="log-icon">🤖</div>
                            <div class="log-content">
                                <div class="log-message">Vibe Coder Agent is ready to help you build amazing applications!</div>
                                <div class="log-time">Just now</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
        
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
