import { Defer } from '../Defer';
import { createLogger } from './createLogger';
import type { TLoggerSettings } from './def';

const loggerSettings = new Defer<TLoggerSettings>();

export const setLoggerSettings = loggerSettings.resolve;
export const { logger, getLogs } = createLogger(loggerSettings.promise);
export type TLogger = typeof logger;
