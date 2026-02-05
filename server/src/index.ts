import express from 'express';
import cors from 'cors';
import path from 'path';
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
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

// Initialize TaskOrchestrator
const taskOrchestrator = new TaskOrchestrator(io);

// Initialize database
initializeDatabase().then(() => {
  logger.info('Database initialized successfully.');
}).catch(err => {
  logger.error('Failed to initialize database:', err);
  process.exit(1);
});

// API Routes
app.get('/api/roles/capabilities', (req, res) => {
  res.json(ROLE_CAPABILITIES);
});

app.post('/api/execute/task', async (req, res) => {
  const { role, goal, context } = req.body;
  try {
    const task = await taskOrchestrator.createTask(goal, role, context);
    res.json({ success: true, taskId: task.id });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/tasks', (req, res) => {
  res.json({ success: true, tasks: taskOrchestrator.getAllTasks() });
});

app.get('/api/task/:taskId', (req, res) => {
  const task = taskOrchestrator.getTask(req.params.taskId);
  if (task) res.json({ success: true, task });
  else res.status(404).json({ success: false, error: 'Task not found' });
});

// Production: Serve static files from the frontend build
if (isProduction) {
  const publicPath = path.resolve(__dirname, '../../dist/public');
  app.use(express.static(publicPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
  logger.info('Serving static files from:', publicPath);
}

// Socket.io connection
io.on('connection', (socket) => {
  logger.info('User connected', { socketId: socket.id });
});

httpServer.listen(port, () => {
  logger.info(`Server running on port ${port} [Mode: ${process.env.NODE_ENV || 'development'}]`);
});
