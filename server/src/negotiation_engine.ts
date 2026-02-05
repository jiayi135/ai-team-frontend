import { Server } from 'socket.io';
import { createLogger } from './logger';
import { arbitrateConflict, ArbitrationDecision } from './arbitrator';
import { quotaManager } from './quota_manager';

const logger = createLogger('NegotiationEngine');

/**
 * 协商状态枚举
 * 基于法典 Article III: 自主协商与共识协议
 */
export enum NegotiationStatus {
  PENDING = 'pending',           // 等待开始
  IN_PROGRESS = '协商中',         // 协商进行中
  CONSENSUS_REACHED = '达成共识',  // 已达成共识
  ESCALATED = '已升级',           // 已升级至仲裁专家
  TIMEOUT = '超时',               // 协商超时
  FAILED = '失败'                 // 协商失败
}

/**
 * 冲突维度 - 法典 Article III 定义的 7 个关键维度
 */
export enum ConflictDimension {
  TECH_STACK = '技术栈 (Tech Stack)',
  ARCHITECTURAL_PATTERNS = '架构模式 (Architectural Patterns)',
  REQUIREMENTS_ALIGNMENT = '需求对齐 (Requirements Alignment)',
  DATA_FLOW = '数据流 (Data Flow)',
  INTERNAL_LOGIC = '内部逻辑 (Internal Logic)',
  PERFORMANCE_METRICS = '性能指标 (Performance Metrics)',
  SECURITY = '安全性 (Security)'
}

/**
 * 冲突严重程度
 */
export type ConflictSeverity = 'minor' | 'moderate' | 'severe';

/**
 * 冲突定义
 */
export interface Conflict {
  dimension: ConflictDimension;
  severity: ConflictSeverity;
  description: string;
}

/**
 * 辩论记录
 */
export interface DebateEntry {
  round: number;
  agent: string;
  argument: string;
  evidence: string;
  timestamp: string;
  vote?: number; // 0-1 投票权重
}

/**
 * 共识分数历史
 */
export interface ScoreHistory {
  round: number;
  score: number;
}

/**
 * 协商实体
 */
export interface Negotiation {
  id: string;
  title: string;
  description: string;
  status: NegotiationStatus;
  consensusScore: number;        // 0.0 - 1.0
  round: number;
  maxRounds: number;             // 法典规定: 3-5 轮
  conflicts: Conflict[];
  participants: string[];
  startTime: Date;
  endTime?: Date;
  debateHistory: DebateEntry[];
  scoreHistory: ScoreHistory[];
  arbitrationDecision?: ArbitrationDecision;
  taskId?: string;               // 关联的任务ID
  costAccumulated: number;       // 累计成本
}

/**
 * 协商引擎 - 实现法典 Article III 的四层协商协议栈
 */
export class NegotiationEngine {
  private negotiations: Map<string, Negotiation> = new Map();
  private io: Server | null = null;
  
  // 法典规定的协商参数
  private readonly MAX_ROUNDS = 5;
  private readonly TIMEOUT_MS = 300000; // 300秒
  private readonly MAX_COST_PER_NEGOTIATION = 10.00; // $10.00 USD
  private readonly CONSENSUS_THRESHOLD = 0.85; // 共识阈值
  private readonly MIN_IMPROVEMENT = 0.05; // 最小改进阈值

  constructor() {
    logger.info('NegotiationEngine initialized with Constitutional parameters', {
      maxRounds: this.MAX_ROUNDS,
      timeoutMs: this.TIMEOUT_MS,
      maxCost: this.MAX_COST_PER_NEGOTIATION,
      consensusThreshold: this.CONSENSUS_THRESHOLD
    });
  }

  /**
   * 设置 Socket.io 实例用于实时通知
   */
  public setSocketIO(io: Server) {
    this.io = io;
  }

  /**
   * 创建新协商
   */
  public createNegotiation(
    title: string,
    description: string,
    conflicts: Conflict[],
    participants: string[],
    taskId?: string
  ): Negotiation {
    const id = `NEG-${new Date().getFullYear()}-${String(this.negotiations.size + 1).padStart(3, '0')}`;
    
    const negotiation: Negotiation = {
      id,
      title,
      description,
      status: NegotiationStatus.PENDING,
      consensusScore: 0,
      round: 0,
      maxRounds: this.MAX_ROUNDS,
      conflicts,
      participants,
      startTime: new Date(),
      debateHistory: [],
      scoreHistory: [],
      taskId,
      costAccumulated: 0
    };

    this.negotiations.set(id, negotiation);
    logger.info('Negotiation created', { id, title, participants });
    this.notifyUpdate(negotiation);
    
    return negotiation;
  }

