import { createLogger } from './logger';
import { mcpDiscovery } from './mcp_discovery';
import { McpClient } from './mcp_client';

const logger = createLogger('SkillCenter');

interface MCPServer {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  tools: number;
  lastUpdated: string;
  enabled: boolean;
  description?: string;
  port?: number;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  server: string;
  enabled: boolean;
  usage: number;
  lastUsed?: string;
  parameters?: string[];
}

export class SkillCenter {
  private servers: Map<string, MCPServer> = new Map();
  private skills: Map<string, Skill> = new Map();
  private usageStats: Map<string, number> = new Map();

  constructor() {
    this.initializeDefaultServers();
  }

  private initializeDefaultServers() {
    // Hugging Face MCP Server
    this.servers.set('hugging-face', {
      id: 'hugging-face',
      name: 'Hugging Face MCP',
      type: 'hugging-face',
      status: 'connected',
      tools: 0,
      lastUpdated: new Date().toISOString(),
      enabled: true,
      description: 'Access Hugging Face models, datasets, and papers',
      port: 3001,
    });

    logger.info('Initialized default MCP servers');
  }

  async refreshServers(): Promise<MCPServer[]> {
    logger.info('Refreshing MCP servers');

    try {
      // 发现所有可用的 MCP 工具
      await mcpDiscovery.discoverAll();
      const tools = mcpDiscovery.getAvailableTools();

      // 按服务器分组工具
      const serverToolsMap = new Map<string, number>();
      for (const tool of tools) {
        const count = serverToolsMap.get(tool.server) || 0;
        serverToolsMap.set(tool.server, count + 1);
      }

      // 更新服务器信息
      for (const [serverId, server] of this.servers) {
        const toolCount = serverToolsMap.get(serverId) || 0;
        server.tools = toolCount;
        server.lastUpdated = new Date().toISOString();
        server.status = toolCount > 0 ? 'connected' : 'disconnected';
      }

      // 刷新技能列表
      await this.refreshSkills();

      logger.info('Servers refreshed', { serverCount: this.servers.size });
      return Array.from(this.servers.values());
    } catch (error: any) {
      logger.error('Failed to refresh servers', { error: error.message });
      throw error;
    }
  }

  async refreshSkills(): Promise<Skill[]> {
    logger.info('Refreshing skills');

    try {
      const tools = mcpDiscovery.getAvailableTools();
      
      // 清空现有技能
      this.skills.clear();

      // 为每个工具创建技能
      for (const tool of tools) {
        const skillId = `${tool.server}-${tool.name}`;
        const skill: Skill = {
          id: skillId,
          name: tool.name,
          description: tool.description || 'No description available',
          category: this.categorizeSkill(tool.name),
          server: tool.server,
          enabled: true,
          usage: this.usageStats.get(skillId) || 0,
          parameters: tool.inputSchema?.properties 
            ? Object.keys(tool.inputSchema.properties)
            : [],
        };

        this.skills.set(skillId, skill);
      }

      logger.info('Skills refreshed', { skillCount: this.skills.size });
      return Array.from(this.skills.values());
    } catch (error: any) {
      logger.error('Failed to refresh skills', { error: error.message });
      throw error;
    }
  }

  private categorizeSkill(skillName: string): string {
    const name = skillName.toLowerCase();
    
    if (name.includes('search') || name.includes('find') || name.includes('discover')) {
      return 'Search';
    } else if (name.includes('dataset') || name.includes('data')) {
      return 'Data';
    } else if (name.includes('model') || name.includes('inference')) {
      return 'Model';
    } else if (name.includes('paper') || name.includes('research')) {
      return 'Research';
    } else if (name.includes('deploy') || name.includes('worker')) {
      return 'Deployment';
    } else if (name.includes('storage') || name.includes('bucket')) {
      return 'Storage';
    } else if (name.includes('doc') || name.includes('documentation')) {
      return 'Documentation';
    } else if (name.includes('image') || name.includes('generate')) {
      return 'Generation';
    }
    
    return 'Other';
  }

  async getServers(): Promise<MCPServer[]> {
    if (this.servers.size === 0) {
      await this.refreshServers();
    }
    return Array.from(this.servers.values());
  }

  async getSkills(): Promise<Skill[]> {
    if (this.skills.size === 0) {
      await this.refreshSkills();
    }
    return Array.from(this.skills.values());
  }

  async toggleServer(serverId: string, enabled: boolean): Promise<void> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server ${serverId} not found`);
    }

    server.enabled = enabled;
    logger.info('Server toggled', { serverId, enabled });
  }

  async toggleSkill(skillId: string, enabled: boolean): Promise<void> {
    const skill = this.skills.get(skillId);
    if (!skill) {
      throw new Error(`Skill ${skillId} not found`);
    }

    skill.enabled = enabled;
    logger.info('Skill toggled', { skillId, enabled });
  }

  async callSkill(skillId: string, args: any): Promise<any> {
    const skill = this.skills.get(skillId);
    if (!skill) {
      throw new Error(`Skill ${skillId} not found`);
    }

    if (!skill.enabled) {
      throw new Error(`Skill ${skillId} is disabled`);
    }

    const server = this.servers.get(skill.server);
    if (!server || !server.enabled) {
      throw new Error(`Server ${skill.server} is not available`);
    }

    try {
      logger.info('Calling skill', { skillId, server: skill.server });

      const client = new McpClient(skill.server);
      const result = await client.callTool(skill.name, args);

      // 更新使用统计
      const currentUsage = this.usageStats.get(skillId) || 0;
      this.usageStats.set(skillId, currentUsage + 1);
      skill.usage = currentUsage + 1;
      skill.lastUsed = new Date().toISOString();

      logger.info('Skill called successfully', { skillId });
      return result;
    } catch (error: any) {
      logger.error('Failed to call skill', { skillId, error: error.message });
      throw error;
    }
  }

  getUsageStats(): Map<string, number> {
    return this.usageStats;
  }
}

export const skillCenter = new SkillCenter();
