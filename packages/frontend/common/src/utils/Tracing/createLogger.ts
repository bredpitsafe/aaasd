import type { TStructurallyCloneable } from '@common/types';
import { isString, noop } from 'lodash-es';
import type { Level, LogEvent, LoggerOptions } from 'pino';
import pino from 'pino';

import { isDevelopment } from '../environment.ts';
import type { TLogEventData, TLoggerSettings } from './def';
import { createInMemoryLogKeeper } from './transmitters/memory';
import { createRemoteTracePublisher } from './transmitters/remote';
import { logWrapper } from './utils';

export function createLogger(settings: Promise<TLoggerSettings>) {
    let fingerprint = '';
    settings.then((s) => (fingerprint = s.fingerprint));

    const memoryTraceKeeper = createInMemoryLogKeeper<TLogEventData>();
    const remoteTracePublisher = createRemoteTracePublisher(
        settings.then(({ sendLog }) => sendLog),
    );
    const minLevel = 'trace';
    const browserOptions: LoggerOptions['browser'] = {
        write: {
            // Don't duplicate `fatal` messages in console since they'll be there already
            fatal: noop,
            // eslint-disable-next-line no-console
            error: logWrapper(console.error),
            // eslint-disable-next-line no-console
            warn: isDevelopment() ? logWrapper(console.warn) : noop,
            // eslint-disable-next-line no-console
            info: isDevelopment() ? logWrapper(console.log) : noop,
            // eslint-disable-next-line no-console
            trace: isDevelopment() ? logWrapper(console.log) : noop,
            // eslint-disable-next-line no-console
            debug: isDevelopment() ? logWrapper(console.log) : noop,
        },
        transmit: {
            level: minLevel,
            send: (level: Level, logEvent: LogEvent) => {
                logWrapper((prefix, message, params) => {
                    const data: TLogEventData = {
                        fingerprint,
                        level,
                        message: `${prefix} ${message}`,
                        params: [params as TStructurallyCloneable],
                        timestamp: logEvent.ts,
                    };

                    memoryTraceKeeper.pushTrace(data);
                    remoteTracePublisher.pushTrace(data);
                })(logEvent.bindings, logEvent.messages);
            },
        },
    };

    // Inside pino exist weird logic, if exist `write` field in browserOptions, pino rewrite `asObject` to `true`
    Object.defineProperty(browserOptions, 'asObject', {
        get: () => false,
        set: noop,
    });

    const logger = pino({
        level: minLevel,
        browser: browserOptions,
    });

    function getLogs() {
        return memoryTraceKeeper.getLogs();
    }

    logger.fatal = logger.fatal.bind(logger);
    logger.error = logger.error.bind(logger);
    logger.warn = logger.warn.bind(logger);
    logger.info = logger.info.bind(logger);
    logger.trace = logger.trace.bind(logger);
    logger.debug = logger.debug.bind(logger);

    // Capture all exceptions & rejections and pass them through logger
    if (typeof self !== 'undefined') {
        self.addEventListener('error', ({ message, error }) =>
            logger.error(`Unhandled error${isString(message) ? ` "${message}"` : ''}`, error),
        );
        self.addEventListener('unhandledrejection', ({ reason }) =>
            logger.error(
                `Unhandled promise rejection${isString(reason.error) ? ` "${reason.error}"` : ''}`,
                reason,
            ),
        );
    }

    return { logger, getLogs };
}
