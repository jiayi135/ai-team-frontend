import { exec } from 'child_process';
import { promisify } from 'util';
import { createLogger } from './logger';

const execAsync = promisify(exec);
const logger = createLogger('McpClient');

export class McpClient {
  private serverName: string;

  constructor(serverName: string) {
    this.serverName = serverName;
  }

  /**
   * List available tools for the specified MCP server.
   */
  public async listTools(): Promise<any> {
    try {
      logger.info('Listing tools', { server: this.serverName });
      const { stdout } = await execAsync(`manus-mcp-cli tool list --server ${this.serverName}`);
      
      // Attempt to parse structured output
      try {
        return JSON.parse(stdout);
      } catch {
        return stdout.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      }
    } catch (error: any) {
      logger.error('Failed to list tools', { server: this.serverName, error: error.message });
      throw new Error(`MCP listTools failed: ${error.message}`);
    }
  }

  /**
   * Call a specific MCP tool with arguments.
   */
  public async callTool(toolName: string, inputArgs: Record<string, any>): Promise<any> {
    // Sanitize input: ensure it's a valid JSON string and escape single quotes for shell
    const inputJson = JSON.stringify(inputArgs).replace(/'/g, "'\\''");
    
    try {
      const command = `manus-mcp-cli tool call ${toolName} --server ${this.serverName} --input '${inputJson}'`;
      logger.info('Calling tool', { server: this.serverName, tool: toolName });
      
      const { stdout } = await execAsync(command);
      
      try {
        // MCP CLI might return wrapped results or raw JSON
        const parsed = JSON.parse(stdout);
        logger.debug('Tool execution success', { server: this.serverName, tool: toolName });
        return parsed;
      } catch {
        // Fallback for non-JSON stdout
        return { rawOutput: stdout.trim() };
      }
    } catch (error: any) {
      logger.error('Tool execution error', { 
        server: this.serverName, 
        tool: toolName, 
        error: error.message 
      });
      throw new Error(`MCP callTool failed: ${error.message}`);
    }
  }
}
