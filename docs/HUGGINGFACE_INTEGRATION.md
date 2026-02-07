# Hugging Face 集成指南

## 项目概述

本项目已部署在 Hugging Face Spaces 上，并集成了 Hugging Face 的多项服务和资源。本文档提供了完整的集成指南，帮助团队成员了解如何使用和扩展 Hugging Face 功能。

## 部署信息

- **平台**: Hugging Face Spaces
- **SDK**: Docker
- **项目类型**: AI 团队协作系统前端
- **仓库**: jiayi135/ai-team-frontend

## 认证配置

### API Token

项目使用 Hugging Face API Token 进行认证，以获得更高的 API 调用限额和完整功能访问。

```bash
# 环境变量配置
export HF_TOKEN="your_huggingface_token_here"
```

### 账号信息

- **邮箱**: huzhitao117@outlook.com
- **用户名**: （通过 Token 认证）

## 可用的 Hugging Face 资源

### 1. 推荐的对话模型

根据下载量和适用性，以下模型适合集成到 AI 团队协作系统中：

| 模型名称 | 下载量 | 点赞数 | 特点 | 推荐用途 |
|---------|--------|--------|------|---------|
| Qwen/Qwen2.5-7B-Instruct | 10.9M | 1059 | 中等规模，性能优秀 | 主要对话引擎 |
| Qwen/Qwen3-0.6B | 9.6M | 1050 | 轻量级，响应快速 | 快速响应场景 |
| meta-llama/Llama-3.1-8B-Instruct | 7.2M | 5397 | 多语言支持 | 国际化需求 |
| openai/gpt-oss-20b | 6.1M | 4309 | 开源 GPT 实现 | 高质量生成 |
| Qwen/Qwen2.5-VL-3B-Instruct | 21.6M | 603 | 多模态（图文） | 图像理解场景 |

