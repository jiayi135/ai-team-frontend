import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { McpClient } from './mcp_client';
import { ROLE_CAPABILITIES } from './role_registry';
import { diagnoseAndSuggestFix, ErrorDiagnosis } from './tester_engine';
import { arbitrateConflict, ArbitrationDecision } from './arbitrator';
import { validateAgainstConstitution, GovernanceValidationResult } from './governance_hook';
import { createLogger } from './logger';
import { mcpDiscovery } from './mcp_discovery';
import { workflowOrchestrator, WorkflowPlan } from './workflow_engine';

const execAsync = promisify(exec);
const logger = createLogger('Executor');

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  diagnosis?: ErrorDiagnosis;
  arbitrationDecision?: ArbitrationDecision;
  governanceValidation?: GovernanceValidationResult;
  attempt?: number;
}

export interface TaskInstruction {
  role: string;
  goal: string;
  context: string;
  attempt?: number;
  previousError?: string;
  suggestedFix?: string;
}

async function generateCodeWithLLM(instruction: TaskInstruction): Promise<string> {
  // Discover tools before generation
  await mcpDiscovery.discoverAll();
  const availableTools = JSON.stringify(mcpDiscovery.getAvailableTools());

  return new Promise((resolve, reject) => {
    const args = [
      './src/llm_code_generator.py',
      instruction.role,
      instruction.goal,
      instruction.context,
      (instruction.attempt || 1).toString(),
      instruction.previousError || '',
      instruction.suggestedFix || '',
      availableTools
    ];

    const pythonProcess = spawn('python3', args, {
      cwd: '/home/ubuntu/ai-team-frontend/server',
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => output += data.toString());
    pythonProcess.stderr.on('data', (data) => errorOutput += data.toString());

    pythonProcess.on('close', (code) => {
      if (code !== 0) reject(new Error(`LLM failed: ${errorOutput}`));
      else resolve(output.trim());
    });
  });
}

async function executeCommandOrWorkflow(input: string, role: string, context: string): Promise<ExecutionResult> {
  // 1. Check if it's a Workflow JSON
  if (input.startsWith('{') && input.includes('"type": "workflow"')) {
    try {
      const workflowData = JSON.parse(input);
      logger.info('Executing dynamic MCP workflow');
      return await workflowOrchestrator.executeWorkflow(workflowData.plan);
    } catch (e: any) {
      return { success: false, error: `Workflow parse error: ${e.message}` };
    }
  }

  // 2. Constitutional Guardrail
  const validationResult = await validateAgainstConstitution(input, role, context);
  if (!validationResult.isValid) {
    return { success: false, error: `INTERCEPTED: ${validationResult.reason}`, governanceValidation: validationResult };
  }

  // 3. Standard Shell Execution
  try {
    const { stdout } = await execAsync(input);
    return { success: true, output: stdout };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function executeTask(instruction: TaskInstruction): Promise<ExecutionResult> {
  const MAX_ATTEMPTS = 3;
  let currentInstruction = { ...instruction };
  let lastResult: ExecutionResult = { success: false };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    currentInstruction.attempt = attempt;
    
    let generatedInput: string;
    try {
      generatedInput = await generateCodeWithLLM(currentInstruction);
    } catch (llmError: any) {
      return { success: false, error: `LLM generation failed: ${llmError.message}`, attempt };
    }

    const result = await executeCommandOrWorkflow(generatedInput, instruction.role, instruction.context);
    result.attempt = attempt;
    lastResult = result;

    if (result.success) return result;

    if (result.governanceValidation && !result.governanceValidation.isValid) {
      result.arbitrationDecision = await arbitrateConflict(`Breach: ${result.governanceValidation.reason}`, instruction.context);
      return result;
    }

    if (attempt < MAX_ATTEMPTS) {
      const diagnosis = await diagnoseAndSuggestFix(result.error || "Error", instruction.context);
      result.diagnosis = diagnosis;
      currentInstruction.previousError = result.error;
      currentInstruction.suggestedFix = diagnosis.suggestedFix;
    }
  }

  return lastResult;
}
