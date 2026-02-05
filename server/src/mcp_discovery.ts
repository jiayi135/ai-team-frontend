import { exec } from 'child_process';
import { promisify } from 'util';
import { createLogger } from './logger';
import { McpClient } from './mcp_client';

const execAsync = promisify(exec);
const logger = createLogger('McpDiscovery');

export interface McpToolMetadata {
  name: string;
  server: string;
  description: string;
  inputSchema: any;
}

export class McpDiscoveryEngine {
  private toolCatalog: Map<string, McpToolMetadata> = new Map();
  private activeServers: string[] = ['vercel', 'cloudflare']; // Default servers

  /**
   * Automatically discover and index all tools from active MCP servers.
   */
  public async discoverAll(): Promise<void> {
    logger.info('Starting MCP tool discovery across active servers', { servers: this.activeServers });
    
    for (const server of this.activeServers) {
      try {
        const client = new McpClient(server);
        const tools = await client.listTools();
        
        if (Array.isArray(tools)) {
          tools.forEach((tool: any) => {
            const toolKey = `${server}:${tool.name || tool}`;
            this.toolCatalog.set(toolKey, {
              name: tool.name || tool,
              server: server,
              description: tool.description || 'No description provided',
              inputSchema: tool.inputSchema || {}
            });
          });
        }
        logger.info(`Discovered ${tools.length} tools from server: ${server}`);
      } catch (error: any) {
        logger.error(`Failed to discover tools for server ${server}`, { error: error.message });
      }
    }
  }

  /**
   * Add a new server to the discovery list (e.g., dynamically adding github).
   */
  public addServer(serverName: string) {
    if (!this.activeServers.includes(serverName)) {
      this.activeServers.push(serverName);
      logger.info(`Added new MCP server to discovery: ${serverName}`);
    }
  }

  /**
   * Get all discovered tools for LLM context injection.
   */
  public getAvailableTools(): McpToolMetadata[] {
    return Array.from(this.toolCatalog.values());
  }

  /**
   * Search for tools relevant to a specific task (Semantic Search placeholder).
   */
  public findRelevantTools(query: string): McpToolMetadata[] {
    const keywords = query.toLowerCase().split(' ');
    return this.getAvailableTools().filter(tool => 
      keywords.some(kw => 
        tool.name.toLowerCase().includes(kw) || 
        tool.description.toLowerCase().includes(kw)
      )
    );
  }
}

export const mcpDiscovery = new McpDiscoveryEngine();
