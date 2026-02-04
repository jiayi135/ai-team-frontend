"use strict";
/**
 * AI Team Governance System - Constants
 * Based on P.R.O.M.P.T. framework
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ENDPOINTS = exports.PAGINATION = exports.TIME_RANGES = exports.CHART_COLORS = exports.COLORS = exports.HEALTH_STATUS = exports.COST_CATEGORIES = exports.TASK_STATUS = exports.NEGOTIATION_STATUS = exports.CONFLICT_DIMENSIONS = exports.PILLAR_DETAILS = exports.PROMPT_PILLARS = exports.ROLE_DETAILS = exports.ROLES = void 0;
// Roles
exports.ROLES = {
    ARCHITECT: 'architect',
    DEVELOPER: 'developer',
    ALGORITHM_EXPERT: 'algorithm_expert',
    TESTER: 'tester',
    ARBITRATION_EXPERT: 'arbitration_expert',
};
exports.ROLE_DETAILS = {
    [exports.ROLES.ARCHITECT]: {
        title: '架构师 (Architect)',
        icon: 'layout',
        color: 'orange',
        description: '系统级设计与技术栈选型',
        responsibilities: [
            '系统级架构设计',
            '技术栈选型与评估',
            '高层需求分析',
            '确保系统长期可扩展性',
        ],
        restrictions: '未经开发者评审，不得直接修改或实现源代码',
    },
    [exports.ROLES.DEVELOPER]: {
        title: '开发者 (Developer)',
        icon: 'code',
        color: 'blue',
        description: '代码实现与性能优化',
        responsibilities: [
            '高质量代码实现',
            '性能瓶颈优化',
            '架构规范的逻辑转化',
            '高性能逻辑执行',
        ],
        restrictions: '禁止在未经架构师批准的情况下更改架构模式或部署配置',
    },
    [exports.ROLES.ALGORITHM_EXPERT]: {
        title: '算法专家 (Algorithm Expert)',
        icon: 'zap',
        color: 'purple',
        description: '核心算法优化与高级性能分析',
        responsibilities: [
            '核心算法优化',
            '高级性能指标分析',
            '最小化计算开销',
            '逻辑严密性验证',
        ],
        restrictions: '不得更改架构模式或部署配置',
    },
    [exports.ROLES.TESTER]: {
        title: '测试员 (Tester)',
        icon: 'check-square',
        color: 'green',
        description: '自动化验证与测试用例设计',
        responsibilities: [
            '自动化功能验证',
            '测试用例设计与执行',
            '反馈循环管理',
            '系统可靠性保障',
        ],
        restrictions: '不能批准自己的代码；必须保持与开发者角色的严格独立',
    },
    [exports.ROLES.ARBITRATION_EXPERT]: {
        title: '仲裁专家 (Arbitration Expert)',
        icon: 'scale',
        color: 'gray',
        description: '技术僵局裁决与共识构建',
        responsibilities: [
            '解决技术决策僵局',
            '执行加权投票机制',
            '多维度评估决策',
            '强制执行最终共识',
        ],
        restrictions: '仅在自主协商引擎无法达成共识时激活',
    },
};
// P.R.O.M.P.T. Pillars
exports.PROMPT_PILLARS = {
    PURPOSE: 'purpose',
    ROLE: 'role',
    OPERATION: 'operation',
    MEDIA: 'media',
    PLANNED: 'planned',
    TRACING: 'tracing',
};
exports.PILLAR_DETAILS = {
    [exports.PROMPT_PILLARS.PURPOSE]: {
        title: 'Purpose (目标定义)',
        description: '意图对齐与目标深度分析',
        impact: '消除任务漂移；确保系统解决正确的问题',
    },
    [exports.PROMPT_PILLARS.ROLE]: {
        title: 'Role (角色边界)',
        description: '身份定位与行为边界强制执行',
        impact: '确保高保真专业输出；防止通用逻辑失效',
    },
    [exports.PROMPT_PILLARS.OPERATION]: {
        title: 'Operation (操作结构)',
        description: '任务分解与结构化输出管理',
        impact: '保证输出是确定性的且易于机器解析',
    },
    [exports.PROMPT_PILLARS.MEDIA]: {
        title: 'Media (上下文挖掘)',
        description: '信息源优先级与探索性学习',
        impact: '最大化私有数据价值；通过深度挖掘发现非显性洞察',
    },
    [exports.PROMPT_PILLARS.PLANNED]: {
        title: 'Planned (计划迭代)',
        description: '对话路径规划与前瞻性思考',
        impact: '防止碎片化交互；在复杂任务周期中创建连贯思维链',
    },
    [exports.PROMPT_PILLARS.TRACING]: {
        title: 'Tracing (溯源验证)',
        description: '证据锚定与审计追踪',
        impact: '确保断言不可否认；为调试和合规提供确定性审计轨迹',
    },
};
// Negotiation Conflict Dimensions
exports.CONFLICT_DIMENSIONS = [
    '技术栈 (Tech Stack)',
    '架构模式 (Architectural Patterns)',
    '需求对齐 (Requirements Alignment)',
    '数据流 (Data Flow)',
    '内部逻辑 (Internal Logic)',
    '性能指标 (Performance Metrics)',
    '安全性 (Security)',
];
// Negotiation Status
exports.NEGOTIATION_STATUS = {
    PENDING: '等待中',
    IN_PROGRESS: '协商中',
    CONSENSUS_REACHED: '达成共识',
    EXPERT_ARBITRATION: '专家仲裁',
    RESOLVED: '已解决',
    FAILED: '协商失败',
};
// Task Status
exports.TASK_STATUS = {
    QUEUED: '队列中',
    RUNNING: '执行中',
    COMPLETED: '已完成',
    FAILED: '失败',
    CANCELLED: '已取消',
};
// Cost Categories
exports.COST_CATEGORIES = {
    COMPUTE: '计算资源',
    STORAGE: '存储',
    NETWORK: '网络',
    API_CALLS: 'API 调用',
    TOKENS: 'Token 消耗',
};
// System Health Status
exports.HEALTH_STATUS = {
    HEALTHY: '健康',
    WARNING: '警告',
    CRITICAL: '严重',
    OFFLINE: '离线',
};
// Color Palette
exports.COLORS = {
    primary: '#1e40af', // Deep blue
    secondary: '#64748b', // Slate
    success: '#16a34a', // Green
    warning: '#f59e0b', // Amber
    danger: '#dc2626', // Red
    info: '#0ea5e9', // Sky blue
    // Role colors
    architect: '#f97316', // Orange
    developer: '#3b82f6', // Blue
    algorithm: '#a855f7', // Purple
    tester: '#22c55e', // Green
    arbitration: '#6b7280', // Gray
};
// Chart colors
exports.CHART_COLORS = [
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#6366f1', // Indigo
];
// Time ranges for analytics
exports.TIME_RANGES = {
    LAST_HOUR: '1h',
    LAST_6_HOURS: '6h',
    LAST_24_HOURS: '24h',
    LAST_7_DAYS: '7d',
    LAST_30_DAYS: '30d',
};
// Pagination
exports.PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
};
// API Endpoints (mock)
exports.API_ENDPOINTS = {
    DASHBOARD: '/api/dashboard',
    ROLES: '/api/roles',
    NEGOTIATIONS: '/api/negotiations',
    TASKS: '/api/tasks',
    COSTS: '/api/costs',
    HEALTH: '/api/health',
    AUDIT_LOGS: '/api/audit-logs',
};
