import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

/**
 * Logger utility class for structured logging
 */
export class Logger {
  constructor(context = 'App') {
    this.context = context;
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logFile = process.env.LOG_FILE || './logs/app.log';
    
    // Ensure log directory exists
    this.ensureLogDirectory();
    
    // Log levels hierarchy
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  /**
   * Create a child logger with additional context
   */
  createChild(childContext) {
    const child = new Logger(`${this.context}:${childContext}`);
    child.logLevel = this.logLevel;
    child.logFile = this.logFile;
    return child;
  }

  /**
   * Log error messages
   */
  error(message, ...args) {
    this.log('error', message, ...args);
  }

  /**
   * Log warning messages
   */
  warn(message, ...args) {
    this.log('warn', message, ...args);
  }

  /**
   * Log info messages
   */
  info(message, ...args) {
    this.log('info', message, ...args);
  }

  /**
   * Log debug messages
   */
  debug(message, ...args) {
    this.log('debug', message, ...args);
  }

  /**
   * Main logging method
   */
  log(level, message, ...args) {
    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const formattedMessage = this.formatMessage(level, timestamp, message, ...args);
    
    // Console output with colors
    console.log(formattedMessage.console);
    
    // File output without colors
    this.writeToFile(formattedMessage.file);
  }

  /**
   * Check if we should log at this level
   */
  shouldLog(level) {
    const currentLevelValue = this.levels[this.logLevel] || 2;
    const messageLevelValue = this.levels[level] || 2;
    return messageLevelValue <= currentLevelValue;
  }

  /**
   * Format log message for different outputs
   */
  formatMessage(level, timestamp, message, ...args) {
    const baseMessage = `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}`;
    
    // Add additional arguments if present
    const additionalInfo = args.length > 0 ? ` ${this.formatArgs(args)}` : '';
    
    // Console version with colors
    const coloredLevel = this.colorizeLevel(level);
    const coloredContext = chalk.cyan(`[${this.context}]`);
    const consoleMessage = `[${chalk.gray(timestamp)}] ${coloredLevel} ${coloredContext} ${message}${additionalInfo}`;
    
    // File version without colors
    const fileMessage = `${baseMessage}${additionalInfo}`;
    
    return {
      console: consoleMessage,
      file: fileMessage
    };
  }

  /**
   * Colorize log level for console output
   */
  colorizeLevel(level) {
    const colors = {
      error: chalk.red.bold,
      warn: chalk.yellow.bold,
      info: chalk.blue.bold,
      debug: chalk.green.bold
    };

    return colors[level](`[${level.toUpperCase()}]`);
  }

  /**
   * Format additional arguments
   */
  formatArgs(args) {
    return args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
  }

  /**
   * Write log message to file
   */
  async writeToFile(message) {
    try {
      await fs.appendFile(this.logFile, `${message}\n`);
    } catch (error) {
      // Fallback to console if file writing fails
      console.error('Failed to write to log file:', error.message);
    }
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    try {
      const logDir = path.dirname(this.logFile);
      fs.ensureDirSync(logDir);
    } catch (error) {
      console.warn('Failed to create log directory:', error.message);
    }
  }

  /**
   * Clear log file
   */
  async clearLogs() {
    try {
      await fs.remove(this.logFile);
      this.info('Log file cleared');
    } catch (error) {
      this.error('Failed to clear log file:', error);
    }
  }
}
