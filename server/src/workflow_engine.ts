import { createLogger } from './logger';
import { McpClient } from './mcp_client';
import { ExecutionResult } from './executor';

const logger = createLogger('WorkflowEngine');

export interface WorkflowStep {
  id: string;
  server: string;
  tool: string;
  arguments: any;
  dependsOn?: string[];
}

export interface WorkflowPlan {
  taskId: string;
  steps: WorkflowStep[];
}

export class WorkflowOrchestrator {
  /**
   * Execute a multi-step workflow plan.
   */
  public async executeWorkflow(plan: WorkflowPlan): Promise<ExecutionResult> {
    logger.info('Starting workflow execution', { taskId: plan.taskId, stepCount: plan.steps.length });
    
    const results: Record<string, any> = {};
    let finalOutput = '';

    for (const step of plan.steps) {
      logger.info(`Executing step: ${step.id}`, { tool: `${step.server}:${step.tool}` });
      
      try {
        const client = new McpClient(step.server);
        // Resolve dynamic arguments from previous steps if needed
        const resolvedArgs = this.resolveArguments(step.arguments, results);
        
        const stepResult = await client.callTool(step.tool, resolvedArgs);
        results[step.id] = stepResult;
        
        finalOutput += `Step ${step.id} Success: ${JSON.stringify(stepResult)}\n`;
      } catch (error: any) {
        logger.error(`Workflow failed at step ${step.id}`, { error: error.message });
        return {
          success: false,
          error: `Workflow interrupted at step ${step.id}: ${error.message}`,
          output: finalOutput
        };
      }
    }

    return {
      success: true,
      output: finalOutput
    };
  }

  /**
   * Helper to resolve placeholders like {{stepId.field}} in arguments.
   */
  private resolveArguments(args: any, results: Record<string, any>): any {
    let argString = JSON.stringify(args);
    const placeholderRegex = /\{\{(.+?)\}\}/g;
    
    argString = argString.replace(placeholderRegex, (match, path) => {
      const [stepId, ...fields] = path.split('.');
      let value = results[stepId];
      for (const field of fields) {
        if (value) value = value[field];
      }
      return value !== undefined ? value : match;
    });

    return JSON.parse(argString);
  }
}

export const workflowOrchestrator = new WorkflowOrchestrator();
