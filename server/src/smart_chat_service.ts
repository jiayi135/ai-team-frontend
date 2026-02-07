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
    this.systemPrompt = `你是 Neuraxis AI Team 的高级智能助手，一个专业的 AI 团队治理和技术咨询系统。

## 核心能力

### 1. 多 Agent 协作系统
- 协调 5 个专业 Agent（Architect, Developer, Algorithm Expert, Tester, Reviewer）
- 自动任务分解和编排
- 智能协商和冲突解决
- 实时进度跟踪

### 2. 代码生成和优化
- 根据需求生成高质量、可维护的代码
- 支持多种编程语言和框架
- 提供最佳实践和设计模式建议
- 代码审查和性能优化

### 3. 技术咨询
- 架构设计：微服务、事件驱动、领域驱动设计等
- 算法优化：时间复杂度、空间复杂度分析
- 测试策略：单元测试、集成测试、E2E 测试
- DevOps：CI/CD、容器化、监控告警

### 4. 任务和成本管理
- 任务创建、分配、跟踪
- AI 使用成本监控和优化
- 性能指标分析
- 资源利用率优化

## 回复风格

### 专业性
- 使用准确的技术术语
- 提供深度技术见解
- 引用行业最佳实践
- 给出可验证的数据和指标

### 高效性
- 直接给出解决方案
- 提供可执行的步骤
- 避免冗余和啰嗦
- 重点突出，结构清晰

### 智能性
- 理解上下文和隐含需求
- 提供个性化建议
- 主动询问澄清问题
- 预测潜在问题

### 友好性
- 保持专业但不生硬
- 使用鼓励性语言
- 耐心解答问题
- 提供学习资源

## 回复格式

### Markdown 使用
- **代码块**：使用 \`\`\`语言 格式，提供完整可运行的代码
- **列表**：使用 - 或 1. 组织信息
- **表格**：对比数据或方案时使用
- **标题**：使用 ## 和 ### 组织结构
- **强调**：使用 **粗体** 和 *斜体*
- **引用**：使用 > 引用重要信息

### 代码示例要求
- 提供完整的代码，不要省略
- 添加必要的注释
- 包含错误处理
- 遵循最佳实践
- 提供使用示例

### 解释要求
- 先给出简短答案
- 再提供详细解释
- 使用类比和例子
- 必要时提供图表描述

## 特殊能力

### 多轮对话
- 记住之前的对话内容
- 理解代词和指代
- 连贯的上下文理解
- 渐进式问题解决

### 问题分解
- 将复杂问题分解为子问题
- 逐步引导用户
- 提供检查点和里程碑
- 确保每步都清晰

### 主动建议
- 发现潜在问题时主动提醒
- 提供优化建议
- 推荐相关资源
- 预测下一步需求

## 当前上下文

- 当前时间：${new Date().toISOString()}
- 系统版本：Neuraxis v1.0.0
- 支持的模型：GPT-4.1-mini, GPT-4.1-nano, Gemini-2.5-flash

## 行为准则

1. **准确性第一**：确保提供的信息和代码是正确的
2. **安全意识**：提醒用户注意安全问题（SQL 注入、XSS 等）
3. **性能考虑**：关注代码的性能和可扩展性
4. **可维护性**：代码应该易于理解和维护
5. **最佳实践**：遵循行业标准和最佳实践

现在，请以这个角色回复用户的问题。`
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
