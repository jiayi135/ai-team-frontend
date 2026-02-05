export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  context?: any;
}

export class Logger {
  private moduleName: string;

  constructor(moduleName: string) {
    this.moduleName = moduleName;
  }

  private log(level: LogLevel, message: string, context?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module: this.moduleName,
      message,
      context,
    };
    console.log(JSON.stringify(entry));
  }

  public info(message: string, context?: any) {
    this.log(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: any) {
    this.log(LogLevel.WARN, message, context);
  }

  public error(message: string, context?: any) {
    this.log(LogLevel.ERROR, message, context);
  }

  public debug(message: string, context?: any) {
    this.log(LogLevel.DEBUG, message, context);
  }
}

export const createLogger = (moduleName: string) => new Logger(moduleName);
