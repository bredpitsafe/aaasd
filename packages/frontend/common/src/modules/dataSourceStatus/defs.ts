import type { Milliseconds } from '@common/types';

export enum EDataSourceStatus {
    Unknown = 'Unknown',
    Stable = 'Stable',
    Unstable = 'Unstable',
    Disconnected = 'Disconnected',
}

export enum EDataSourceLevel {
    Success = 'success',
    Info = 'info',
    Warning = 'warning',
    Error = 'error',
}

export type TDataSourceName = string;

export enum EDataSourceType {
    WS = 'WebSocket',
    HTTP = 'HTTP',
}

export type TDataSourceLog = {
    level: EDataSourceLevel;
    status: EDataSourceStatus;
    message: string;
    timestamp: Milliseconds;
};

export type TDataSourceState = {
    type: EDataSourceType;
    name: TDataSourceName;
    url: string;
    level: EDataSourceLevel;
    status: EDataSourceStatus;
    log: TDataSourceLog[];
};

export type TDataSourceStateMap = Record<TDataSourceName, TDataSourceState>;
