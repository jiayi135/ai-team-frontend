const ROLES = {
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
      { name: "GitHub Integration", server: "github", description: "Code repository management", tools: ["create_repository", "create_pull_request", "list_issues"] },
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
