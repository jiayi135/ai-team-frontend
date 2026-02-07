import { createLogger } from './logger';
import { llmFactory } from './llm_factory';
import * as ts from 'typescript';
import * as fs from 'fs/promises';
import * as path from 'path';

const logger = createLogger('EvolutionEngine');

// ============================================
// 类型定义
// ============================================

export interface EvolutionTask {
  id: string;
  type: 'bug_fix' | 'optimization' | 'feature_add' | 'refactor';
  description: string;
  targetFiles?: string[];
  constraints?: {
    noBreakingChanges?: boolean;
    preserveAPI?: boolean;
    maxComplexity?: number;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  requiresApproval?: boolean;
}

export interface CodeAnalysis {
  file: string;
  content: string;
  structure: {
    imports: string[];
    exports: string[];
    functions: FunctionInfo[];
    classes: ClassInfo[];
  };
  dependencies: {
    internal: string[];
    external: string[];
  };
  complexity: {
    linesOfCode: number;
    functions: number;
    classes: number;
  };
  issues: CodeIssue[];
}

interface FunctionInfo {
  name: string;
  line: number;
  parameters: string[];
  returnType?: string;
}

interface ClassInfo {
  name: string;
  line: number;
  methods: string[];
  properties: string[];
}

interface CodeIssue {
  type: 'bug' | 'smell' | 'security' | 'performance';
  severity: 'low' | 'medium' | 'high';
  line: number;
  description: string;
}

export interface ModificationPlan {
  id: string;
  taskId: string;
  strategy: 'minimal' | 'moderate' | 'comprehensive';
  changes: CodeChange[];
  rationale: string;
  risks: string[];
  estimatedImpact: {
    filesAffected: number;
    linesChanged: number;
    breakingChanges: boolean;
  };
}

export interface CodeChange {
  file: string;
  type: 'modify' | 'add' | 'delete';
  location?: { start: number; end: number };
  oldCode?: string;
  newCode: string;
  reason: string;
}

export interface EvolutionResult {
  taskId: string;
  status: 'success' | 'partial' | 'failed';
  changes: AppliedChange[];
  validation?: ValidationResult;
  metrics: {
    filesModified: number;
    linesAdded: number;
    linesRemoved: number;
    duration: number;
  };
  learnings: string[];
  error?: string;
}

interface AppliedChange {
  file: string;
  success: boolean;
  diff?: string;
  error?: string;
}

interface ValidationResult {
  passed: boolean;
  checks: {
    syntax: { passed: boolean; errors: string[] };
    tests?: { passed: boolean; failed: string[] };
  };
}

// ============================================
// 代码分析器
// ============================================

class CodeAnalyzer {
  async analyze(files: string[]): Promise<CodeAnalysis[]> {
    const analyses: CodeAnalysis[] = [];

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const analysis = await this.analyzeFile(file, content);
        analyses.push(analysis);
      } catch (error: any) {
        logger.error(`Failed to analyze file ${file}`, { error: error.message });
      }
    }

