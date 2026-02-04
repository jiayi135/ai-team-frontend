/**
 * AI Team Governance System - Constants
 * Based on P.R.O.M.P.T. framework
 */

// Roles
export const ROLES = {
  ARCHITECT: 'architect',
  DEVELOPER: 'developer',
  ALGORITHM_EXPERT: 'algorithm_expert',
  TESTER: 'tester',
  ARBITRATION_EXPERT: 'arbitration_expert',
} as const;

export const ROLE_DETAILS = {
  [ROLES.ARCHITECT]: {
    title: 'Architect',
    icon: 'layout',
    color: 'orange',
    description: 'System-level design and technical stack selection',
    responsibilities: [
      'System-level design',
      'Technical stack selection',
      'High-level requirement analysis',
      'Long-term system scalability',
    ],
    restrictions: 'Cannot modify or implement source code without Developer review',
  },
  [ROLES.DEVELOPER]: {
    title: 'Developer',
    icon: 'code',
    color: 'blue',
    description: 'Code implementation and optimization',
    responsibilities: [
      'Code implementation',
      'Performance optimization',
      'Architectural specification translation',
      'High-performance logic execution',
    ],
    restrictions: 'Cannot alter architectural schemas or deployment configurations',
  },
  [ROLES.ALGORITHM_EXPERT]: {
    title: 'Algorithm Expert',
    icon: 'zap',
    color: 'purple',
    description: 'Core algorithm optimization and performance analysis',
    responsibilities: [
      'Algorithm optimization',
      'Advanced performance analysis',
      'Computational overhead minimization',
      'Logic validation',
    ],
    restrictions: 'Cannot alter architectural schemas or deployment configurations',
  },
  [ROLES.TESTER]: {
    title: 'Tester',
    icon: 'check-square',
    color: 'green',
    description: 'Automated verification and test case design',
    responsibilities: [
      'Automated verification',
      'Test case design',
      'Feedback loop management',
      'System reliability assurance',
    ],
    restrictions: 'Cannot approve its own code; must maintain independence from Developer',
  },
  [ROLES.ARBITRATION_EXPERT]: {
    title: 'Arbitration Expert',
    icon: 'scale',
    color: 'gray',
    description: 'Technical deadlock adjudication and consensus building',
    responsibilities: [
      'Technical deadlock resolution',
      'Weighted voting',
      'Multi-dimensional evaluation',
      'Consensus enforcement',
    ],
    restrictions: 'Only activated when Autonomous Negotiation engine fails',
  },
} as const;

// P.R.O.M.P.T. Pillars
export const PROMPT_PILLARS = {
  PURPOSE: 'purpose',
  ROLE: 'role',
  OPERATION: 'operation',
  MEDIA: 'media',
  PLANNED: 'planned',
  TRACING: 'tracing',
} as const;

export const PILLAR_DETAILS = {
  [PROMPT_PILLARS.PURPOSE]: {
    title: 'Purpose',
    description: 'Goal Definition & Intent Alignment',
    impact: 'Eliminates task drift; ensures the system solves the correct problem',
  },
  [PROMPT_PILLARS.ROLE]: {
    title: 'Role & Restrictions',
    description: 'Identity & Behavioral Boundaries',
    impact: 'Ensures high-fidelity specialized output; prevents generic logic failures',
  },
  [PROMPT_PILLARS.OPERATION]: {
    title: 'Operation & Output',
    description: 'Task Decomposition & Structural Utility',
    impact: 'Guarantees outputs are deterministic and machine-parsable',
  },
  [PROMPT_PILLARS.MEDIA]: {
    title: 'Media & Mining',
    description: 'Context & Exploratory Learning',
    impact: 'Maximizes proprietary data value; surfaces non-obvious insights',
  },
  [PROMPT_PILLARS.PLANNED]: {
    title: 'Planned Iteration',
    description: 'Dialogue Pathing & Anticipatory Thinking',
    impact: 'Prevents fragmented interactions; creates coherent chain of thought',
  },
  [PROMPT_PILLARS.TRACING]: {
    title: 'Tracing & Verification',
    description: 'Evidence & Audit Trail',
    impact: 'Ensures non-repudiation; provides deterministic audit trail',
  },
} as const;

// Negotiation Conflict Dimensions
export const CONFLICT_DIMENSIONS = [
  'Tech Stack',
  'Architectural Patterns',
  'Requirements Alignment',
  'Data Flow',
  'Internal Logic',
  'Performance Metrics',
  'Security',
] as const;

// Negotiation Status
export const NEGOTIATION_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  CONSENSUS_REACHED: 'consensus_reached',
  EXPERT_ARBITRATION: 'expert_arbitration',
  RESOLVED: 'resolved',
  FAILED: 'failed',
} as const;

// Task Status
export const TASK_STATUS = {
  QUEUED: 'queued',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

// Cost Categories
export const COST_CATEGORIES = {
  COMPUTE: 'compute',
  STORAGE: 'storage',
  NETWORK: 'network',
  API_CALLS: 'api_calls',
  TOKENS: 'tokens',
} as const;

// System Health Status
export const HEALTH_STATUS = {
  HEALTHY: 'healthy',
  WARNING: 'warning',
  CRITICAL: 'critical',
  OFFLINE: 'offline',
} as const;

// Color Palette
export const COLORS = {
  primary: '#1e40af',      // Deep blue
  secondary: '#64748b',    // Slate
  success: '#16a34a',      // Green
  warning: '#f59e0b',      // Amber
  danger: '#dc2626',       // Red
  info: '#0ea5e9',         // Sky blue
  
  // Role colors
  architect: '#f97316',    // Orange
  developer: '#3b82f6',    // Blue
  algorithm: '#a855f7',    // Purple
  tester: '#22c55e',       // Green
  arbitration: '#6b7280',  // Gray
} as const;

// Chart colors
export const CHART_COLORS = [
  '#3b82f6',  // Blue
  '#8b5cf6',  // Purple
  '#ec4899',  // Pink
  '#f59e0b',  // Amber
  '#10b981',  // Emerald
  '#06b6d4',  // Cyan
  '#f97316',  // Orange
  '#6366f1',  // Indigo
] as const;

// Time ranges for analytics
export const TIME_RANGES = {
  LAST_HOUR: '1h',
  LAST_6_HOURS: '6h',
  LAST_24_HOURS: '24h',
  LAST_7_DAYS: '7d',
  LAST_30_DAYS: '30d',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// API Endpoints (mock)
export const API_ENDPOINTS = {
  DASHBOARD: '/api/dashboard',
  ROLES: '/api/roles',
  NEGOTIATIONS: '/api/negotiations',
  TASKS: '/api/tasks',
  COSTS: '/api/costs',
  HEALTH: '/api/health',
  AUDIT_LOGS: '/api/audit-logs',
} as const;
