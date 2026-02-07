---
title: AI Team Governance Dashboard
emoji: 🤖
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

# AI 团队协作系统前端

这是一个现代化、响应式、功能完整的 Web 前端界面，用于管理、监控和交互自主迭代 AI 团队系统。

## 核心框架

本项目基于 **P.R.O.M.P.T. 元认知框架**构建，实现了自主迭代和自我优化的 AI 团队协作系统。

P.R.O.M.P.T. 代表：
- **P**urpose（目标定义）- 深入理解任务意图
- **R**ole（角色与边界）- 专业化分工和边界管理
- **O**peration（操作与结构）- 结构化输出和工作流
- **M**edia（上下文与探索）- 深度信息挖掘
- **P**lanned（迭代规划）- 预期性思考和路径规划
- **T**racing（追溯与验证）- 证据链和审计追踪

详细了解框架：[AI Team Constitution](./docs/AI_TEAM_CONSTITUTION.md)

## 技术栈

- **框架**: React 18
- **构建工具**: Vite
- **UI 组件库**: Ant Design 5 + shadcn/ui
- **图表**: Recharts
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **通信**: Axios & Socket.io
- **AI 集成**: Hugging Face + MCP

## 功能模块

- **仪表板**: 全景监控系统运行状态、成本和实时指标
- **任务管理**: 可视化任务流程，支持实时进度追踪
- **角色管理**: 管理 AI 代理角色（Architect、Developer、Tester 等）
- **工具中心**: 集成和管理外部工具和服务
- **技能中心**: AI 技能库管理和学习
- **协商系统**: 多代理自主协商和共识达成
- **成本追踪**: 实时监控 API 调用成本
- **系统配置**: 灵活调整模型映射、预算和 API 密钥

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 同时启动前端和后端
pnpm dev

# 或分别启动
pnpm dev:frontend  # 前端开发服务器
pnpm dev:backend   # 后端开发服务器
```

### 构建生产版本

```bash
pnpm build
```

### 启动生产服务器

```bash
pnpm start
```

## 环境变量

在 `.env` 文件中配置：

```env
# 后端 API 地址
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000

# Hugging Face 配置
HF_TOKEN=your_huggingface_token_here
HF_DEFAULT_MODEL=Qwen/Qwen2.5-7B-Instruct
```

## 文档

### 核心文档

- [AI Team Constitution](./docs/AI_TEAM_CONSTITUTION.md) - P.R.O.M.P.T. 框架治理法典
- [Development Phases](./docs/DEVELOPMENT_PHASES.md) - 开发阶段规划和任务清单
- [Hugging Face Integration](./docs/HUGGINGFACE_INTEGRATION.md) - HF 集成指南和最佳实践
- [HF Resources](./docs/HF_RESOURCES.md) - 推荐模型、数据集和工具清单

### 其他文档

- [Development Plan](./DEVELOPMENT_PLAN.md) - 详细开发计划
- [Fix Analysis](./FIX_ANALYSIS.md) - 问题修复分析
- [Neuraxis Analysis](./neuraxis_frontend_backend_analysis.md) - 前后端架构分析

## 项目结构

```
ai-team-frontend/
├── client/                 # 前端代码
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── pages/         # 页面组件
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── contexts/      # Context 提供者
│   │   └── lib/           # 工具函数
│   └── public/            # 静态资源
├── server/                # 后端代码
│   └── src/
│       ├── routes/        # API 路由
│       └── services/      # 业务逻辑
├── shared/                # 共享代码
├── docs/                  # 项目文档
└── patches/               # 依赖补丁

```

## 核心特性

### 1. 多角色 AI 代理系统

基于 P.R.O.M.P.T. 框架实现的专业化角色分工：

- **Architect** - 系统架构设计
- **Developer** - 代码实现
- **Algorithm Expert** - 算法优化
- **Tester** - 质量保证
- **Arbitration Expert** - 技术仲裁

### 2. 自主协商机制

实现多代理之间的自主协商和共识达成：

- 多轮结构化辩论
- 共识分数计算
- 专家仲裁升级
- 防死锁保障机制

### 3. Hugging Face 集成

通过 MCP 协议集成 Hugging Face 生态：

- 模型搜索和评估
- 数据集发现
- 研究论文检索
- Spaces 参考学习

### 4. 实时协作

基于 WebSocket 的实时通信：

- 任务状态实时更新
- 代理协作实时监控
- 成本追踪实时显示
- 系统健康实时监控

### 5. 成本管理

完整的 API 调用成本追踪：

- 实时成本计算
- 预算管理
- 成本分析和优化建议
- 多维度成本报表

## 开发规范

### 代码风格

项目使用 Prettier 进行代码格式化：

```bash
pnpm format
```

### 类型检查

使用 TypeScript 进行严格的类型检查：

```bash
pnpm check
```

### 提交规范

遵循 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型包括：
- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档
- `style`: 格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

## 部署

### Hugging Face Spaces

项目已配置为可直接部署到 Hugging Face Spaces：

1. 推送代码到 GitHub
2. 在 HF Spaces 中连接 GitHub 仓库
3. 配置环境变量（HF_TOKEN 等）
4. 自动构建和部署

### Docker 部署

使用提供的 Dockerfile：

```bash
docker build -t ai-team-frontend .
docker run -p 3000:3000 ai-team-frontend
```

## 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License

## 联系方式

- **GitHub**: [jiayi135/ai-team-frontend](https://github.com/jiayi135/ai-team-frontend)
- **Hugging Face**: [jiayi135/ai-team-frontend](https://huggingface.co/spaces/jiayi135/ai-team-frontend)
- **邮箱**: huzhitao117@outlook.com

## 致谢

- 基于 [P.R.O.M.P.T. Meta-Cognitive Framework](./docs/AI_TEAM_CONSTITUTION.md)
- 集成 [Hugging Face](https://huggingface.co/) 生态
- 使用 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)

---

**让 AI 团队自主协作、自我进化！** 🚀
