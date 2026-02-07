import OpenAI from 'openai';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export class SmartChatService {
  private openai: OpenAI;
  private sessions: Map<string, ChatSession> = new Map();
  private systemPrompt: string;

  constructor() {
    // 使用环境变量中的 API Key
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 智能系统提示词
    this.systemPrompt = `你是 Neuraxis AI Team 的智能助手，一个专业的 AI 团队治理系统。

你的核心能力：
1. 多 Agent 协作：你可以协调 5 个专业 Agent（Architect, Developer, Algorithm Expert, Tester, Reviewer）完成复杂任务
2. 任务管理：帮助用户创建、分配、跟踪和优化任务
3. 代码生成：根据需求生成高质量代码
4. 技术咨询：提供架构设计、算法优化、测试策略等专业建议
5. 成本管理：帮助用户监控和优化 AI 使用成本

你的特点：
- 专业：使用技术术语，提供深度见解
- 高效：直接给出解决方案，不啰嗦
- 智能：理解上下文，提供个性化建议
- 友好：保持专业的同时，语气亲切

回复格式：
- 简洁明了，重点突出
- 使用 Markdown 格式（代码块、列表、表格等）
- 提供可执行的步骤或代码
- 必要时询问澄清问题

当前时间：${new Date().toISOString()}`;
  }

  /**
   * 创建新的聊天会话
   */
  createSession(sessionId: string): ChatSession {
    const session: ChatSession = {
      id: sessionId,
      messages: [
        {
          role: 'system',
          content: this.systemPrompt,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * 获取或创建会话
   */
  getOrCreateSession(sessionId: string): ChatSession {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = this.createSession(sessionId);
    }
    return session;
  }

  /**
   * 发送消息并获取流式响应
   */
  async *streamChat(sessionId: string, userMessage: string): AsyncGenerator<string> {
    const session = this.getOrCreateSession(sessionId);

    // 添加用户消息
    session.messages.push({
      role: 'user',
      content: userMessage,
    });
    session.updatedAt = new Date();

    try {
      // 调用 OpenAI API（流式）
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4.1-mini', // 使用 gpt-4.1-mini
        messages: session.messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2000,
      });

      let fullResponse = '';

      // 流式输出
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          yield content;
        }
      }

      // 保存完整的助手回复
      session.messages.push({
        role: 'assistant',
        content: fullResponse,
      });
      session.updatedAt = new Date();

    } catch (error: any) {
      console.error('OpenAI API 调用失败:', error);
      
      // Fallback：返回友好的错误消息
      const errorMessage = `抱歉，我遇到了一些技术问题。错误信息：${error.message}

不过别担心，我可以：
1. 使用备用模型继续对话
2. 帮你记录这个问题
3. 提供离线帮助文档

你想怎么做？`;

      yield errorMessage;

      session.messages.push({
        role: 'assistant',
        content: errorMessage,
      });
    }
  }

  /**
   * 发送消息并获取完整响应（非流式）
   */
  async chat(sessionId: string, userMessage: string): Promise<string> {
    const session = this.getOrCreateSession(sessionId);

    // 添加用户消息
    session.messages.push({
      role: 'user',
      content: userMessage,
    });
    session.updatedAt = new Date();

    try {
      // 调用 OpenAI API
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: session.messages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      const assistantMessage = response.choices[0]?.message?.content || '抱歉，我没有理解你的问题。';

      // 保存助手回复
      session.messages.push({
        role: 'assistant',
        content: assistantMessage,
      });
      session.updatedAt = new Date();

      return assistantMessage;

    } catch (error: any) {
      console.error('OpenAI API 调用失败:', error);
      
      const errorMessage = `抱歉，我遇到了一些技术问题：${error.message}`;
      
      session.messages.push({
        role: 'assistant',
        content: errorMessage,
      });

      return errorMessage;
    }
  }

  /**
   * 获取会话历史
   */
  getSessionHistory(sessionId: string): Message[] {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return [];
    }
    // 排除系统提示词
    return session.messages.filter(msg => msg.role !== 'system');
  }

  /**
   * 清除会话
   */
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * 获取所有会话 ID
   */
  getAllSessionIds(): string[] {
    return Array.from(this.sessions.keys());
  }

  /**
   * 获取会话统计
   */
  getSessionStats(sessionId: string): {
    messageCount: number;
    createdAt: Date;
    updatedAt: Date;
  } | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }
    return {
      messageCount: session.messages.length - 1, // 排除系统提示词
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }
}

// 导出单例
export const smartChatService = new SmartChatService();
