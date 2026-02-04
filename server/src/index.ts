import express from 'express';
import cors from 'cors';
import { ROLE_CAPABILITIES } from './role_registry';

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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
