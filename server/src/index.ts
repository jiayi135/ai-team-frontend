import express from 'express';
import cors from 'cors';
import { ROLE_CAPABILITIES } from './role_registry';
import { TaskOrchestrator, TaskStatus } from './task_orchestrator';
import { initializeDatabase } from './database';

const app = express();
const port = 3001; // 后端服务端口

app.use(cors());
app.use(express.json());

const taskOrchestrator = new TaskOrchestrator();

// 初始化数据库
initializeDatabase().then(() => {
  console.log('Database initialized successfully.');
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1); // 数据库初始化失败，退出应用
});

// 获取所有角色能力
app.get('/api/roles/capabilities', (req, res) => {
  res.json(ROLE_CAPABILITIES);
});

// 获取特定角色能力
app.get('/api/roles/:roleName/capabilities', (req, res) => {
  const { roleName } = req.params;
  const capabilities = ROLE_CAPABILITIES[roleName];

  if (capabilities) {
    res.json(capabilities);
  } else {
    res.status(404).json({ message: 'Role capabilities not found' });
  }
});

// 任务执行 API
app.post('/api/execute/task', async (req, res) => {
  const { role, goal, context } = req.body;
  if (!role || !goal || !context) {
    return res.status(400).json({ success: false, error: 'Missing role, goal, or context' });
  }

  try {
    const task = await taskOrchestrator.createTask(goal, role, context);
    res.json({ success: true, taskId: task.id, message: 'Task initiated' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/task/:taskId', (req, res) => {
  const { taskId } = req.params;
  const task = taskOrchestrator.getTask(taskId);
  if (task) {
    res.json({ success: true, task });
  } else {
    res.status(404).json({ success: false, error: 'Task not found' });
  }
});

app.get('/api/tasks', (req, res) => {
  const tasks = taskOrchestrator.getAllTasks();
  res.json({ success: true, tasks });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
