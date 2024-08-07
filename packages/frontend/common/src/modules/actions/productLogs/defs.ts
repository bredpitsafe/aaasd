import type { ISO, Milliseconds } from '@common/types';
import type { TraceId } from '@common/utils';

import type { TStructurallyCloneableObject } from '../../../types/serialization.ts';

export enum EProductLogLevel {
    Info = 'Info',
    Warn = 'Warn',
    Error = 'Error',
}

export const allProductLogLevels = [
    EProductLogLevel.Info,
    EProductLogLevel.Warn,
    EProductLogLevel.Error,
];

export type TProductLog = {
    fingerprint: string;
    traceId: TraceId;
    level: EProductLogLevel;
    message: string;
    platformTime: ISO;
    actorGroup: string;
    actorKey: string;
    component: string;
    location: string;
    dedupCount: number;
    dedupKey: number;
    fields: TStructurallyCloneableObject;
};

export type TProductLogFilters = {
    backtestingRunId?: number;
    include?: {
        level?: EProductLogLevel[];
        message?: string[];
        actorKey?: string[];
        actorGroup?: string[];
    };
    exclude?: {
        message?: string[];
        actorKey?: string[];
        actorGroup?: string[];
    };
};

export type TServerProductLogFilters = {
    btRunNo?: number;
    include?: {
        level?: EProductLogLevel[];
        actorKey?: string[];
        actorGroup?: string[];
        messageContains?: string[];
    };
    exclude?: {
        actorKey?: string[];
        actorGroup?: string[];
        messageContains?: string[];
    };
};

export type TProductLogSubscriptionFilters = TProductLogFilters & {
    since?: Milliseconds;
    till?: Milliseconds;
};
