import fs from 'fs-extra';
import path from 'path';
import yaml from 'yaml';

/**
 * ConfigManager - Handles application configuration
 */
export class ConfigManager {
  constructor(configPath = null) {
    this.configPath = configPath || './config/agents.yml';
    this.config = {};
    this.defaultConfig = this.getDefaultConfig();
  }

  /**
   * Load configuration from file or use defaults
   */
  async load() {
    try {
      if (await fs.pathExists(this.configPath)) {
        const configContent = await fs.readFile(this.configPath, 'utf8');
        
        if (this.configPath.endsWith('.yml') || this.configPath.endsWith('.yaml')) {
          this.config = yaml.parse(configContent);
        } else {
          this.config = JSON.parse(configContent);
        }
        
        // Merge with defaults
        this.config = this.mergeConfig(this.defaultConfig, this.config);
      } else {
        // Use default configuration and create file
        this.config = this.defaultConfig;
        await this.save();
      }
    } catch (error) {
      console.warn('Failed to load config, using defaults:', error.message);
      this.config = this.defaultConfig;
    }
  }

  /**
   * Save current configuration to file
   */
  async save() {
    try {
      await fs.ensureDir(path.dirname(this.configPath));
      
      const configContent = this.configPath.endsWith('.yml') || this.configPath.endsWith('.yaml')
        ? yaml.stringify(this.config)
        : JSON.stringify(this.config, null, 2);
      
      await fs.writeFile(this.configPath, configContent);
    } catch (error) {
      console.error('Failed to save config:', error.message);
    }
  }

  /**
   * Get configuration for a specific agent
   */
  getAgentConfig(agentName) {
    return this.config.agents?.[agentName] || {};
  }

  /**
   * Get global configuration
   */
  getGlobalConfig() {
    return this.config.global || {};
  }

  /**
   * Update agent configuration
   */
  setAgentConfig(agentName, config) {
    if (!this.config.agents) {
      this.config.agents = {};
    }
    this.config.agents[agentName] = { ...this.config.agents[agentName], ...config };
  }

  /**
   * Update global configuration
   */
  setGlobalConfig(config) {
    this.config.global = { ...this.config.global, ...config };
  }

  /**
   * Get default configuration structure
   */
  getDefaultConfig() {
    return {
      global: {
        ai_provider: process.env.DEFAULT_MODEL?.includes('gpt') ? 'openai' : 'anthropic',
        default_model: process.env.DEFAULT_MODEL || 'gpt-4',
        max_tokens: 4000,
        temperature: 0.7,
        timeout: 30000
      },
      agents: {
        architect: {
          model: 'gpt-4',
          temperature: 0.3,
          max_tokens: 4000,
          specialization: 'system_design',
          capabilities: [
            'architecture_design',
            'technology_selection',
            'scalability_planning',
            'security_assessment'
          ]
        },
        frontend: {
          model: 'gpt-4',
          temperature: 0.5,
          max_tokens: 3000,
          specialization: 'ui_development',
          preferred_frameworks: ['react', 'vue', 'angular', 'svelte'],
          capabilities: [
            'component_creation',
            'styling',
            'state_management',
            'responsive_design'
          ]
        },
        backend: {
          model: 'gpt-4',
          temperature: 0.4,
          max_tokens: 4000,
          specialization: 'api_development',
          preferred_languages: ['javascript', 'typescript', 'python', 'go'],
          capabilities: [
            'api_design',
            'database_integration',
            'authentication',
            'performance_optimization'
          ]
        },
        database: {
          model: 'gpt-4',
          temperature: 0.2,
          max_tokens: 3000,
          specialization: 'data_modeling',
          supported_databases: ['postgresql', 'mysql', 'mongodb', 'redis'],
          capabilities: [
            'schema_design',
            'query_optimization',
            'indexing',
            'migration_planning'
          ]
        },
        devops: {
          model: 'gpt-4',
          temperature: 0.3,
          max_tokens: 3500,
          specialization: 'deployment',
          platforms: ['aws', 'gcp', 'azure', 'docker', 'kubernetes'],
          capabilities: [
            'containerization',
            'ci_cd_setup',
            'infrastructure_as_code',
            'monitoring_setup'
          ]
        },
        tester: {
          model: 'gpt-4',
          temperature: 0.4,
          max_tokens: 3000,
          specialization: 'quality_assurance',
          testing_types: ['unit', 'integration', 'e2e', 'performance'],
          capabilities: [
            'test_generation',
            'coverage_analysis',
            'test_automation',
            'quality_metrics'
          ]
        },
        debugger: {
          model: 'gpt-4',
          temperature: 0.2,
          max_tokens: 4000,
          specialization: 'bug_detection',
          analysis_types: ['static', 'dynamic', 'security', 'performance'],
          capabilities: [
            'bug_detection',
            'root_cause_analysis',
            'fix_generation',
            'prevention_recommendations'
          ]
        },
        reviewer: {
          model: 'gpt-4',
          temperature: 0.3,
          max_tokens: 3500,
          specialization: 'code_quality',
          review_aspects: ['style', 'performance', 'security', 'maintainability'],
          capabilities: [
            'code_analysis',
            'best_practices_checking',
            'refactoring_suggestions',
            'documentation_review'
          ]
        }
      },
      templates: {
        web_app: {
          frontend_frameworks: ['react', 'vue', 'angular'],
          backend_frameworks: ['express', 'fastapi', 'django'],
          databases: ['postgresql', 'mongodb'],
          features: ['authentication', 'api', 'responsive_ui']
        },
        mobile_app: {
          frameworks: ['react-native', 'flutter'],
          backend_integration: true,
          features: ['offline_support', 'push_notifications', 'user_auth']
        },
        api_service: {
          frameworks: ['express', 'fastapi', 'gin'],
          features: ['rest_api', 'authentication', 'rate_limiting', 'documentation']
        }
      }
    };
  }

  /**
   * Merge configurations with deep merge for objects
   */
  mergeConfig(defaultConfig, userConfig) {
    const merged = { ...defaultConfig };
    
    for (const key in userConfig) {
      if (userConfig.hasOwnProperty(key)) {
        if (typeof userConfig[key] === 'object' && !Array.isArray(userConfig[key])) {
          merged[key] = this.mergeConfig(merged[key] || {}, userConfig[key]);
        } else {
          merged[key] = userConfig[key];
        }
      }
    }
    
    return merged;
  }
}
