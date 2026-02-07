import { createLogger } from './logger';
import { taskOrchestrator } from './task_orchestrator';
import { skillCenter } from './skill_center';
import { llmFactory } from './llm_factory';

const logger = createLogger('ChatService');

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
  taskId?: string;
}

interface ToolCall {
  id: string;
  toolName: string;
  args: any;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: any;
  error?: string;
}

interface ChatRequest {
  message: string;
  apiKey?: string;
  provider?: string;
  modelName?: string;
}

export class ChatService {
  async processMessage(request: ChatRequest): Promise<ChatMessage> {
    const { message, apiKey, provider = 'openai', modelName = 'gpt-4o' } = request;

    logger.info('Processing chat message', { message: message.substring(0, 50) });

    // 如果没有 API Key，返回模拟响应
    if (!apiKey) {
      return this.generateMockResponse(message);
    }

    try {
      // 分析用户意图
      const intent = await this.analyzeIntent(message, apiKey, provider, modelName);

      // 根据意图执行不同的操作
      if (intent.type === 'task_creation') {
        return await this.handleTaskCreation(message, intent, apiKey, provider, modelName);
      } else if (intent.type === 'skill_call') {
        return await this.handleSkillCall(message, intent);
      } else {
        return await this.handleGeneralChat(message, apiKey, provider, modelName);
      }
    } catch (error: any) {
      logger.error('Failed to process message', { error: error.message });
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `抱歉，处理您的消息时出现错误：${error.message}`,
        timestamp: new Date(),
      };
    }
  }

  private async analyzeIntent(
    message: string,
    apiKey: string,
    provider: string,
    modelName: string
  ): Promise<{ type: string; params?: any }> {
    // 简单的意图识别
    const lowerMessage = message.toLowerCase();

    // 检查是否是任务创建请求
    if (
      lowerMessage.includes('创建任务') ||
      lowerMessage.includes('新建任务') ||
      lowerMessage.includes('帮我') ||
      lowerMessage.includes('请')
    ) {
      return { type: 'task_creation' };
    }

    // 检查是否是技能调用请求
    if (
      lowerMessage.includes('搜索') ||
      lowerMessage.includes('查找') ||
      lowerMessage.includes('获取') ||
      lowerMessage.includes('调用')
    ) {
      return { type: 'skill_call' };
    }

    return { type: 'general_chat' };
  }

  private async handleTaskCreation(
    message: string,
    intent: any,
    apiKey: string,
    provider: string,
    modelName: string
  ): Promise<ChatMessage> {
    logger.info('Handling task creation');

    try {
      // 创建任务
      const task = await taskOrchestrator.createTask(
        message,
        'Developer', // 默认角色
        { source: 'chat', apiKey, provider, modelName }
      );

      const toolCall: ToolCall = {
        id: `tc-${Date.now()}`,
        toolName: 'create_task',
        args: { goal: message, role: 'Developer' },
        status: 'running',
      };

      // 异步执行任务
      this.executeTaskAsync(task.id, apiKey, provider, modelName, toolCall);

      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `我已经为您创建了任务，正在执行中...`,
        timestamp: new Date(),
        toolCalls: [toolCall],
        taskId: task.id,
      };
    } catch (error: any) {
      logger.error('Failed to create task', { error: error.message });
      throw error;
    }
  }

  private async executeTaskAsync(
    taskId: string,
    apiKey: string,
    provider: string,
    modelName: string,
    toolCall: ToolCall
  ): Promise<void> {
    try {
      // 这里应该调用任务执行器
      // 为了简化，我们模拟执行过程
      await new Promise(resolve => setTimeout(resolve, 2000));

      toolCall.status = 'success';
      toolCall.result = '任务执行成功';

      logger.info('Task executed successfully', { taskId });
    } catch (error: any) {
      toolCall.status = 'error';
      toolCall.error = error.message;
      logger.error('Task execution failed', { taskId, error: error.message });
    }
  }

  private async handleSkillCall(message: string, intent: any): Promise<ChatMessage> {
    logger.info('Handling skill call');

    try {
      // 获取可用技能
      const skills = await skillCenter.getSkills();

      // 简单匹配：找到第一个启用的搜索技能
      const searchSkill = skills.find(
        s => s.enabled && s.category === 'Search'
      );

      if (!searchSkill) {
        return {
          id: Date.now().toString(),
          role: 'assistant',
          content: '抱歉，没有找到可用的搜索技能。请先在技能中心启用相关技能。',
          timestamp: new Date(),
        };
      }

      const toolCall: ToolCall = {
        id: `tc-${Date.now()}`,
        toolName: searchSkill.name,
        args: { query: message, limit: 5 },
        status: 'running',
      };

      // 异步调用技能
      this.callSkillAsync(searchSkill.id, toolCall);

      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `正在通过 MCP 技能 "${searchSkill.name}" 处理您的请求...`,
        timestamp: new Date(),
        toolCalls: [toolCall],
      };
    } catch (error: any) {
      logger.error('Failed to call skill', { error: error.message });
      throw error;
    }
  }

  private async callSkillAsync(skillId: string, toolCall: ToolCall): Promise<void> {
    try {
      const result = await skillCenter.callSkill(skillId, toolCall.args);
      toolCall.status = 'success';
      toolCall.result = JSON.stringify(result, null, 2);
      logger.info('Skill called successfully', { skillId });
    } catch (error: any) {
      toolCall.status = 'error';
      toolCall.error = error.message;
      logger.error('Skill call failed', { skillId, error: error.message });
    }
  }

  private async handleGeneralChat(
    message: string,
    apiKey: string,
    provider: string,
    modelName: string
  ): Promise<ChatMessage> {
    logger.info('Handling general chat');

    try {
      const client = llmFactory.getClient({
        provider,
        apiKey,
        modelName,
      });

      const response = await client.chat([
        {
          role: 'system',
          content: '你是 Neuraxis 智能代理，基于 P.R.O.M.P.T. 框架工作。你可以帮助用户创建任务、调用 MCP 技能或回答问题。',
        },
        {
          role: 'user',
          content: message,
        },
      ]);

      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
      };
    } catch (error: any) {
      logger.error('Failed to generate chat response', { error: error.message });
      throw error;
    }
  }

  private generateMockResponse(message: string): ChatMessage {
    logger.info('Generating mock response');

    const lowerMessage = message.toLowerCase();
    let content = '';
    let toolCalls: ToolCall[] | undefined;

    if (
      lowerMessage.includes('搜索') ||
      lowerMessage.includes('查找') ||
      lowerMessage.includes('hugging face')
    ) {
      content = '我已经通过 MCP 端口连接并为您搜索相关信息。';
      toolCalls = [
        {
          id: `tc-${Date.now()}`,
          toolName: 'model_search',
          args: { query: message, limit: 5 },
          status: 'success',
          result: 'Found 5 matching models on Hugging Face.',
        },
      ];
    } else if (
      lowerMessage.includes('创建') ||
      lowerMessage.includes('任务') ||
      lowerMessage.includes('帮我')
    ) {
      content = '我已经为您创建了任务，并分配给合适的 AI 代理执行。';
      toolCalls = [
        {
          id: `tc-${Date.now()}`,
          toolName: 'create_task',
          args: { goal: message, role: 'Developer' },
          status: 'success',
          result: 'Task created successfully with ID: task-123',
        },
      ];
    } else {
      content = `我理解您的问题："${message}"。要获得更智能的响应，请在系统设置中配置您的 API Key。`;
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      toolCalls,
    };
  }
}

export const chatService = new ChatService();
