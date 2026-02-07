/**
 * Multi-Agent Workflow Implementation
 * 多 Agent 协作工作流
 */

import { callLlm } from './llm_client';
import { createLogger } from './logger';

const logger = createLogger('MultiAgentWorkflow');

export interface AgentRole {
  name: string;
  systemPrompt: string;
  responsibilities: string[];
}

export const AGENT_ROLES: Record<string, AgentRole> = {
  architect: {
    name: 'Architect',
    systemPrompt: `你是一个资深软件架构师。你的职责是：
1. 分析需求，设计系统架构
2. 选择合适的技术栈和设计模式
3. 制定开发计划和模块划分
4. 考虑可扩展性、性能和安全性

请用清晰、专业的语言回答，提供具体的技术方案。`,
    responsibilities: ['需求分析', '架构设计', '技术选型', '模块划分']
  },
  
  developer: {
    name: 'Developer',
    systemPrompt: `你是一个经验丰富的全栈开发工程师。你的职责是：
1. 根据架构设计实现代码
2. 编写清晰、可维护的代码
3. 遵循最佳实践和编码规范
4. 添加必要的注释和文档

请提供完整的、可运行的代码实现。`,
    responsibilities: ['代码实现', '功能开发', '代码优化', '文档编写']
  },
  
  algorithm_expert: {
    name: 'Algorithm Expert',
    systemPrompt: `你是一个算法专家。你的职责是：
1. 分析算法复杂度
2. 优化数据结构和算法
3. 提供高效的解决方案
4. 解决性能瓶颈

请提供算法分析和优化建议。`,
    responsibilities: ['算法分析', '性能优化', '复杂度分析', '数据结构设计']
  },
  
  tester: {
    name: 'Tester',
    systemPrompt: `你是一个专业的测试工程师。你的职责是：
1. 设计测试用例
2. 执行功能测试和边界测试
3. 发现潜在的 bug 和问题
4. 提供测试报告

请提供详细的测试计划和测试结果。`,
    responsibilities: ['测试设计', '质量保证', 'Bug 发现', '测试报告']
  },
  
  reviewer: {
    name: 'Reviewer',
    systemPrompt: `你是一个资深代码审查员。你的职责是：
1. 审查代码质量和规范
2. 检查潜在的安全问题
3. 提出改进建议
4. 确保代码符合最佳实践

请提供详细的审查意见和改进建议。`,
    responsibilities: ['代码审查', '质量检查', '安全审计', '改进建议']
  }
};

export interface WorkflowStep {
  role: string;
  input: string;
  output?: string;
  timestamp: number;
  duration?: number;
}

export interface WorkflowResult {
  goal: string;
  steps: WorkflowStep[];
  finalOutput: string;
  totalDuration: number;
  success: boolean;
}

/**
 * 简化的多 Agent 工作流
 * Architect → Developer → Tester → Reviewer
 */
export class MultiAgentWorkflow {
  private steps: WorkflowStep[] = [];
  
  /**
   * 执行完整的多 Agent 工作流
   */
  async execute(goal: string): Promise<WorkflowResult> {
    const startTime = Date.now();
    logger.info('Starting multi-agent workflow', { goal });
    
    try {
      // Step 1: Architect 分析需求
      const architecture = await this.callAgent('architect', 
        `任务目标：${goal}\n\n请分析需求并设计系统架构。`
      );
      
      // Step 2: Developer 实现代码
      const code = await this.callAgent('developer',
        `架构设计：\n${architecture}\n\n请根据架构设计实现代码。`
      );
      
      // Step 3: Tester 测试代码
      const testResult = await this.callAgent('tester',
        `代码实现：\n${code}\n\n请设计测试用例并测试代码。`
      );
      
      // Step 4: Reviewer 审查代码
      const review = await this.callAgent('reviewer',
        `代码实现：\n${code}\n\n测试结果：\n${testResult}\n\n请审查代码质量并提供改进建议。`
      );
      
      const totalDuration = Date.now() - startTime;
      
      const result: WorkflowResult = {
        goal,
        steps: this.steps,
        finalOutput: review,
        totalDuration,
        success: true
      };
      
      logger.info('Workflow completed', { 
        goal, 
        duration: totalDuration,
        stepsCount: this.steps.length 
      });
      
      return result;
      
    } catch (error: any) {
      logger.error('Workflow failed', { goal, error: error.message });
      
      return {
        goal,
        steps: this.steps,
        finalOutput: `工作流执行失败：${error.message}`,
        totalDuration: Date.now() - startTime,
        success: false
      };
    }
  }
  
  /**
   * 调用单个 Agent
   */
  private async callAgent(role: string, input: string): Promise<string> {
    const startTime = Date.now();
    const agent = AGENT_ROLES[role];
    
    if (!agent) {
      throw new Error(`Unknown agent role: ${role}`);
    }
    
    logger.info(`Calling agent: ${agent.name}`, { role });
    
    const step: WorkflowStep = {
      role,
      input,
      timestamp: startTime
    };
    
    try {
      const output = await callLlm([
        { role: 'system', content: agent.systemPrompt },
        { role: 'user', content: input }
      ], null, 0.7, 2048);
      
      step.output = output;
      step.duration = Date.now() - startTime;
      
      this.steps.push(step);
      
      logger.info(`Agent ${agent.name} completed`, { 
        role, 
        duration: step.duration,
        outputLength: output.length 
      });
      
      return output;
      
    } catch (error: any) {
      logger.error(`Agent ${agent.name} failed`, { role, error: error.message });
      throw error;
    }
  }
  
  /**
   * 并行执行多个 Agent（用于需要多个专家同时工作的场景）
   */
  async executeParallel(role1: string, role2: string, input: string): Promise<[string, string]> {
    logger.info('Executing agents in parallel', { role1, role2 });
    
    const [output1, output2] = await Promise.all([
      this.callAgent(role1, input),
      this.callAgent(role2, input)
    ]);
    
    return [output1, output2];
  }
}

/**
 * 创建并执行工作流的便捷函数
 */
export async function executeWorkflow(goal: string): Promise<WorkflowResult> {
  const workflow = new MultiAgentWorkflow();
  return await workflow.execute(goal);
}
