import type { TraceId } from '@common/utils';
import { isNil, isObject } from 'lodash-es';
import type { SetOptional as SetSomeOptional } from 'type-fest';
import type { LeveledLogMethod } from 'winston';
import { createLogger as createWinstonLogger, format, transports } from 'winston';

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

const getCustomFormatter = (defaultLogActor: string) =>
    format.printf(
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
            const logActor = actor ?? defaultLogActor;
            const logParams = printObject(restParams);
            const logMessage = `${logActor} - ${message as string}`;

            return [ts, logLevel, logTraceId, logMessage, logParams].join('\t');
        },
    );

export type TLoggerBasicMessage = {
    traceId: TraceId;
    error?: unknown;
    message: string;
    [param: string]: unknown;
};

export type TBasicLogger<
    LoggerMessage extends TLoggerBasicMessage = TLoggerBasicMessage,
    DefaultedMessageParamKeys extends keyof LoggerMessage = '',
> = {
    debug: (params: SetSomeOptional<LoggerMessage, DefaultedMessageParamKeys>) => void;
    info: (params: SetSomeOptional<LoggerMessage, DefaultedMessageParamKeys>) => void;
    warn: (params: SetSomeOptional<LoggerMessage, DefaultedMessageParamKeys>) => void;
    error: (params: SetSomeOptional<LoggerMessage, DefaultedMessageParamKeys>) => void;
    createChildLogger: <ChildLoggerDefaultedMessageParamKeys extends keyof LoggerMessage>(
        childDefaultedMessageParams: Pick<LoggerMessage, ChildLoggerDefaultedMessageParamKeys>,
    ) => TBasicLogger<
        LoggerMessage,
        DefaultedMessageParamKeys | ChildLoggerDefaultedMessageParamKeys
    >;
};

export function createLogger<
    LoggerMessage extends TLoggerBasicMessage = TLoggerBasicMessage,
    DefaultedMessageParamKeys extends keyof LoggerMessage = '',
>({
    loggingLevel,
    defaultLogActor,
    devMode = false,
    defaultedMessageParams,
}: {
    loggingLevel: string;
    defaultLogActor: string;
    devMode?: boolean;
    defaultedMessageParams?: Pick<LoggerMessage, DefaultedMessageParamKeys>;
}): TBasicLogger<LoggerMessage, DefaultedMessageParamKeys> {
    const winstonLogger = createWinstonLogger({
        transports: [new transports.Console({ level: loggingLevel })],
        format: format.combine(
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss.SSS',
            }),
            getCustomFormatter(defaultLogActor),
            format.colorize({ all: devMode }),
        ),
    });

    const logFn = (method: LeveledLogMethod) => {
        return (params: SetSomeOptional<LoggerMessage, DefaultedMessageParamKeys>) => {
            method.call(winstonLogger, {
                ...defaultedMessageParams,
                ...params,
            });
        };
    };

    return {
        debug: logFn(winstonLogger.debug),
        info: logFn(winstonLogger.info),
        warn: logFn(winstonLogger.warn),
        error: logFn(winstonLogger.error),
        createChildLogger: <ChildLoggerDefaultedMessageParamKeys extends keyof LoggerMessage>(
            childDefaultedMessageParams: Pick<LoggerMessage, ChildLoggerDefaultedMessageParamKeys>,
        ) =>
            createLogger<
                LoggerMessage,
                DefaultedMessageParamKeys | ChildLoggerDefaultedMessageParamKeys
            >({
                loggingLevel,
                defaultLogActor,
                defaultedMessageParams: {
                    ...defaultedMessageParams,
                    ...childDefaultedMessageParams,
                } as Pick<
                    LoggerMessage,
                    DefaultedMessageParamKeys | ChildLoggerDefaultedMessageParamKeys
                >,
            }),
    };
}
