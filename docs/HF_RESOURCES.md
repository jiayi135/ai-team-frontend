# Hugging Face 资源清单

本文档汇总了所有与项目相关的 Hugging Face 资源，包括模型、数据集、Spaces 和论文，方便团队成员快速查找和使用。

## 认证信息

**API Token**: 请在环境变量中配置 `HF_TOKEN`  
**账号邮箱**: huzhitao117@outlook.com  
**使用限制**: 根据 HF 免费层级限制

## 推荐模型

### 对话和文本生成模型

#### Qwen/Qwen2.5-7B-Instruct ⭐ 推荐

**基本信息**:
- **模型 ID**: `Qwen/Qwen2.5-7B-Instruct`
- **任务类型**: text-generation
- **库**: transformers
- **下载量**: 10.9M
- **点赞数**: 1059
- **许可证**: Apache 2.0

**特点**:
- 中等规模，性能优秀
- 支持对话和指令跟随
- 英文支持良好
- 适合作为主要对话引擎

**使用场景**:
- AI 代理对话
- 任务规划和执行
- 代码生成和解释
- 文档生成

**链接**: [https://hf.co/Qwen/Qwen2.5-7B-Instruct](https://hf.co/Qwen/Qwen2.5-7B-Instruct)

**使用示例**:
```python
from huggingface_hub import InferenceClient
import os

client = InferenceClient(token=os.getenv('HF_TOKEN'))

response = client.text_generation(
    "Explain what is AI agent",
    model="Qwen/Qwen2.5-7B-Instruct",
    max_new_tokens=200
)
```

---

#### Qwen/Qwen3-0.6B ⚡ 快速

**基本信息**:
- **模型 ID**: `Qwen/Qwen3-0.6B`
- **任务类型**: text-generation
- **库**: transformers
- **下载量**: 9.6M
- **点赞数**: 1050
- **许可证**: Apache 2.0

**特点**:
- 轻量级模型（600M 参数）
- 响应速度快
- 资源消耗低
- 适合实时交互

**使用场景**:
- 快速响应场景
- 简单对话
- 实时建议
- 移动端部署

**链接**: [https://hf.co/Qwen/Qwen3-0.6B](https://hf.co/Qwen/Qwen3-0.6B)

---

#### meta-llama/Llama-3.1-8B-Instruct 🌍 多语言

**基本信息**:
- **模型 ID**: `meta-llama/Llama-3.1-8B-Instruct`
- **任务类型**: text-generation
- **库**: transformers
- **下载量**: 7.2M
- **点赞数**: 5397

**特点**:
- Meta 官方模型
- 支持多语言（英、德、法、意、葡、印地、西、泰）
- 性能强大
- 社区支持好

**使用场景**:
- 国际化需求
- 多语言对话
- 跨语言任务
- 翻译辅助

**链接**: [https://hf.co/meta-llama/Llama-3.1-8B-Instruct](https://hf.co/meta-llama/Llama-3.1-8B-Instruct)

---

#### openai/gpt-oss-20b 🎯 高质量

**基本信息**:
- **模型 ID**: `openai/gpt-oss-20b`
- **任务类型**: text-generation
- **库**: transformers
- **下载量**: 6.1M
- **点赞数**: 4309
- **许可证**: Apache 2.0

**特点**:
- OpenAI 开源实现
- 大规模模型（20B 参数）
- 生成质量高
- 支持 8-bit 量化

**使用场景**:
- 高质量内容生成
- 复杂任务处理
- 创意写作
- 深度分析

**链接**: [https://hf.co/openai/gpt-oss-20b](https://hf.co/openai/gpt-oss-20b)

---

#### Qwen/Qwen2.5-VL-3B-Instruct 🖼️ 多模态

**基本信息**:
- **模型 ID**: `Qwen/Qwen2.5-VL-3B-Instruct`
- **任务类型**: image-text-to-text
- **库**: transformers
- **下载量**: 21.6M
- **点赞数**: 603

**特点**:
- 支持图像和文本输入
- 视觉理解能力强
- 多模态对话
- 图像描述和分析

**使用场景**:
- 图像理解和描述
- 视觉问答
- 图表分析
- 多模态对话

**链接**: [https://hf.co/Qwen/Qwen2.5-VL-3B-Instruct](https://hf.co/Qwen/Qwen2.5-VL-3B-Instruct)

---

### 其他推荐模型

| 模型 ID | 类型 | 下载量 | 特点 | 链接 |
|---------|------|--------|------|------|
| Qwen/Qwen2.5-3B-Instruct | text-generation | 10.5M | 平衡性能和速度 | [查看](https://hf.co/Qwen/Qwen2.5-3B-Instruct) |
| Qwen/Qwen2.5-1.5B-Instruct | text-generation | 6.4M | 超轻量级 | [查看](https://hf.co/Qwen/Qwen2.5-1.5B-Instruct) |
| Qwen/Qwen3-4B | text-generation | 5.2M | 中等规模 | [查看](https://hf.co/Qwen/Qwen3-4B) |
| openai-community/gpt2 | text-generation | 7.4M | 经典模型 | [查看](https://hf.co/openai-community/gpt2) |

## 相关 Spaces

### HLE Leaderboard for Agents with Tools

**基本信息**:
- **Space ID**: `zoom-ai/hle-leaderboard`
- **作者**: zoom-ai
- **类别**: Text Analysis
- **点赞数**: 5
- **相关性**: 73.2%

**描述**: Humanity's Last Exam Leaderboard for LLM Agents with Tools

**用途**:
- 了解 LLM 代理工具的性能排行
- 参考评估标准
- 学习最佳实践

**链接**: [https://hf.co/spaces/zoom-ai/hle-leaderboard](https://hf.co/spaces/zoom-ai/hle-leaderboard)

---

### GroqChatBot

**基本信息**:
- **Space ID**: `hassan773/SageBot`
- **作者**: hassan773
- **类别**: Chatbots
- **点赞数**: 4
- **相关性**: 70.9%

**描述**: 聊天机器人助手实现

**用途**:
- 参考聊天界面设计
- 学习对话流程
- UI/UX 灵感

**链接**: [https://hf.co/spaces/hassan773/SageBot](https://hf.co/spaces/hassan773/SageBot)

---

### First Agent Template

**基本信息**:
- **Space ID**: `ATLearner/AT_First_agent_template`
- **作者**: ATLearner
- **类别**: Code Generation
- **点赞数**: 1
- **相关性**: 55.8%

**描述**: 使用 AI 代理生成自定义代码解决方案

**用途**:
- 代码生成参考
- 代理模板学习
- 工作流设计

**链接**: [https://hf.co/spaces/ATLearner/AT_First_agent_template](https://hf.co/spaces/ATLearner/AT_First_agent_template)

---

### TraceMind AI

**基本信息**:
- **Space ID**: `MCP-1st-Birthday/TraceMind`
- **作者**: MCP-1st-Birthday
- **类别**: Data Visualization
- **点赞数**: 21
- **相关性**: 32.0%

**描述**: 基于 MCP 的 AI 代理评估系统

**用途**:
- MCP 集成参考
- 代理评估方法
- 可视化设计

**链接**: [https://hf.co/spaces/MCP-1st-Birthday/TraceMind](https://hf.co/spaces/MCP-1st-Birthday/TraceMind)

---

### AgentReview

**基本信息**:
- **Space ID**: `Ahren09/AgentReview`
- **作者**: Ahren09
- **类别**: Text Generation
- **点赞数**: 13
- **会议**: EMNLP 2024

**描述**: 代理评审系统

**用途**:
- 学术研究参考
- 评审流程设计
- 质量控制

**链接**: [https://hf.co/spaces/Ahren09/AgentReview](https://hf.co/spaces/Ahren09/AgentReview)

## 推荐数据集

### google-research-datasets/mbpp

**基本信息**:
- **数据集 ID**: `google-research-datasets/mbpp`
- **下载量**: 1.2M
- **点赞数**: 215
- **许可证**: CC-BY-4.0

**描述**: Mostly Basic Python Problems (MBPP) - 包含约 1,000 个众包的 Python 编程问题

**用途**:
- 代码生成训练
- 编程能力评估
- 基准测试

**链接**: [https://hf.co/datasets/google-research-datasets/mbpp](https://hf.co/datasets/google-research-datasets/mbpp)

---

### deepmind/code_contests

**基本信息**:
- **数据集 ID**: `deepmind/code_contests`
- **下载量**: 1.2M
- **点赞数**: 211
- **许可证**: CC-BY-4.0

**描述**: 竞赛编程数据集，用于训练 AlphaCode

**用途**:
- 高级代码生成
- 算法问题求解
- 模型训练

**链接**: [https://hf.co/datasets/deepmind/code_contests](https://hf.co/datasets/deepmind/code_contests)

---

### NTU-NLP-sg/xCodeEval

**基本信息**:
- **数据集 ID**: `NTU-NLP-sg/xCodeEval`
- **下载量**: 1.3M
- **点赞数**: 57
- **许可证**: CC-BY-4.0

**描述**: 多语言代码评估数据集

**用途**:
- 跨语言代码生成
- 多语言支持测试
- 翻译评估

**链接**: [https://hf.co/datasets/NTU-NLP-sg/xCodeEval](https://hf.co/datasets/NTU-NLP-sg/xCodeEval)

---

### huggingface/documentation-images

**基本信息**:
- **数据集 ID**: `huggingface/documentation-images`
- **下载量**: 1.9M
- **点赞数**: 103
- **许可证**: CC-BY-NC-SA-4.0

**描述**: HuggingFace 文档中使用的图像集合

**用途**:
- UI 设计参考
- 图标和插图
- 文档素材

**链接**: [https://hf.co/datasets/huggingface/documentation-images](https://hf.co/datasets/huggingface/documentation-images)

## 相关研究论文

### Geometric Attention: A Regime-Explicit Operator Semantics for Transformer Attention

**基本信息**:
- **发布日期**: 2026-01-10
- **作者**: Luis Rosario Freytes
- **论文 ID**: 2601.11618

**摘要**: 通过四个独立组件定义注意力机制，实现原则性的注意力架构设计和分析

**关键词**: attention layer, carrier, evidence-kernel rule, probe family, anchor/update rule

**相关性**: 理解 Transformer 注意力机制的最新理论

**链接**: [https://hf.co/papers/2601.11618](https://hf.co/papers/2601.11618)

---

### The Shaped Transformer: Attention Models in the Infinite Depth-and-Width Limit

**基本信息**:
- **发布日期**: 2023-06-30
- **作者**: Lorenzo Noci, Chuning Li, Mufan Bill Li, Bobby He, Thomas Hofmann, Chris Maddison, Daniel M. Roy
- **论文 ID**: 2306.17759
- **点赞数**: 4

**摘要**: 改进的 Softmax 注意力模型，在无限深度和宽度下表现出良好的协方差结构和稳定性

**关键词**: covariance matrix, representations, trainability, Transformers

**相关性**: 模型稳定性和可训练性研究

**链接**: [https://hf.co/papers/2306.17759](https://hf.co/papers/2306.17759)

---

### AttentionViz: A Global View of Transformer Attention

**基本信息**:
- **发布日期**: 2023-05-04
- **作者**: Catherine Yeh, Yida Chen, Aoyu Wu, Cynthia Chen, Fernanda Viégas, Martin Wattenberg
- **论文 ID**: 2305.03210
- **点赞数**: 1
- **讨论**: 2 条评论

**摘要**: 交互式可视化工具，用于分析 Transformer 模型中的全局注意力模式

**关键词**: transformer models, self-attention mechanism, interactive visualization tool

**相关性**: 模型可解释性和可视化

**链接**: [https://hf.co/papers/2305.03210](https://hf.co/papers/2305.03210)

## MCP 工具列表

通过 Hugging Face MCP 服务器可用的工具：

### 搜索工具

1. **model_search** - 搜索机器学习模型
   - 参数：query, author, task, library, sort, limit
   - 返回：模型列表及详细信息

2. **dataset_search** - 搜索数据集
   - 参数：query, author, tags, sort, limit
   - 返回：数据集列表及详细信息

3. **paper_search** - 搜索研究论文
   - 参数：query, results_limit, concise_only
   - 返回：论文列表及摘要

4. **space_search** - 搜索 Hugging Face Spaces
   - 参数：query, limit, mcp
   - 返回：Space 列表及相关信息

### 信息获取

5. **hub_repo_details** - 获取仓库详细信息
   - 参数：repo_ids, repo_type
   - 返回：仓库完整信息

6. **hf_doc_search** - 搜索 Hugging Face 文档
   - 参数：query, product
   - 返回：文档搜索结果

7. **hf_doc_fetch** - 获取文档内容
   - 参数：doc_url, offset
   - 返回：文档完整内容

### 生成工具

8. **gr1_z_image_turbo_generate** - 生成图像
   - 参数：prompt, resolution, seed, steps, shift, random_seed
   - 返回：生成的图像

### 认证

9. **hf_whoami** - 查看认证状态
   - 参数：无
   - 返回：用户信息和认证指南

## 使用建议

### 模型选择指南

**场景一：实时对话**
- 推荐：Qwen/Qwen3-0.6B
- 原因：轻量快速，适合实时交互

**场景二：复杂任务**
- 推荐：Qwen/Qwen2.5-7B-Instruct 或 openai/gpt-oss-20b
- 原因：性能强大，理解能力好

**场景三：多语言支持**
- 推荐：meta-llama/Llama-3.1-8B-Instruct
- 原因：原生支持多种语言

**场景四：图像理解**
- 推荐：Qwen/Qwen2.5-VL-3B-Instruct
- 原因：多模态能力

### 成本优化

**策略一：模型分层**
- 简单任务使用小模型（0.6B-1.5B）
- 复杂任务使用大模型（7B-20B）
- 根据任务复杂度动态选择

**策略二：缓存机制**
- 缓存常见查询结果
- 减少重复 API 调用
- 设置合理的缓存过期时间

**策略三：批处理**
- 合并相似请求
- 批量处理提高效率
- 减少 API 调用次数

### 最佳实践

**实践一：错误处理**
- 实现重试机制
- 处理速率限制
- 提供降级方案

**实践二：监控和日志**
- 记录所有 API 调用
- 追踪响应时间
- 分析使用模式

**实践三：安全性**
- 保护 API Token
- 使用环境变量
- 定期轮换密钥

## 更新记录

### 2026-02-07
- ✅ 初始版本创建
- ✅ 添加推荐模型列表
- ✅ 添加相关 Spaces
- ✅ 添加数据集清单
- ✅ 添加研究论文
- ✅ 添加 MCP 工具列表
- ✅ 添加使用建议

---

**文档版本**: 1.0  
**最后更新**: 2026-02-07  
**维护者**: AI Team  
**下次审查**: 2026-02-14
