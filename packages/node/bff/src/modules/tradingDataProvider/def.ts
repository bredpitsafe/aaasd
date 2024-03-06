import { TRpcApi } from '../../def/rpc.ts';
import {
    TFetchConvertRatesLogRequestPayload,
    TFetchConvertRatesLogResponsePayload,
} from './schemas/FetchConvertRatesLog.schema.ts';
import {
    TFetchConvertRatesSnapshotRequestPayload,
    TFetchConvertRatesSnapshotResponsePayload,
} from './schemas/FetchConvertRatesSnapshot.schema.ts';
import {
    TFetchStmBalancesSnapshotRequestPayload,
    TFetchStmBalancesSnapshotResponsePayload,
} from './schemas/FetchStmBalancesSnapshot.schema.ts';
import {
    TFetchStmPositionsSnapshotRequestPayload,
    TFetchStmPositionsSnapshotResponsePayload,
} from './schemas/FetchStmPositionsSnapshot.schema.ts';
import {
    TSubscribeToConvertRatesRequestPayload,
    TSubscribeToConvertRatesResponsePayload,
} from './schemas/SubscribeToConvertRates.schema.ts';
import {
    TSubscribeToStmBalancesRequestPayload,
    TSubscribeToStmBalancesResponsePayload,
} from './schemas/SubscribeToStmBalances.schema.ts';
import {
    TSubscribeToStmPositionsRequestPayload,
    TSubscribeToStmPositionsResponsePayload,
} from './schemas/SubscribeToStmPositions.schema.ts';

export enum ETradingDataProviderRouteName {
    SubscribeToConvertRates = 'SubscribeToConvertRates',
    FetchConvertRatesLog = 'FetchConvertRatesLog',
    FetchConvertRatesSnapshot = 'FetchConvertRatesSnapshot',
    SubscribeToStmBalances = 'SubscribeToStmBalances',
    SubscribeToStmPositions = 'SubscribeToStmPositions',
    FetchStmBalancesSnapshot = 'FetchStmBalancesSnapshot',
    FetchStmPositionsSnapshot = 'FetchStmPositionsSnapshot',
}

export type TTradingDataProviderRoutesMap = {
    [ETradingDataProviderRouteName.SubscribeToConvertRates]: TRpcApi<
        TSubscribeToConvertRatesRequestPayload,
        TSubscribeToConvertRatesResponsePayload
    >;
    [ETradingDataProviderRouteName.FetchConvertRatesLog]: TRpcApi<
        TFetchConvertRatesLogRequestPayload,
        TFetchConvertRatesLogResponsePayload
    >;
    [ETradingDataProviderRouteName.FetchConvertRatesSnapshot]: TRpcApi<
        TFetchConvertRatesSnapshotRequestPayload,
        TFetchConvertRatesSnapshotResponsePayload
    >;
    [ETradingDataProviderRouteName.SubscribeToStmBalances]: TRpcApi<
        TSubscribeToStmBalancesRequestPayload,
        TSubscribeToStmBalancesResponsePayload
    >;
    [ETradingDataProviderRouteName.SubscribeToStmPositions]: TRpcApi<
        TSubscribeToStmPositionsRequestPayload,
        TSubscribeToStmPositionsResponsePayload
    >;
    [ETradingDataProviderRouteName.FetchStmBalancesSnapshot]: TRpcApi<
        TFetchStmBalancesSnapshotRequestPayload,
        TFetchStmBalancesSnapshotResponsePayload
    >;
    [ETradingDataProviderRouteName.FetchStmPositionsSnapshot]: TRpcApi<
        TFetchStmPositionsSnapshotRequestPayload,
        TFetchStmPositionsSnapshotResponsePayload
    >;
};
