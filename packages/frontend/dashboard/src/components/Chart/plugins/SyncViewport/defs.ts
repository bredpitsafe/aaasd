import type { TimeseriesCharter } from '@frontend/charter/src';
import type { Someseconds } from '@frontend/common/src/types/time';

export type TSyncViewportSyncData = TUpdateData;
export type TUpdateData = {
    clientTimeIncrement: Someseconds;
    left: number;
    right: number;
};

export type TSyncData = TUpdateData & {
    host?: undefined | TimeseriesCharter;
};
