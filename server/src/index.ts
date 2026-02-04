import express from 'express';
import cors from 'cors';
import { ROLE_CAPABILITIES } from './role_registry';
import { executeTask } from './executor';

const app = express();
const port = 3001; // 后端服务端口

app.use(cors());
app.use(express.json());

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

  if (!role || !goal) {
    return res.status(400).json({ error: 'Role and goal are required.' });
  }

  try {
    const result = await executeTask({ role, goal, context });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
