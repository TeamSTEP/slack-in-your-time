import pino, { type Logger } from 'pino';
import type { Env } from './env';

export type { Logger };

let loggerInstance: Logger | undefined;

export const createLogger = (env: Env): Logger => {
    const level = env.LOG_LEVEL ?? (env.NODE_ENV === 'development' ? 'debug' : 'info');

    return pino({ level });
};

export const setLogger = (logger: Logger) => {
    loggerInstance = logger;
};

export const getLogger = (): Logger => {
    if (!loggerInstance) {
        throw new Error('Logger has not been initialized');
    }

    return loggerInstance;
};