**链接**:
- [Qwen2.5-7B-Instruct](https://hf.co/Qwen/Qwen2.5-7B-Instruct)
- [Qwen3-0.6B](https://hf.co/Qwen/Qwen3-0.6B)
- [Llama-3.1-8B-Instruct](https://hf.co/meta-llama/Llama-3.1-8B-Instruct)
- [gpt-oss-20b](https://hf.co/openai/gpt-oss-20b)
- [Qwen2.5-VL-3B-Instruct](https://hf.co/Qwen/Qwen2.5-VL-3B-Instruct)

### 2. 相关 Hugging Face Spaces

以下 Spaces 提供了类似功能的参考实现：

| Space 名称 | 描述 | 相关性 | 链接 |
|-----------|------|--------|------|
| HLE Leaderboard for Agents with Tools | LLM 代理工具排行榜 | 73.2% | [查看](https://hf.co/spaces/zoom-ai/hle-leaderboard) |
| GroqChatBot | 聊天机器人助手 | 70.9% | [查看](https://hf.co/spaces/hassan773/SageBot) |
| First Agent Template | AI 代理代码生成 | 55.8% | [查看](https://hf.co/spaces/ATLearner/AT_First_agent_template) |
| TraceMind AI | MCP 驱动的 AI 代理评估 | 32.0% | [查看](https://hf.co/spaces/MCP-1st-Birthday/TraceMind) |

### 3. 推荐数据集

用于训练、测试和评估的数据集：

| 数据集名称 | 下载量 | 用途 | 链接 |
|-----------|--------|------|------|
| google-research-datasets/mbpp | 1.2M | Python 编程问题基准测试 | [查看](https://hf.co/datasets/google-research-datasets/mbpp) |
| deepmind/code_contests | 1.2M | 竞赛编程数据集 | [查看](https://hf.co/datasets/deepmind/code_contests) |
| NTU-NLP-sg/xCodeEval | 1.3M | 多语言代码评估 | [查看](https://hf.co/datasets/NTU-NLP-sg/xCodeEval) |

## 集成方案

### 方案一：使用 Hugging Face Inference API

**优点**:
- 无需本地部署模型
- 自动扩展和负载均衡
- 快速集成

**实现步骤**:

1. 安装依赖：
```bash
pnpm add @huggingface/inference
```

2. 创建客户端服务：
```typescript
// server/src/services/huggingface.ts
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_TOKEN);

export async function generateText(prompt: string, model: string = 'Qwen/Qwen2.5-7B-Instruct') {
  const response = await hf.textGeneration({
    model,
    inputs: prompt,
    parameters: {
      max_new_tokens: 500,
      temperature: 0.7,
      top_p: 0.95,
    }
  });
  return response.generated_text;
}

export async function chatCompletion(messages: Array<{role: string, content: string}>) {
  const response = await hf.chatCompletion({
    model: 'Qwen/Qwen2.5-7B-Instruct',
    messages,
    max_tokens: 500,
  });
  return response.choices[0].message;
}
```

3. 创建 API 路由：
```typescript
// server/src/routes/ai.ts
import express from 'express';
import { generateText, chatCompletion } from '../services/huggingface';

const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const { prompt, model } = req.body;
    const result = await generateText(prompt, model);
    res.json({ success: true, text: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const result = await chatCompletion(messages);
    res.json({ success: true, message: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

### 方案二：使用 Transformers.js（客户端推理）

**优点**:
- 完全在浏览器中运行
- 无需服务器成本
- 隐私保护

**实现步骤**:

1. 安装依赖：
```bash
pnpm add @xenova/transformers
```

2. 创建推理 Hook：
```typescript
// client/src/hooks/useHuggingFace.ts
import { pipeline } from '@xenova/transformers';
import { useState, useEffect } from 'react';

export function useTextGeneration(model: string = 'Xenova/LaMini-Flan-T5-783M') {
  const [generator, setGenerator] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pipeline('text2text-generation', model).then((gen) => {
      setGenerator(gen);
      setLoading(false);
    });
  }, [model]);

  const generate = async (prompt: string) => {
    if (!generator) throw new Error('Model not loaded');
    const result = await generator(prompt, {
      max_length: 200,
      temperature: 0.7,
    });
    return result[0].generated_text;
  };

  return { generate, loading };
}
```

### 方案三：混合方案（推荐）

结合服务端和客户端推理：

- **轻量任务**：使用 Transformers.js 在客户端处理
- **重量任务**：使用 Inference API 在服务端处理
- **实时交互**：使用 WebSocket + Streaming API

## 环境变量配置

在项目根目录的 `.env` 文件中添加：

```env
# Hugging Face 配置
HF_TOKEN=your_huggingface_token_here
HF_DEFAULT_MODEL=Qwen/Qwen2.5-7B-Instruct
HF_INFERENCE_ENDPOINT=https://api-inference.huggingface.co

# 可选：自定义推理端点
# HF_CUSTOM_ENDPOINT=https://your-custom-endpoint.com
```

在 `server/.env` 中同样配置：

```env
HF_TOKEN=your_huggingface_token_here
```

## 使用 MCP 集成 Hugging Face

项目已经集成了 MCP (Model Context Protocol)，可以通过 MCP 服务器访问 Hugging Face 资源。

### 可用的 MCP 工具

1. **model_search** - 搜索模型
2. **dataset_search** - 搜索数据集
3. **paper_search** - 搜索研究论文
4. **space_search** - 搜索 Spaces
5. **hub_repo_details** - 获取仓库详情
6. **hf_doc_search** - 搜索文档
7. **hf_doc_fetch** - 获取文档内容
8. **gr1_z_image_turbo_generate** - 生成图像

### 使用示例

```bash
# 搜索模型
manus-mcp-cli tool call model_search --server hugging-face --input '{
  "task": "text-generation",
  "sort": "downloads",
  "limit": 5
}'

# 获取模型详情
manus-mcp-cli tool call hub_repo_details --server hugging-face --input '{
  "repo_ids": ["Qwen/Qwen2.5-7B-Instruct"]
}'
```

## 前端集成示例

### 创建 AI 聊天组件

```typescript
// client/src/components/ai/HuggingFaceChat.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import axios from 'axios';

export function HuggingFaceChat() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/ai/chat', {
        messages: newMessages
      });
      
      setMessages([...newMessages, {
        role: 'assistant',
        content: response.data.message.content
      }]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4 mb-4 h-96 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${
              msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="输入消息..."
          disabled={loading}
        />
        <Button onClick={sendMessage} disabled={loading}>
          {loading ? '发送中...' : '发送'}
        </Button>
      </div>
    </Card>
  );
}
```

### 添加到路由

```typescript
// client/src/App.tsx
import { Route } from 'wouter';
import { HuggingFaceChat } from '@/components/ai/HuggingFaceChat';

// 在路由中添加
<Route path="/ai-chat" component={HuggingFaceChat} />
```

## 性能优化建议

### 1. 模型缓存

```typescript
// 缓存模型实例
const modelCache = new Map();

export async function getCachedModel(modelId: string) {
  if (!modelCache.has(modelId)) {
    const model = await pipeline('text-generation', modelId);
    modelCache.set(modelId, model);
  }
  return modelCache.get(modelId);
}
```

### 2. 请求批处理

```typescript
// 批量处理请求
export class BatchProcessor {
  private queue: Array<{prompt: string, resolve: Function}> = [];
  private processing = false;

  async add(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      this.queue.push({ prompt, resolve });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const batch = this.queue.splice(0, 10); // 每批最多 10 个
    
    const results = await Promise.all(
      batch.map(item => generateText(item.prompt))
    );
    
    batch.forEach((item, idx) => item.resolve(results[idx]));
    this.processing = false;
    
    if (this.queue.length > 0) this.process();
  }
}
```

### 3. 流式响应

```typescript
// 支持流式输出
export async function* streamGeneration(prompt: string) {
  const response = await fetch('https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 500 },
      options: { use_cache: false, wait_for_model: true }
    })
  });

  const reader = response.body?.getReader();
  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield new TextDecoder().decode(value);
  }
}
```

## 监控和日志

### 使用统计

```typescript
// server/src/middleware/hf-analytics.ts
export function trackHFUsage(req: any, res: any, next: any) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log({
      endpoint: req.path,
      model: req.body?.model,
      duration,
      status: res.statusCode,
      timestamp: new Date().toISOString()
    });
  });
  
  next();
}
```

### 错误处理

```typescript
// 统一错误处理
export class HFError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'HFError';
  }
}

