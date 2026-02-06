import { createLogger } from './logger';
import { OpenAI } from 'openai';

const logger = createLogger('LLMFactory');

export type ModelProvider = 'openai' | 'anthropic' | 'deepseek' | 'google' | 'local' | 'z-ai' | 'minimax';

export interface LLMConfig {
  provider: ModelProvider;
  apiKey: string;
  baseUrl?: string;
  modelName: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
  };
}

export class LLMClient {
  private client: any;
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
    this.initializeClient();
  }

  private initializeClient() {
    // 默认使用 OpenAI 兼容协议，因为大多数主流模型（DeepSeek, Groq, Local LLMs）都支持它
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl || this.getProviderBaseUrl(this.config.provider),
    });
    logger.info(`LLM Client initialized for provider: ${this.config.provider}`);
  }

  private getProviderBaseUrl(provider: ModelProvider): string {
    switch (provider) {
      case 'openai': return 'https://api.openai.com/v1';
      case 'deepseek': return 'https://api.deepseek.com';
      case 'google': return 'https://generativelanguage.googleapis.com/v1beta/openai';
      case 'z-ai': return 'https://open.bigmodel.cn/api/paas/v4';
      case 'minimax': return 'https://api.minimax.chat/v1';
      default: return 'https://api.openai.com/v1';
    }
  }

  public async chat(messages: ChatMessage[]): Promise<LLMResponse> {
    try {
      const startTime = Date.now();
      const response = await this.client.chat.completions.create({
        model: this.config.modelName,
        messages: messages,
        temperature: this.config.temperature ?? 0.7,
        max_tokens: this.config.maxTokens ?? 2000,
      });

      const content = response.choices[0].message.content || '';
      const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
      
      // 简单的成本估算 (每1k tokens)
      const cost = this.calculateCost(usage.prompt_tokens, usage.completion_tokens);

      logger.info('LLM Response received', { 
        model: this.config.modelName, 
        duration: Date.now() - startTime,
        tokens: usage.total_tokens
      });

      return {
        content,
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          cost
        }
      };
    } catch (error: any) {
      logger.error('LLM Chat failed', { error: error.message });
      throw error;
    }
  }

  private calculateCost(promptTokens: number, completionTokens: number): number {
    // 这里的费率可以根据模型动态调整，目前使用一个通用平均值
    const promptRate = 0.005 / 1000; // $0.005 per 1k
    const completionRate = 0.015 / 1000; // $0.015 per 1k
    return (promptTokens * promptRate) + (completionTokens * completionRate);
  }
}

export class LLMFactory {
  private static instance: LLMFactory;
  private clients: Map<string, LLMClient> = new Map();

  private constructor() {}

  public static getInstance(): LLMFactory {
    if (!LLMFactory.instance) {
      LLMFactory.instance = new LLMFactory();
    }
    return LLMFactory.instance;
  }

  public getClient(config: LLMConfig): LLMClient {
    const key = `${config.provider}-${config.modelName}-${config.apiKey.substring(0, 8)}`;
    if (!this.clients.has(key)) {
      this.clients.set(key, new LLMClient(config));
    }
    return this.clients.get(key)!;
  }
}

export const llmFactory = LLMFactory.getInstance();
