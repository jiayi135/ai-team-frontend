import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { McpClient } from './mcp_client';
import { ROLE_CAPABILITIES } from './role_registry';
import { diagnoseAndSuggestFix, ErrorDiagnosis } from './tester_engine';
import { arbitrateConflict, ArbitrationDecision } from './arbitrator';
import { validateAgainstConstitution, GovernanceValidationResult } from './governance_hook'; // 导入治理钩子

const execAsync = promisify(exec);

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  diagnosis?: ErrorDiagnosis;
  arbitrationDecision?: ArbitrationDecision;
  governanceValidation?: GovernanceValidationResult; // 添加治理验证结果
}

export interface TaskInstruction {
  role: string;
  goal: string;
  context: string;
  attempt?: number;
}

// 调用 Python 脚本生成代码
async function generateCodeWithLLM(instruction: TaskInstruction): Promise<string> {
  console.log(`[LLM] Requesting code generation for role: ${instruction.role}, goal: ${instruction.goal}`);
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [
      './src/llm_code_generator.py',
      instruction.role,
      instruction.goal,
      instruction.context,
    ], {
      cwd: '/home/ubuntu/repo-ai-team-frontend/server',
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
        console.error(`[LLM] Python script exited with code ${code}: ${errorOutput}`);
        reject(new Error(`Failed to generate code: ${errorOutput}`));
      } else {
        console.log(`[LLM] Generated code: ${output.trim()}`);
        resolve(output.trim());
      }
    });

    pythonProcess.on('error', (err) => {
      console.error(`[LLM] Failed to start Python subprocess: ${err.message}`);
      reject(err);
    });
  });
}

// 执行 Shell 命令或 MCP 工具调用
async function executeCommandOrMcpTool(command: string, role: string, context: string): Promise<ExecutionResult> {
  const roleCapabilities = ROLE_CAPABILITIES[role];

  // 1. 宪法约束验证
  const validationResult = await validateAgainstConstitution(command, role, context);
  if (!validationResult.isValid) {
    console.warn(`[GovernanceHook] Command failed constitutional validation: ${validationResult.reason}`);
    return {
      success: false,
      error: `Governance validation failed: ${validationResult.reason}`,
      governanceValidation: validationResult,
    };
  }

  // 检查是否是 MCP 工具调用
  if (command.startsWith('manus-mcp-cli')) {
    const parts = command.split(' ');
    const toolCallIndex = parts.indexOf('call');
    const serverIndex = parts.indexOf('--server');
    const inputIndex = parts.indexOf('--input');

    if (toolCallIndex !== -1 && serverIndex !== -1 && inputIndex !== -1) {
      const toolName = parts[toolCallIndex + 1];
      const serverName = parts[serverIndex + 1];
      const inputJson = parts.slice(inputIndex + 1).join(' ').replace(/^'|'$/g, ''); // 移除单引号

      // 验证角色是否有权限调用此 MCP 工具
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

  // 否则，执行普通的 Shell 命令
  try {
    console.log(`[Executor] Executing shell command: ${command}`);
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      console.warn(`[Executor] Stderr (may contain warnings): ${stderr}`);
    }
    console.log(`[Executor] Stdout: ${stdout}`);
    return { success: true, output: stdout };
  } catch (error: any) {
    console.error(`[Executor] Execution failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 主执行函数
export async function executeTask(instruction: TaskInstruction): Promise<ExecutionResult> {
  const roleCapabilities = ROLE_CAPABILITIES[instruction.role];

  if (!roleCapabilities) {
    return { success: false, error: `Role ${instruction.role} not found or has no defined capabilities.` };
  }

  let currentInstruction = { ...instruction };
  let executionAttempts = 0;
  const MAX_ATTEMPTS = 3;

  while (executionAttempts < MAX_ATTEMPTS) {
    executionAttempts++;
    console.log(`[Executor] Attempt ${executionAttempts} for goal: ${currentInstruction.goal}`);

    // 1. LLM 生成代码/脚本
    let generatedCommand: string;
    try {
      generatedCommand = await generateCodeWithLLM(currentInstruction);
    } catch (llmError: any) {
      return { success: false, error: `LLM code generation failed: ${llmError.message}` };
    }

    if (!generatedCommand) {
      return { success: false, error: "LLM failed to generate a command." };
    }

    // 2. 执行生成的代码/脚本或 MCP 工具
    const executionResult = await executeCommandOrMcpTool(generatedCommand, instruction.role, currentInstruction.context);

    if (executionResult.success) {
      return executionResult; // 成功，返回结果
    } else {
      // 如果是治理验证失败，直接触发仲裁
      if (executionResult.governanceValidation && !executionResult.governanceValidation.isValid) {
        console.warn(`[Executor] Governance validation failed. Escalating to Arbitration Expert.`);
        const conflictDescription = `任务 [${instruction.goal}] 因治理验证失败而中止。原因：${executionResult.governanceValidation.reason}。`;
        const arbitrationDecision = await arbitrateConflict(conflictDescription, currentInstruction.context);
        executionResult.arbitrationDecision = arbitrationDecision;
        return executionResult; // 返回治理失败结果和仲裁决策
      }

      // 执行失败，触发 Tester 进行诊断
      console.warn(`[Executor] Execution failed. Triggering Tester for diagnosis.`);
      const diagnosis = await diagnoseAndSuggestFix(executionResult.error || "Unknown error", currentInstruction.context);
      console.log(`[Executor] Tester Diagnosis: ${JSON.stringify(diagnosis, null, 2)}`);

      // 将诊断信息附加到结果中
      executionResult.diagnosis = diagnosis;

      // 如果达到最大尝试次数，或者 Tester 诊断为逻辑错误且没有明确修复建议，则升级到仲裁专家
      if (executionAttempts >= MAX_ATTEMPTS || (diagnosis.isLogicError && !diagnosis.suggestedFix)) {
        console.warn(`[Executor] Max attempts reached or unresolvable logic error. Escalating to Arbitration Expert.`);
        const conflictDescription = `任务 [${instruction.goal}] 在 ${executionAttempts} 次尝试后仍然失败。最后一次错误：${executionResult.error}。Tester 诊断：${diagnosis.diagnosis}。`;
        const arbitrationDecision = await arbitrateConflict(conflictDescription, currentInstruction.context);
        executionResult.arbitrationDecision = arbitrationDecision;
        return executionResult; // 返回最终失败结果和仲裁决策
      }

      // 更新上下文，尝试让 LLM 重新生成代码
      currentInstruction.context = `原始任务：${instruction.goal}\n上次执行失败，错误输出：${executionResult.error}\nTester 诊断：${diagnosis.diagnosis}\n修复建议：${diagnosis.suggestedFix}\n请根据修复建议重新生成代码。`;
      currentInstruction.attempt = executionAttempts;
    }
  }

  return { success: false, error: "Reached maximum execution attempts without success." };
}
