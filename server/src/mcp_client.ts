import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class McpClient {
  private serverName: string;

  constructor(serverName: string) {
    this.serverName = serverName;
  }

  /**
   * 列出指定 MCP 服务器可用的工具。
   * @returns Promise<string[]> 可用工具列表。
   */
  public async listTools(): Promise<string[]> {
    try {
      const { stdout } = await execAsync(`manus-mcp-cli tool list --server ${this.serverName}`);
      // 假设输出是每行一个工具名
      return stdout.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    } catch (error: any) {
      console.error(`[McpClient] Error listing tools for server ${this.serverName}: ${error.message}`);
      throw new Error(`Failed to list tools: ${error.message}`);
    }
  }

  /**
   * 调用指定 MCP 工具。
   * @param toolName 要调用的工具名称。
   * @param inputArgs JSON 格式的工具参数。
   * @returns Promise<any> 工具执行结果。
   */
  public async callTool(toolName: string, inputArgs: Record<string, any>): Promise<any> {
    const inputJson = JSON.stringify(inputArgs);
    try {
      const command = `manus-mcp-cli tool call ${toolName} --server ${this.serverName} --input '${inputJson}'`;
      console.log(`[McpClient] Calling tool ${toolName} on server ${this.serverName} with args: ${inputJson}`);
      const { stdout } = await execAsync(command);
      return JSON.parse(stdout);
    } catch (error: any) {
      console.error(`[McpClient] Error calling tool ${toolName} on server ${this.serverName}: ${error.message}`);
      throw new Error(`Failed to call tool: ${error.message}`);
    }
  }
}
