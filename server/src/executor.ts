import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { McpTool, Skill, ApiPermission } from './role_registry';
import { ROLE_CAPABILITIES } from './role_registry';
import { diagnoseAndSuggestFix, ErrorDiagnosis } from './tester_engine';

const execAsync = promisify(exec);

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  diagnosis?: ErrorDiagnosis; // 添加诊断信息
}

export interface TaskInstruction {
  role: string; // 执行任务的角色
  goal: string; // 任务目标
  context: string; // 任务上下文
  attempt?: number; // 尝试次数，用于修复循环
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

// 执行 Shell 命令
async function executeShellCommand(command: string): Promise<ExecutionResult> {
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
  const MAX_ATTEMPTS = 3; // 最多尝试修复3次

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

    // 2. 执行生成的代码/脚本
    const executionResult = await executeShellCommand(generatedCommand);

    if (executionResult.success) {
      return executionResult; // 成功，返回结果
    } else {
      // 执行失败，触发 Tester 进行诊断
      console.warn(`[Executor] Execution failed. Triggering Tester for diagnosis.`);
      const diagnosis = await diagnoseAndSuggestFix(executionResult.error || "Unknown error", currentInstruction.context);
      console.log(`[Executor] Tester Diagnosis: ${JSON.stringify(diagnosis, null, 2)}`);

      // 更新上下文，尝试让 LLM 重新生成代码
      currentInstruction.context = `原始任务：${instruction.goal}\n上次执行失败，错误输出：${executionResult.error}\nTester 诊断：${diagnosis.diagnosis}\n修复建议：${diagnosis.suggestedFix}\n请根据修复建议重新生成代码。`;
      currentInstruction.attempt = executionAttempts;
      executionResult.diagnosis = diagnosis; // 将诊断信息附加到结果中

      if (executionAttempts >= MAX_ATTEMPTS) {
        return executionResult; // 达到最大尝试次数，返回最终失败结果和诊断
      }
    }
  }

  return { success: false, error: "Reached maximum execution attempts without success." };
}