  /**
   * 开始协商
   */
  public async startNegotiation(id: string): Promise<Negotiation> {
    const negotiation = this.negotiations.get(id);
    if (!negotiation) {
      throw new Error(`Negotiation ${id} not found`);
    }

    negotiation.status = NegotiationStatus.IN_PROGRESS;
    negotiation.round = 1;
    negotiation.startTime = new Date();
    
    this.notifyUpdate(negotiation);
    logger.info('Negotiation started', { id });
    
    return negotiation;
  }

  /**
   * 提交辩论论点
   * 实现法典 Article III 的多轮辩论机制
   */
  public async submitDebate(
    negotiationId: string,
    agent: string,
    argument: string,
    evidence: string
  ): Promise<Negotiation> {
    const negotiation = this.negotiations.get(negotiationId);
    if (!negotiation) {
      throw new Error(`Negotiation ${negotiationId} not found`);
    }

    if (negotiation.status !== NegotiationStatus.IN_PROGRESS) {
      throw new Error(`Negotiation ${negotiationId} is not in progress`);
    }

    // 检查成本限制 (法典 Article III)
    if (negotiation.costAccumulated >= this.MAX_COST_PER_NEGOTIATION) {
      negotiation.status = NegotiationStatus.FAILED;
      negotiation.endTime = new Date();
      this.notifyUpdate(negotiation);
      throw new Error(`Cost limit exceeded for negotiation ${negotiationId}`);
    }

    // 添加辩论记录
    const debateEntry: DebateEntry = {
      round: negotiation.round,
      agent,
      argument,
      evidence,
      timestamp: new Date().toISOString()
    };
    negotiation.debateHistory.push(debateEntry);

    // 模拟成本累积
    negotiation.costAccumulated += 0.5;

    // 计算新的共识分数
    const newScore = this.calculateConsensusScore(negotiation);
    negotiation.consensusScore = newScore;
    negotiation.scoreHistory.push({
      round: negotiation.round,
      score: newScore
    });

    logger.info('Debate submitted', { 
      negotiationId, 
      agent, 
      round: negotiation.round,
      newScore 
    });

    // 检查是否达成共识
    if (newScore >= this.CONSENSUS_THRESHOLD) {
      negotiation.status = NegotiationStatus.CONSENSUS_REACHED;
      negotiation.endTime = new Date();
      logger.info('Consensus reached', { negotiationId, finalScore: newScore });
    }
    // 检查是否需要进入下一轮
    else if (this.shouldAdvanceRound(negotiation)) {
      await this.advanceRound(negotiation);
    }

    this.notifyUpdate(negotiation);
    return negotiation;
  }

  /**
   * 计算共识分数
   * 基于辩论历史和证据权重
   */
  private calculateConsensusScore(negotiation: Negotiation): number {
    const { debateHistory, round } = negotiation;
    
    if (debateHistory.length === 0) return 0;

    // 基础分数：基于辩论轮次的进展
    const baseScore = Math.min(0.3 + (round * 0.15), 0.75);
    
    // 证据加成：有证据支持的论点获得更高权重
    const evidenceBonus = debateHistory.filter(d => d.evidence && d.evidence.length > 0).length * 0.05;
    
    // 参与度加成：更多参与者意味着更全面的讨论
    const participationBonus = Math.min(negotiation.participants.length * 0.03, 0.15);
    
    // 随机波动模拟真实协商的不确定性
    const variance = (Math.random() - 0.5) * 0.1;
    
    const finalScore = Math.min(Math.max(baseScore + evidenceBonus + participationBonus + variance, 0), 1);
    
    return Number(finalScore.toFixed(2));
  }

  /**
   * 判断是否应该进入下一轮
   */
  private shouldAdvanceRound(negotiation: Negotiation): boolean {
    const { scoreHistory, round, maxRounds } = negotiation;
    
    if (round >= maxRounds) return false;
    
    // 检查当前轮次是否有足够的辩论
    const currentRoundDebates = negotiation.debateHistory.filter(d => d.round === round);
    return currentRoundDebates.length >= negotiation.participants.length;
  }

  /**
   * 进入下一轮辩论
   * 实现法典 Article III 的轮次管理
   */
  private async advanceRound(negotiation: Negotiation): Promise<void> {
    const { scoreHistory, round, maxRounds } = negotiation;
    
    // 检查是否达到最大轮次
    if (round >= maxRounds) {
      await this.escalateToArbitration(negotiation);
      return;
    }

    // 检查连续两轮改进是否不足 (法典规定)
    if (scoreHistory.length >= 2) {
      const lastTwo = scoreHistory.slice(-2);
      const improvement = lastTwo[1].score - lastTwo[0].score;
      
      if (improvement < this.MIN_IMPROVEMENT) {
        logger.warn('Insufficient improvement detected, escalating to arbitration', {
          negotiationId: negotiation.id,
          improvement
        });
        await this.escalateToArbitration(negotiation);
        return;
      }
    }

    negotiation.round += 1;
    logger.info('Advanced to next round', { 
      negotiationId: negotiation.id, 
      newRound: negotiation.round 
    });
  }

