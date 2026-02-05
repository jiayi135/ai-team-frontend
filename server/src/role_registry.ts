export const ROLES = {
  ARCHITECT: 'architect',
  DEVELOPER: 'developer',
  ALGORITHM_EXPERT: 'algorithm_expert',
  TESTER: 'tester',
  ARBITRATION_EXPERT: 'arbitration_expert',
} as const;

export interface ApiPermission {
  name: string;
  description: string;
  endpoint: string;
  methods: string[];
}

export interface McpTool {
  name: string;
  server: string;
  description: string;
  tools: string[]; // Specific tool names provided by the MCP server
}

export interface Skill {
  name: string;
  description: string;
  usage: string;
}

export interface RoleCapabilities {
  apiPermissions: ApiPermission[];
  mcpTools: McpTool[];
  skills: Skill[];
}

export const ROLE_CAPABILITIES: Record<string, RoleCapabilities> = {
  [ROLES.ARCHITECT]: {
    apiPermissions: [
      { name: "Architecture Review", description: "Review system architecture compliance", endpoint: "/api/architecture/evaluate", methods: ["POST"] },
    ],
    mcpTools: [
      { name: "Cloudflare Manager", server: "cloudflare", description: "Manage edge infrastructure", tools: ["d1_execute", "kv_put", "r2_upload"] },
      { name: "Vercel Admin", server: "vercel", description: "Manage production domains and logs", tools: ["list_domains", "get_deployment_logs"] },
    ],
    skills: [
      { name: "skill-creator", description: "Create and update Manus skills", usage: "Define new agent capabilities" },
    ],
  },
  [ROLES.DEVELOPER]: {
    apiPermissions: [
      { name: "Code Submission", description: "Submit code to VCS", endpoint: "/api/code/submit", methods: ["POST"] },
    ],
    mcpTools: [
      { name: "GitHub Integration", server: "github", description: "Code repository management", tools: ["create_repository", "create_pull_request", "list_issues", "search_code", "get_repository", "create_issue", "update_issue", "merge_pull_request"] },
      { name: "Vercel Deployment", server: "vercel", description: "Frontend deployment management", tools: ["create_deployment", "get_deployment"] },
    ],
    skills: [
      { name: "excel-generator", description: "Generate professional Excel spreadsheets", usage: "Data reporting and analysis" },
    ],
  },
  [ROLES.ALGORITHM_EXPERT]: {
    apiPermissions: [],
    mcpTools: [],
    skills: [
      { name: "data-analysis-skill", description: "Complex data analysis", usage: "Model evaluation" },
    ],
  },
  [ROLES.TESTER]: {
    apiPermissions: [],
    mcpTools: [
      { name: "Vercel QA", server: "vercel", description: "Monitor test deployments", tools: ["list_deployments", "get_deployment_logs"] },
    ],
    skills: [
      { name: "test-automation-skill", description: "Automated testing", usage: "Verification" },
    ],
  },
  [ROLES.ARBITRATION_EXPERT]: {
    apiPermissions: [],
    mcpTools: [],
    skills: [
      { name: "negotiation-resolution-skill", description: "Resolve disputes", usage: "Decision support" },
    ],
  },
};

export const ROLE_DETAILS = {
  [ROLES.ARCHITECT]: {
    title: '系统架构师 (Architect)',
    description: '负责系统全局设计、技术选型及跨模块一致性审计。',
    restrictions: ['禁止编写具体业务逻辑代码', '必须提供架构合规性报告', '优先考虑系统可扩展性与安全性']
  },
  [ROLES.DEVELOPER]: {
    title: '高级开发工程师 (Developer)',
    description: '负责高质量代码实现、单元测试及技术文档编写。',
    restrictions: ['代码必须符合生产环境标准', '必须包含必要的错误处理', '优先使用已定义的工具集']
  },
  [ROLES.ALGORITHM_EXPERT]: {
    title: '算法专家 (Algorithm Expert)',
    description: '负责复杂逻辑建模、数据分析及性能优化。',
    restrictions: ['必须提供算法复杂度分析', '确保数据处理的数学严谨性']
  },
  [ROLES.TESTER]: {
    title: '质量保证专家 (Tester)',
    description: '负责系统验证、边界条件测试及自动化审计。',
    restrictions: ['秉持“零信任”原则', '必须覆盖所有核心业务路径']
  },
  [ROLES.ARBITRATION_EXPERT]: {
    title: '仲裁专家 (Arbitration Expert)',
    description: '负责解决角色间的冲突，进行最终决策。',
    restrictions: ['必须基于宪法条款进行裁决', '决策过程必须透明可追溯']
  }
};
