import inquirer from 'inquirer';
import chalk from 'chalk';
import { Logger } from '../utils/Logger.js';

/**
 * CLIInterface - Command-line interface for interacting with agents
 */
export class CLIInterface {
  constructor(coordinator) {
    this.coordinator = coordinator;
    this.logger = new Logger('CLI');
    this.running = false;
  }

  /**
   * Start the CLI interface
   */
  async start() {
    this.running = true;
    
    console.log(chalk.cyan(`
    ╦  ╦╦╔╗ ╔═╗  ╔═╗╔═╗╔╦╗╔═╗╦═╗  ╔═╗╔═╗╔═╗╔╗╔╔╦╗
    ╚╗╔╝║╠╩╗║╣   ║  ║ ║ ║║║╣ ╠╦╝  ╠═╣║ ╦║╣ ║║║ ║ 
     ╚╝ ╩╚═╝╚═╝  ╚═╝╚═╝═╩╝╚═╝╩╚═  ╩ ╩╚═╝╚═╝╝╚╝ ╩ 
    
    🚀 Command Line Interface
    `));

    await this.showMainMenu();
  }

  /**
   * Show the main menu
   */
  async showMainMenu() {
    while (this.running) {
      try {
        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
              { name: '🏗️  Create a new project', value: 'create_project' },
              { name: '🐛 Debug existing code', value: 'debug_code' },
              { name: '👁️  Review code quality', value: 'review_code' },
              { name: '⚡ Optimize performance', value: 'optimize_performance' },
              { name: '🚀 Deploy application', value: 'deploy_application' },
              { name: '📊 View system status', value: 'status' },
              { name: '🤖 List available agents', value: 'agents' },
              { name: '🚪 Exit', value: 'exit' }
            ]
          }
        ]);

        await this.handleAction(action);
      } catch (error) {
        console.log(chalk.red('\n❌ An error occurred:'), error.message);
        console.log(chalk.gray('Please try again.\n'));
      }
    }
  }

  /**
   * Handle user actions
   */
  async handleAction(action) {
    switch (action) {
      case 'create_project':
        await this.createProject();
        break;
      case 'debug_code':
        await this.debugCode();
        break;
      case 'review_code':
        await this.reviewCode();
        break;
      case 'optimize_performance':
        await this.optimizePerformance();
        break;
      case 'deploy_application':
        await this.deployApplication();
        break;
      case 'status':
        await this.showStatus();
        break;
      case 'agents':
        await this.showAgents();
        break;
      case 'exit':
        this.running = false;
        console.log(chalk.yellow('\n👋 Thank you for using Vibe Coder Agent!\n'));
        break;
      default:
        console.log(chalk.red('Unknown action:', action));
    }
  }

  /**
   * Create a new project
   */
  async createProject() {
    console.log(chalk.blue('\n🏗️ Creating a new project...\n'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is the project name?',
        validate: input => input.length > 0 || 'Project name is required'
      },
      {
        type: 'list',
        name: 'projectType',
        message: 'What type of project?',
        choices: [
          { name: '🌐 Web Application', value: 'web_app' },
          { name: '📱 Mobile Application', value: 'mobile_app' },
          { name: '🔌 API Service', value: 'api_service' }
        ]
      },
      {
        type: 'input',
        name: 'description',
        message: 'Describe your project:',
        validate: input => input.length > 0 || 'Description is required'
      },
      {
        type: 'checkbox',
        name: 'features',
        message: 'Select desired features:',
        choices: [
          { name: '🔐 Authentication', value: 'authentication' },
          { name: '💳 Payments', value: 'payments' },
          { name: '📧 Email notifications', value: 'email' },
          { name: '📊 Real-time updates', value: 'real-time' },
          { name: '🔍 Search functionality', value: 'search' },
          { name: '📱 Mobile responsive', value: 'responsive' }
        ]
      }
    ]);

    const taskData = {
      type: 'create_project',
      description: answers.description,
      requirements: {
        projectName: answers.projectName,
        type: answers.projectType,
        features: answers.features
      }
    };

    await this.executeTaskWithProgress(taskData);
  }

  /**
   * Debug existing code
   */
  async debugCode() {
    console.log(chalk.blue('\n🐛 Setting up code debugging...\n'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'filePath',
        message: 'Enter the file path or directory to analyze:',
        validate: input => input.length > 0 || 'File path is required'
      },
      {
        type: 'checkbox',
        name: 'issueTypes',
        message: 'What types of issues should we look for?',
        choices: [
          { name: '🔍 All issues (comprehensive)', value: 'all', checked: true },
          { name: '🔒 Security vulnerabilities', value: 'security' },
          { name: '⚡ Performance problems', value: 'performance' },
          { name: '🧹 Code quality', value: 'quality' },
          { name: '🐛 Logical bugs', value: 'bugs' }
        ]
      },
      {
        type: 'input',
        name: 'description',
        message: 'Describe any specific issues you\'re experiencing:',
        default: 'General code analysis and debugging'
      }
    ]);

    const taskData = {
      type: 'debug_code',
      description: answers.description,
      requirements: {
        files: [answers.filePath],
        issues: answers.issueTypes
      }
    };

    await this.executeTaskWithProgress(taskData);
  }

  /**
   * Review code quality
   */
  async reviewCode() {
    console.log(chalk.blue('\n👁️ Setting up code review...\n'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'filePath',
        message: 'Enter the file path or directory to review:',
        validate: input => input.length > 0 || 'File path is required'
      },
      {
        type: 'input',
        name: 'description',
        message: 'What specific aspects should we focus on?',
        default: 'General code quality review'
      }
    ]);

    const taskData = {
      type: 'review_code',
      description: answers.description,
      requirements: {
        files: [answers.filePath]
      }
    };

    await this.executeTaskWithProgress(taskData);
  }

  /**
   * Execute task with progress indication
   */
  async executeTaskWithProgress(taskData) {
    console.log(chalk.green(`\n🚀 Executing: ${taskData.type}`));
    console.log(chalk.gray(`Description: ${taskData.description}\n`));

    // Setup progress tracking
    const progressListener = (data) => {
      const progressBar = this.createProgressBar(data.progress);
      process.stdout.write(`\r${chalk.blue('Progress:')} ${progressBar} ${data.progress}%`);
    };

    const completedListener = (data) => {
      console.log(chalk.green('\n\n✅ Task completed successfully!'));
      this.displayResult(data.result);
    };

    const failedListener = (data) => {
      console.log(chalk.red('\n\n❌ Task failed:'), data.error);
    };

    // Add listeners
    this.coordinator.on('taskProgress', progressListener);
    this.coordinator.on('taskCompleted', completedListener);
    this.coordinator.on('taskFailed', failedListener);

    try {
      const result = await this.coordinator.executeTask(taskData);
      
      // Remove listeners
      this.coordinator.removeListener('taskProgress', progressListener);
      this.coordinator.removeListener('taskCompleted', completedListener);
      this.coordinator.removeListener('taskFailed', failedListener);

      await this.pressAnyKey();
    } catch (error) {
      // Remove listeners
      this.coordinator.removeListener('taskProgress', progressListener);
      this.coordinator.removeListener('taskCompleted', completedListener);
      this.coordinator.removeListener('taskFailed', failedListener);

      console.log(chalk.red('\n❌ Task execution failed:'), error.message);
      await this.pressAnyKey();
    }
  }

  /**
   * Display task result
   */
  displayResult(result) {
    if (!result) return;

    console.log(chalk.cyan('\n📋 Task Results:'));
    console.log(chalk.gray('─'.repeat(50)));
    
    if (result.projectId) {
      console.log(chalk.green(`Project ID: ${result.projectId}`));
    }
    
    if (result.files) {
      console.log(chalk.blue('\n📁 Generated Files:'));
      Object.keys(result.files).forEach(category => {
        console.log(chalk.yellow(`  ${category}:`));
        if (Array.isArray(result.files[category])) {
          result.files[category].forEach(file => {
            console.log(chalk.gray(`    • ${file}`));
          });
        }
      });
    }
    
    if (result.instructions) {
      console.log(chalk.blue('\n📖 Setup Instructions:'));
      result.instructions.forEach((instruction, i) => {
        console.log(chalk.gray(`  ${i + 1}. ${instruction}`));
      });
    }
    
    if (result.nextSteps) {
      console.log(chalk.blue('\n🚀 Next Steps:'));
      result.nextSteps.forEach((step, i) => {
        console.log(chalk.gray(`  ${i + 1}. ${step}`));
      });
    }
    
    if (result.analysis) {
      console.log(chalk.blue('\n🔍 Analysis Summary:'));
      console.log(chalk.gray(`  Total Files: ${result.analysis.summary.totalFiles}`));
      console.log(chalk.gray(`  Total Issues: ${result.analysis.summary.totalIssues}`));
      console.log(chalk.red(`  Critical Issues: ${result.analysis.summary.criticalIssues}`));
      console.log(chalk.orange(`  Security Issues: ${result.analysis.summary.securityIssues}`));
    }
  }

  /**
   * Show system status
   */
  async showStatus() {
    console.log(chalk.blue('\n📊 System Status\n'));
    
    const status = this.coordinator.getStatus();
    
    console.log(chalk.green('🟢 System:'), status.initialized ? 'Online' : 'Offline');
    console.log(chalk.blue('🏃 Running Tasks:'), status.runningTasks);
    console.log(chalk.yellow('⏳ Queued Tasks:'), status.queuedTasks);
    
    console.log(chalk.cyan('\n🤖 Agent Status:'));
    console.log(chalk.gray('─'.repeat(50)));
    
    Object.keys(status.agents).forEach(agentName => {
      const agent = status.agents[agentName];
      const statusIcon = agent.status === 'ready' ? '🟢' : '🟡';
      console.log(`${statusIcon} ${chalk.bold(agentName)}: ${agent.status} (${agent.completedTasks} tasks completed)`);
    });

    await this.pressAnyKey();
  }

  /**
   * Show available agents
   */
  async showAgents() {
    console.log(chalk.blue('\n🤖 Available Agents\n'));

    for (const [name, agentData] of this.coordinator.agents) {
      const agent = agentData.instance;
      const status = agent.getStatus();
      
      console.log(chalk.cyan(`🤖 ${chalk.bold(name.charAt(0).toUpperCase() + name.slice(1))} Agent`));
      console.log(chalk.gray(`   Description: ${agentData.description}`));
      console.log(chalk.gray(`   Specialization: ${status.config.specialization || 'General'}`));
      console.log(chalk.gray(`   Status: ${status.initialized ? '✅ Ready' : '❌ Not Ready'}`));
      
      if (status.capabilities && status.capabilities.length > 0) {
        console.log(chalk.gray(`   Capabilities: ${status.capabilities.join(', ')}`));
      }
      
      console.log(); // Empty line
    }

    await this.pressAnyKey();
  }

  /**
   * Create a simple progress bar
   */
  createProgressBar(progress, width = 20) {
    const filled = Math.round(width * progress / 100);
    const empty = width - filled;
    return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  }

  /**
   * Wait for user to press any key
   */
  async pressAnyKey() {
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to continue...'
      }
    ]);
  }

  /**
   * Handle placeholder actions
   */
  async optimizePerformance() {
    console.log(chalk.yellow('\n⚡ Performance optimization feature coming soon!'));
    await this.pressAnyKey();
  }

  async deployApplication() {
    console.log(chalk.yellow('\n🚀 Application deployment feature coming soon!'));
    await this.pressAnyKey();
  }
}