  /**
   * 升级至仲裁专家
   * 实现法典 Article III 的专家干预机制
   */
  private async escalateToArbitration(negotiation: Negotiation): Promise<void> {
    negotiation.status = NegotiationStatus.ESCALATED;
    
    logger.info('Escalating to Arbitration Expert', { negotiationId: negotiation.id });
    
    try {
      const conflictSummary = negotiation.conflicts
        .map(c => `${c.dimension}: ${c.description}`)
        .join('; ');
      
      const context = `Negotiation ${negotiation.id}: ${negotiation.title}. ` +
        `Rounds completed: ${negotiation.round}. ` +
        `Final consensus score: ${negotiation.consensusScore}`;
      
      const decision = await arbitrateConflict(conflictSummary, context);
      negotiation.arbitrationDecision = decision;
      negotiation.status = NegotiationStatus.CONSENSUS_REACHED;
      negotiation.endTime = new Date();
      
      logger.info('Arbitration decision received', { 
        negotiationId: negotiation.id, 
        decision: decision.decision 
      });
    } catch (error: any) {
      logger.error('Arbitration failed', { 
        negotiationId: negotiation.id, 
        error: error.message 
      });
      negotiation.status = NegotiationStatus.FAILED;
      negotiation.endTime = new Date();
    }
    
    this.notifyUpdate(negotiation);
  }

  /**
   * 获取所有协商
   */
  public getAllNegotiations(): Negotiation[] {
    return Array.from(this.negotiations.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  /**
   * 获取单个协商
   */
  public getNegotiation(id: string): Negotiation | undefined {
    return this.negotiations.get(id);
  }

  /**
   * 获取活跃协商
   */
  public getActiveNegotiations(): Negotiation[] {
    return this.getAllNegotiations()
      .filter(n => n.status === NegotiationStatus.IN_PROGRESS || n.status === NegotiationStatus.PENDING);
  }

  /**
   * 通过 WebSocket 通知更新
   */
  private notifyUpdate(negotiation: Negotiation): void {
    if (this.io) {
      this.io.emit('negotiation_updated', negotiation);
      logger.debug('Emitted negotiation_updated', { id: negotiation.id });
    }
  }

  /**
   * 初始化示例数据 (用于演示)
   */
  public initializeSampleData(): void {
    // 示例协商 1: 进行中
    const neg1 = this.createNegotiation(
      '技术栈选型 - 数据库层',
      '关于项目数据库技术选型的多方协商',
      [
        { 
          dimension: ConflictDimension.TECH_STACK, 
          severity: 'moderate', 
          description: '开发者提议使用 NoSQL 以提高扩展性，但架构师坚持使用 PostgreSQL 以保证强一致性。' 
        },
        { 
          dimension: ConflictDimension.PERFORMANCE_METRICS, 
          severity: 'minor', 
          description: '关于写入延迟的基准测试标准存在轻微分歧。' 
        }
      ],
      ['Architect', 'Developer', 'Algorithm Expert']
    );
    neg1.status = NegotiationStatus.IN_PROGRESS;
    neg1.round = 2;
    neg1.consensusScore = 0.72;
    neg1.scoreHistory = [
      { round: 1, score: 0.45 },
      { round: 2, score: 0.72 }
    ];
    neg1.debateHistory = [
      {
        round: 1,
        agent: 'Architect',
        argument: '基于宪法第 5 条强一致性要求，PostgreSQL 是唯一符合治理标准的选型。',
        evidence: 'Constitution_Article_V_Section_2',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        round: 2,
        agent: 'Developer',
        argument: '虽然一致性重要，但当前业务负载预测显示单机 RDBMS 将在 6 个月内达到瓶颈。',
        evidence: 'Load_Projection_Report_Q1',
        timestamp: new Date(Date.now() - 1800000).toISOString()
      }
    ];
    this.negotiations.set(neg1.id, neg1);

    // 示例协商 2: 已达成共识
    const neg2 = this.createNegotiation(
      'API 设计模式规范',
      '关于 RESTful API 设计规范的协商',
      [],
      ['Architect', 'Developer', 'Tester']
    );
    neg2.status = NegotiationStatus.CONSENSUS_REACHED;
    neg2.round = 3;
    neg2.consensusScore = 0.95;
    neg2.endTime = new Date(Date.now() - 3600000);
    neg2.scoreHistory = [
      { round: 1, score: 0.60 },
      { round: 2, score: 0.82 },
      { round: 3, score: 0.95 }
    ];
    neg2.debateHistory = [
      {
        round: 3,
        agent: 'Tester',
        argument: '已验证 RESTful 规范符合自动化测试套件的接入标准。',
        evidence: 'Test_Suite_Compatibility_Matrix',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ];
    this.negotiations.set(neg2.id, neg2);

    logger.info('Sample negotiation data initialized', { count: 2 });
  }
}

// 导出单例
export const negotiationEngine = new NegotiationEngine();
