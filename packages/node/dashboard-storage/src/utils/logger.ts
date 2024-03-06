import { isNil, isObject } from 'lodash-es';
import { createLogger, format, LoggerOptions, transports } from 'winston';

import { EActorName, TActorSocketKey } from '../def/actor.ts';
import { config } from './config.ts';
import { CorrelationId, TraceId } from './traceId/index.ts';

type TLoggerMessage = {
    actor: EActorName;
    traceId: TraceId;
    correlationId?: CorrelationId;
    socketKey?: TActorSocketKey;
    message: string;
    [param: string]: unknown;
};

type TLogger = {
    debug: (params: TLoggerMessage) => void;
    info: (params: TLoggerMessage) => void;
    warn: (params: TLoggerMessage) => void;
    error: (params: TLoggerMessage) => void;
};

function tskv(obj: object): string {
    return Object.entries(obj)
        .map(
            ([key, value]) =>
                `${key}=${isObject(value) ? JSON.stringify(value) : (value as string)}`,
        )
        .join('\t');
}

const customFormatter = format.printf(
    ({ level, timestamp, actor, message, socketKey, traceId, correlationId, ...restParams }) => {
        if (!isNil(socketKey)) {
            restParams.socketKey = socketKey;
        }
        if (!isNil(correlationId)) {
            restParams.correlationId = correlationId;
        }

        const ts = `${timestamp as string}000000`;
        const logLevel = level.toUpperCase();
        const logTraceId = `[${String(traceId) ?? undefined}]`;
        const logActor = (actor as EActorName) ?? EActorName.Root;
        const logParams = tskv(restParams);
        const logMessage = `${logActor} - ${message as string}`;

        return [ts, logLevel, logTraceId, logMessage, logParams].join('\t');
    },
);

const logConfiguration: LoggerOptions = {
    transports: [new transports.Console({ level: config.logging.level })],
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss.SSS',
        }),
        customFormatter,
    ),
};

const winstonLogger = createLogger(logConfiguration);

export const logger: TLogger = {
    debug: winstonLogger.debug.bind(winstonLogger),
    info: winstonLogger.info.bind(winstonLogger),
    warn: winstonLogger.warn.bind(winstonLogger),
    error: winstonLogger.error.bind(winstonLogger),
};
