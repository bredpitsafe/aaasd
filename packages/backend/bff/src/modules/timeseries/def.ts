import type { TRpcApi } from '../../def/rpc.ts';
import type {
    TFetchTaggedTimeseriesDataLogRequestPayload,
    TFetchTaggedTimeseriesDataLogResponsePayload,
} from './schemas/FetchTaggedTimeseriesDataLog.schema.ts';
import type {
    TFetchTimeseriesLogRequestPayload,
    TFetchTimeseriesLogResponsePayload,
} from './schemas/FetchTimeseriesLog.schema.ts';
import type {
    TSubscribeToTimeseriesLogRequestPayload,
    TSubscribeToTimeseriesLogResponsePayload,
} from './schemas/SubscribeToTimeseriesLog.schema.ts';

export enum ETimeseriesRouteName {
    SubscribeToTimeseriesLog = 'SubscribeToTimeseriesLog',
    FetchTimeseriesLog = 'FetchTimeseriesLog',
    FetchTaggedTimeseriesDataLog = 'FetchTaggedTimeseriesDataLog',
}

export type TTimeseriesRoutesMap = {
    [ETimeseriesRouteName.SubscribeToTimeseriesLog]: TRpcApi<
        TSubscribeToTimeseriesLogRequestPayload,
        TSubscribeToTimeseriesLogResponsePayload
    >;
    [ETimeseriesRouteName.FetchTimeseriesLog]: TRpcApi<
        TFetchTimeseriesLogRequestPayload,
        TFetchTimeseriesLogResponsePayload
    >;
    [ETimeseriesRouteName.FetchTaggedTimeseriesDataLog]: TRpcApi<
        TFetchTaggedTimeseriesDataLogRequestPayload,
        TFetchTaggedTimeseriesDataLogResponsePayload
    >;
};
