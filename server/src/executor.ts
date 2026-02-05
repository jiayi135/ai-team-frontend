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
}

export interface TaskInstruction {
  role: string;
  goal: string;
  context: string;
  attempt?: number;
}

async function generateCodeWithLLM(instruction: TaskInstruction): Promise<string> {
  logger.info('Requesting code generation', { role: instruction.role, goal: instruction.goal });
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [
      './src/llm_code_generator.py',
      instruction.role,
      instruction.goal,
      instruction.context,
    ], {
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
        logger.debug('Generated code', { output: output.trim() });
        resolve(output.trim());
      }
    });

    pythonProcess.on('error', (err) => {
      logger.error('Failed to start Python code generator', { error: err.message });
      reject(err);
    });
  });
}

async function executeCommandOrMcpTool(command: string, role: string, context: string): Promise<ExecutionResult> {
  const roleCapabilities = ROLE_CAPABILITIES[role];

  const validationResult = await validateAgainstConstitution(command, role, context);
  if (!validationResult.isValid) {
    logger.warn('Constitutional validation failed', { command, reason: validationResult.reason });
    return {
      success: false,
      error: `Governance validation failed: ${validationResult.reason}`,
      governanceValidation: validationResult,
    };
  }

  if (command.startsWith('manus-mcp-cli')) {
    const parts = command.split(' ');
    const toolCallIndex = parts.indexOf('call');
    const serverIndex = parts.indexOf('--server');
    const inputIndex = parts.indexOf('--input');

    if (toolCallIndex !== -1 && serverIndex !== -1 && inputIndex !== -1) {
      const toolName = parts[toolCallIndex + 1];
      const serverName = parts[serverIndex + 1];
      const inputJson = parts.slice(inputIndex + 1).join(' ').replace(/^'|'$/g, '');

      if (!roleCapabilities.mcpTools || !roleCapabilities.mcpTools.some(mcpTool => mcpTool.server === serverName && mcpTool.tools.includes(toolName))) {
        return { success: false, error: `Role ${role} does not have permission to call MCP tool ${toolName} on server ${serverName}.` };
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

  try {
    logger.info('Executing shell command', { command });
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      logger.warn('Command stderr', { stderr });
    }
    logger.debug('Command stdout', { stdout });
    return { success: true, output: stdout };
  } catch (error: any) {
    logger.error('Command execution failed', { error: error.message });
    return { success: false, error: error.message };
  }
}

export async function executeTask(instruction: TaskInstruction): Promise<ExecutionResult> {
  const roleCapabilities = ROLE_CAPABILITIES[instruction.role];

  if (!roleCapabilities) {
    return { success: false, error: `Role ${instruction.role} not found.` };
  }

  let currentInstruction = { ...instruction };
  let executionAttempts = 0;
  const MAX_ATTEMPTS = 3;

  while (executionAttempts < MAX_ATTEMPTS) {
    executionAttempts++;
    logger.info('Task attempt', { attempt: executionAttempts, goal: currentInstruction.goal });

    let generatedCommand: string;
    try {
      generatedCommand = await generateCodeWithLLM(currentInstruction);
    } catch (llmError: any) {
      return { success: false, error: `LLM code generation failed: ${llmError.message}` };
    }

    if (!generatedCommand) {
      return { success: false, error: "LLM failed to generate a command." };
    }

    const executionResult = await executeCommandOrMcpTool(generatedCommand, instruction.role, currentInstruction.context);

    if (executionResult.success) {
      return executionResult;
    } else {
      if (executionResult.governanceValidation && !executionResult.governanceValidation.isValid) {
        logger.warn('Governance failure, escalating to arbitration');
        const conflictDescription = `Task [${instruction.goal}] aborted due to governance failure: ${executionResult.governanceValidation.reason}`;
        const arbitrationDecision = await arbitrateConflict(conflictDescription, currentInstruction.context);
        executionResult.arbitrationDecision = arbitrationDecision;
        return executionResult;
      }

      logger.warn('Execution failed, triggering diagnosis');
      const diagnosis = await diagnoseAndSuggestFix(executionResult.error || "Unknown error", currentInstruction.context);
      executionResult.diagnosis = diagnosis;

      if (executionAttempts >= MAX_ATTEMPTS || (diagnosis.isLogicError && !diagnosis.suggestedFix)) {
        logger.warn('Max attempts reached or unresolvable error, escalating');
        const conflictDescription = `Task [${instruction.goal}] failed after ${executionAttempts} attempts. Last error: ${executionResult.error}. Diagnosis: ${diagnosis.diagnosis}`;
        const arbitrationDecision = await arbitrateConflict(conflictDescription, currentInstruction.context);
        executionResult.arbitrationDecision = arbitrationDecision;
        return executionResult;
      }

      currentInstruction.context = `Goal: ${instruction.goal}\nError: ${executionResult.error}\nDiagnosis: ${diagnosis.diagnosis}\nFix: ${diagnosis.suggestedFix}`;
      currentInstruction.attempt = executionAttempts;
    }
  }

  return { success: false, error: "Max attempts reached." };
}