    return analyses;
  }

  private async analyzeFile(file: string, content: string): Promise<CodeAnalysis> {
    // 解析 TypeScript 代码
    const sourceFile = ts.createSourceFile(
      file,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    // 提取结构信息
    const structure = this.extractStructure(sourceFile);
    const dependencies = this.extractDependencies(sourceFile);
    const complexity = this.calculateComplexity(sourceFile, content);
    const issues = await this.identifyIssues(content);

    return {
      file,
      content,
      structure,
      dependencies,
      complexity,
      issues,
    };
  }

  private extractStructure(sourceFile: ts.SourceFile): CodeAnalysis['structure'] {
    const imports: string[] = [];
    const exports: string[] = [];
    const functions: FunctionInfo[] = [];
    const classes: ClassInfo[] = [];

    const visit = (node: ts.Node) => {
      // 提取 imports
      if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier.getText().replace(/['"]/g, '');
        imports.push(moduleSpecifier);
      }

      // 提取 exports
      if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
        exports.push(node.getText());
      }

      // 提取函数
      if (ts.isFunctionDeclaration(node) && node.name) {
        const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        functions.push({
          name: node.name.text,
          line,
          parameters: node.parameters.map(p => p.name.getText()),
          returnType: node.type?.getText(),
        });
      }

      // 提取类
      if (ts.isClassDeclaration(node) && node.name) {
        const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        const methods: string[] = [];
        const properties: string[] = [];

        node.members.forEach(member => {
          if (ts.isMethodDeclaration(member) && member.name) {
            methods.push(member.name.getText());
          }
          if (ts.isPropertyDeclaration(member) && member.name) {
            properties.push(member.name.getText());
          }
        });

        classes.push({
          name: node.name.text,
          line,
          methods,
          properties,
        });
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return { imports, exports, functions, classes };
  }

  private extractDependencies(sourceFile: ts.SourceFile): CodeAnalysis['dependencies'] {
    const internal: string[] = [];
    const external: string[] = [];

    const visit = (node: ts.Node) => {
      if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier.getText().replace(/['"]/g, '');
        if (moduleSpecifier.startsWith('.')) {
          internal.push(moduleSpecifier);
        } else {
          external.push(moduleSpecifier);
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return { internal, external };
  }

  private calculateComplexity(
    sourceFile: ts.SourceFile,
    content: string
  ): CodeAnalysis['complexity'] {
    const lines = content.split('\n');
    const linesOfCode = lines.filter(line => line.trim() && !line.trim().startsWith('//')).length;

    let functions = 0;
    let classes = 0;

    const visit = (node: ts.Node) => {
      if (ts.isFunctionDeclaration(node)) functions++;
      if (ts.isClassDeclaration(node)) classes++;
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return { linesOfCode, functions, classes };
  }

  private async identifyIssues(content: string): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const lines = content.split('\n');

    // 简单的静态分析
    lines.forEach((line, index) => {
      // 检测 console.log
      if (line.includes('console.log')) {
        issues.push({
          type: 'smell',
          severity: 'low',
          line: index + 1,
          description: 'Console.log statement found (should use logger)',
        });
      }

      // 检测 any 类型
      if (line.includes(': any')) {
        issues.push({
          type: 'smell',
          severity: 'medium',
          line: index + 1,
          description: 'Use of "any" type reduces type safety',
        });
      }

      // 检测长行
      if (line.length > 120) {
        issues.push({
          type: 'smell',
          severity: 'low',
          line: index + 1,
          description: 'Line too long (>120 characters)',
        });
      }
    });

    return issues;
  }
}

// ============================================
// 方案生成器
// ============================================

class PlanGenerator {
  private llmClient: any;

  constructor() {
    // 使用默认配置，实际使用时会传入 API Key
    this.llmClient = null;
  }

  async generatePlan(
    task: EvolutionTask,
    analyses: CodeAnalysis[],
    apiKey?: string
  ): Promise<ModificationPlan> {
    if (!apiKey) {
      return this.generateMockPlan(task, analyses);
    }

    try {
      this.llmClient = llmFactory.getClient({
        provider: 'openai',
        apiKey,
        modelName: 'gpt-4o',
      });

      const prompt = this.buildPrompt(task, analyses);
      const response = await this.llmClient.chat([
        {
          role: 'system',
          content: this.getSystemPrompt(),
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      return this.parsePlan(response.content, task);
    } catch (error: any) {
      logger.error('Failed to generate plan with LLM', { error: error.message });
      return this.generateMockPlan(task, analyses);
    }
  }

  private getSystemPrompt(): string {
    return `你是一个代码进化专家，基于 P.R.O.M.P.T. 框架工作。

你的任务是分析代码并生成修改方案。请以 JSON 格式返回，包含：
- strategy: 'minimal' | 'moderate' | 'comprehensive'
- changes: 数组，每个包含 { file, type, location, oldCode, newCode, reason }
- rationale: 修改的总体理由
- risks: 潜在风险数组

确保修改是最小化的、安全的，并且符合最佳实践。`;
  }

  private buildPrompt(task: EvolutionTask, analyses: CodeAnalysis[]): string {
    let prompt = `任务类型：${task.type}\n`;
    prompt += `任务描述：${task.description}\n\n`;

    prompt += `代码分析结果：\n`;
    analyses.forEach(analysis => {
      prompt += `\n文件：${analysis.file}\n`;
      prompt += `行数：${analysis.complexity.linesOfCode}\n`;
      prompt += `函数数：${analysis.complexity.functions}\n`;
      prompt += `类数：${analysis.complexity.classes}\n`;
      
      if (analysis.issues.length > 0) {
        prompt += `问题：\n`;
        analysis.issues.forEach(issue => {
          prompt += `  - 第${issue.line}行: ${issue.description}\n`;
        });
      }
    });

    prompt += `\n请生成修改方案。`;

    return prompt;
  }

  private parsePlan(content: string, task: EvolutionTask): ModificationPlan {
    try {
      // 尝试从 LLM 响应中提取 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          id: `plan-${Date.now()}`,
          taskId: task.id,
          strategy: parsed.strategy || 'moderate',
          changes: parsed.changes || [],
          rationale: parsed.rationale || '',
          risks: parsed.risks || [],
          estimatedImpact: {
            filesAffected: parsed.changes?.length || 0,
            linesChanged: 0,
            breakingChanges: false,
          },
        };
      }
    } catch (error) {
      logger.error('Failed to parse LLM response', { error });
    }

    // 如果解析失败，返回模拟方案
    return this.generateMockPlan(task, []);
  }

  private generateMockPlan(task: EvolutionTask, analyses: CodeAnalysis[]): ModificationPlan {
    const changes: CodeChange[] = [];

    // 根据任务类型生成模拟修改
    if (task.type === 'optimization') {
      changes.push({
        file: task.targetFiles?.[0] || 'server/src/example.ts',
        type: 'modify',
        location: { start: 10, end: 15 },
        oldCode: '// Old implementation',
        newCode: '// Optimized implementation with caching',
        reason: '添加缓存以提高性能',
      });
    }

    return {
      id: `plan-${Date.now()}`,
      taskId: task.id,
      strategy: 'minimal',
      changes,
      rationale: `基于任务"${task.description}"生成的修改方案（模拟模式）`,
      risks: ['这是模拟方案，实际执行需要配置 API Key'],
      estimatedImpact: {
        filesAffected: changes.length,
        linesChanged: 10,
        breakingChanges: false,
      },
    };
  }
}

// ============================================
// 代码修改器
// ============================================

class CodeModifier {
  async applyChanges(plan: ModificationPlan): Promise<AppliedChange[]> {
    const results: AppliedChange[] = [];

    for (const change of plan.changes) {
      try {
        const result = await this.applyChange(change);
        results.push(result);
      } catch (error: any) {
        results.push({
          file: change.file,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  private async applyChange(change: CodeChange): Promise<AppliedChange> {
    try {
      const filePath = path.resolve(process.cwd(), change.file);

      if (change.type === 'add') {
        // 创建新文件
        await fs.writeFile(filePath, change.newCode, 'utf-8');
        return {
          file: change.file,
          success: true,
          diff: `+++ ${change.file}\n${change.newCode}`,
        };
      }

      if (change.type === 'delete') {
        // 删除文件
        await fs.unlink(filePath);
        return {
          file: change.file,
          success: true,
          diff: `--- ${change.file}`,
        };
      }

      // 修改现有文件
      const content = await fs.readFile(filePath, 'utf-8');
      let newContent = content;

      if (change.oldCode) {
        // 替换特定代码
        newContent = content.replace(change.oldCode, change.newCode);
      } else if (change.location) {
        // 在特定位置插入/替换
        const lines = content.split('\n');
        lines.splice(
          change.location.start - 1,
          change.location.end - change.location.start + 1,
          change.newCode
        );
        newContent = lines.join('\n');
      }

      await fs.writeFile(filePath, newContent, 'utf-8');

      return {
        file: change.file,
        success: true,
        diff: this.generateDiff(content, newContent),
      };
    } catch (error: any) {
      throw new Error(`Failed to apply change to ${change.file}: ${error.message}`);
    }
  }

  private generateDiff(oldContent: string, newContent: string): string {
    // 简单的 diff 生成
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    
    let diff = '';
    const maxLen = Math.max(oldLines.length, newLines.length);
    
    for (let i = 0; i < maxLen; i++) {
      if (oldLines[i] !== newLines[i]) {
        if (oldLines[i]) diff += `- ${oldLines[i]}\n`;
        if (newLines[i]) diff += `+ ${newLines[i]}\n`;
      }
    }
    
    return diff;
  }
}

// ============================================
// 进化引擎
// ============================================

export class EvolutionEngine {
  private analyzer: CodeAnalyzer;
  private planGenerator: PlanGenerator;
  private modifier: CodeModifier;

  constructor() {
    this.analyzer = new CodeAnalyzer();
    this.planGenerator = new PlanGenerator();
    this.modifier = new CodeModifier();
  }

  async evolve(task: EvolutionTask, apiKey?: string): Promise<EvolutionResult> {
    const startTime = Date.now();
    
    try {
      logger.info('Starting evolution task', { taskId: task.id, type: task.type });

      // 1. 确定目标文件
      const targetFiles = await this.determineTargetFiles(task);
      logger.info('Target files determined', { files: targetFiles });

      // 2. 分析代码
      const analyses = await this.analyzer.analyze(targetFiles);
      logger.info('Code analysis completed', { filesAnalyzed: analyses.length });

      // 3. 生成修改方案
      const plan = await this.planGenerator.generatePlan(task, analyses, apiKey);
      logger.info('Modification plan generated', { changes: plan.changes.length });

      // 4. 应用修改（在模拟模式下跳过实际修改）
      let appliedChanges: AppliedChange[] = [];
      if (apiKey && !task.requiresApproval) {
        appliedChanges = await this.modifier.applyChanges(plan);
        logger.info('Changes applied', { successful: appliedChanges.filter(c => c.success).length });
      } else {
        // 模拟模式：不实际修改文件
        appliedChanges = plan.changes.map(c => ({
          file: c.file,
          success: true,
          diff: `模拟修改：${c.reason}`,
        }));
      }

      // 5. 计算指标
      const metrics = this.calculateMetrics(appliedChanges, startTime);

      // 6. 提取学习经验
      const learnings = this.extractLearnings(task, plan, appliedChanges);

      return {
        taskId: task.id,
        status: appliedChanges.every(c => c.success) ? 'success' : 'partial',
        changes: appliedChanges,
        metrics,
        learnings,
      };
    } catch (error: any) {
      logger.error('Evolution task failed', { taskId: task.id, error: error.message });
      return {
        taskId: task.id,
        status: 'failed',
        changes: [],
        metrics: {
          filesModified: 0,
          linesAdded: 0,
          linesRemoved: 0,
          duration: Date.now() - startTime,
        },
        learnings: [],
        error: error.message,
      };
    }
  }

  private async determineTargetFiles(task: EvolutionTask): Promise<string[]> {
    if (task.targetFiles && task.targetFiles.length > 0) {
      return task.targetFiles;
    }

    // 默认目标文件
    return ['server/src/index.ts'];
  }

  private calculateMetrics(changes: AppliedChange[], startTime: number) {
    let linesAdded = 0;
    let linesRemoved = 0;

    changes.forEach(change => {
      if (change.diff) {
        const lines = change.diff.split('\n');
        linesAdded += lines.filter(l => l.startsWith('+')).length;
        linesRemoved += lines.filter(l => l.startsWith('-')).length;
      }
    });

    return {
      filesModified: changes.filter(c => c.success).length,
      linesAdded,
      linesRemoved,
      duration: Date.now() - startTime,
    };
  }

  private extractLearnings(
    task: EvolutionTask,
    plan: ModificationPlan,
    changes: AppliedChange[]
  ): string[] {
    const learnings: string[] = [];

    learnings.push(`完成了 ${task.type} 类型的任务`);
    learnings.push(`使用 ${plan.strategy} 策略`);
    learnings.push(`修改了 ${changes.length} 个文件`);

    if (plan.risks.length > 0) {
      learnings.push(`识别了 ${plan.risks.length} 个潜在风险`);
    }

    return learnings;
  }
}

// 导出单例
export const evolutionEngine = new EvolutionEngine();
