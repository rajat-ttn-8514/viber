import { BaseAgent } from './BaseAgent.js';

/**
 * ProjectArchitectAgent - Designs application architecture and structure
 */
export class ProjectArchitectAgent extends BaseAgent {
  constructor(options) {
    super(options);
    this.specialization = 'system_design';
  }

  /**
   * Design application architecture based on requirements
   */
  async designArchitecture(requirements) {
    const prompt = this.createPrompt(
      `Design a comprehensive application architecture based on the given requirements. 
       Consider scalability, maintainability, security, and best practices.
       Include technology stack recommendations, folder structure, and component relationships.`,
      requirements,
      [
        {
          input: { type: 'web_app', features: ['authentication', 'real-time', 'payments'] },
          output: {
            architecture_type: 'microservices',
            frontend: 'react',
            backend: 'node.js',
            database: 'postgresql',
            cache: 'redis'
          }
        }
      ]
    );

    const response = await this.generateResponse(prompt);
    const architecture = this.parseJSONResponse(response);

    // Enhance with detailed structure
    return this.enhanceArchitecture(architecture, requirements);
  }

  /**
   * Enhance architecture with detailed structure and recommendations
   */
  enhanceArchitecture(baseArchitecture, requirements) {
    const enhanced = {
      ...baseArchitecture,
      projectStructure: this.generateProjectStructure(baseArchitecture, requirements),
      technologyStack: this.recommendTechnologyStack(baseArchitecture, requirements),
      securityConsiderations: this.getSecurityRecommendations(requirements),
      scalabilityPlan: this.createScalabilityPlan(baseArchitecture, requirements),
      deploymentStrategy: this.suggestDeploymentStrategy(baseArchitecture),
      developmentWorkflow: this.createDevelopmentWorkflow()
    };

    return enhanced;
  }

  /**
   * Generate project folder structure
   */
  generateProjectStructure(architecture, requirements) {
    const structure = {
      root: requirements.projectName || 'vibe-app',
      directories: {}
    };

    // Frontend structure
    if (architecture.frontend) {
      structure.directories.frontend = {
        'src/': {
          'components/': 'Reusable UI components',
          'pages/': 'Page components and routing',
          'hooks/': 'Custom React hooks',
          'services/': 'API calls and external services',
          'utils/': 'Utility functions',
          'styles/': 'CSS/SCSS files',
          'assets/': 'Images, fonts, and static files',
          'types/': 'TypeScript type definitions'
        },
        'public/': 'Static public assets',
        'tests/': 'Frontend tests',
        'package.json': 'Frontend dependencies',
        '.env.example': 'Environment variables template'
      };
    }

    // Backend structure
    if (architecture.backend) {
      structure.directories.backend = {
        'src/': {
          'controllers/': 'Request handlers',
          'services/': 'Business logic',
          'models/': 'Data models and schemas',
          'middleware/': 'Express middleware',
          'routes/': 'API route definitions',
          'utils/': 'Utility functions',
          'config/': 'Configuration files',
          'validators/': 'Input validation schemas'
        },
        'tests/': 'Backend tests',
        'migrations/': 'Database migrations',
        'seeds/': 'Database seed files',
        'package.json': 'Backend dependencies',
        '.env.example': 'Environment variables template'
      };
    }

    // Database structure
    if (architecture.database) {
      structure.directories.database = {
        'schemas/': 'Database schema definitions',
        'migrations/': 'Database migration files',
        'seeds/': 'Sample data for development',
        'queries/': 'Complex query definitions'
      };
    }

    // DevOps and deployment
    structure.directories.deployment = {
      'docker/': 'Docker configurations',
      'k8s/': 'Kubernetes manifests',
      'scripts/': 'Deployment and utility scripts',
      '.github/workflows/': 'CI/CD pipeline definitions'
    };

    // Documentation
    structure.directories.docs = {
      'api/': 'API documentation',
      'architecture/': 'Architecture diagrams and docs',
      'user-guide/': 'User documentation',
      'deployment/': 'Deployment instructions'
    };

    return structure;
  }

  /**
   * Recommend technology stack
   */
  recommendTechnologyStack(architecture, requirements) {
    const stack = {
      frontend: {
        framework: architecture.frontend || 'react',
        stateManagement: this.selectStateManagement(architecture.frontend, requirements),
        styling: this.selectStylingApproach(requirements),
        buildTool: 'vite',
        testing: ['jest', 'react-testing-library']
      },
      backend: {
        runtime: architecture.backend || 'node.js',
        framework: this.selectBackendFramework(architecture.backend, requirements),
        database: architecture.database || 'postgresql',
        orm: this.selectORM(architecture.database),
        authentication: this.selectAuthStrategy(requirements),
        testing: ['jest', 'supertest']
      },
      devops: {
        containerization: 'docker',
        orchestration: requirements.scale === 'large' ? 'kubernetes' : 'docker-compose',
        cicd: 'github-actions',
        monitoring: ['prometheus', 'grafana'],
        logging: 'winston'
      },
      tools: {
        versionControl: 'git',
        codeQuality: ['eslint', 'prettier', 'husky'],
        documentation: 'swagger',
        packageManager: 'npm'
      }
    };

    return stack;
  }

