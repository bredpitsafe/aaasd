import { TFetchHandler, THandlerOptions } from '../modules/communicationHandlers/def';
import { TSocketURL } from '../types/domain/sockets';
import { TStructurallyCloneableObject } from '../types/serialization';
import type { Nanoseconds } from '../types/time';
import { isProduction } from '../utils/environment';

export type TPublishLog = {
    clientTime: Nanoseconds;
    level: ELogLevel;
    message: string;
    params?: undefined | TStructurallyCloneableObject;
};

type TSendBody = {
    type: 'PublishLogEvent';
} & TPublishLog;

export enum ELogLevel {
    Info = 'Info',
    Warn = 'Warn',
    Error = 'Error',
    Debug = 'Debug',
}

export function sendLogsEventHandle(
    fetch: TFetchHandler,
    url: TSocketURL,
    log: TPublishLog,
    options?: THandlerOptions,
) {
    if (!isProduction()) return;

    fetch<TSendBody, {}>(
        url,
        {
            type: 'PublishLogEvent',
            ...log,
        },
        {
            ...options,
            enableLogs: false,
            waitForResponse: false,
            skipAuthentication: true,
        },
    ).subscribe();
}
