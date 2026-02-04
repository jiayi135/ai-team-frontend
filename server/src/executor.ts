import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { McpTool, Skill, ApiPermission } from './role_registry';
import { ROLE_CAPABILITIES } from './role_registry';

const execAsync = promisify(exec);

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
}

export interface TaskInstruction {
  role: string; // 执行任务的角色
  goal: string; // 任务目标
  context: string; // 任务上下文
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
      // Don't return error for warnings or non-critical stderr messages, but log them
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

  // 1. LLM 生成代码/脚本
  const generatedCommand = await generateCodeWithLLM(instruction);
  if (!generatedCommand) {
    return { success: false, error: "LLM failed to generate a command." };
  }

  // 2. 执行生成的代码/脚本
  // 权限校验逻辑应在此处添加，例如检查生成的命令是否符合角色的 MCP 工具或 API 权限
  console.log(`[Executor] Role ${instruction.role} is attempting to execute: ${generatedCommand}`);
  return executeShellCommand(generatedCommand);
}
