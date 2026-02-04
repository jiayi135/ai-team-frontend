import { executeTask, TaskInstruction } from './executor';
import { ExecutionResult } from './executor'; // 明确导入 ExecutionResult
import { ROLE_CAPABILITIES } from './role_registry';
import { saveTask, getTaskById, getAllTasks } from './database'; // 导入数据库操作

export enum TaskStatus {
  PENDING = 'pending',
  PLANNING = 'planning',
  EXECUTING = 'executing',
  TESTING = 'testing',
  ARBITRATING = 'arbitrating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Task {
  id: string;
  goal: string;
  currentStatus: TaskStatus;
  history: ExecutionResult[];
  createdAt: Date;
  updatedAt: Date;
  assignedRole: string;
  context: string;
}

export class TaskOrchestrator {
  private tasks: Map<string, Task> = new Map(); // 内存中的任务缓存

  constructor() {
    this.loadAllTasksFromDb(); // 启动时从数据库加载所有任务
  }

  private async loadAllTasksFromDb() {
    const storedTasks = await getAllTasks();
    storedTasks.forEach(task => this.tasks.set(task.id, task));
    console.log(`[TaskOrchestrator] Loaded ${storedTasks.length} tasks from database.`);
  }

  public async createTask(goal: string, assignedRole: string, context: string): Promise<Task> {
    const taskId = `task-${Date.now()}`;
    const newTask: Task = {
      id: taskId,
      goal,
      currentStatus: TaskStatus.PENDING,
      history: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedRole,
      context,
    };
    this.tasks.set(taskId, newTask);
    await saveTask(newTask); // 保存到数据库
    this.processTask(taskId); // 异步处理任务
    return newTask;
  }

  public getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  public getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  private async processTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.currentStatus = TaskStatus.PLANNING;
    task.updatedAt = new Date();
    await saveTask(task); // 更新数据库
    console.log(`[TaskOrchestrator] Task ${taskId}: Planning for goal "${task.goal}"`);

    task.currentStatus = TaskStatus.EXECUTING;
    task.updatedAt = new Date();
    await saveTask(task); // 更新数据库
    console.log(`[TaskOrchestrator] Task ${taskId}: Executing...`);

    const instruction: TaskInstruction = {
      role: task.assignedRole,
      goal: task.goal,
      context: task.context,
    };

    let result: ExecutionResult;
    try {
      result = await executeTask(instruction);
      task.history.push(result);

      if (result.success) {
        task.currentStatus = TaskStatus.COMPLETED;
        console.log(`[TaskOrchestrator] Task ${taskId}: Completed successfully.`);
      } else {
        if (result.arbitrationDecision) {
          task.currentStatus = TaskStatus.ARBITRATING;
          console.log(`[TaskOrchestrator] Task ${taskId}: Arbitration triggered.`);
        } else if (result.governanceValidation && !result.governanceValidation.isValid) {
          task.currentStatus = TaskStatus.FAILED; // 治理验证失败直接标记为失败
          console.log(`[TaskOrchestrator] Task ${taskId}: Failed due to governance validation.`);
        } else if (result.diagnosis) {
          task.currentStatus = TaskStatus.TESTING; // 表示正在进行测试/修复循环
          console.log(`[TaskOrchestrator] Task ${taskId}: Testing/Fixing loop triggered.`);
          // executeTask 内部已经包含了重试逻辑，如果最终失败，会返回失败状态
          task.currentStatus = TaskStatus.FAILED; // 如果 executeTask 内部的重试都失败了，则最终是失败
          console.log(`[TaskOrchestrator] Task ${taskId}: Failed after testing/fixing attempts.`);
        } else {
          task.currentStatus = TaskStatus.FAILED;
          console.log(`[TaskOrchestrator] Task ${taskId}: Failed.`);
        }
      }
    } catch (error: any) {
      task.currentStatus = TaskStatus.FAILED;
      task.history.push({ success: false, error: error.message });
      console.error(`[TaskOrchestrator] Task ${taskId}: Unexpected error during execution: ${error.message}`);
    }

    task.updatedAt = new Date();
    await saveTask(task); // 最终状态保存到数据库
    this.tasks.set(taskId, task); // 更新内存缓存
  }
}
