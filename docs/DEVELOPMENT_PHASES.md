# 开发阶段规划文档

## 项目概述

本文档记录了 AI 团队协作系统前端项目的开发阶段、已完成工作和后续计划，帮助团队成员了解项目进展和开发路线图。

## 项目信息

- **项目名称**: AI 团队协作系统前端 (ai-team-frontend)
- **GitHub 仓库**: jiayi135/ai-team-frontend
- **Hugging Face 部署**: 已部署到 HF Spaces
- **技术栈**: React 18 + Vite + TypeScript + Ant Design + Tailwind CSS
- **后端**: Express + Socket.io + SQLite
- **核心框架**: P.R.O.M.P.T. 元认知框架（详见 [AI_TEAM_CONSTITUTION.md](./AI_TEAM_CONSTITUTION.md)）

## 已完成阶段

### 阶段 1：基础架构搭建 ✅

**完成时间**: 初始阶段

**主要成果**:
- ✅ 项目初始化和构建配置
- ✅ 前后端分离架构
- ✅ TypeScript 类型系统
- ✅ UI 组件库集成（Ant Design + shadcn/ui）
- ✅ 路由系统（Wouter）
- ✅ 状态管理（Zustand）
- ✅ WebSocket 实时通信

**技术细节**:
```
client/
├── src/
│   ├── components/     # UI 组件
│   ├── pages/          # 页面组件
│   ├── hooks/          # 自定义 Hooks
│   ├── contexts/       # Context 提供者
│   └── lib/            # 工具函数

server/
├── src/
│   ├── routes/         # API 路由
│   ├── services/       # 业务逻辑
│   └── index.ts        # 服务器入口
```

### 阶段 2：核心功能实现 ✅

**完成时间**: 主要开发阶段

**主要成果**:
- ✅ 仪表板（Dashboard）- 系统监控和指标展示
- ✅ 任务管理（Tasks）- 任务创建、追踪和管理
- ✅ 角色管理（Roles）- AI 角色配置和能力管理
- ✅ 工具中心（Tools）- 工具发现和管理
- ✅ 技能中心（Skill Center）- 技能库管理
- ✅ 代理控制台（Agent Console）- 实时代理监控
- ✅ 成本管理（Costs）- 使用成本追踪
- ✅ 系统设置（Settings）- 配置管理

**功能模块**:
| 模块 | 路径 | 描述 | 状态 |
|------|------|------|------|
| 首页 | `/` | 系统概览和快速入口 | ✅ |
| 仪表板 | `/dashboard` | 实时监控和数据可视化 | ✅ |
| 任务 | `/tasks` | 任务流程管理 | ✅ |
| 角色 | `/roles` | AI 角色配置 | ✅ |
| 工具 | `/tools` | 工具集成 | ✅ |
| 技能 | `/skills` | 技能库 | ✅ |
| 协商 | `/negotiations` | 多代理协商 | ✅ |
| 代理聊天 | `/agent-chat` | 与代理交互 | ✅ |
| 成本 | `/costs` | 成本分析 | ✅ |
| 搜索 | `/search` | 全局搜索 | ✅ |
| 设置 | `/settings` | 系统配置 | ✅ |

### 阶段 3：Hugging Face 集成规划 🔄

**开始时间**: 2026-02-07

**主要目标**:
- 🔄 集成 Hugging Face Inference API
- 🔄 添加对话模型支持
- 🔄 实现模型切换功能
- 🔄 创建 AI 聊天组件
- 🔄 文档完善

**已完成工作**:
1. ✅ Hugging Face 资源调研
   - 搜索并评估适合的对话模型
   - 发现相关 Spaces 和数据集
   - 确定集成方案

2. ✅ 文档创建
   - 完成 `HUGGINGFACE_INTEGRATION.md` 集成指南
   - 完成 `DEVELOPMENT_PHASES.md` 阶段规划文档
   - 完成 `HF_RESOURCES.md` 资源清单

