type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev =
  (typeof __DEV__ !== 'undefined' && __DEV__ === true) ||
  (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production');

function formatMessage(scope: string, message: string) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${scope}] ${message}`;
}

function log(level: LogLevel, scope: string, message: string, payload?: unknown) {
  const formatted = formatMessage(scope, message);

  switch (level) {
    case 'debug':
      if (isDev) {
        console.debug(formatted, payload ?? '');
      }
      break;
    case 'info':
      console.info(formatted, payload ?? '');
      break;
    case 'warn':
      console.warn(formatted, payload ?? '');
      break;
    case 'error':
      console.error(formatted, payload ?? '');
      break;
    default:
      console.log(formatted, payload ?? '');
  }
}

const logger = {
  debug(scope: string, message: string, payload?: unknown) {
    log('debug', scope, message, payload);
  },
  info(scope: string, message: string, payload?: unknown) {
    log('info', scope, message, payload);
  },
  warn(scope: string, message: string, payload?: unknown) {
    log('warn', scope, message, payload);
  },
  error(scope: string, message: string, payload?: unknown) {
    log('error', scope, message, payload);
  },
};

export default logger;



