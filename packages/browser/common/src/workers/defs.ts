import { Opaque } from '../types';
import { EApplicationName } from '../types/app';
import { createWorkerIds } from './utils/createWorkerId';

export type TWorkerId = Opaque<'WorkerName', string>;

export enum EWorkerName {
    SharedRoot = 'SharedRoot',
    BacktestingDataProviders = 'BacktestingDataProviders',
}

export const EWorkerIds = <const>{
    [EWorkerName.SharedRoot]: createWorkerIds(EWorkerName.SharedRoot),
    [EWorkerName.BacktestingDataProviders]: createWorkerIds(EWorkerName.BacktestingDataProviders),
};

export type TThreadName = EApplicationName | EWorkerName;
