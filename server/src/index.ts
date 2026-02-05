import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { ROLE_CAPABILITIES } from './role_registry';
import { TaskOrchestrator } from './task_orchestrator';
import { initializeDatabase } from './database';
import { createLogger } from './logger';
import { negotiationEngine, ConflictDimension } from './negotiation_engine';
import { healthMonitor } from './health_monitor';
import { costTracker } from './cost_tracker';
import { webSearchService } from './web_search';

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

// Initialize NegotiationEngine with Socket.io
negotiationEngine.setSocketIO(io);
negotiationEngine.initializeSampleData();

// Initialize HealthMonitor with sample data
healthMonitor.initializeSampleAuditLogs();

// Initialize database
initializeDatabase().then(() => {
  logger.info('Database initialized successfully.');
}).catch(err => {
  logger.error('Failed to initialize database:', err);
  process.exit(1);
});

// ============================================
// Role API Routes
// ============================================
app.get('/api/roles/capabilities', (req, res) => {
  res.json(ROLE_CAPABILITIES);
});

app.get('/api/roles/:roleName/capabilities', (req, res) => {
  const roleName = req.params.roleName;
  const capabilities = ROLE_CAPABILITIES[roleName as keyof typeof ROLE_CAPABILITIES];
  if (capabilities) {
    res.json(capabilities);
  } else {
    res.status(404).json({ error: 'Role capabilities not found' });
  }
});

