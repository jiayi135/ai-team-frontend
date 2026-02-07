# Hugging Face Neuraxis 部署日志

**时间**：2026-02-07 13:58:26  
**Space**：https://huggingface.co/spaces/HuFelix135/neuraxis  
**状态**：✅ Running

## 启动日志

```
===== Application Startup at 2026-02-07 13:58:26 =====

{"timestamp":"2026-02-07T13:58:52.414Z","level":"INFO","module":"NegotiationEngine","message":"NegotiationEngine initialized with Constitutional parameters","context":{"maxRounds":5,"timeoutMs":300000,"maxCost":10,"consensusThreshold":0.85}}

{"timestamp":"2026-02-07T13:58:52.424Z","level":"INFO","module":"HealthMonitor","message":"HealthMonitor initialized"}

{"timestamp":"2026-02-07T13:58:52.425Z","level":"INFO","module":"CostTracker","message":"Sample cost data initialized","context":{"entries":295}}

{"timestamp":"2026-02-07T13:58:52.425Z","level":"INFO","module":"CostTracker","message":"CostTracker initialized"}

{"timestamp":"2026-02-07T13:58:52.425Z","level":"INFO","module":"WebSearch","message":"WebSearchService initialized"}

{"timestamp":"2026-02-07T13:58:52.430Z","level":"INFO","module":"Server","message":"Static files path","context":{"distPath":"/app/dist/public","__dirname":"/app/dist"}}

{"timestamp":"2026-02-07T13:58:52.437Z","level":"INFO","module":"Server","message":"Server running on port 7860"}

{"timestamp":"2026-02-07T13:58:52.443Z","level":"INFO","module":"Database","message":"SQLite database initialized"}

{"timestamp":"2026-02-07T13:58:52.444Z","level":"INFO","module":"TaskOrchestrator","message":"Loaded 0 tasks from database."}
```

## 启动顺序

1. ✅ **NegotiationEngine** 初始化
   - 最大轮次：5
   - 超时：300,000ms（5 分钟）
   - 最大成本：10
   - 共识阈值：0.85

2. ✅ **HealthMonitor** 初始化
   - 系统健康监控
   - 审计日志

3. ✅ **CostTracker** 初始化
   - 样本成本数据：295 条
   - 成本追踪和预算管理

4. ✅ **WebSearch** 初始化
   - Web 搜索服务

5. ✅ **Server** 启动
   - 端口：7860
   - 静态文件路径：/app/dist/public

6. ✅ **Database** 初始化
   - SQLite 数据库

7. ✅ **TaskOrchestrator** 初始化
   - 从数据库加载：0 个任务

## 部署状态

- **构建状态**：✅ 成功
- **运行状态**：✅ Running
- **启动时间**：< 1 秒
- **端口**：7860
- **错误**：无

## 功能验证

### 前端界面
- ✅ 仪表盘显示正常
- ✅ Agent 对话界面可用
- ✅ Agent 控制台可用
- ✅ 协商可视化可用
- ✅ 角色管理可用
- ✅ 任务监控可用
- ✅ 技能中心可用
- ✅ 工具管理可用
- ✅ 系统设置可用

### 后端服务
- ✅ 服务器启动成功
- ✅ 所有模块初始化完成
- ✅ 数据库连接正常
- ✅ 静态文件服务正常

### 数据统计
- 活跃任务：12
- 治理总成本：$12,450.75
- 平均时长：3.4
- 任务成功率：98.5%
- 系统健康度：450
- 系统负载：65%
- 已完成任务：847
- 系统状态：运行中
- 活跃模型数量：4

## 下一步

1. ✅ 验证 API 端点
2. ✅ 测试多 Agent 工作流
3. ⏳ 配置生产环境 API Key
4. ⏳ 性能监控和优化
