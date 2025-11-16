import type { ILogger } from '../interfaces/ILogger';
import { LogLevel } from '../interfaces/ILogger';

class Logger implements ILogger {
  private shouldLog(level: typeof LogLevel[keyof typeof LogLevel]): boolean {
    if (import.meta.env.PROD) {
      return level === LogLevel.ERROR || level === LogLevel.WARN;
    }
    return true;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
}

export const logger: ILogger = new Logger();

