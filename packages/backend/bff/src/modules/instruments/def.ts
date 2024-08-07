import type { TRpcApi } from '../../def/rpc.ts';
import type { TStageName } from '../../def/stages.ts';
import type {
    TApproveAssetRequestPayload,
    TApproveAssetResponsePayload,
} from './schemas/ApproveAsset.schema.ts';
import type {
    TApproveIndexRequestPayload,
    TApproveIndexResponsePayload,
} from './schemas/ApproveIndex.schema.ts';
import type {
    TApproveInstrumentRequestPayload,
    TApproveInstrumentResponsePayload,
} from './schemas/ApproveInstrument.schema.ts';
import type {
    TFetchInstrumentRevisionsLogRequestPayload,
    TFetchInstrumentRevisionsLogResponsePayload,
} from './schemas/FetchInstrumentRevisionsLog.schema.ts';
import type {
    TFetchInstrumentsSnapshotRequestPayload,
    TFetchInstrumentsSnapshotResponsePayload,
} from './schemas/FetchInstrumentsSnapshot.schema.ts';
import type {
    TSubscribeToAssetsRequestPayload,
    TSubscribeToAssetsResponsePayload,
} from './schemas/SubscribeToAssets.schema.ts';
import type {
    TSubscribeToIndexesRequestPayload,
    TSubscribeToIndexesResponsePayload,
} from './schemas/SubscribeToIndexes.schema.ts';
import type {
    TSubscribeToInstrumentRevisionsRequestPayload,
    TSubscribeToInstrumentRevisionsResponsePayload,
} from './schemas/SubscribeToInstrumentRevisions.schema.ts';
import type {
    TSubscribeToInstrumentsRequestPayload,
    TSubscribeToInstrumentsResponsePayload,
} from './schemas/SubscribeToInstruments.schema.ts';
import type {
    TSubscribeToInstrumentsDynamicDataRequestPayload,
    TSubscribeToInstrumentsDynamicDataResponsePayload,
} from './schemas/SubscribeToInstrumentsDynamicData.schema.ts';
import type {
    TUpdateProviderInstrumentsOverrideRequestPayload,
    TUpdateProviderInstrumentsOverrideResponsePayload,
} from './schemas/UpdateProviderInstrumentsOverride.schema.ts';

export const INSTRUMENTS_REQUEST_STAGE = 'instruments' as TStageName;

export enum EInstrumentsRouteName {
    // Instruments
    SubscribeToInstruments = 'SubscribeToInstruments',
    SubscribeToInstrumentsDynamicData = 'SubscribeToInstrumentsDynamicData',
    SubscribeToInstrumentRevisions = 'SubscribeToInstrumentRevisions',
    FetchInstrumentsSnapshot = 'FetchInstrumentsSnapshot',
    FetchInstrumentRevisionsLog = 'FetchInstrumentRevisionsLog',
    ApproveInstrument = 'ApproveInstrument',
    UpdateProviderInstrumentsOverride = 'UpdateProviderInstrumentsOverride',

    // Assets API
    SubscribeToAssets = 'SubscribeToAssets',
    ApproveAsset = 'ApproveAsset',

    // Indexes API
    SubscribeToIndexes = 'SubscribeToIndexes',
    ApproveIndex = 'ApproveIndex',
}

export type TInstrumentsRoutesMap = {
    [EInstrumentsRouteName.SubscribeToInstruments]: TRpcApi<
        TSubscribeToInstrumentsRequestPayload,
        TSubscribeToInstrumentsResponsePayload
    >;
    [EInstrumentsRouteName.SubscribeToInstrumentsDynamicData]: TRpcApi<
        TSubscribeToInstrumentsDynamicDataRequestPayload,
        TSubscribeToInstrumentsDynamicDataResponsePayload
    >;
    [EInstrumentsRouteName.SubscribeToInstrumentRevisions]: TRpcApi<
        TSubscribeToInstrumentRevisionsRequestPayload,
        TSubscribeToInstrumentRevisionsResponsePayload
    >;
    [EInstrumentsRouteName.SubscribeToAssets]: TRpcApi<
        TSubscribeToAssetsRequestPayload,
        TSubscribeToAssetsResponsePayload
    >;
    [EInstrumentsRouteName.SubscribeToIndexes]: TRpcApi<
        TSubscribeToIndexesRequestPayload,
        TSubscribeToIndexesResponsePayload
    >;
    [EInstrumentsRouteName.FetchInstrumentsSnapshot]: TRpcApi<
        TFetchInstrumentsSnapshotRequestPayload,
        TFetchInstrumentsSnapshotResponsePayload
    >;
    [EInstrumentsRouteName.FetchInstrumentRevisionsLog]: TRpcApi<
        TFetchInstrumentRevisionsLogRequestPayload,
        TFetchInstrumentRevisionsLogResponsePayload
    >;
    [EInstrumentsRouteName.ApproveInstrument]: TRpcApi<
        TApproveInstrumentRequestPayload,
        TApproveInstrumentResponsePayload
    >;
    [EInstrumentsRouteName.UpdateProviderInstrumentsOverride]: TRpcApi<
        TUpdateProviderInstrumentsOverrideRequestPayload,
        TUpdateProviderInstrumentsOverrideResponsePayload
    >;
    [EInstrumentsRouteName.ApproveAsset]: TRpcApi<
        TApproveAssetRequestPayload,
        TApproveAssetResponsePayload
    >;
    [EInstrumentsRouteName.ApproveIndex]: TRpcApi<
        TApproveIndexRequestPayload,
        TApproveIndexResponsePayload
    >;
};
