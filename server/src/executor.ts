import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { McpClient } from './mcp_client';
import { ROLE_CAPABILITIES } from './role_registry';
import { diagnoseAndSuggestFix, ErrorDiagnosis } from './tester_engine';
import { arbitrateConflict, ArbitrationDecision } from './arbitrator';
import { validateAgainstConstitution, GovernanceValidationResult } from './governance_hook';
import { createLogger } from './logger';

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
  logger.info('Requesting code generation', { 
    role: instruction.role, 
    goal: instruction.goal,
    attempt: instruction.attempt || 1 
  });
  
  return new Promise((resolve, reject) => {
    // Pass attempt and feedback if available
    const args = [
      './src/llm_code_generator.py',
      instruction.role,
      instruction.goal,
      instruction.context,
      (instruction.attempt || 1).toString(),
      instruction.previousError || '',
      instruction.suggestedFix || ''
    ];

    const pythonProcess = spawn('python3', args, {
      cwd: '/home/ubuntu/ai-team-frontend/server',
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        logger.error('Python code generator failed', { code, error: errorOutput });
        reject(new Error(`Failed to generate code: ${errorOutput}`));
      } else {
        const result = output.trim();
        logger.debug('Generated code', { length: result.length });
        resolve(result);
      }
    });

    pythonProcess.on('error', (err) => {
      logger.error('Failed to start Python code generator', { error: err.message });
      reject(err);
    });
  });
}

async function executeCommandOrMcpTool(command: string, role: string, context: string): Promise<ExecutionResult> {
  // 1. Governance Hook (Pre-execution)
  const validationResult = await validateAgainstConstitution(command, role, context);
  if (!validationResult.isValid) {
    logger.warn('Constitutional validation failed', { command, reason: validationResult.reason });
    return {
      success: false,
      error: `Governance validation failed: ${validationResult.reason}`,
      governanceValidation: validationResult,
    };
  }

  // 2. MCP Tool Check
  if (command.startsWith('manus-mcp-cli')) {
    const parts = command.split(' ');
    const toolCallIndex = parts.indexOf('call');
    const serverIndex = parts.indexOf('--server');
    const inputIndex = parts.indexOf('--input');

    if (toolCallIndex !== -1 && serverIndex !== -1 && inputIndex !== -1) {
      const toolName = parts[toolCallIndex + 1];
      const serverName = parts[serverIndex + 1];
      const inputJson = parts.slice(inputIndex + 1).join(' ').replace(/^'|'$/g, '');

      const roleCapabilities = ROLE_CAPABILITIES[role];
      if (!roleCapabilities.mcpTools || !roleCapabilities.mcpTools.some(mcpTool => mcpTool.server === serverName && mcpTool.tools.includes(toolName))) {
        return { success: false, error: `Role ${role} lacks permission for MCP tool ${toolName} on ${serverName}.` };
      }

      try {
        const mcpClient = new McpClient(serverName);
        const result = await mcpClient.callTool(toolName, JSON.parse(inputJson));
        return { success: true, output: JSON.stringify(result, null, 2) };
      } catch (error: any) {
        return { success: false, error: `MCP tool execution failed: ${error.message}` };
      }
    }
  }

  // 3. Shell Execution
  try {
    logger.info('Executing shell command', { command });
    const { stdout, stderr } = await execAsync(command);
    if (stderr) logger.warn('Command stderr', { stderr });
    return { success: true, output: stdout };
  } catch (error: any) {
    logger.error('Command execution failed', { error: error.message });
    return { success: false, error: error.message };
  }
}

export async function executeTask(instruction: TaskInstruction): Promise<ExecutionResult> {
  const MAX_ATTEMPTS = 3;
  let currentInstruction = { ...instruction };
  let lastResult: ExecutionResult = { success: false };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    currentInstruction.attempt = attempt;
    logger.info(`Starting attempt ${attempt}/${MAX_ATTEMPTS}`, { goal: instruction.goal });

    // Step A: Generate Code
    let generatedCommand: string;
    try {
      generatedCommand = await generateCodeWithLLM(currentInstruction);
    } catch (llmError: any) {
      return { success: false, error: `LLM generation failed: ${llmError.message}`, attempt };
    }

    // Step B: Execute
    const result = await executeCommandOrMcpTool(generatedCommand, instruction.role, instruction.context);
    result.attempt = attempt;
    lastResult = result;

    if (result.success) {
      logger.info(`Task succeeded on attempt ${attempt}`);
      return result;
    }

    // Step C: Handle Failures
    // C1: Governance Failure (No retry, go to arbitration)
    if (result.governanceValidation && !result.governanceValidation.isValid) {
      logger.warn('Governance violation detected. Escalating to arbitration.');
      result.arbitrationDecision = await arbitrateConflict(
        `Governance violation in attempt ${attempt}: ${result.governanceValidation.reason}`,
        instruction.context
      );
      return result;
    }

    // C2: Execution Failure - Trigger Feedback Loop
    if (attempt < MAX_ATTEMPTS) {
      logger.warn(`Attempt ${attempt} failed. Triggering diagnosis for feedback loop.`);
      const diagnosis = await diagnoseAndSuggestFix(result.error || "Unknown execution error", instruction.context);
      result.diagnosis = diagnosis;
      
      // Update instruction for the next iteration
      currentInstruction.previousError = result.error;
      currentInstruction.suggestedFix = diagnosis.suggestedFix;
      
      logger.info('Feedback prepared for next attempt', { 
        isLogicError: diagnosis.isLogicError,
        hasFix: !!diagnosis.suggestedFix 
      });
    } else {
      // C3: Final Failure - Arbitration
      logger.error(`Task failed after ${MAX_ATTEMPTS} attempts.`);
      const diagnosis = await diagnoseAndSuggestFix(result.error || "Max attempts reached", instruction.context);
      result.diagnosis = diagnosis;
      result.arbitrationDecision = await arbitrateConflict(
        `Task failed all ${MAX_ATTEMPTS} attempts. Last error: ${result.error}`,
        instruction.context
      );
    }
  }

  return lastResult;
}
