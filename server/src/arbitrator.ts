import { spawn } from 'child_process';

export interface ArbitrationDecision {
  decision: string; // 仲裁专家的最终决策
  reasoning: string; // 决策依据，可能引用宪法条款
  impact: string; // 决策对任务或系统的影响
  constitutionalClause?: string; // 引用的宪法条款
}

export async function arbitrateConflict(conflictDescription: string, context: string, timeoutMs: number = 300000): Promise<ArbitrationDecision> {
  console.log(`[ArbitratorEngine] Requesting arbitration for conflict: ${conflictDescription}`);

  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [
      './src/llm_arbitrator.py',
      conflictDescription,
      context,
    ], {
      cwd: '/home/ubuntu/ai-team-frontend/server',
    });

    const timeout = setTimeout(() => {
      pythonProcess.kill();
      reject(new Error(`Arbitration timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    let output = '';
    let errorOutputFromPython = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutputFromPython += data.toString();
    });

    pythonProcess.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        console.error(`[ArbitratorEngine] Python script exited with code ${code}: ${errorOutputFromPython}`);
        reject(new Error(`Failed to arbitrate conflict: ${errorOutputFromPython}`));
      } else {
        try {
          const decision = JSON.parse(output.trim()) as ArbitrationDecision;
          console.log(`[ArbitratorEngine] Decision received: ${JSON.stringify(decision, null, 2)}`);
          resolve(decision);
        } catch (parseError: any) {
          console.error(`[ArbitratorEngine] Failed to parse JSON from Python script: ${parseError.message}, Raw output: ${output}`);
          reject(new Error(`Failed to parse arbitration decision: ${parseError.message}`));
        }
      }
    });

    pythonProcess.on('error', (err) => {
      clearTimeout(timeout);
      console.error(`[ArbitratorEngine] Failed to start Python subprocess: ${err.message}`);
      reject(err);
    });
  });
}
