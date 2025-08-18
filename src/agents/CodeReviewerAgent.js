import { BaseAgent } from './BaseAgent.js';

export class CodeReviewerAgent extends BaseAgent {
  constructor(options) {
    super(options);
    this.specialization = 'code_quality';
  }

  async processTask(task) {
    this.validateTask(task);
    return { review: 'completed', suggestions: [] };
  }
}
