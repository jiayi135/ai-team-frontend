import * as fs from 'fs';
import * as path from 'path';
import { createLogger } from './logger';

const logger = createLogger('CheckpointManager');
const CHECKPOINT_DIR = path.join('/home/ubuntu/ai-team-frontend/server', 'checkpoints');

export interface CheckpointData {
  taskId: string;
  phase: string;
  state: any;
  timestamp: string;
}

export class CheckpointManager {
  constructor() {
    if (!fs.existsSync(CHECKPOINT_DIR)) {
      fs.mkdirSync(CHECKPOINT_DIR, { recursive: true });
    }
  }

  public saveCheckpoint(data: CheckpointData) {
    const filePath = path.join(CHECKPOINT_DIR, `${data.taskId}_${data.phase}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    logger.info('Checkpoint saved', { taskId: data.taskId, phase: data.phase });
  }

  public loadCheckpoint(taskId: string, phase: string): CheckpointData | null {
    const filePath = path.join(CHECKPOINT_DIR, `${taskId}_${phase}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
    return null;
  }
}

export const checkpointManager = new CheckpointManager();
