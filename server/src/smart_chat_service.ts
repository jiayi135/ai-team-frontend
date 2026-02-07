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
  private openai: OpenAI | null = null;
  private sessions: Map<string, ChatSession> = new Map();
  private systemPrompt: string;
  private useMock: boolean = false;

  constructor() {
    // 使 API Key 可选，如果没有配置则使用 Mock
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (apiKey && apiKey.trim() !== '') {
      this.openai = new OpenAI({ apiKey });
      this.useMock = false;
      console.log('[SmartChatService] 使用真实 OpenAI API');
    } else {
      this.useMock = true;
      console.log('[SmartChatService] 未配置 OPENAI_API_KEY，使用 Mock 模式');
    }

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

现在，请以这个角色回复用户的问题。`;
  }

  /**
   * 流式聊天（异步生成器）
   */
  async *streamChat(sessionId: string, message: string, model: string = 'gpt-4.1-mini'): AsyncGenerator<string> {
    // 获取或创建会话
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
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
    }

    // 添加用户消息
    session.messages.push({
      role: 'user',
      content: message,
    });
    session.updatedAt = new Date();

    try {
      // 如果没有真实 API Key，返回 Mock 响应
      if (this.useMock || !this.openai) {
        yield* this.mockStreamResponse(message);
        
        // 保存 Mock 响应到会话
        const mockResponse = this.getMockResponse(message);
        session.messages.push({
          role: 'assistant',
          content: mockResponse,
        });
        return;
      }

      // 调用真实 OpenAI API
      const stream = await this.openai.chat.completions.create({
        model,
        messages: session.messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2000,
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          yield content;
        }
      }

      // 保存助手回复
      session.messages.push({
        role: 'assistant',
        content: fullResponse,
      });
      session.updatedAt = new Date();

    } catch (error: any) {
      console.error('OpenAI API 调用失败:', error);
      
      const errorMessage = `抱歉，我遇到了一些技术问题：${error.message}`;
      
      session.messages.push({
        role: 'assistant',
        content: errorMessage,
      });

      yield errorMessage;
    }
  }

  /**
   * Mock 流式响应
   */
  private async *mockStreamResponse(message: string): AsyncGenerator<string> {
    const response = this.getMockResponse(message);
    const words = response.split('');
    
    for (const char of words) {
      yield char;
      // 模拟打字延迟
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }

  /**
   * 获取 Mock 响应
   */
  private getMockResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('代码') || lowerMessage.includes('code')) {
      return `好的！我来帮你写代码。

\`\`\`python
def hello_world():
    """
    这是一个示例函数
    """
    print("Hello, World!")
    return "Success"

# 调用函数
result = hello_world()
print(result)
\`\`\`

这段代码演示了基本的函数定义和调用。

**注意**：当前使用的是 Mock 模式，请在 HF Space Settings 中配置 \`OPENAI_API_KEY\` 以启用真实的 AI 对话功能。`;
    }

    if (lowerMessage.includes('算法') || lowerMessage.includes('algorithm')) {
      return `让我解释一下这个算法：

## 快速排序

快速排序是一种高效的排序算法，采用分治策略。

### 基本思想

1. 选择一个基准元素
2. 将数组分为两部分：小于基准和大于基准
3. 递归地对两部分进行排序

### 时间复杂度

| 情况 | 复杂度 |
|------|--------|
| 最好 | O(n log n) |
| 平均 | O(n log n) |
| 最坏 | O(n²) |

**注意**：当前使用的是 Mock 模式，请配置 \`OPENAI_API_KEY\` 以获得更智能的回复。`;
    }

    if (lowerMessage.includes('你好') || lowerMessage.includes('hello')) {
      return `你好！我是 Neuraxis AI Team 的智能助手。

我可以帮你：

- 🤖 **多 Agent 协作**：协调 5 个专业 Agent 完成复杂任务
- 💻 **代码生成**：根据需求生成高质量代码
- 🏗️ **架构设计**：提供系统架构建议
- 🔍 **算法优化**：分析和优化算法性能
- 🧪 **测试策略**：制定完整的测试方案

有什么我可以帮你的吗？

> **提示**：当前使用的是 Mock 模式。要启用真实的 AI 对话功能，请在 Hugging Face Space Settings 中配置 \`OPENAI_API_KEY\` 环境变量。`;
    }

    return `感谢你的提问！

我理解你想了解关于"${message}"的信息。

由于当前处于 **Mock 模式**，我只能提供有限的预设回复。要获得更智能、更准确的回答，请按以下步骤配置：

## 启用真实 AI 功能

1. 访问 [Hugging Face Space Settings](https://huggingface.co/spaces/HuFelix135/neuraxis/settings)
2. 找到 "Variables and secrets" 区域
3. 点击 "New secret"
4. 添加：
   - Name: \`OPENAI_API_KEY\`
   - Value: 你的 OpenAI API Key
5. 点击 "Save"
6. 重启 Space

配置完成后，我将能够：
- 理解复杂的问题
- 生成高质量的代码
- 提供专业的技术建议
- 进行多轮对话
- 记住上下文

期待为你提供更好的服务！🚀`;
  }

  /**
   * 普通聊天（非流式）
   */
  async chat(sessionId: string, message: string, model: string = 'gpt-4.1-mini'): Promise<string> {
    let fullResponse = '';
    for await (const chunk of this.streamChat(sessionId, message, model)) {
      fullResponse += chunk;
    }
    return fullResponse;
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
  clearSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * 获取会话统计
   */
  getSessionStats(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    const messages = session.messages.filter(msg => msg.role !== 'system');
    const userMessages = messages.filter(msg => msg.role === 'user');
    const assistantMessages = messages.filter(msg => msg.role === 'assistant');

    return {
      sessionId,
      messageCount: messages.length,
      userMessageCount: userMessages.length,
      assistantMessageCount: assistantMessages.length,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }
}
