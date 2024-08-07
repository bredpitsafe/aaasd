import type { Nanoseconds, TStructurallyCloneableObject } from '@common/types';

export type TPublishLog = {
    clientTime: Nanoseconds;
    level: ELogLevel;
    message: string;
    params?: undefined | TStructurallyCloneableObject;
};

export enum ELogLevel {
    Info = 'Info',
    Warn = 'Warn',
    Error = 'Error',
    Debug = 'Debug',
}
