const ROLES = {
  ARCHITECT: 'architect',
  DEVELOPER: 'developer',
  ALGORITHM_EXPERT: 'algorithm_expert',
  TESTER: 'tester',
  ARBITRATION_EXPERT: 'arbitration_expert',
} as const;

// 定义 API 权限接口
export interface ApiPermission {
  name: string;
  description: string;
  endpoint: string;
  methods: string[];
}

// 定义 MCP 工具接口
export interface McpTool {
  name: string;
  server: string;
  description: string;
  tools: string[]; // MCP server 提供的具体工具名称
}

// 定义 Skill 接口
export interface Skill {
  name: string;
  description: string;
  usage: string; // 如何使用该技能的简要说明
}

// 定义角色能力接口
export interface RoleCapabilities {
  apiPermissions: ApiPermission[];
  mcpTools: McpTool[];
  skills: Skill[];
}

// 角色能力注册表
export const ROLE_CAPABILITIES: Record<string, RoleCapabilities> = {
  [ROLES.ARCHITECT]: {
    apiPermissions: [
      { name: "架构评估 API", description: "评估系统架构的合规性与可扩展性", endpoint: "/api/architecture/evaluate", methods: ["POST"] },
      { name: "部署配置 API", description: "管理部署环境和配置", endpoint: "/api/deployment/config", methods: ["GET", "PUT"] },
    ],
    mcpTools: [
      { name: "Cloudflare Workers", server: "cloudflare", description: "用于管理和部署边缘计算服务", tools: ["d1", "r2", "kv"] },
    ],
    skills: [
      { name: "skill-creator", description: "创建和更新 Manus 技能", usage: "用于定义新的智能体能力和工作流" },
    ],
  },
  [ROLES.DEVELOPER]: {
    apiPermissions: [
      { name: "代码提交 API", description: "提交代码到版本控制系统", endpoint: "/api/code/submit", methods: ["POST"] },
      { name: "CI/CD 触发 API", description: "触发持续集成/持续部署流程", endpoint: "/api/ci-cd/trigger", methods: ["POST"] },
    ],
    mcpTools: [
      { name: "GitHub CLI", server: "github", description: "用于管理 GitHub 仓库和代码", tools: ["repo", "pr", "issue"] },
      { name: "Vercel CLI", server: "vercel", description: "用于管理 Vercel 项目和部署", tools: ["deploy", "env", "logs"] },
    ],
    skills: [
      { name: "excel-generator", description: "生成专业的 Excel 电子表格", usage: "用于数据报告和分析" },
    ],
  },
  [ROLES.ALGORITHM_EXPERT]: {
    apiPermissions: [
      { name: "算法优化 API", description: "提交算法模型进行优化", endpoint: "/api/algorithm/optimize", methods: ["POST"] },
      { name: "性能分析 API", description: "获取算法性能分析报告", endpoint: "/api/performance/report", methods: ["GET"] },
    ],
    mcpTools: [],
    skills: [
      { name: "data-analysis-skill", description: "执行复杂数据分析和可视化", usage: "用于算法性能评估和模型调优" },
    ],
  },
  [ROLES.TESTER]: {
    apiPermissions: [
      { name: "测试用例管理 API", description: "管理测试用例和测试计划", endpoint: "/api/test/cases", methods: ["GET", "POST", "PUT"] },
      { name: "测试报告 API", description: "获取自动化测试报告", endpoint: "/api/test/report", methods: ["GET"] },
    ],
    mcpTools: [],
    skills: [
      { name: "test-automation-skill", description: "自动化测试脚本生成与执行", usage: "用于提高测试效率和覆盖率" },
    ],
  },
  [ROLES.ARBITRATION_EXPERT]: {
    apiPermissions: [
      { name: "仲裁决策 API", description: "提交仲裁决策结果", endpoint: "/api/arbitration/decide", methods: ["POST"] },
      { name: "冲突评估 API", description: "评估协商冲突的严重性", endpoint: "/api/conflict/evaluate", methods: ["GET"] },
    ],
    mcpTools: [],
    skills: [
      { name: "negotiation-resolution-skill", description: "辅助解决复杂技术争议", usage: "用于在协商僵局时提供决策支持" },
    ],
  },
};