  /**
   * Select appropriate state management solution
   */
  selectStateManagement(frontend, requirements) {
    if (frontend === 'react') {
      if (requirements.complexity === 'high' || requirements.features?.includes('real-time')) {
        return 'redux-toolkit';
      } else if (requirements.complexity === 'medium') {
        return 'zustand';
      }
      return 'react-context';
    }
    
    if (frontend === 'vue') {
      return requirements.complexity === 'high' ? 'vuex' : 'pinia';
    }

    return 'built-in';
  }

  /**
   * Select styling approach
   */
  selectStylingApproach(requirements) {
    if (requirements.ui === 'modern' || requirements.features?.includes('theming')) {
      return 'styled-components';
    } else if (requirements.development_speed === 'fast') {
      return 'tailwindcss';
    }
    return 'css-modules';
  }

  /**
   * Select backend framework
   */
  selectBackendFramework(backend, requirements) {
    if (backend === 'node.js') {
      return requirements.api_type === 'graphql' ? 'apollo-server' : 'express';
    } else if (backend === 'python') {
      return requirements.api_type === 'fast' ? 'fastapi' : 'django';
    }
    return 'express';
  }

  /**
   * Select ORM/ODM
   */
  selectORM(database) {
    const ormMap = {
      postgresql: 'prisma',
      mysql: 'sequelize',
      mongodb: 'mongoose',
      sqlite: 'prisma'
    };
    return ormMap[database] || 'prisma';
  }

  /**
   * Select authentication strategy
   */
  selectAuthStrategy(requirements) {
    if (requirements.features?.includes('social_login')) {
      return 'passport.js';
    } else if (requirements.features?.includes('enterprise_auth')) {
      return 'auth0';
    }
    return 'jwt';
  }

  /**
   * Get security recommendations
   */
  getSecurityRecommendations(requirements) {
    return [
      'Implement HTTPS everywhere',
      'Use environment variables for sensitive data',
      'Implement rate limiting',
      'Validate and sanitize all inputs',
      'Use CORS properly',
      'Implement proper session management',
      'Regular security audits and updates',
      'Use Content Security Policy (CSP)',
      'Implement proper error handling without exposing internals'
    ];
  }

  /**
   * Create scalability plan
   */
  createScalabilityPlan(architecture, requirements) {
    return {
      current: 'Monolithic architecture for MVP',
      shortTerm: [
        'Database indexing and query optimization',
        'Implement caching layer',
        'CDN for static assets',
        'Load balancer setup'
      ],
      longTerm: [
        'Microservices decomposition',
        'Database sharding/partitioning',
        'Message queue implementation',
        'Auto-scaling configuration'
      ],
      monitoring: [
        'Performance metrics collection',
        'Error tracking and alerting',
        'User behavior analytics',
        'Resource utilization monitoring'
      ]
    };
  }

  /**
   * Suggest deployment strategy
   */
  suggestDeploymentStrategy(architecture) {
    return {
      development: 'Docker Compose for local development',
      staging: 'Cloud deployment with CI/CD pipeline',
      production: 'Blue-green deployment with health checks',
      rollback: 'Automated rollback on failure detection',
      environments: ['development', 'staging', 'production']
    };
  }

  /**
   * Create development workflow
   */
  createDevelopmentWorkflow() {
    return {
      gitflow: 'Feature branch workflow',
      codeReview: 'Pull request reviews required',
      testing: 'Automated testing on all branches',
      deployment: 'Automated deployment from main branch',
      quality: 'Code quality gates in CI/CD'
    };
  }

  /**
   * Process task implementation
   */
  async processTask(task) {
    this.validateTask(task);

    switch (task.type) {
      case 'design_architecture':
        return await this.designArchitecture(task.requirements);
      
      case 'review_architecture':
        return await this.reviewArchitecture(task.architecture, task.requirements);
      
      case 'suggest_improvements':
        return await this.suggestArchitectureImprovements(task.currentArchitecture);
      
      default:
        throw new Error(`Unsupported task type: ${task.type}`);
    }
  }

  /**
   * Review existing architecture
   */
  async reviewArchitecture(architecture, requirements) {
    const prompt = this.createPrompt(
      `Review the provided architecture against the requirements and industry best practices. 
       Identify potential issues, security concerns, scalability problems, and suggest improvements.`,
      { architecture, requirements }
    );

    const response = await this.generateResponse(prompt);
    return this.parseJSONResponse(response);
  }

  /**
   * Suggest architecture improvements
   */
  async suggestArchitectureImprovements(currentArchitecture) {
    const prompt = this.createPrompt(
      `Analyze the current architecture and suggest specific improvements for better performance, 
       maintainability, security, and scalability. Prioritize suggestions by impact and effort.`,
      { currentArchitecture }
    );

    const response = await this.generateResponse(prompt);
    return this.parseJSONResponse(response);
  }
}
