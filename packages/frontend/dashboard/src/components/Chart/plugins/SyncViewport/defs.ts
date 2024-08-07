import type { Someseconds } from '@common/types';
import type { TimeseriesCharter } from '@frontend/charter/src';

export type TSyncViewportSyncData = TUpdateData;
export type TUpdateData = {
    clientTimeIncrement: Someseconds;
    left: number;
    right: number;
};

export type TSyncData = TUpdateData & {
    host?: undefined | TimeseriesCharter;
};
