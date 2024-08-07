import type { ISO, Milliseconds, Nanoseconds } from '@common/types';
import type { TraceId } from '@common/utils';

import type { TComponentId } from '../../types/domain/component.ts';
import type { TGate } from '../../types/domain/gates.ts';
import type { TRobot, TRobotId } from '../../types/domain/robots.ts';
import type { THandlerOptions } from '../communicationHandlers/def.ts';
import type { TUserName } from '../user';

export type TWithSnapshot = {
    // @deprecated
    isSnapshot: boolean;
    endOfSnapshot: boolean;
    startOfSnapshot: boolean;
};

export type TWithTraceId = {
    traceId: TraceId;
};

export type TUnsubscribe = {
    type: 'Unsubscribe';
};

export type TSubscribed = {
    type: 'Subscribed';
    platformTime: ISO | null;
};

export type SGate = Omit<TGate, 'type'>;

export enum EComponentCommands {
    StartComponent = 'StartComponent',
    StopComponent = 'StopComponent',
    UnblockRobot = 'UnblockRobot',
    DryRunComponent = 'DryRunComponent',
    GenericRobotCommand = 'GenericRobotCommand',
}

export type TComponentConfig = {
    type: 'ComponentConfig';
    user: TUserName;
    componentId: TComponentId;
    componentKind: string;
    componentName: string;
    platformTime: ISO;
    config: string;
    digest: string;
};

export type TRobotDashboard = {
    id: number;
    platformTime: ISO;
    robotId: TRobotId;
    robotName: string;
    name: string;
    backtestingId?: number;
    focusTo?: ISO;
    raw?: string;
};

export type TUnsubscribeSendBody = {
    type: 'Unsubscribe';
};

export type THandlerStreamOptions = THandlerOptions & {
    updatesOnly?: boolean;
    pollInterval?: Milliseconds;
};

export type TWithUpdatesOnly = {
    updatesOnly?: boolean;
};

export type TWithPollInterval = {
    pollInterval?: Milliseconds;
};

export type TWithServerPollInterval = {
    pollInterval?: Nanoseconds;
};

export type TRequestStreamOptions = Partial<{
    updatesOnly: boolean;
    /**
     * @description Only specific types are valid:
     * Duration::from_millis(50),
     * Duration::from_millis(100),
     * Duration::from_millis(200),
     * Duration::from_millis(500),
     * Duration::from_secs(1),
     * Duration::from_secs(2),
     * Duration::from_secs(5),
     * https://bhft-company.atlassian.net/browse/PLT-3015
     */
    pollInterval: Nanoseconds;
}>;

export enum EFetchHistoryDirection {
    Forward = 'Forward',
    Backward = 'Backward',
}

export type TFetchHistoryParams = {
    limit: number;
    direction: EFetchHistoryDirection;
    timestamp: ISO;
    timestampExcluded?: boolean;
    timestampBound?: ISO;
    timestampBoundExcluded?: boolean;
};

export type TServerFetchHistoryParams = {
    limit?: undefined | number;
    // Send softLimit items count + all with same time
    softLimit?: undefined | number;
    direction: EFetchHistoryDirection;
    platformTime: ISO;
    platformTimeExcluded?: boolean; // optional, false by default, excludes start time (platform_time) from response
    platformTimeBound?: ISO;
    platformTimeBoundExcluded?: boolean; // optional, false by default, excludes end time (platform_time_bound) from response if time bound reached
};

export enum ETimeseriesAggregationFunction {
    FlattenCandle = 1,
    Last = 2,
    Candle = 3,
    Unspecified = 0,
}

export enum ETimeseriesAggregationIntervalUnit {
    Unspecified = 0,
    Millis = 1,
    Sec = 2,
    Min = 3,
    Hour = 4,
}

export type TTimeseriesAggregation<
    F extends ETimeseriesAggregationFunction = ETimeseriesAggregationFunction,
> = {
    function: F;
    intervalUnit: ETimeseriesAggregationIntervalUnit;
    intervalValue: number; // uint32
};

export type TTimeseriesFilter = {
    // `bt_run_no` which will be used as default value. Will be override by bt_run_no from
    // PromQL query. If bt_run_no didn't provide in `default_bt_run_no` and PromQL - data
    // will be returned not from backtest.
    defaultBtRunNo: number;
    // **REQUIRED** PromQL request for timeseries. Contains to fields:
    // - bt_run_no: number of backtest run.
    // - name - regex expression to specify names of timeseries.
    // Example:
    //  - indicator{bt_run_no=42,name~="akrousdt\|HuobiSpot.l1.ask|akrousdt\|HuobiSpot.volume"}
    //  - indicator{name="arusdt|HuobiSpot.l1.bid"}
    stringQuery: string;
};

export type TFetchSnapshotParams = {
    limit: number;
    offset: number;
    withTotal?: boolean;
};

export enum EFetchSortOrder {
    Asc = 'Asc',
    Desc = 'Desc',
}

export type TFetchSortFieldOrder<T extends Record<string, unknown>> = [keyof T, EFetchSortOrder];
export type TFetchSortFieldsOrder<T extends Record<string, unknown>> = TFetchSortFieldOrder<T>[];

export const UPDATES_ONLY: Pick<THandlerStreamOptions, 'updatesOnly'> = {
    updatesOnly: true,
};

export const NO_RETRIES: Pick<THandlerOptions, 'enableRetries'> = {
    enableRetries: false,
};

export const NO_LOGS: Pick<THandlerOptions, 'enableLogs'> = {
    enableLogs: false,
};

export type TRobotConfig = Pick<TRobot, 'id'> &
    Partial<Pick<TComponentConfig, 'config' | 'digest'>>;

export type TRobotConfigRecord = Record<TRobotId, TRobotConfig>;
export const DEFAULT_RETRY_DELAY = 5_000 as Milliseconds;
