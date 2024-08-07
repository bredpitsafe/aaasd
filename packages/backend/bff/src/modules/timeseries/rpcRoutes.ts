import { filter, map } from 'rxjs';

import { EGrpcClientName } from '../../def/grpcClients.ts';
import { ERpcMethod } from '../../rpc/def.ts';
import { createRpcRoutes } from '../../rpc/utils.ts';
import { pipeMetadataTransformers } from '../../transport/grpc/client/metadataTransformers.ts';
import { isDefined } from '../../utils/types.ts';
import { ETimeseriesRouteName } from './def.ts';
import { fetchTaggedTimeseriesDataLogTransformers } from './transformers/fetchTaggedTimeseriesDataLog.ts';
import { fetchTimeseriesLogTransformers } from './transformers/fetchTimeseriesLog.ts';
import { subscribeToTimeseriesLogTransformers } from './transformers/subscribeToTimeseriesLog.ts';

export const timeseriesRpcRoutes = createRpcRoutes<ETimeseriesRouteName>({
    [ETimeseriesRouteName.SubscribeToTimeseriesLog]: {
        method: ERpcMethod.SUBSCRIBE,
        requestStage: (ctx) => ctx.req.payload.requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.TimeseriesV1)
                .subscribeToTimeseriesLog(
                    subscribeToTimeseriesLogTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        subscribeToTimeseriesLogTransformers.fromGrpcToResponse(data),
                    ),
                    filter(isDefined),
                );
        },
    },
    [ETimeseriesRouteName.FetchTimeseriesLog]: {
        method: ERpcMethod.CALL,
        requestStage: (ctx) => ctx.req.payload.requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.TimeseriesV1)
                .fetchTimeseriesLog(
                    fetchTimeseriesLogTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) => fetchTimeseriesLogTransformers.fromGrpcToResponse(data)),
                    filter(isDefined),
                );
        },
    },
    [ETimeseriesRouteName.FetchTaggedTimeseriesDataLog]: {
        method: ERpcMethod.CALL,
        requestStage: (ctx) => ctx.req.payload.requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.TimeseriesV1)
                .fetchTaggedTimeseriesDataLog(
                    fetchTaggedTimeseriesDataLogTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        fetchTaggedTimeseriesDataLogTransformers.fromGrpcToResponse(data),
                    ),
                    filter(isDefined),
                );
        },
    },
});