// ============================================
// Task API Routes
// ============================================
app.post('/api/execute/task', async (req, res) => {
  const { role, goal, context } = req.body;
  try {
    const task = await taskOrchestrator.createTask(goal, role, context);
    
    // Log audit entry
    healthMonitor.logAudit(
      '任务创建',
      role,
      'success',
      `创建新任务: ${goal}`,
      'Article I: 目标定义'
    );
    
    res.json({ success: true, taskId: task.id });
  } catch (error: any) {
    healthMonitor.logAudit(
      '任务创建失败',
      'System',
      'error',
      error.message
    );
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

// ============================================
// Negotiation API Routes (Article III)
// ============================================
app.get('/api/negotiations', (req, res) => {
  try {
    const negotiations = negotiationEngine.getAllNegotiations();
    res.json({ success: true, negotiations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/negotiations/active', (req, res) => {
  try {
    const negotiations = negotiationEngine.getActiveNegotiations();
    res.json({ success: true, negotiations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/negotiations/:id', (req, res) => {
  try {
    const negotiation = negotiationEngine.getNegotiation(req.params.id);
    if (negotiation) {
      res.json({ success: true, negotiation });
    } else {
      res.status(404).json({ success: false, error: 'Negotiation not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/negotiations', (req, res) => {
  try {
    const { title, description, conflicts, participants, taskId } = req.body;
    
    // 转换冲突维度
    const typedConflicts = conflicts.map((c: any) => ({
      dimension: c.dimension as ConflictDimension,
      severity: c.severity,
      description: c.description
    }));
    
    const negotiation = negotiationEngine.createNegotiation(
      title,
      description,
      typedConflicts,
      participants,
      taskId
    );
    
    healthMonitor.logAudit(
      '协商创建',
      'System',
      'success',
      `创建新协商: ${title}`,
      'Article III: 自主协商协议'
    );
    
    res.json({ success: true, negotiation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/negotiations/:id/start', async (req, res) => {
  try {
    const negotiation = await negotiationEngine.startNegotiation(req.params.id);
    
    healthMonitor.logAudit(
      '协商开始',
      'System',
      'success',
      `协商 ${req.params.id} 已开始`,
      'Article III: 四层协商协议栈'
    );
    
    res.json({ success: true, negotiation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/negotiations/:id/debate', async (req, res) => {
  try {
    const { agent, argument, evidence } = req.body;
    const negotiation = await negotiationEngine.submitDebate(
      req.params.id,
      agent,
      argument,
      evidence
    );
    
    healthMonitor.logAudit(
      '辩论提交',
      agent,
      'success',
      `${agent} 在协商 ${req.params.id} 中提交论点`,
      'Article III: 多轮辩论机制'
    );
    
    res.json({ success: true, negotiation });
  } catch (error: any) {
    healthMonitor.logAudit(
      '辩论提交失败',
      req.body.agent || 'Unknown',
      'error',
      error.message,
      'Article III: 自主协商协议'
    );
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Cost API Routes (Article III: Economic Safeguards)
// ============================================
app.get('/api/costs/summary', (req, res) => {
  try {
    const summary = costTracker.getCostSummary();
    res.json({ success: true, ...summary });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/costs/by-provider', (req, res) => {
  try {
    const data = costTracker.getCostByProvider();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/costs/by-category', (req, res) => {
  try {
    const data = costTracker.getCostByCategory();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/costs/history', (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const data = costTracker.getCostHistory(days);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/costs/alerts', (req, res) => {
  try {
    const alerts = costTracker.getAlerts();
    res.json({ success: true, alerts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/costs/track', (req, res) => {
  try {
    const { provider, model, category, tokens, cost, taskId, negotiationId } = req.body;
    const entry = costTracker.trackCost(provider, model, category, tokens, cost, taskId, negotiationId);
    res.json({ success: true, entry });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Health API Routes (Article IV: Observability)
// ============================================
app.get('/api/health/services', (req, res) => {
  try {
    const services = healthMonitor.getServicesHealth();
    res.json({ success: true, services });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/health/summary', (req, res) => {
  try {
    const summary = healthMonitor.getHealthSummary();
    res.json({ success: true, ...summary });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/health/metrics', (req, res) => {
  try {
    const metrics = healthMonitor.getSystemMetrics();
    res.json({ success: true, metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/health/audit-logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = healthMonitor.getAuditLogs(limit);
    res.json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Web Search API Routes (互联网搜索功能)
// ============================================
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    const maxResults = parseInt(req.query.limit as string) || 10;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ success: false, error: 'Query parameter "q" is required' });
    }
    
    const searchResponse = await webSearchService.search(query, maxResults);
    
    // 记录搜索历史
    webSearchService.recordSearch(query, searchResponse.results.length);
    
    // 记录审计日志
    healthMonitor.logAudit(
      '互联网搜索',
      'System',
      searchResponse.success ? 'success' : 'warning',
      `搜索查询: "${query}" - 返回 ${searchResponse.results.length} 条结果`,
      'Article V: 知识获取'
    );
    
    res.json(searchResponse);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/search/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const history = webSearchService.getSearchHistory(limit);
    res.json({ success: true, history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Production Static Files
// ============================================
if (isProduction) {
  const publicPath = path.resolve(__dirname, '../../dist/public');
  app.use(express.static(publicPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
  logger.info('Serving static files from:', publicPath);
}

// ============================================
// Socket.io Connection
// ============================================
io.on('connection', (socket) => {
  logger.info('User connected', { socketId: socket.id });
  
  // 发送初始数据
  socket.emit('initial_data', {
    negotiations: negotiationEngine.getAllNegotiations(),
    healthSummary: healthMonitor.getHealthSummary(),
    costSummary: costTracker.getCostSummary()
  });
  
  socket.on('disconnect', () => {
    logger.info('User disconnected', { socketId: socket.id });
  });
});

// ============================================
// Server Start
// ============================================
httpServer.listen(port, () => {
  logger.info(`Server running on port ${port} [Mode: ${process.env.NODE_ENV || 'development'}]`);
  logger.info('API Endpoints available:', {
    roles: '/api/roles/*',
    tasks: '/api/tasks, /api/execute/task',
    negotiations: '/api/negotiations/*',
    costs: '/api/costs/*',
    health: '/api/health/*',
    search: '/api/search'
  });
});
