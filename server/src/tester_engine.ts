import { spawn } from 'child_process';

export interface ErrorDiagnosis {
  isSyntaxError: boolean;
  isPermissionError: boolean;
  isLogicError: boolean;
  diagnosis: string;
  suggestedFix: string;
}

export async function diagnoseAndSuggestFix(errorOutput: string, context: string): Promise<ErrorDiagnosis> {
  console.log(`[TesterEngine] Requesting error diagnosis for: ${errorOutput}`);

  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [
      './src/llm_error_diagnoser.py',
      errorOutput,
      context,
    ], {
      cwd: '/home/ubuntu/ai-team-frontend/server',
    });

    let output = '';
    let errorOutputFromPython = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutputFromPython += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`[TesterEngine] Python script exited with code ${code}: ${errorOutputFromPython}`);
        reject(new Error(`Failed to diagnose error: ${errorOutputFromPython}`));
      } else {
        try {
          const diagnosis = JSON.parse(output.trim()) as ErrorDiagnosis;
          console.log(`[TesterEngine] Diagnosis received: ${JSON.stringify(diagnosis, null, 2)}`);
          resolve(diagnosis);
        } catch (parseError: any) {
          console.error(`[TesterEngine] Failed to parse JSON from Python script: ${parseError.message}, Raw output: ${output}`);
          reject(new Error(`Failed to parse diagnosis: ${parseError.message}`));
        }
      }
    });

    pythonProcess.on('error', (err) => {
      console.error(`[TesterEngine] Failed to start Python subprocess: ${err.message}`);
      reject(err);
    });
  });
}
