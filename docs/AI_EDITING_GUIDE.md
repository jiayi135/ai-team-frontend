# AI 编辑优化指南

**目的**：提高 AI 编辑效率，避免重复检查文件，减少 token 消耗

---

## 🎯 核心原则

### 1. 信任上下文，减少验证

**❌ 低效做法**：
```
每次编辑前都先 read 文件检查内容
编辑后再 read 文件验证结果
反复确认文件是否存在
```

**✅ 高效做法**：
```
直接使用 edit 工具进行修改
只在必要时 read 文件（如首次接触或复杂修改）
相信工具的执行结果
```

### 2. 批量操作，减少往返

**❌ 低效做法**：
```
修改文件 A → 检查 → 修改文件 B → 检查 → 修改文件 C → 检查
```

**✅ 高效做法**：
```
一次性修改文件 A、B、C → 最后统一验证
使用 edit 的多个 edits 一次性完成多处修改
```

### 3. 明确目标，直接执行

**❌ 低效做法**：
```
"让我先看看文件内容..."
"我需要确认一下..."
"让我检查一下是否成功..."
```

**✅ 高效做法**：
```
"现在修改文件 X 的 Y 部分"
"添加 Z 功能到文件 A"
"直接执行，完成后报告结果"
```

---

## 📝 具体场景指南

### 场景 1：修改已知文件

**任务**：修改 `server/src/index.ts` 添加新的 API 路由

**❌ 低效流程**：
```bash
1. file read server/src/index.ts  # 检查文件
2. file edit server/src/index.ts  # 修改文件
3. file read server/src/index.ts  # 验证修改
```
**Token 消耗**：~3000 tokens

**✅ 高效流程**：
```bash
1. file edit server/src/index.ts  # 直接修改
```
**Token 消耗**：~500 tokens

**提示词**：
```
直接在 server/src/index.ts 中添加新的 API 路由 /api/workflow/execute，
无需先读取文件内容。
```

---

### 场景 2：批量修改多个文件

**任务**：更新 3 个组件文件的样式

**❌ 低效流程**：
```bash
1. file read ComponentA.tsx
2. file edit ComponentA.tsx
3. file read ComponentA.tsx  # 验证
4. file read ComponentB.tsx
5. file edit ComponentB.tsx
6. file read ComponentB.tsx  # 验证
7. file read ComponentC.tsx
8. file edit ComponentC.tsx
9. file read ComponentC.tsx  # 验证
```
**Token 消耗**：~9000 tokens

**✅ 高效流程**：
```bash
1. file edit ComponentA.tsx
2. file edit ComponentB.tsx
3. file edit ComponentC.tsx
4. shell exec "pnpm run build"  # 统一验证
```
**Token 消耗**：~1500 tokens

**提示词**：
```
批量修改以下 3 个文件的样式，无需逐个验证：
- ComponentA.tsx: 修改主色调
- ComponentB.tsx: 修改主色调
- ComponentC.tsx: 修改主色调
最后通过构建验证即可。
```

---

### 场景 3：添加新文件

**任务**：创建新的工作流文件

**❌ 低效流程**：
```bash
1. shell exec "ls server/src/"  # 检查目录
2. file write server/src/workflow.ts
3. file read server/src/workflow.ts  # 验证内容
4. shell exec "ls server/src/"  # 确认文件创建
```
**Token 消耗**：~2000 tokens

**✅ 高效流程**：
```bash
1. file write server/src/workflow.ts
```
**Token 消耗**：~500 tokens

**提示词**：
```
创建新文件 server/src/workflow.ts，包含多 Agent 工作流实现。
文件会自动创建，无需验证。
```

---

### 场景 4：Git 操作

**任务**：提交代码到 GitHub

**❌ 低效流程**：
```bash
1. shell exec "git status"  # 查看状态
2. shell exec "git add -A"
3. shell exec "git status"  # 再次查看
4. shell exec "git commit -m 'xxx'"
5. shell exec "git log -1"  # 验证提交
6. shell exec "git push"
7. shell exec "git log -1"  # 验证推送
```
**Token 消耗**：~1500 tokens

**✅ 高效流程**：
```bash
1. shell exec "git add -A && git commit -m 'xxx' && git push"
```
**Token 消耗**：~300 tokens

**提示词**：
```
一次性完成 Git 提交和推送：
git add -A && git commit -m "feat: add workflow" && git push origin master
```

---

## 🚀 最佳实践提示词模板

### 模板 1：文件修改

```
【任务】修改 {文件路径}
【操作】{具体修改内容}
【要求】直接执行，无需验证
【原因】文件已存在，内容明确
```

**示例**：
```
【任务】修改 server/src/index.ts
【操作】在第 50 行后添加新的 API 路由 /api/test
【要求】直接执行，无需验证
【原因】文件已存在，位置明确
```

---

### 模板 2：批量操作

```
【任务】批量修改以下文件
【文件列表】
  1. {文件1}: {修改内容1}
  2. {文件2}: {修改内容2}
  3. {文件3}: {修改内容3}
【要求】连续执行，最后统一验证
【验证方式】{构建/测试命令}
```

**示例**：
```
【任务】批量修改以下文件
【文件列表】
  1. Home.tsx: 修改主色调为 #6366F1
  2. Chat.tsx: 修改主色调为 #6366F1
  3. App.tsx: 修改主色调为 #6366F1
【要求】连续执行，最后统一验证
【验证方式】pnpm run build
```

---

### 模板 3：新功能开发

