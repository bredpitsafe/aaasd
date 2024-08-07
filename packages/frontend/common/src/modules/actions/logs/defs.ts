import type { Nanoseconds } from '@common/types';

import type { TStructurallyCloneableObject } from '../../../types/serialization.ts';

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
