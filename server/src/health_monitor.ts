import { createLogger } from './logger';

const logger = createLogger('HealthMonitor');

/**
 * 服务健康状态
 */
export enum HealthStatus {
  HEALTHY = '正常',
  WARNING = '警告',
  CRITICAL = '严重',
  UNKNOWN = '未知'
}

/**
 * 服务定义
 */
export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  uptime: number;           // 百分比
  responseTime: number;     // 毫秒
  lastCheck: Date;
  description?: string;
}

/**
 * 审计日志条目
 */
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: string;
  actor: string;
  status: 'success' | 'warning' | 'error';
  details: string;
  constitutionalClause?: string;
}

/**
 * 系统指标
 */
export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
}

/**
 * 健康监控服务
 * 实现法典 Article IV 的可观测性要求
 */
export class HealthMonitor {
  private services: Map<string, ServiceHealth> = new Map();
  private auditLogs: AuditLogEntry[] = [];
  private metrics: SystemMetrics = {
    cpuUsage: 0,
    memoryUsage: 0,
    activeConnections: 0,
    requestsPerMinute: 0,
    errorRate: 0
  };

  constructor() {
    this.initializeServices();
    this.startMetricsCollection();
    logger.info('HealthMonitor initialized');
  }

  /**
   * 初始化服务列表
   */
  private initializeServices(): void {
    const defaultServices: ServiceHealth[] = [
      {
        name: 'P.R.O.M.P.T. 引擎',
        status: HealthStatus.HEALTHY,
        uptime: 99.99,
        responseTime: 120,
        lastCheck: new Date(),
        description: '元认知框架核心引擎'
      },
      {
        name: '元认知协商服务器',
        status: HealthStatus.HEALTHY,
        uptime: 99.95,
        responseTime: 450,
        lastCheck: new Date(),
        description: '自主协商与共识构建服务'
      },
      {
        name: 'ChromaDB 向量检索',
        status: HealthStatus.HEALTHY,
        uptime: 99.50,
        responseTime: 85,
        lastCheck: new Date(),
        description: '长期记忆向量数据库'
      },
      {
        name: 'MCP 工具链网关',
        status: HealthStatus.HEALTHY,
        uptime: 99.99,
        responseTime: 15,
        lastCheck: new Date(),
        description: 'Model Context Protocol 工具调用网关'
      },
      {
        name: 'WebSocket 实时通信',
        status: HealthStatus.HEALTHY,
        uptime: 99.90,
        responseTime: 5,
        lastCheck: new Date(),
        description: '实时状态推送服务'
      },
      {
        name: '宪法护栏服务',
        status: HealthStatus.HEALTHY,
        uptime: 100.00,
        responseTime: 10,
        lastCheck: new Date(),
        description: '执行前合规性检查服务'
      }
    ];

    defaultServices.forEach(service => {
      this.services.set(service.name, service);
    });
  }

  /**
   * 启动指标收集
   */
  private startMetricsCollection(): void {
    // 每30秒更新一次指标
    setInterval(() => {
      this.updateMetrics();
      this.checkServices();
    }, 30000);

    // 初始更新
    this.updateMetrics();
  }

  /**
   * 更新系统指标
   */
  private updateMetrics(): void {
    // 模拟真实指标数据
    this.metrics = {
      cpuUsage: 30 + Math.random() * 40,
      memoryUsage: 50 + Math.random() * 30,
      activeConnections: Math.floor(10 + Math.random() * 50),
      requestsPerMinute: Math.floor(100 + Math.random() * 200),
      errorRate: Math.random() * 2
    };
  }

  /**
   * 检查服务状态
   */
  private checkServices(): void {
    this.services.forEach((service, name) => {
      // 模拟服务检查
      const newResponseTime = service.responseTime + (Math.random() - 0.5) * 50;
      service.responseTime = Math.max(5, Math.round(newResponseTime));
      service.lastCheck = new Date();

      // 根据响应时间更新状态
      if (service.responseTime > 1000) {
        service.status = HealthStatus.CRITICAL;
      } else if (service.responseTime > 500) {
        service.status = HealthStatus.WARNING;
      } else {
        service.status = HealthStatus.HEALTHY;
      }

      this.services.set(name, service);
    });
  }