```
【任务】实现 {功能名称}
【步骤】
  1. 创建 {文件1}
  2. 修改 {文件2}
  3. 更新 {文件3}
【要求】流程化执行，减少中间验证
【最终验证】{测试方法}
```

**示例**：
```
【任务】实现多 Agent 工作流
【步骤】
  1. 创建 server/src/multi_agent_workflow.ts
  2. 修改 server/src/index.ts 添加 API 路由
  3. 更新 .env 添加配置
【要求】流程化执行，减少中间验证
【最终验证】curl 测试 API
```

---

### 模板 4：部署流程

```
【任务】部署到 {平台}
【流程】
  1. 构建: {构建命令}
  2. 提交: {Git 命令}
  3. 推送: {推送命令}
【要求】一次性完成，使用 && 连接命令
【验证】查看 {平台} 日志
```

**示例**：
```
【任务】部署到 GitHub
【流程】
  1. 构建: pnpm run build
  2. 提交: git add -A && git commit -m "feat: xxx"
  3. 推送: git push origin master
【要求】一次性完成，使用 && 连接命令
【验证】查看 GitHub Actions 日志
```

---

## 💡 高效命令技巧

### 1. 使用命令链接

```bash
# ❌ 低效
git add -A
git commit -m "update"
git push

# ✅ 高效
git add -A && git commit -m "update" && git push origin master
```

### 2. 使用管道和重定向

```bash
# ❌ 低效
pnpm run build
cat build.log

# ✅ 高效
pnpm run build 2>&1 | tail -20
```

### 3. 使用后台执行

```bash
# ❌ 低效（阻塞）
node server.js
# 等待...

# ✅ 高效
node server.js > server.log 2>&1 &
sleep 2 && cat server.log | head -10
```

---

## 📊 效率对比

| 场景 | 低效方式 Token | 高效方式 Token | 节省比例 |
|------|---------------|---------------|---------|
| 单文件修改 | ~3000 | ~500 | 83% |
| 批量修改（3个文件） | ~9000 | ~1500 | 83% |
| 新建文件 | ~2000 | ~500 | 75% |
| Git 操作 | ~1500 | ~300 | 80% |
| **平均节省** | - | - | **80%** |

---

## 🎯 给 AI 的明确指令

### 指令 1：信任工具

```
在执行文件操作时，信任工具的执行结果。
除非遇到错误，否则不需要读取文件验证。
工具会返回执行状态，根据状态判断即可。
```

### 指令 2：批量思维

```
对于多个相似操作，采用批量处理方式。
先规划所有步骤，然后连续执行。
只在关键节点进行验证（如构建、测试）。
```

### 指令 3：命令优化

```
优先使用命令链接（&&）、管道（|）、重定向（>）。
减少命令执行次数，提高效率。
后台执行长时间任务，避免阻塞。
```

### 指令 4：结果导向

```
关注最终结果，而非中间过程。
最终验证方式：构建成功、测试通过、部署正常。
中间步骤的小错误可以在最终验证时发现。
```

---

## 📋 快速检查清单

在开始任务前，问自己：

- [ ] 这个文件是否已经在上下文中？（是 → 直接 edit）
- [ ] 是否需要修改多个文件？（是 → 批量操作）
- [ ] 是否可以用命令链接？（是 → 使用 &&）
- [ ] 验证是否可以延后？（是 → 最后统一验证）
- [ ] 是否真的需要读取文件？（否 → 直接执行）

---

## 🚀 实战示例

### 示例 1：完整的功能开发流程

**任务**：添加新的 API 端点并测试

**高效执行**：
```
1. file edit server/src/index.ts
   添加 API 路由

2. file write server/src/handler.ts
   创建处理函数

3. shell exec "cd /path && pnpm run build && node dist/index.js > server.log 2>&1 &"
   构建并启动服务器

4. shell exec "sleep 3 && curl http://localhost:7860/api/test"
   测试 API

5. shell exec "git add -A && git commit -m 'feat: add test API' && git push"
   提交代码
```

**Token 节省**：从 ~8000 降至 ~2000（节省 75%）

---

### 示例 2：批量样式更新

**任务**：更新 5 个组件的主题色

**高效执行**：
```
1. file edit client/src/components/Header.tsx
2. file edit client/src/components/Footer.tsx
3. file edit client/src/components/Sidebar.tsx
4. file edit client/src/components/Card.tsx
5. file edit client/src/components/Button.tsx
6. shell exec "cd /path && pnpm run build"
   统一验证
```

**Token 节省**：从 ~15000 降至 ~3000（节省 80%）

---

## 💬 与 AI 对话的最佳方式

### ❌ 低效对话

```
用户：修改 Home.tsx 的样式
AI：好的，让我先看看文件内容...
AI：[读取文件]
AI：我看到了，现在修改...
AI：[修改文件]
AI：让我验证一下修改是否成功...
AI：[再次读取文件]
AI：修改成功！
```

### ✅ 高效对话

```
用户：直接修改 Home.tsx 的主色调为 #6366F1，无需验证
AI：[修改文件]
AI：已完成修改
```

---

## 🎓 总结

**核心思想**：
1. **信任工具**：工具返回的状态就是真实状态
2. **批量操作**：减少往返次数
3. **延迟验证**：在关键节点统一验证
4. **命令优化**：使用链接、管道、后台执行

**预期效果**：
- Token 消耗减少 70-85%
- 执行速度提升 3-5 倍
- 用户体验更流畅

**记住**：
> 效率来自信任，信任来自理解工具的可靠性。

---

**最后更新**：2026-02-07  
**维护者**：AI Team
