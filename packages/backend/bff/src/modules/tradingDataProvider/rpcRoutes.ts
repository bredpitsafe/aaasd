import { filter, map } from 'rxjs';

import { EGrpcClientName } from '../../def/grpcClients.ts';
import { ERpcMethod } from '../../rpc/def.ts';
import { createRpcRoutes } from '../../rpc/utils.ts';
import { pipeMetadataTransformers } from '../../transport/grpc/client/metadataTransformers.ts';
import { isDefined } from '../../utils/types.ts';
import { ETradingDataProviderRouteName } from './def.ts';
import { fetchConvertRatesLogTransformers } from './transformers/fetchConvertRatesLog.ts';
import { fetchConvertRatesSnapshotTransformers } from './transformers/fetchConvertRatesSnapshot.ts';
import { fetchStmBalancesSnapshotTransformers } from './transformers/fetchStmBalancesSnapshot.ts';
import { fetchStmPositionsSnapshotTransformers } from './transformers/fetchStmPositionsSnapshot.ts';
import { subscribeToConvertRatesTransformers } from './transformers/subscribeToConvertRates.ts';
import { subscribeToStmBalancesTransformers } from './transformers/subscribeToStmBalances.ts';
import { subscribeToStmPositionsTransformers } from './transformers/subscribeToStmPositions.ts';

export const convertRatesRpcRoutes = createRpcRoutes<ETradingDataProviderRouteName>({
    [ETradingDataProviderRouteName.SubscribeToConvertRates]: {
        method: ERpcMethod.SUBSCRIBE,
        requestStage: (ctx) => ctx.req.payload.requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.ConvertRatesV1)
                .subscribeToConvertRates(
                    subscribeToConvertRatesTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) => subscribeToConvertRatesTransformers.fromGrpcToResponse(data)),
                    filter(isDefined),
                );
        },
    },
    [ETradingDataProviderRouteName.FetchConvertRatesLog]: {
        method: ERpcMethod.CALL,
        requestStage: (ctx) => ctx.req.payload.requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.ConvertRatesV1)
                .fetchConvertRatesLog(
                    fetchConvertRatesLogTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(map(({ data }) => fetchConvertRatesLogTransformers.fromGrpcToResponse(data)));
        },
    },
    [ETradingDataProviderRouteName.FetchConvertRatesSnapshot]: {
        method: ERpcMethod.CALL,
        requestStage: (ctx) => ctx.req.payload.requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.ConvertRatesV1)
                .fetchConvertRatesSnapshot(
                    fetchConvertRatesSnapshotTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        fetchConvertRatesSnapshotTransformers.fromGrpcToResponse(data),
                    ),
                );
        },
    },
    [ETradingDataProviderRouteName.SubscribeToStmBalances]: {
        method: ERpcMethod.SUBSCRIBE,
        requestStage: (ctx) => ctx.req.payload.requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.StmV1)
                .subscribeToStmBalances(
                    subscribeToStmBalancesTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) => subscribeToStmBalancesTransformers.fromGrpcToResponse(data)),
                );
        },
    },
    [ETradingDataProviderRouteName.SubscribeToStmPositions]: {
        method: ERpcMethod.SUBSCRIBE,
        requestStage: (ctx) => ctx.req.payload.requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.StmV1)
                .subscribeToStmBalances(
                    subscribeToStmPositionsTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) => subscribeToStmPositionsTransformers.fromGrpcToResponse(data)),
                );
        },
    },
    [ETradingDataProviderRouteName.FetchStmBalancesSnapshot]: {
        method: ERpcMethod.CALL,
        requestStage: (ctx) => ctx.req.payload.requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.StmV1)
                .fetchStmBalancesSnapshot(
                    fetchStmBalancesSnapshotTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        fetchStmBalancesSnapshotTransformers.fromGrpcToResponse(data),
                    ),
                );
        },
    },
    [ETradingDataProviderRouteName.FetchStmPositionsSnapshot]: {
        method: ERpcMethod.CALL,
        requestStage: (ctx) => ctx.req.payload.requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.StmV1)
                .fetchStmBalancesSnapshot(
                    fetchStmPositionsSnapshotTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        fetchStmPositionsSnapshotTransformers.fromGrpcToResponse(data),
                    ),
                );
        },
    },
});
