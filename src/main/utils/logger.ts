type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

const isDevelopment = process.env.NODE_ENV === 'development';

function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  const output = JSON.stringify(entry);

  switch (level) {
    case 'error':
      process.stderr.write(output + '\n');
      break;
    case 'warn':
      process.stderr.write(output + '\n');
      break;
    case 'debug':
      // debug ログは開発環境のみ出力
      if (isDevelopment) {
        process.stdout.write(output + '\n');
      }
      break;
    default:
      process.stdout.write(output + '\n');
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>): void =>
    log('debug', message, context),
  info: (message: string, context?: Record<string, unknown>): void =>
    log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>): void =>
    log('warn', message, context),
  error: (message: string, context?: Record<string, unknown>): void =>
    log('error', message, context),
};