**推荐模型列表**:
| 模型 | 规模 | 下载量 | 推荐场景 |
|------|------|--------|---------|
| Qwen/Qwen2.5-7B-Instruct | 7B | 10.9M | 主要对话引擎 |
| Qwen/Qwen3-0.6B | 0.6B | 9.6M | 快速响应 |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 7.2M | 多语言支持 |
| openai/gpt-oss-20b | 20B | 6.1M | 高质量生成 |
| Qwen/Qwen2.5-VL-3B-Instruct | 3B | 21.6M | 多模态（图文） |

## 当前阶段：Hugging Face 功能集成

### 待完成任务

#### 优先级 P0（本周完成）

- [ ] **安装 Hugging Face 依赖**
  ```bash
  pnpm add @huggingface/inference
  ```

- [ ] **创建 HF 服务层**
  - 文件：`server/src/services/huggingface.ts`
  - 功能：文本生成、聊天补全、模型管理

- [ ] **添加 API 路由**
  - 文件：`server/src/routes/ai.ts`
  - 端点：`/api/ai/generate`, `/api/ai/chat`

- [ ] **环境变量配置**
  - 在 `.env` 中添加 `HF_TOKEN`
  - 在 `server/.env` 中同步配置

- [ ] **创建前端聊天组件**
  - 文件：`client/src/components/ai/HuggingFaceChat.tsx`
  - 功能：消息发送、接收、显示

#### 优先级 P1（下周完成）

- [ ] **实现流式响应**
  - 支持 Server-Sent Events (SSE)
  - 实时显示生成内容

- [ ] **添加模型选择器**
  - 组件：`ModelSelector.tsx`
  - 支持动态切换模型

- [ ] **错误处理和重试**
  - 统一错误处理中间件
  - 自动重试机制

- [ ] **使用统计和监控**
  - 记录 API 调用次数
  - 追踪响应时间和成本

#### 优先级 P2（两周内完成）

- [ ] **多模态支持**
  - 集成 Qwen2.5-VL 模型
  - 支持图像输入和理解

- [ ] **模型缓存优化**
  - 实现请求缓存
  - 减少重复调用

- [ ] **批处理功能**
  - 支持批量请求
  - 提高吞吐量

- [ ] **单元测试**
  - HF 服务测试
  - API 路由测试
  - 组件测试

## 技术债务

### 需要重构的部分

1. **类型定义**
   - 统一 API 响应类型
   - 完善组件 Props 类型

2. **错误处理**
   - 统一错误处理机制
   - 改进用户错误提示

3. **性能优化**
   - 组件懒加载
   - 图片优化
   - 代码分割

### 已知问题

| 问题 | 优先级 | 状态 | 负责人 |
|------|--------|------|--------|
| WebSocket 重连机制不稳定 | P1 | 待修复 | - |
| 某些页面加载较慢 | P2 | 待优化 | - |
| 移动端适配不完整 | P2 | 待改进 | - |

## 下一阶段规划

### 阶段 4：高级功能开发（2-4 周）

**目标**:
- 完善 Hugging Face 集成
- 添加更多 AI 功能
- 优化用户体验

**计划功能**:
1. **智能助手**
   - 上下文感知对话
   - 多轮对话支持
   - 个性化响应

2. **代码生成**
   - 基于自然语言生成代码
   - 代码解释和优化建议
   - 支持多种编程语言

3. **文档生成**
   - 自动生成技术文档
   - API 文档生成
   - 项目说明生成

4. **数据分析**
   - 自然语言查询数据
   - 自动生成图表
   - 趋势分析和预测

### 阶段 5：企业级功能（1-2 个月）

**目标**:
- 提升系统稳定性
- 增强安全性
- 支持大规模部署

**计划功能**:
1. **用户认证和权限**
   - OAuth 集成
   - 角色权限管理
   - 审计日志

2. **多租户支持**
   - 租户隔离
   - 资源配额管理
   - 计费系统

3. **监控和告警**
   - 性能监控
   - 错误追踪
   - 自动告警

4. **备份和恢复**
   - 自动备份
   - 灾难恢复
   - 数据迁移

## 开发规范

### 代码规范

1. **TypeScript**
   - 严格模式
   - 避免使用 `any`
   - 完善类型定义

