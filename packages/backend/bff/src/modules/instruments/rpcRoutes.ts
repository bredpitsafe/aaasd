import { filter, map } from 'rxjs';

import { EGrpcClientName } from '../../def/grpcClients.ts';
import { ERpcMethod } from '../../rpc/def.ts';
import { createRpcRoutes } from '../../rpc/utils.ts';
import { pipeMetadataTransformers } from '../../transport/grpc/client/metadataTransformers.ts';
import { isDefined } from '../../utils/types.ts';
import { EInstrumentsRouteName, INSTRUMENTS_REQUEST_STAGE } from './def.ts';
import { approveAssetTransformers } from './transformers/approveAsset.ts';
import { approveIndexTransformers } from './transformers/approveIndex.ts';
import { approveInstrumentTransformers } from './transformers/approveInstrument.ts';
import { fetchInstrumentRevisionsLogTransformers } from './transformers/fetchInstrumentRevisionsLog.ts';
import { fetchInstrumentsSnapshotTransformers } from './transformers/fetchInstrumentsSnapshot.ts';
import { subscribeToAssetsTransformers } from './transformers/subscribeToAssets.ts';
import { subscribeToIndexesTransformers } from './transformers/subscribeToIndexes.ts';
import { subscribeToInstrumentRevisionsTransformers } from './transformers/subscribeToInstrumentRevisions.ts';
import { subscribeToInstrumentsTransformers } from './transformers/subscribeToInstruments.ts';
import { subscribeToInstrumentsDynamicDataTransformers } from './transformers/subscribeToInstrumentsDynamicData.ts';
import { updateProviderInstrumentsOverrideTransformers } from './transformers/updateProviderInstrumentsOverride.ts';

const requestStage = () => INSTRUMENTS_REQUEST_STAGE;

export const instrumentsRpcRoutes = createRpcRoutes<EInstrumentsRouteName>({
    [EInstrumentsRouteName.SubscribeToInstruments]: {
        method: ERpcMethod.SUBSCRIBE,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.InstrumentsV1)
                .subscribeToInstruments(
                    subscribeToInstrumentsTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) => subscribeToInstrumentsTransformers.fromGrpcToResponse(data)),
                    filter(isDefined),
                );
        },
    },
    [EInstrumentsRouteName.SubscribeToInstrumentsDynamicData]: {
        method: ERpcMethod.SUBSCRIBE,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.InstrumentsV1)
                .subscribeToInstrumentsDynamicData(
                    subscribeToInstrumentsDynamicDataTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        subscribeToInstrumentsDynamicDataTransformers.fromGrpcToResponse(data),
                    ),
                    filter(isDefined),
                );
        },
    },
    [EInstrumentsRouteName.SubscribeToInstrumentRevisions]: {
        method: ERpcMethod.SUBSCRIBE,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.InstrumentsV1)
                .subscribeToInstrumentRevisions(
                    subscribeToInstrumentRevisionsTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        subscribeToInstrumentRevisionsTransformers.fromGrpcToResponse(data),
                    ),
                    filter(isDefined),
                );
        },
    },
    [EInstrumentsRouteName.SubscribeToAssets]: {
        method: ERpcMethod.SUBSCRIBE,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.AssetsV1)
                .subscribeToAssets(
                    subscribeToAssetsTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) => subscribeToAssetsTransformers.fromGrpcToResponse(data)),
                    filter(isDefined),
                );
        },
    },
    [EInstrumentsRouteName.SubscribeToIndexes]: {
        method: ERpcMethod.SUBSCRIBE,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.IndexesV1)
                .subscribeToIndexes(
                    subscribeToIndexesTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) => subscribeToIndexesTransformers.fromGrpcToResponse(data)),
                    filter(isDefined),
                );
        },
    },
    [EInstrumentsRouteName.FetchInstrumentsSnapshot]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.InstrumentsV1)
                .fetchInstrumentsSnapshot(
                    fetchInstrumentsSnapshotTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        fetchInstrumentsSnapshotTransformers.fromGrpcToResponse(data),
                    ),
                    filter(isDefined),
                );
        },
    },
    [EInstrumentsRouteName.FetchInstrumentRevisionsLog]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.InstrumentsV1)
                .fetchInstrumentRevisionsLog(
                    fetchInstrumentRevisionsLogTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        fetchInstrumentRevisionsLogTransformers.fromGrpcToResponse(data),
                    ),
                    filter(isDefined),
                );
        },
    },
    [EInstrumentsRouteName.ApproveInstrument]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.InstrumentsV1)
                .approveInstrument(
                    approveInstrumentTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) => approveInstrumentTransformers.fromGrpcToResponse(data)),
                    filter(isDefined),
                );
        },
    },
    [EInstrumentsRouteName.UpdateProviderInstrumentsOverride]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.InstrumentsV1)
                .updateProviderInstrumentsOverride(
                    updateProviderInstrumentsOverrideTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        updateProviderInstrumentsOverrideTransformers.fromGrpcToResponse(data),
                    ),
                    filter(isDefined),
                );
        },
    },
    [EInstrumentsRouteName.ApproveAsset]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.AssetsV1)
                .approveAsset(
                    approveAssetTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) => approveAssetTransformers.fromGrpcToResponse(data)),
                    filter(isDefined),
                );
        },
    },
    [EInstrumentsRouteName.ApproveIndex]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.IndexesV1)
                .approveIndex(
                    approveIndexTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) => approveIndexTransformers.fromGrpcToResponse(data)),
                    filter(isDefined),
                );
        },
    },
});
