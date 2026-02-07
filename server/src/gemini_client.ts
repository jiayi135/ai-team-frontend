import { createLogger } from './logger';
import { ChatMessage, LLMResponse } from './llm_factory';

const logger = createLogger('GeminiClient');

export interface GeminiConfig {
  apiKey: string;
  modelName: string;
  temperature?: number;
  maxTokens?: number;
}

interface GeminiContent {
  parts: Array<{ text: string }>;
  role?: string;
}

interface GeminiRequest {
  contents: GeminiContent[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GeminiClient {
  private config: GeminiConfig;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(config: GeminiConfig) {
    this.config = config;
    logger.info(`Gemini Client initialized for model: ${config.modelName}`);
  }

  public async chat(messages: ChatMessage[]): Promise<LLMResponse> {
    try {
      const startTime = Date.now();
      
      // 转换消息格式为 Gemini 格式
      const contents = this.convertMessages(messages);
      
      const requestBody: GeminiRequest = {
        contents,
        generationConfig: {
          temperature: this.config.temperature ?? 0.7,
          maxOutputTokens: this.config.maxTokens ?? 2000,
        },
      };

      const url = `${this.baseUrl}/models/${this.config.modelName}:generateContent?key=${this.config.apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
      }

      const data: GeminiResponse = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No candidates returned from Gemini API');
      }

      const content = data.candidates[0].content.parts[0].text;
      const usage = data.usageMetadata;

      const cost = this.calculateCost(usage.promptTokenCount, usage.candidatesTokenCount);

      logger.info('Gemini Response received', {
        model: this.config.modelName,
        duration: Date.now() - startTime,
        tokens: usage.totalTokenCount,
      });

      return {
        content,
        usage: {
          promptTokens: usage.promptTokenCount,
          completionTokens: usage.candidatesTokenCount,
          totalTokens: usage.totalTokenCount,
          cost,
        },
      };
    } catch (error: any) {
      logger.error('Gemini Chat failed', { error: error.message });
      throw error;
    }
  }

  private convertMessages(messages: ChatMessage[]): GeminiContent[] {
    // Gemini 不支持 system 角色，需要将 system 消息转换为 user 消息
    const contents: GeminiContent[] = [];
    let systemMessage = '';

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemMessage += msg.content + '\n\n';
      } else if (msg.role === 'user') {
        const text = systemMessage + msg.content;
        systemMessage = ''; // 清空 system 消息
        contents.push({
          parts: [{ text }],
          role: 'user',
        });
      } else if (msg.role === 'assistant') {
        contents.push({
          parts: [{ text: msg.content }],
          role: 'model', // Gemini 使用 'model' 而不是 'assistant'
        });
      }
    }

    // 如果还有剩余的 system 消息，添加为 user 消息
    if (systemMessage) {
      contents.push({
        parts: [{ text: systemMessage }],
        role: 'user',
      });
    }

    return contents;
  }

  private calculateCost(promptTokens: number, completionTokens: number): number {
    // Gemini 2.5 Flash 定价（截至 2024）
    // 输入：$0.075 / 1M tokens
    // 输出：$0.30 / 1M tokens
    const promptRate = 0.075 / 1_000_000;
    const completionRate = 0.30 / 1_000_000;
    return promptTokens * promptRate + completionTokens * completionRate;
  }
}
