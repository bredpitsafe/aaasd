import { noop } from 'lodash-es';
import pino, { Level, LogEvent, LoggerOptions } from 'pino';

import { isProduction } from '../environment';
import { Binding } from './Children/Binding';
import { TLogEventData, TLoggerSettings } from './def';
import { createInMemoryLogKeeper } from './transmitters/memory';
import { createRemoteTracePublisher } from './transmitters/remote';
import { consoleWrapper } from './utils';

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
            error: consoleWrapper(console.error),
            warn: consoleWrapper(console.warn),
            info: consoleWrapper(console.info),
            // Don't log debug and trace messages in production, because it's looks like a spam and prevent GC for logged data
            trace: isProduction() ? noop : consoleWrapper(console.log),
            debug: isProduction() ? noop : consoleWrapper(console.log),
        },
        transmit: {
            level: minLevel,
            send: (level: Level, logEvent: LogEvent) => {
                let message = '';
                if (typeof logEvent.messages[0] === 'string') {
                    message = logEvent.messages[0];
                }

                if (!message && typeof logEvent.messages[0]?.message === 'string') {
                    message = logEvent.messages[0].message;
                }

                for (const binding of logEvent.bindings) {
                    if (binding instanceof Binding) {
                        message = `[${binding}]${message}`;
                    }
                }

                const params = message ? logEvent.messages.slice(1) : logEvent.messages;

                const data: TLogEventData = {
                    fingerprint,
                    level,
                    message,
                    params,
                    timestamp: logEvent.ts,
                };

                memoryTraceKeeper.pushTrace(data);
                remoteTracePublisher.pushTrace(data);
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

    return { logger, getLogs };
}
