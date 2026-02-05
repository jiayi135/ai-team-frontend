import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { Task } from './task_orchestrator';
import { createLogger } from './logger';

const logger = createLogger('Database');
let db: Database | null = null;

export async function initializeDatabase() {
  if (db) return db;

  db = await open({
    filename: './ai_team_governance.db',
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      goal TEXT NOT NULL,
      currentStatus TEXT NOT NULL,
      history TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      assignedRole TEXT NOT NULL,
      context TEXT
    );
  `);
  logger.info("SQLite database initialized");
  return db;
}

export async function saveTask(task: Task) {
  if (!db) await initializeDatabase();
  await db!.run(
    `INSERT OR REPLACE INTO tasks (id, goal, currentStatus, history, createdAt, updatedAt, assignedRole, context)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
    task.id, 
    task.goal, 
    task.currentStatus, 
    JSON.stringify(task.history), 
    task.createdAt.toISOString(), 
    task.updatedAt.toISOString(), 
    task.assignedRole,
    task.context
  );
  logger.debug("Task saved", { taskId: task.id });
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  if (!db) await initializeDatabase();
  const row = await db!.get(
    `SELECT * FROM tasks WHERE id = ?`, 
    id
  );
  if (row) {
    return {
      ...row,
      history: JSON.parse(row.history),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
  return undefined;
}

export async function getAllTasks(): Promise<Task[]> {
  if (!db) await initializeDatabase();
  const rows = await db!.all(`SELECT * FROM tasks`);
  return rows.map(row => ({
    ...row,
    history: JSON.parse(row.history),
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }));
}
