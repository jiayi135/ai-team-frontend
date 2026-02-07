import { createLogger } from './logger';
import { llmFactory } from './llm_factory';

const logger = createLogger('ToolGenerator');

interface GenerateToolRequest {
  prompt: string;
  apiKey?: string;
  provider?: string;
  modelName?: string;
}

interface GenerateToolResult {
  success: boolean;
  output?: string;
  error?: string;
  code?: string;
  diagnosis?: {
    reason: string;
    suggestedFix: string;
  };
  attempt?: number;
}

export class ToolGenerator {
  private maxAttempts = 3;

  async generateTool(request: GenerateToolRequest): Promise<GenerateToolResult> {
    const { prompt, apiKey, provider = 'openai', modelName = 'gpt-4o' } = request;

    logger.info('Starting tool generation', { prompt: prompt.substring(0, 50) });

    // 如果没有提供 API Key，返回模拟结果
    if (!apiKey) {
      return this.generateMockTool(prompt);
    }

    try {
      const client = llmFactory.getClient({
        provider,
        apiKey,
        modelName,
      });

      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(prompt);

      let attempt = 0;
      let lastError: string | null = null;

      while (attempt < this.maxAttempts) {
        attempt++;
        logger.info(`Tool generation attempt ${attempt}/${this.maxAttempts}`);

        try {
          const response = await client.chat([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ]);

          const code = this.extractCode(response.content);
          
          // 验证生成的代码
          const validation = this.validateCode(code);
          
          if (validation.valid) {
            return {
              success: true,
              output: response.content,
              code,
              attempt,
            };
          } else {
            lastError = validation.error || 'Code validation failed';
            // 如果验证失败，继续下一次尝试
            continue;
          }
        } catch (error: any) {
          lastError = error.message;
          logger.error(`Attempt ${attempt} failed`, { error: error.message });
        }
      }

      // 所有尝试都失败
      return {
        success: false,
        error: lastError || 'Failed to generate tool after maximum attempts',
        diagnosis: {
          reason: '代码生成或验证失败',
          suggestedFix: '请尝试更详细地描述您的需求，或简化功能要求',
        },
        attempt,
      };
    } catch (error: any) {
      logger.error('Tool generation error', { error: error.message });
      return {
        success: false,
        error: error.message,
        diagnosis: {
          reason: 'LLM 调用失败',
          suggestedFix: '请检查 API Key 和网络连接',
        },
      };
    }
  }

  private generateMockTool(prompt: string): GenerateToolResult {
    logger.info('Generating mock tool');

    const mockCode = `
// 根据您的需求自动生成的工具
// 需求: ${prompt}

async function generatedTool(input) {
  console.log('执行工具:', input);
  
  // 这是一个模拟实现
  // 实际功能需要配置真实的 API Key
  
  return {
    success: true,
    message: '工具执行成功（模拟）',
    data: {
      input: input,
      timestamp: new Date().toISOString(),
      result: '这是模拟的执行结果'
    }
  };
}

// 导出工具
module.exports = { generatedTool };
`;

    const mockOutput = `
✅ 工具生成成功！

📋 生成的代码：
${mockCode}

🎯 功能说明：
根据您的需求 "${prompt.substring(0, 50)}..."，我已经生成了一个基础工具框架。

⚠️ 注意：
当前使用模拟模式。要生成真实可用的工具，请在系统设置中配置您的 API Key。

💡 下一步：
1. 在"工具管理"页面查看和测试此工具
2. 根据需要调整参数和逻辑
3. 集成到您的工作流中
`;

    return {
      success: true,
      output: mockOutput,
      code: mockCode,
      attempt: 1,
    };
  }

  private buildSystemPrompt(): string {
    return `你是一个专业的工具生成 AI，基于 P.R.O.M.P.T. 框架工作。

你的任务是根据用户的需求描述，生成可执行的 JavaScript/TypeScript 代码。

要求：
1. **Purpose（目标）**: 深入理解用户的真实需求，不要只是字面实现
2. **Role（角色）**: 你是一个 Developer，专注于代码实现
3. **Operation（操作）**: 生成结构化、可执行的代码
4. **Media（上下文）**: 考虑工具的使用场景和环境
5. **Planned（规划）**: 考虑错误处理和边界情况
6. **Tracing（追溯）**: 添加必要的日志和注释

代码规范：
- 使用现代 JavaScript/TypeScript 语法
- 包含错误处理
- 添加清晰的注释
- 返回结构化的结果
- 使用 async/await 处理异步操作

输出格式：
\`\`\`javascript
// 你的代码
\`\`\`

然后简要说明代码的功能和使用方法。`;
  }

  private buildUserPrompt(prompt: string): string {
    return `请根据以下需求生成工具代码：

${prompt}

请生成完整的、可执行的代码，包括：
1. 函数定义
2. 参数验证
3. 核心逻辑实现
4. 错误处理
5. 返回值

确保代码可以直接运行。`;
  }

  private extractCode(content: string): string {
    // 提取代码块
    const codeBlockRegex = /```(?:javascript|typescript|js|ts)?\n([\s\S]*?)\n```/g;
    const matches = [...content.matchAll(codeBlockRegex)];
    
    if (matches.length > 0) {
      return matches.map(m => m[1]).join('\n\n');
    }
    
    // 如果没有代码块，返回原内容
    return content;
  }

  private validateCode(code: string): { valid: boolean; error?: string } {
    // 基本验证
    if (!code || code.trim().length === 0) {
      return { valid: false, error: 'Empty code' };
    }

    // 检查是否包含基本的函数定义
    if (!code.includes('function') && !code.includes('=>')) {
      return { valid: false, error: 'No function definition found' };
    }

    // 检查是否有明显的语法错误标记
    if (code.includes('// ERROR') || code.includes('// FIXME')) {
      return { valid: false, error: 'Code contains error markers' };
    }

    return { valid: true };
  }
}

export const toolGenerator = new ToolGenerator();