2. **组件开发**
   - 使用函数组件
   - Hooks 优先
   - Props 类型定义

3. **命名规范**
   - 组件：PascalCase
   - 函数：camelCase
   - 常量：UPPER_SNAKE_CASE
   - 文件：kebab-case

### Git 工作流

1. **分支策略**
   - `main`: 生产环境
   - `develop`: 开发环境
   - `feature/*`: 功能分支
   - `bugfix/*`: 修复分支

2. **提交规范**
   ```
   <type>(<scope>): <subject>
   
   <body>
   
   <footer>
   ```
   
   类型：
   - `feat`: 新功能
   - `fix`: 修复
   - `docs`: 文档
   - `style`: 格式
   - `refactor`: 重构
   - `test`: 测试
   - `chore`: 构建/工具

3. **代码审查**
   - 所有 PR 需要至少一人审查
   - 通过 CI 检查后才能合并
   - 保持 PR 小而专注

### 测试策略

1. **单元测试**
   - 覆盖率目标：80%+
   - 测试关键业务逻辑
   - 使用 Vitest

2. **集成测试**
   - API 端点测试
   - 数据库操作测试
   - WebSocket 通信测试

3. **E2E 测试**
   - 关键用户流程
   - 使用 Playwright
   - 自动化回归测试

## 部署流程

### 开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 访问
# 前端: http://localhost:5173
# 后端: http://localhost:3000
```

### 生产环境

```bash
# 构建
pnpm build

# 启动
pnpm start
```

### Hugging Face Spaces

1. 推送代码到 GitHub
2. HF Spaces 自动同步
3. 自动构建和部署
4. 访问 Space URL

## 性能指标

### 当前性能

| 指标 | 目标 | 当前 | 状态 |
|------|------|------|------|
| 首屏加载时间 | < 2s | ~2.5s | ⚠️ 需优化 |
| API 响应时间 | < 500ms | ~300ms | ✅ 良好 |
| WebSocket 延迟 | < 100ms | ~80ms | ✅ 良好 |
| 构建大小 | < 500KB | ~650KB | ⚠️ 需优化 |

### 优化计划

1. **代码分割**
   - 按路由分割
   - 动态导入组件
   - 预加载关键资源

2. **资源优化**
   - 图片压缩和懒加载
   - 字体子集化
   - CSS 压缩

3. **缓存策略**
   - Service Worker
   - HTTP 缓存
   - 状态持久化

## 团队协作

### 沟通渠道

- **GitHub Issues**: 问题追踪和功能请求
- **GitHub Discussions**: 技术讨论
- **Pull Requests**: 代码审查

### 文档维护

- 每个新功能都需要更新相关文档
- 定期审查和更新技术文档
- 保持 README 和 CHANGELOG 最新

### 知识分享

- 定期技术分享会
- 代码审查中的知识传递
- 文档化最佳实践

## 资源链接

### 项目资源

- [GitHub 仓库](https://github.com/jiayi135/ai-team-frontend)
- [Hugging Face Space](https://huggingface.co/spaces/jiayi135/ai-team-frontend)
- [Hugging Face 集成指南](./HUGGINGFACE_INTEGRATION.md)
- [资源清单](./HF_RESOURCES.md)

### 技术文档

- [React 文档](https://react.dev/)
- [Vite 文档](https://vitejs.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Ant Design 文档](https://ant.design/)
- [Hugging Face 文档](https://huggingface.co/docs)

### 学习资源

- [Hugging Face Course](https://huggingface.co/learn)
- [React Patterns](https://reactpatterns.com/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

## 更新日志

### 2026-02-07

**新增**:
- ✅ 创建 Hugging Face 集成指南文档
- ✅ 创建开发阶段规划文档
- ✅ 创建资源清单文档
- ✅ 完成 HF 资源调研

**计划**:
- 🔄 开始 HF API 集成开发
- 🔄 实现基础聊天功能

---

**文档版本**: 1.0  
**最后更新**: 2026-02-07  
**维护者**: AI Team  
**下次审查**: 2026-02-14