  /**
   * 获取所有服务状态
   */
  public getServicesHealth(): ServiceHealth[] {
    return Array.from(this.services.values());
  }

  /**
   * 获取系统指标
   */
  public getSystemMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  /**
   * 获取健康摘要
   */
  public getHealthSummary(): {
    overallStatus: HealthStatus;
    healthyCount: number;
    warningCount: number;
    criticalCount: number;
    totalServices: number;
  } {
    const services = this.getServicesHealth();
    const healthyCount = services.filter(s => s.status === HealthStatus.HEALTHY).length;
    const warningCount = services.filter(s => s.status === HealthStatus.WARNING).length;
    const criticalCount = services.filter(s => s.status === HealthStatus.CRITICAL).length;

    let overallStatus = HealthStatus.HEALTHY;
    if (criticalCount > 0) {
      overallStatus = HealthStatus.CRITICAL;
    } else if (warningCount > 0) {
      overallStatus = HealthStatus.WARNING;
    }

    return {
      overallStatus,
      healthyCount,
      warningCount,
      criticalCount,
      totalServices: services.length
    };
  }

  /**
   * 记录审计日志
   * 实现法典 Article I 的溯源与验证要求
   */
  public logAudit(
    action: string,
    actor: string,
    status: 'success' | 'warning' | 'error',
    details: string,
    constitutionalClause?: string
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action,
      actor,
      status,
      details,
      constitutionalClause
    };

    this.auditLogs.unshift(entry);

    // 保留最近1000条日志
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(0, 1000);
    }

    logger.info('Audit log recorded', { action, actor, status });
    return entry;
  }

  /**
   * 获取审计日志
   */
  public getAuditLogs(limit: number = 50): AuditLogEntry[] {
    return this.auditLogs.slice(0, limit);
  }

  /**
   * 初始化示例审计日志
   */
  public initializeSampleAuditLogs(): void {
    const sampleLogs = [
      {
        action: '元认知审计',
        actor: 'Architect',
        status: 'success' as const,
        details: '系统架构设计通过 P.R.O.M.P.T. 六大支柱合规性检查',
        constitutionalClause: 'Article I: PROMPT 元认知指令'
      },
      {
        action: '协商干预',
        actor: 'Arbitration Expert',
        status: 'warning' as const,
        details: '检测到 API 设计模式存在认知漂移，已强制介入',
        constitutionalClause: 'Article III: 自主协商协议'
      },
      {
        action: '成本熔断',
        actor: 'System',
        status: 'error' as const,
        details: 'Provider A 消耗速率异常，已自动切换至备用模型',
        constitutionalClause: 'Article III: 经济保障'
      },
      {
        action: '知识库更新',
        actor: 'Algorithm Expert',
        status: 'success' as const,
        details: '成功提取并存储 12 条高效协作模式至向量数据库',
        constitutionalClause: 'Article V: 自主进化'
      },
      {
        action: '角色边界检查',
        actor: 'GovernanceHook',
        status: 'success' as const,
        details: 'Developer 角色执行代码提交操作，权限验证通过',
        constitutionalClause: 'Article II: 角色边界'
      },
      {
        action: '红线扫描',
        actor: 'GovernanceHook',
        status: 'warning' as const,
        details: '检测到潜在危险命令模式，已阻止执行',
        constitutionalClause: 'Article IV: 安全护栏'
      }
    ];

    // 添加示例日志，时间递减
    sampleLogs.forEach((log, index) => {
      const entry: AuditLogEntry = {
        id: `AUDIT-SAMPLE-${index}`,
        timestamp: new Date(Date.now() - index * 300000), // 每条间隔5分钟
        ...log
      };
      this.auditLogs.push(entry);
    });

    logger.info('Sample audit logs initialized', { count: sampleLogs.length });
  }
}

// 导出单例
export const healthMonitor = new HealthMonitor();
