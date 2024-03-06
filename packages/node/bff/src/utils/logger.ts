import { isNil, isObject } from 'lodash-es';
import { SetOptional } from 'type-fest';
import {
    createLogger as createWinstonLogger,
    format,
    LeveledLogMethod,
    LoggerOptions,
    transports,
} from 'winston';

import { EActorName } from '../def/actor.ts';
import { TUserName } from '../def/user.ts';
import { appConfig } from './appConfig.ts';
import { TCorrelationId } from './correlationId.ts';
import { TSessionId } from './sessionId.ts';
import { TraceId } from './traceId.ts';

/**
 * @public
 */
export type TLoggerMessage = {
    actor: EActorName;
    traceId: TraceId;
    correlationId?: TCorrelationId;
    sessionId?: TSessionId;
    username?: TUserName;
    error?: unknown;
    message: string;
    [param: string]: unknown;
};

function printObject(obj: Record<string, unknown>): string {
    return Object.keys(obj)
        .sort()
        .map((key) => {
            const value = obj[key];
            return `${key}=${isObject(value) ? JSON.stringify(value) : (value as string)}`;
        })
        .join('\t');
}

function createErrorLog(error: unknown) {
    if (error instanceof Error) {
        return {
            ...error,
            message: error.message,
        };
    } else if (isObject(error)) {
        return error;
    }

    return { message: error };
}

const customFormatter = format.printf(
    ({
        level,
        timestamp,
        actor,
        message,
        socketKey,
        traceId,
        correlationId,
        error,
        ...restParams
    }) => {
        if (!isNil(socketKey)) {
            restParams.socketKey = socketKey;
        }
        if (!isNil(correlationId)) {
            restParams.correlationId = correlationId;
        }
        if (!isNil(error)) {
            restParams.error = createErrorLog(error);
        }

        const ts = `${timestamp as string}000000`;
        const logLevel = level.toUpperCase();
        const logTraceId = `[${String(traceId) ?? undefined}]`;
        const logActor = (actor as EActorName) ?? EActorName.Root;
        const logParams = printObject(restParams);
        const logMessage = `${logActor} - ${message as string}`;

        return [ts, logLevel, logTraceId, logMessage, logParams].join('\t');
    },
);

const logConfiguration: LoggerOptions = {
    transports: [
        new transports.Console({
            level: appConfig.logging.level,
            format: format.combine(
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss.SSS',
                }),
                customFormatter,
                format.colorize({ all: appConfig.service.stage === 'dev' }),
            ),
        }),
    ],
};

function createLogger<K extends keyof TLoggerMessage>(
    defaultParams?: Pick<TLoggerMessage, K>,
): TLogger<K> {
    const winstonLogger = createWinstonLogger(logConfiguration);
    const logFn = (method: LeveledLogMethod) => {
        return (params: SetOptional<TLoggerMessage, K>) => {
            method.call(winstonLogger, {
                ...defaultParams,
                ...params,
            });
        };
    };
    return {
        debug: logFn(winstonLogger.debug),
        info: logFn(winstonLogger.info),
        warn: logFn(winstonLogger.warn),
        error: logFn(winstonLogger.error),
        child: <P extends keyof TLoggerMessage>(childParams: Pick<TLoggerMessage, P>) =>
            createLogger<K | P>({ ...defaultParams, ...childParams } as Pick<
                TLoggerMessage,
                K | P
            >),
    };
}

export type TLogger<T extends keyof TLoggerMessage = ''> = {
    debug: (params: SetOptional<TLoggerMessage, T>) => void;
    info: (params: SetOptional<TLoggerMessage, T>) => void;
    warn: (params: SetOptional<TLoggerMessage, T>) => void;
    error: (params: SetOptional<TLoggerMessage, T>) => void;
    child: <P extends keyof TLoggerMessage>(childParams: Pick<TLoggerMessage, P>) => TLogger<T | P>;
};

export const defaultLogger: TLogger = createLogger();
