import { ROLE_PROMPTS } from './prompt_library';
import { Router } from 'express';
import { mcpDiscovery } from './mcp_discovery';
import { McpClient } from './mcp_client';
import { createLogger } from './logger';
import { quotaManager } from './quota_manager';
import { checkpointManager } from './checkpoint';
import { taskOrchestrator } from './task_orchestrator';

const logger = createLogger('McpRoutes');
const router = Router();

// ============================================
// MCP Tool Routes
// ============================================

// List all discovered tools
router.get('/tool/list', async (req, res) => {
  try {
    // Ensure discovery has run at least once
    const tools = mcpDiscovery.getAvailableTools();
    if (tools.length === 0) {
      await mcpDiscovery.discoverAll();
    }
    res.json({ success: true, tools: mcpDiscovery.getAvailableTools() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Call a specific tool
router.post('/tool/call', async (req, res) => {
  const { server, tool, args } = req.body;
  if (!server || !tool) {
    return res.status(400).json({ success: false, error: 'Server and tool name are required' });
  }

  try {
    const client = new McpClient(server);
    const result = await client.callTool(tool, args || {});
    res.json({ success: true, result });
  } catch (error: any) {
    logger.error('MCP Tool Call failed', { server, tool, error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Refresh tool discovery
router.post('/discovery/refresh', async (req, res) => {
  try {
    await mcpDiscovery.discoverAll();
    res.json({ success: true, tools: mcpDiscovery.getAvailableTools() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Quota & Governance Routes
// ============================================

router.get('/quota/status', (req, res) => {
  res.json({
    success: true,
    remainingBudget: quotaManager.getRemainingBudget(),
    totalBudget: 1000.00, // Hardcoded for now matching quota_manager.ts
    spending: 1000.00 - quotaManager.getRemainingBudget()
  });
});

// ============================================
// Checkpoint Routes
// ============================================

router.get('/checkpoints/:taskId', (req, res) => {
  const { taskId } = req.params;
  const phases = ['planning', 'executing', 'testing', 'final'];
  const checkpoints = phases.map(phase => {
    return {
      phase,
      data: checkpointManager.loadCheckpoint(taskId, phase)
    };
  }).filter(cp => cp.data !== null);

  res.json({ success: true, taskId, checkpoints });
});


// Get role system prompts
router.get('/prompts', (req, res) => {
  res.json({ success: true, prompts: ROLE_PROMPTS });
});

export default router;
