#!/usr/bin/env node

import dotenv from 'dotenv';
import { Command } from 'commander';
import chalk from 'chalk';
import { AgentCoordinator } from './core/AgentCoordinator.js';
import { WebInterface } from './ui/WebInterface.js';
import { CLIInterface } from './ui/CLIInterface.js';
import { Logger } from './utils/Logger.js';

// Load environment variables
dotenv.config();

const program = new Command();
const logger = new Logger();

// ASCII Art Banner
const banner = `
╦  ╦╦╔╗ ╔═╗  ╔═╗╔═╗╔╦╗╔═╗╦═╗  ╔═╗╔═╗╔═╗╔╗╔╔╦╗
╚╗╔╝║╠╩╗║╣   ║  ║ ║ ║║║╣ ╠╦╝  ╠═╣║ ╦║╣ ║║║ ║ 
 ╚╝ ╩╚═╝╚═╝  ╚═╝╚═╝═╩╝╚═╝╩╚═  ╩ ╩╚═╝╚═╝╝╚╝ ╩ 
                                                
🚀 Multi-Agent Development Assistant
`;

async function main() {
  console.log(chalk.cyan(banner));
  
  program
    .name('vibe-coder-agent')
    .description('Multi-agent system for modern application development')
    .version('1.0.0');

  program
    .option('-c, --cli', 'Start in CLI mode')
    .option('-p, --port <port>', 'Port for web interface', process.env.PORT || '3000')
    .option('-d, --debug', 'Enable debug mode')
    .option('--config <config>', 'Configuration file path');

  program.parse();

  const options = program.opts();

  try {
    // Initialize the agent coordinator
    const coordinator = new AgentCoordinator({
      debug: options.debug,
      configPath: options.config
    });

    await coordinator.initialize();
    
    logger.info('🤖 Agent Coordinator initialized');

    if (options.cli) {
      // Start CLI interface
      logger.info('🖥️  Starting CLI interface...');
      const cli = new CLIInterface(coordinator);
      await cli.start();
    } else {
      // Start web interface
      logger.info(`🌐 Starting web interface on port ${options.port}...`);
      const webInterface = new WebInterface(coordinator, {
        port: parseInt(options.port),
        debug: options.debug
      });
      
      await webInterface.start();
      
      console.log(chalk.green(`
🎉 Vibe Coder Agent is running!
🌐 Web Interface: http://localhost:${options.port}
🚀 Ready to help you build amazing applications!
      `));
    }

  } catch (error) {
    logger.error('❌ Failed to start Vibe Coder Agent:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n👋 Shutting down Vibe Coder Agent...'));
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the application
main().catch((error) => {
  console.error(chalk.red('❌ Fatal error:'), error);
  process.exit(1);
});
