import { createLogger } from './logger';

const logger = createLogger('QuotaManager');

export interface QuotaConfig {
  maxCostPerNegotiation: number; // Article III: $10.00 USD
  maxRoundsPerNegotiation: number; // Article III: 3-5 rounds
  totalBudget: number;
}

export class QuotaManager {
  private currentSpending: number = 0;
  private config: QuotaConfig;

  constructor(config: QuotaConfig) {
    this.config = config;
  }

  public checkBudget(estimatedCost: number): boolean {
    if (this.currentSpending + estimatedCost > this.config.totalBudget) {
      logger.warn('Budget exceeded', { currentSpending: this.currentSpending, estimatedCost });
      return false;
    }
    return true;
  }

  public trackSpending(cost: number) {
    this.currentSpending += cost;
    logger.info('Tracked spending', { cost, totalSpending: this.currentSpending });
  }

  public getRemainingBudget(): number {
    return this.config.totalBudget - this.currentSpending;
  }
}

export const quotaManager = new QuotaManager({
  maxCostPerNegotiation: 10.00,
  maxRoundsPerNegotiation: 5,
  totalBudget: 1000.00, // Default total budget
});
