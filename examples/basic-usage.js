#!/usr/bin/env node

/**
 * Basic usage example for Vibe Coder Agent
 * This example shows how to interact with the agent system programmatically
 */

import { AgentCoordinator } from '../src/core/AgentCoordinator.js';
import { Logger } from '../src/utils/Logger.js';

const logger = new Logger('Example');

async function runExample() {
  console.log('🚀 Vibe Coder Agent - Basic Usage Example\n');

  try {
    // Initialize the agent coordinator
    logger.info('Initializing agent coordinator...');
    const coordinator = new AgentCoordinator();
    await coordinator.initialize();
    
    logger.info('✅ Agent coordinator initialized');

    // Example 1: Create a new project
    console.log('\n📝 Example 1: Creating a new React web application');
    const projectTask = {
      type: 'create_project',
      description: 'Create a modern e-commerce web application with authentication and payments',
      requirements: {
        projectName: 'my-ecommerce-app',
        type: 'web_app',
        frontend: 'react',
        backend: 'node.js',
        database: 'postgresql',
        features: ['authentication', 'payments', 'real-time', 'responsive']
      }
    };

    try {
      const projectResult = await coordinator.executeTask(projectTask);
      logger.info('Project created successfully:', projectResult.projectId);
      
      if (projectResult.structure) {
        console.log('📁 Project structure created');
      }
      
      if (projectResult.instructions) {
        console.log('📋 Setup instructions provided');
      }
    } catch (error) {
      logger.error('Project creation failed:', error.message);
    }

    // Example 2: Debug code analysis
    console.log('\n🐛 Example 2: Analyzing code for bugs');
    const debugTask = {
      type: 'debug_code',
      description: 'Analyze JavaScript code for potential issues',
      requirements: {
        files: [
          {
            path: 'example.js',
            content: `
function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    if (items[i].price == null) {
      console.log('Invalid price for item:', items[i]);
    } else {
      total += items[i].price;
    }
  }
  return total;
}

function processPayment(amount, cardNumber) {
  // Security issue: should not log sensitive data
  console.log('Processing payment for', amount, 'with card', cardNumber);
  
  if (amount > 0) {
    eval('processPaymentAPI(' + amount + ')'); // Security risk!
  }
}
            `.trim()
          }
        ],
        issues: ['all']
      }
    };

    try {
      const debugResult = await coordinator.executeTask(debugTask);
      logger.info('Code analysis completed');
      
      if (debugResult.analysis) {
        console.log(`📊 Found ${debugResult.analysis.summary.totalIssues} issues`);
        console.log(`🔴 Critical issues: ${debugResult.analysis.summary.criticalIssues}`);
        console.log(`🔒 Security issues: ${debugResult.analysis.summary.securityIssues}`);
      }
    } catch (error) {
      logger.error('Code analysis failed:', error.message);
    }

    // Example 3: Get system status
    console.log('\n📊 Example 3: Checking system status');
    const status = coordinator.getStatus();
    
    console.log('System Status:');
    console.log('- Initialized:', status.initialized);
    console.log('- Running Tasks:', status.runningTasks);
    console.log('- Available Agents:', Object.keys(status.agents).length);
    
    console.log('\nAgent Status:');
    Object.keys(status.agents).forEach(agentName => {
      const agent = status.agents[agentName];
      console.log(`- ${agentName}: ${agent.status} (${agent.completedTasks} tasks completed)`);
    });

    console.log('\n✅ Example completed successfully!');

  } catch (error) {
    logger.error('Example failed:', error);
    process.exit(1);
  }
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExample().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runExample };
