import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { initTaskOrchestrator, taskOrchestrator } from './task_orchestrator';
import { createLogger } from './logger';
import { negotiationEngine, ConflictDimension } from './negotiation_engine';
import { healthMonitor } from './health_monitor';
import { costTracker } from './cost_tracker';
import { webSearchService } from './web_search';
import { llmFactory } from './llm_factory';
import { PromptGenerator } from './prompt_generator';
import mcpRoutes from './mcp_routes';
import { mcpDiscovery } from './mcp_discovery';
import { McpClient } from './mcp_client';

const logger = createLogger('Server');
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

// Initialize Task Orchestrator with Socket.io
initTaskOrchestrator(io);

app.use(cors());
app.use(express.json());

// Serve static files from the frontend build directory
const distPath = path.resolve(__dirname, '../dist/public');
logger.info('Static files path', { distPath, __dirname });
app.use(express.static(distPath));

// ============================================
// Task API Routes
// ============================================
app.post('/api/execute/task', async (req, res) => {
  const { role, goal, context, config } = req.body;
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

    // 如果提供了 LLM 配置，则尝试进行真实调用
    if (config && config.apiKey) {
      logger.info('Executing real LLM task', { role, goal });
      
      const client = llmFactory.getClient({
        provider: config.provider || 'openai',
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        modelName: config.modelName || 'gpt-4o'
      });

      const systemPrompt = PromptGenerator.generateSystemPrompt(role);
      const userPrompt = PromptGenerator.generateUserPrompt({ role, goal });

      // 异步执行，不阻塞响应
      (async () => {
        try {
          const response = await client.chat([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]);

          // 记录成本
          costTracker.trackCost(
            config.provider,
            config.modelName,
            'task_execution',
            response.usage.totalTokens,
            response.usage.cost,
            task.id
          );

          // 记录审计日志
          healthMonitor.logAudit(
            '任务执行',
            role,
            'success',
            `任务 "${goal.substring(0, 20)}..." 执行成功`,
            'Article II: 角色执行'
          );
        } catch (err: any) {
          logger.error('Background task execution failed', { taskId: task.id, error: err.message });
        }
      })();
    }
    
    res.json({ success: true, taskId: task.id });
  } catch (error: any) {
    healthMonitor.logAudit(
      '任务创建失败',
      role,
      'error',
      `任务创建失败: ${error.message}`,
      'Article I: 目标定义'
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

app.post('/api/negotiations/start', (req, res) => {
  try {
    const { title, participants, dimensions } = req.body;
    const negotiation = negotiationEngine.startNegotiation(title, participants, dimensions);
    res.json({ success: true, negotiation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Cost API Routes (Article III)
// ============================================
app.get('/api/costs/summary', (req, res) => {
  res.json({ success: true, ...costTracker.getCostSummary() });
});

app.get('/api/costs/by-provider', (req, res) => {
  res.json({ success: true, data: costTracker.getCostByProvider() });
});

app.get('/api/costs/by-category', (req, res) => {
  res.json({ success: true, data: costTracker.getCostByCategory() });
});

app.get('/api/costs/history', (req, res) => {
  const days = parseInt(req.query.days as string) || 30;
  res.json({ success: true, data: costTracker.getCostHistory(days) });
});

app.get('/api/costs/alerts', (req, res) => {
  res.json({ success: true, alerts: costTracker.getAlerts() });
});

// ============================================
// Health & Audit API Routes (Article IV)
// ============================================
app.get('/api/health/status', (req, res) => {
  res.json({ success: true, status: healthMonitor.getSystemStatus() });
});

app.get('/api/health/audit-logs', (req, res) => {
  res.json({ success: true, logs: healthMonitor.getAuditLogs() });
});

// ============================================
// MCP & Governance Routes
// ============================================
app.use('/api/mcp', mcpRoutes);
app.use('/api/governance', mcpRoutes);

// --- MCP Port & Status Routes ---
app.get('/api/mcp/status', (req, res) => {
  res.json({
    success: true,
    port: 8330,
    status: 'connected',
    servers: [
      { id: 'huggingface', name: 'Hugging Face MCP', status: 'online' },
      { id: 'cloudflare', name: 'Cloudflare MCP', status: 'online' }
    ],
    timestamp: new Date().toISOString()
  });
});

// Additional MCP Tools API Routes for Frontend
app.get('/api/mcp-tools', async (req, res) => {
  try {
    await mcpDiscovery.discoverAll();
    const tools = mcpDiscovery.getAvailableTools();
    res.json({ success: true, tools });
  } catch (error: any) {
    logger.error('Failed to list MCP tools', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/mcp-tools/call', async (req, res) => {
  try {
    const { toolName, server, inputArgs } = req.body;
    if (!toolName || !server) {
      return res.status(400).json({ success: false, error: 'toolName and server are required' });
    }
    const client = new McpClient(server);
    const result = await client.callTool(toolName, inputArgs || {});
    res.json({ success: true, result });
  } catch (error: any) {
    logger.error('Failed to call MCP tool', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Tool Generation API
app.post('/api/tools/generate', async (req, res) => {
  const { prompt, role = 'Developer', context = '' } = req.body;
  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Prompt is required' });
  }

  try {
    const { executeTask } = await import('./executor');
    const result = await executeTask({
      role,
      goal: `Generate a tool or workflow for: ${prompt}`,
      context: `User request for tool generation. ${context}`
    });
    res.json(result);
  } catch (error: any) {
    logger.error('Failed to generate tool', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Web Search API Routes (Article V)
// ============================================
app.get('/api/search', async (req, res) => {
  const query = req.query.q as string;
  const limit = parseInt(req.query.limit as string) || 10;
  
  if (!query) {
    return res.status(400).json({ success: false, error: 'Query is required' });
  }

  try {
    const results = await webSearchService.search(query, limit);
    res.json({ success: true, query, results: results.results, totalResults: results.totalResults, searchTime: results.searchTime });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/search/history', (req, res) => {
  res.json({ success: true, history: webSearchService.getSearchHistory() });
});

// ============================================
// Socket.io Integration
// ============================================
io.on('connection', (socket) => {
  logger.info('Client connected', { id: socket.id });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected', { id: socket.id });
  });
});

// Handle SPA routing - send all non-API requests to index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
    const indexPath = path.join(distPath, 'index.html');
    logger.info('Serving index.html', { indexPath });
    res.sendFile(indexPath);
  }
});

const PORT = process.env.PORT || 7860; // Hugging Face Spaces default port is 7860
httpServer.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