export function handleHFError(error: any) {
  if (error.response?.status === 429) {
    throw new HFError('Rate limit exceeded', 429, error.response.data);
  }
  if (error.response?.status === 503) {
    throw new HFError('Model is loading', 503, error.response.data);
  }
  throw new HFError('HuggingFace API error', 500, error);
}
```

## 测试

### 单元测试示例

```typescript
// server/src/services/__tests__/huggingface.test.ts
import { describe, it, expect, vi } from 'vitest';
import { generateText } from '../huggingface';

describe('HuggingFace Service', () => {
  it('should generate text successfully', async () => {
    const result = await generateText('Hello, how are you?');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should handle errors gracefully', async () => {
    await expect(generateText('')).rejects.toThrow();
  });
});
```

## 部署注意事项

### Hugging Face Spaces 配置

1. **Dockerfile 优化**：
```dockerfile
# 添加 HF 依赖
RUN pip install huggingface_hub transformers
```

2. **环境变量设置**：
在 Spaces 设置中添加 `HF_TOKEN` 作为 Secret

3. **资源限制**：
- 免费版：2 CPU, 16GB RAM
- Pro 版：8 CPU, 32GB RAM, GPU 可选

### 成本优化

- 使用较小的模型（如 Qwen3-0.6B）降低推理成本
- 启用缓存减少重复请求
- 使用批处理提高吞吐量
- 考虑使用 Inference Endpoints 获得更好的性能

## 后续开发计划

### 短期目标（1-2 周）

- [ ] 集成 Qwen2.5-7B-Instruct 作为主要对话模型
- [ ] 实现流式响应提升用户体验
- [ ] 添加模型切换功能
- [ ] 完善错误处理和重试机制

### 中期目标（1 个月）

- [ ] 集成多模态模型（Qwen2.5-VL）支持图像理解
- [ ] 实现模型微调功能
- [ ] 添加使用统计和成本监控
- [ ] 优化性能和缓存策略

### 长期目标（3 个月）

- [ ] 支持自定义模型部署
- [ ] 实现分布式推理
- [ ] 添加 A/B 测试框架
- [ ] 构建模型评估系统

## 参考资源

- [Hugging Face 文档](https://huggingface.co/docs)
- [Inference API 文档](https://huggingface.co/docs/api-inference)
- [Transformers.js 文档](https://huggingface.co/docs/transformers.js)
- [Hugging Face Spaces 文档](https://huggingface.co/docs/hub/spaces)

## 联系方式

如有问题或建议，请联系：
- **邮箱**: huzhitao117@outlook.com
- **GitHub Issues**: [jiayi135/ai-team-frontend](https://github.com/jiayi135/ai-team-frontend/issues)

---

**文档版本**: 1.0  
**最后更新**: 2026-02-07  
**维护者**: AI Team
