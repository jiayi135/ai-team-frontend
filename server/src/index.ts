import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { ROLE_CAPABILITIES } from './role_registry';
import { TaskOrchestrator } from './task_orchestrator';
import { initializeDatabase } from './database';
import { createLogger } from './logger';

const logger = createLogger('Server');
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for dev
    methods: ["GET", "POST"]
  }
});

const port = 3001;

app.use(cors());
app.use(express.json());

// Initialize TaskOrchestrator with socket.io instance
const taskOrchestrator = new TaskOrchestrator(io);

// Initialize database
initializeDatabase().then(() => {
  logger.info('Database initialized successfully.');
}).catch(err => {
  logger.error('Failed to initialize database:', err);
  process.exit(1);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info('A user connected', { socketId: socket.id });
  
  socket.on('disconnect', () => {
    logger.info('User disconnected', { socketId: socket.id });
  });
});

// API Routes
app.get('/api/roles/capabilities', (req, res) => {
  res.json(ROLE_CAPABILITIES);
});

app.get('/api/roles/:roleName/capabilities', (req, res) => {
  const { roleName } = req.params;
  const capabilities = ROLE_CAPABILITIES[roleName];
  if (capabilities) {
    res.json(capabilities);
  } else {
    res.status(404).json({ message: 'Role capabilities not found' });
  }
});

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

httpServer.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});
