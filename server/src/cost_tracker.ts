import { createLogger } from './logger';

const logger = createLogger('CostTracker');

/**
 * 成本记录
 */
export interface CostEntry {
  id: string;
  timestamp: Date;
  provider: string;
  model: string;
  category: string;
  tokens: number;
  cost: number;
  taskId?: string;
  negotiationId?: string;
}

/**
 * 供应商成本汇总
 */
export interface ProviderCostSummary {
  provider: string;
  cost: number;
  percentage: number;
  trend: number; // 相比上期的变化百分比
}

/**
 * 类别成本汇总
 */
export interface CategoryCostSummary {
  name: string;
  value: number;
  color: string;
}

/**
 * 成本追踪器
 * 实现法典 Article III 的经济保障要求
 */
export class CostTracker {
  private costHistory: CostEntry[] = [];
  private monthlyBudget: number = 20000;

  // 供应商配置
  private readonly providers = [
    { name: 'OpenAI (GPT-4o)', color: '#3b82f6' },
    { name: 'Anthropic (Claude 3.5)', color: '#8b5cf6' },
    { name: 'Google (Gemini 1.5)', color: '#ec4899' },
    { name: 'Local (Llama 3)', color: '#10b981' }
  ];

  // 类别配置
  private readonly categories = [
    { name: '元认知协商', color: '#3b82f6' },
    { name: '上下文挖掘', color: '#8b5cf6' },
    { name: '任务分解', color: '#ec4899' },
    { name: '代码实现', color: '#f59e0b' },
    { name: '系统审计', color: '#10b981' }
  ];

  constructor() {
    this.initializeSampleData();
    logger.info('CostTracker initialized');
  }

