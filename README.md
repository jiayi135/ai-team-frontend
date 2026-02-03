# AI 团队协作系统前端

这是一个现代化、响应式、功能完整的 Web 前端界面，用于管理、监控和交互自主迭代 AI 团队系统。

## 技术栈

- **框架**: React 18
- **构建工具**: Vite
- **UI 组件库**: Ant Design 5
- **图表**: Recharts
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **通信**: Axios & Socket.io

## 功能模块

- **仪表板**: 全景监控系统运行状态、成本和实时指标。
- **任务管理**: 可视化任务流程，支持实时进度追踪。
- **提供商管理**: 管理和监控所有 AI 服务提供商（OpenAI, Anthropic 等）。
- **系统配置**: 灵活调整模型映射、预算和 API 密钥。

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 环境变量

在 `.env` 文件中配置后端 API 地址：

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```
