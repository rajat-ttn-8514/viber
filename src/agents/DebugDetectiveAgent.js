import { BaseAgent } from './BaseAgent.js';
import fs from 'fs-extra';
import path from 'path';

/**
 * DebugDetectiveAgent - Specialized in finding and fixing bugs in code
 */
export class DebugDetectiveAgent extends BaseAgent {
  constructor(options) {
    super(options);
    this.specialization = 'bug_detection';
    this.bugPatterns = this.initializeBugPatterns();
  }

  /**
   * Initialize common bug patterns
   */
  initializeBugPatterns() {
    return {
      javascript: [
        { pattern: /==\s*null/, type: 'equality', severity: 'medium', message: 'Use strict equality (===) instead of ==' },
        { pattern: /var\s+\w+/, type: 'declaration', severity: 'low', message: 'Use let or const instead of var' },
        { pattern: /console\.log\(/, type: 'debugging', severity: 'low', message: 'Remove console.log statements' },
        { pattern: /eval\(/, type: 'security', severity: 'high', message: 'Avoid using eval() - security risk' },
        { pattern: /innerHTML\s*=/, type: 'security', severity: 'high', message: 'Potential XSS vulnerability with innerHTML' }
      ],
      python: [
        { pattern: /except:\s*$/, type: 'exception', severity: 'high', message: 'Avoid bare except clauses' },
        { pattern: /print\(/, type: 'debugging', severity: 'low', message: 'Use logging instead of print statements' },
        { pattern: /exec\(/, type: 'security', severity: 'high', message: 'Avoid using exec() - security risk' },
        { pattern: /import\s+\*/, type: 'import', severity: 'medium', message: 'Avoid wildcard imports' }
      ],
      general: [
        { pattern: /TODO|FIXME|HACK/, type: 'todo', severity: 'low', message: 'Unfinished code or technical debt' },
        { pattern: /password|secret|key/i, type: 'security', severity: 'high', message: 'Potential hardcoded sensitive information' }
      ]
    };
  }

  /**
   * Analyze code for bugs and issues
   */
  async analyzeCode(files, issueTypes = ['all']) {
    const analysis = {
      summary: {
        totalFiles: files.length,
        totalIssues: 0,
        criticalIssues: 0,
        securityIssues: 0,
        performanceIssues: 0
      },
      files: [],
      recommendations: []
    };

    for (const file of files) {
      const fileAnalysis = await this.analyzeFile(file, issueTypes);
      analysis.files.push(fileAnalysis);
      
      // Update summary
      analysis.summary.totalIssues += fileAnalysis.issues.length;
      analysis.summary.criticalIssues += fileAnalysis.issues.filter(i => i.severity === 'high').length;
      analysis.summary.securityIssues += fileAnalysis.issues.filter(i => i.type === 'security').length;
      analysis.summary.performanceIssues += fileAnalysis.issues.filter(i => i.type === 'performance').length;
    }

    // Generate overall recommendations
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  /**
   * Analyze a single file
   */
  async analyzeFile(filePath, issueTypes) {
    try {
      let content;
      let fileExtension;
      
      // Handle both file paths and file objects with content
      if (typeof filePath === 'string') {
        content = await fs.readFile(filePath, 'utf8');
        fileExtension = path.extname(filePath).slice(1);
      } else if (filePath.content) {
        content = filePath.content;
        fileExtension = path.extname(filePath.path || filePath.name || '').slice(1);
      } else {
        throw new Error('Invalid file format');
      }

      const fileName = typeof filePath === 'string' ? filePath : (filePath.path || filePath.name);

      const fileAnalysis = {
        file: fileName,
        extension: fileExtension,
        size: content.length,
        lines: content.split('\n').length,
        issues: []
      };

      // Static analysis using patterns
      const staticIssues = this.performStaticAnalysis(content, fileExtension);
      fileAnalysis.issues.push(...staticIssues);

      // AI-powered analysis for complex issues
      if (issueTypes.includes('all') || issueTypes.includes('complex')) {
        const aiIssues = await this.performAIAnalysis(content, fileExtension, fileName);
        fileAnalysis.issues.push(...aiIssues);
      }

      // Complexity analysis
      const complexityIssues = this.analyzeComplexity(content, fileExtension);
      fileAnalysis.issues.push(...complexityIssues);

      // Sort issues by severity
      fileAnalysis.issues.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });

      return fileAnalysis;
    } catch (error) {
      this.logger?.error('Failed to analyze file:', error);
      return {
        file: typeof filePath === 'string' ? filePath : filePath.path,
        error: error.message,
        issues: []
      };
    }
  }

  /**
   * Perform static analysis using predefined patterns
   */
  performStaticAnalysis(content, fileExtension) {
    const issues = [];
    const lines = content.split('\n');
    
    // Get relevant patterns for this file type
    const patterns = [
      ...(this.bugPatterns[fileExtension] || []),
      ...this.bugPatterns.general
    ];

    lines.forEach((line, lineNumber) => {
      patterns.forEach(pattern => {
        if (pattern.pattern.test(line)) {
          issues.push({
            type: pattern.type,
            severity: pattern.severity,
            message: pattern.message,
            line: lineNumber + 1,
            code: line.trim(),
            category: 'static_analysis'
          });
        }
      });
    });

    return issues;
  }

  /**
   * Perform AI-powered analysis for complex issues
   */
  async performAIAnalysis(content, fileExtension, fileName) {
    const prompt = this.createPrompt(
      `Analyze the following ${fileExtension} code for potential bugs, performance issues, security vulnerabilities, and code quality problems. 
       Focus on logical errors, race conditions, memory leaks, and other issues that static analysis might miss.
       Provide specific line references when possible.`,
      {
        fileName,
        fileExtension,
        codeLength: content.length,
        code: content.slice(0, 3000) // Limit code length for AI analysis
      }
    );

    try {
      const response = await this.generateResponse(prompt, { temperature: 0.2 });
      const aiAnalysis = this.parseJSONResponse(response);
      
      // Convert AI response to standard issue format
      if (aiAnalysis.issues && Array.isArray(aiAnalysis.issues)) {
        return aiAnalysis.issues.map(issue => ({
          ...issue,
          category: 'ai_analysis',
          confidence: issue.confidence || 0.7
        }));
      }
      
      return [];
    } catch (error) {
      this.logger?.warn('AI analysis failed:', error);
      return [];
    }
  }

  /**
   * Analyze code complexity
   */
  analyzeComplexity(content, fileExtension) {
    const issues = [];
    const lines = content.split('\n');
    
    // Cyclomatic complexity indicators
    const complexityPatterns = {
      javascript: [
        { pattern: /\bif\b|\belse\b|\bwhile\b|\bfor\b|\bswitch\b|\bcase\b|\bcatch\b/, weight: 1 },
        { pattern: /&&|\|\|/, weight: 1 },
        { pattern: /\?.*:/, weight: 1 } // Ternary operator
      ],
      python: [
        { pattern: /\bif\b|\belif\b|\belse\b|\bwhile\b|\bfor\b|\btry\b|\bexcept\b/, weight: 1 },
        { pattern: /\band\b|\bor\b/, weight: 1 }
      ]
    };

    if (!complexityPatterns[fileExtension]) {
      return issues;
    }

    let totalComplexity = 1; // Base complexity
    const patterns = complexityPatterns[fileExtension];
    
    lines.forEach((line, lineNumber) => {
      patterns.forEach(pattern => {
        const matches = (line.match(pattern.pattern) || []).length;
        totalComplexity += matches * pattern.weight;
      });
    });

    // Function-level complexity analysis
    const functions = this.extractFunctions(content, fileExtension);
    functions.forEach(func => {
      const funcComplexity = this.calculateFunctionComplexity(func.body, fileExtension);
      
      if (funcComplexity > 10) {
        issues.push({
          type: 'complexity',
          severity: funcComplexity > 20 ? 'high' : 'medium',
          message: `Function '${func.name}' has high cyclomatic complexity (${funcComplexity})`,
          line: func.startLine,
          category: 'complexity_analysis',
          complexity: funcComplexity
        });
      }
    });

    // Overall file complexity
    if (totalComplexity > 50) {
      issues.push({
        type: 'complexity',
        severity: totalComplexity > 100 ? 'high' : 'medium',
        message: `File has high overall complexity (${totalComplexity})`,
        line: 1,
        category: 'complexity_analysis',
        complexity: totalComplexity
      });
    }

    return issues;
  }

  /**
   * Extract functions from code
   */
  extractFunctions(content, fileExtension) {
    const functions = [];
    const lines = content.split('\n');
    
    const functionPatterns = {
      javascript: /function\s+(\w+)\s*\(.*?\)\s*\{|(\w+)\s*:\s*function\s*\(.*?\)\s*\{|const\s+(\w+)\s*=\s*\(.*?\)\s*=>\s*\{/,
      python: /def\s+(\w+)\s*\(.*?\):/
    };
    
    const pattern = functionPatterns[fileExtension];
    if (!pattern) return functions;
    
    let currentFunction = null;
    let braceCount = 0;
    
    lines.forEach((line, lineNumber) => {
      const match = line.match(pattern);
      
      if (match) {
        const functionName = match[1] || match[2] || match[3] || 'anonymous';
        currentFunction = {
          name: functionName,
          startLine: lineNumber + 1,
          body: line,
          braceCount: 0
        };
      }
      
      if (currentFunction) {
        currentFunction.body += '\n' + line;
        
        // Count braces for JavaScript
        if (fileExtension === 'javascript') {
          braceCount += (line.match(/\{/g) || []).length;
          braceCount -= (line.match(/\}/g) || []).length;
          
          if (braceCount === 0 && lineNumber > currentFunction.startLine - 1) {
            currentFunction.endLine = lineNumber + 1;
            functions.push(currentFunction);
            currentFunction = null;
          }
        }
        // Python indentation-based function detection
        else if (fileExtension === 'python' && line.trim() === '' && lineNumber > currentFunction.startLine) {
          const nextLine = lines[lineNumber + 1];
          if (nextLine && !nextLine.startsWith('    ') && !nextLine.startsWith('\t')) {
            currentFunction.endLine = lineNumber + 1;
            functions.push(currentFunction);
            currentFunction = null;
          }
        }
      }
    });
    
    return functions;
  }

  /**
   * Calculate function complexity
   */
  calculateFunctionComplexity(functionBody, fileExtension) {
    const complexityPatterns = {
      javascript: [
        { pattern: /\bif\b|\belse\b|\bwhile\b|\bfor\b|\bswitch\b|\bcase\b|\bcatch\b/, weight: 1 },
        { pattern: /&&|\|\|/, weight: 1 },
        { pattern: /\?.*:/, weight: 1 }
      ],
      python: [
        { pattern: /\bif\b|\belif\b|\belse\b|\bwhile\b|\bfor\b|\btry\b|\bexcept\b/, weight: 1 },
        { pattern: /\band\b|\bor\b/, weight: 1 }
      ]
    };

    const patterns = complexityPatterns[fileExtension];
    if (!patterns) return 1;

    let complexity = 1;
    const lines = functionBody.split('\n');
    
    lines.forEach(line => {
      patterns.forEach(pattern => {
        const matches = (line.match(pattern.pattern) || []).length;
        complexity += matches * pattern.weight;
      });
    });

    return complexity;
  }

  /**
   * Generate fixes for identified issues
   */
  async generateFixes(analysis) {
    const fixes = {};
    
    for (const fileAnalysis of analysis.files) {
      if (fileAnalysis.issues.length === 0) continue;
      
      const prompt = this.createPrompt(
        `Generate specific code fixes for the identified issues in this file. 
         Provide the original problematic code and the corrected version.
         Focus on the most critical issues first.`,
        {
          fileName: fileAnalysis.file,
          issues: fileAnalysis.issues.slice(0, 10) // Focus on top 10 issues
        }
      );

      try {
        const response = await this.generateResponse(prompt, { temperature: 0.1 });
        const fileFixes = this.parseJSONResponse(response);
        fixes[fileAnalysis.file] = fileFixes;
      } catch (error) {
        this.logger?.warn(`Failed to generate fixes for ${fileAnalysis.file}:`, error);
        fixes[fileAnalysis.file] = { error: error.message };
      }
    }
    
    return fixes;
  }

  /**
   * Generate recommendations based on analysis
   */
  generateRecommendations(analysis) {
    const recommendations = [];
    
    // Security recommendations
    if (analysis.summary.securityIssues > 0) {
      recommendations.push({
        category: 'security',
        priority: 'high',
        message: 'Address security vulnerabilities immediately',
        actions: [
          'Review and fix all security-related issues',
          'Implement input validation',
          'Use parameterized queries for database operations',
          'Enable security linters in your CI/CD pipeline'
        ]
      });
    }
    
    // Complexity recommendations
    const highComplexityFiles = analysis.files.filter(f => 
      f.issues.some(i => i.type === 'complexity' && i.severity === 'high')
    );
    
    if (highComplexityFiles.length > 0) {
      recommendations.push({
        category: 'maintainability',
        priority: 'medium',
        message: 'Reduce code complexity for better maintainability',
        actions: [
          'Refactor complex functions into smaller ones',
          'Extract common logic into utility functions',
          'Consider using design patterns to reduce complexity',
          'Add comprehensive tests before refactoring'
        ]
      });
    }
    
    // Code quality recommendations
    if (analysis.summary.totalIssues > 20) {
      recommendations.push({
        category: 'quality',
        priority: 'medium',
        message: 'Improve overall code quality',
        actions: [
          'Set up automated code quality tools',
          'Establish coding standards and guidelines',
          'Implement code review processes',
          'Regular refactoring sessions'
        ]
      });
    }
    
    return recommendations;
  }

  /**
   * Get debugging recommendations
   */
  getRecommendations(analysis) {
    return {
      immediate: this.getImmediateActions(analysis),
      shortTerm: this.getShortTermActions(analysis),
      longTerm: this.getLongTermActions(analysis),
      tools: this.recommendTools(analysis)
    };
  }

  getImmediateActions(analysis) {
    const actions = [];
    
    if (analysis.summary.securityIssues > 0) {
      actions.push('Fix all security vulnerabilities');
    }
    
    if (analysis.summary.criticalIssues > 5) {
      actions.push('Address critical bugs and errors');
    }
    
    return actions;
  }

  getShortTermActions(analysis) {
    return [
      'Set up automated testing',
      'Implement code linting',
      'Add error monitoring',
      'Create debugging documentation'
    ];
  }

  getLongTermActions(analysis) {
    return [
      'Establish code review processes',
      'Implement continuous integration',
      'Regular security audits',
      'Performance monitoring setup'
    ];
  }

  recommendTools(analysis) {
    return [
      'ESLint/Pylint for static analysis',
      'SonarQube for code quality',
      'Sentry for error tracking',
      'Jest/PyTest for testing'
    ];
  }

  /**
   * Process task implementation
   */
  async processTask(task) {
    this.validateTask(task);

    switch (task.type) {
      case 'analyze_code':
        return await this.analyzeCode(task.files, task.issueTypes);
      
      case 'generate_fixes':
        return await this.generateFixes(task.analysis);
      
      case 'analyze_file':
        return await this.analyzeFile(task.file, task.issueTypes);
      
      default:
        throw new Error(`Unsupported task type: ${task.type}`);
    }
  }
}