  /**
   * 记录成本
   */
  public trackCost(
    provider: string,
    model: string,
    category: string,
    tokens: number,
    cost: number,
    taskId?: string,
    negotiationId?: string
  ): CostEntry {
    const entry: CostEntry = {
      id: `COST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      provider,
      model,
      category,
      tokens,
      cost,
      taskId,
      negotiationId
    };

    this.costHistory.unshift(entry);
    logger.info('Cost tracked', { provider, cost, category });

    return entry;
  }

  /**
   * 获取成本摘要
   */
  public getCostSummary(): {
    totalCost: number;
    monthlyBudget: number;
    budgetUtilization: number;
    remainingBudget: number;
    costChange: number;
  } {
    const totalCost = this.getTotalCost();
    const budgetUtilization = (totalCost / this.monthlyBudget) * 100;
    const remainingBudget = this.monthlyBudget - totalCost;

    // 计算相比上月的变化 (模拟)
    const costChange = 8.4;

    return {
      totalCost,
      monthlyBudget: this.monthlyBudget,
      budgetUtilization,
      remainingBudget,
      costChange
    };
  }

  /**
   * 获取总成本
   */
  private getTotalCost(): number {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return this.costHistory
      .filter(entry => entry.timestamp >= thirtyDaysAgo)
      .reduce((sum, entry) => sum + entry.cost, 0);
  }

  /**
   * 按供应商获取成本
   */
  public getCostByProvider(): ProviderCostSummary[] {
    const totalCost = this.getTotalCost();
    const providerCosts = new Map<string, number>();

    // 初始化所有供应商
    this.providers.forEach(p => providerCosts.set(p.name, 0));

    // 汇总成本
    this.costHistory.forEach(entry => {
      const current = providerCosts.get(entry.provider) || 0;
      providerCosts.set(entry.provider, current + entry.cost);
    });

    // 转换为数组并计算百分比
    return Array.from(providerCosts.entries()).map(([provider, cost]) => ({
      provider,
      cost,
      percentage: totalCost > 0 ? (cost / totalCost) * 100 : 0,
      trend: this.calculateTrend(provider)
    }));
  }

  /**
   * 按类别获取成本
   */
  public getCostByCategory(): CategoryCostSummary[] {
    const categoryCosts = new Map<string, number>();

    // 初始化所有类别
    this.categories.forEach(c => categoryCosts.set(c.name, 0));

    // 汇总成本
    this.costHistory.forEach(entry => {
      const current = categoryCosts.get(entry.category) || 0;
      categoryCosts.set(entry.category, current + entry.cost);
    });

    // 转换为数组
    return this.categories.map(category => ({
      name: category.name,
      value: categoryCosts.get(category.name) || 0,
      color: category.color
    }));
  }

  /**
   * 获取成本历史趋势
   */
  public getCostHistory(days: number = 30): { date: string; cost: number }[] {
    const result: { date: string; cost: number }[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayCost = this.costHistory
        .filter(entry => entry.timestamp.toISOString().split('T')[0] === dateStr)
        .reduce((sum, entry) => sum + entry.cost, 0);

      result.push({ date: dateStr, cost: dayCost });
    }

    return result;
  }

  /**
   * 获取治理警报
   */
  public getAlerts(): { severity: 'error' | 'warning'; title: string; description: string }[] {
    const alerts: { severity: 'error' | 'warning'; title: string; description: string }[] = [];
    const summary = this.getCostSummary();

    // 预算警报
    if (summary.budgetUtilization > 90) {
      alerts.push({
        severity: 'error',
        title: '预算即将耗尽',
        description: `当前预算使用率已达 ${summary.budgetUtilization.toFixed(1)}%，请立即采取措施。`
      });
    } else if (summary.budgetUtilization > 75) {
      alerts.push({
        severity: 'warning',
        title: '预算配额预警',
        description: `当前预算使用率为 ${summary.budgetUtilization.toFixed(1)}%，建议优化资源使用。`
      });
    }

    // 供应商成本警报
    const providerCosts = this.getCostByProvider();
    const highCostProvider = providerCosts.find(p => p.percentage > 50);
    if (highCostProvider) {
      alerts.push({
        severity: 'warning',
        title: '供应商成本集中',
        description: `${highCostProvider.provider} 占总成本 ${highCostProvider.percentage.toFixed(1)}%，建议分散风险。`
      });
    }

    return alerts;
  }

  /**
   * 计算趋势 (模拟)
   */
  private calculateTrend(provider: string): number {
    // 模拟趋势数据
    const trends: Record<string, number> = {
      'OpenAI (GPT-4o)': 12.5,
      'Anthropic (Claude 3.5)': -5.2,
      'Google (Gemini 1.5)': 8.5,
      'Local (Llama 3)': 0
    };
    return trends[provider] || 0;
  }

  /**
   * 初始化示例数据
   */
  private initializeSampleData(): void {
    const now = new Date();

    // 生成过去30天的模拟数据
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      // 每天生成多条记录
      const entriesPerDay = Math.floor(5 + Math.random() * 10);
      
      for (let j = 0; j < entriesPerDay; j++) {
        const provider = this.providers[Math.floor(Math.random() * this.providers.length)];
        const category = this.categories[Math.floor(Math.random() * this.categories.length)];
        
        const entry: CostEntry = {
          id: `COST-SAMPLE-${i}-${j}`,
          timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
          provider: provider.name,
          model: provider.name.includes('GPT') ? 'gpt-4o' : 
                 provider.name.includes('Claude') ? 'claude-3.5-sonnet' :
                 provider.name.includes('Gemini') ? 'gemini-1.5-pro' : 'llama-3-70b',
          category: category.name,
          tokens: Math.floor(1000 + Math.random() * 10000),
          cost: Math.random() * 50 + 10
        };

        this.costHistory.push(entry);
      }
    }

    // 按时间排序
    this.costHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    logger.info('Sample cost data initialized', { entries: this.costHistory.length });
  }

  /**
   * 设置月度预算
   */
  public setMonthlyBudget(budget: number): void {
    this.monthlyBudget = budget;
    logger.info('Monthly budget updated', { budget });
  }
}

// 导出单例
export const costTracker = new CostTracker();
