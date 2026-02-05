import { Server } from 'socket.io';
import { executeTask, TaskInstruction } from './executor';
import { ExecutionResult } from './executor';
import { saveTask, getAllTasks } from './database';
import { createLogger } from './logger';
import { checkpointManager } from './checkpoint';

const logger = createLogger('TaskOrchestrator');

export enum TaskStatus {
  PENDING = 'pending',
  PLANNING = 'planning',
  EXECUTING = 'executing',
  REPAIRING = 'repairing', // New state for feedback loop
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
  currentAttempt?: number;
}

export class TaskOrchestrator {
  private tasks: Map<string, Task> = new Map();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.loadAllTasksFromDb();
  }

  private async loadAllTasksFromDb() {
    const storedTasks = await getAllTasks();
    storedTasks.forEach(task => this.tasks.set(task.id, task));
    logger.info(`Loaded ${storedTasks.length} tasks from database.`);
  }

  private notifyTaskUpdate(task: Task) {
    this.io.emit('task_updated', task);
    logger.debug('Emitted task_updated', { taskId: task.id, status: task.currentStatus, attempt: task.currentAttempt });
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
      currentAttempt: 1
    };
    this.tasks.set(taskId, newTask);
    await saveTask(newTask);
    this.notifyTaskUpdate(newTask);
    this.processTask(taskId);
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

    try {
      // 1. Planning Phase
      task.currentStatus = TaskStatus.PLANNING;
      task.updatedAt = new Date();
      await saveTask(task);
      this.notifyTaskUpdate(task);
      
      checkpointManager.saveCheckpoint({
        taskId,
        phase: 'planning',
        state: { goal: task.goal },
        timestamp: new Date().toISOString()
      });

      // 2. Execution with Feedback Loop
      const instruction: TaskInstruction = {
        role: task.assignedRole,
        goal: task.goal,
        context: task.context,
      };

      // We handle the loop within executor, but we can intercept or monitor if needed.
      // For real-time "Repairing" status, we could modify executeTask to take a callback.
      // For now, we'll let executeTask handle the 3 attempts and return the final history.
      
      task.currentStatus = TaskStatus.EXECUTING;
      this.notifyTaskUpdate(task);

      const result = await executeTask(instruction);
      task.history.push(result);
      task.currentAttempt = result.attempt;

      // 3. Final Status Determination
      if (result.success) {
        task.currentStatus = TaskStatus.COMPLETED;
        logger.info(`Task ${taskId}: Completed in ${result.attempt} attempts`);
      } else {
        if (result.arbitrationDecision) {
          task.currentStatus = TaskStatus.ARBITRATING;
          logger.warn(`Task ${taskId}: Escalated to Arbitration`);
        } else {
          task.currentStatus = TaskStatus.FAILED;
          logger.error(`Task ${taskId}: Final Failure`, { error: result.error });
        }
      }
    } catch (error: any) {
      task.currentStatus = TaskStatus.FAILED;
      task.history.push({ success: false, error: error.message, attempt: task.currentAttempt });
      logger.error(`Task ${taskId}: Unexpected system error`, { error: error.message });
    }

    task.updatedAt = new Date();
    await saveTask(task);
    this.tasks.set(taskId, task);
    this.notifyTaskUpdate(task);
    
    checkpointManager.saveCheckpoint({
      taskId,
      phase: 'final',
      state: { status: task.currentStatus, attempts: task.currentAttempt },
      timestamp: new Date().toISOString()
    });
  }
}
