import type { TAuthorizationHeaderValue } from '@backend/utils/src/constants.ts';
import { AUTHORIZATION_HEADER, TRACE_ID_HEADER } from '@backend/utils/src/constants.ts';
import { generateTraceId } from '@common/utils';
import { convertTraceIdToHex } from '@common/utils/src/traceId/convertTraceIdToHex.ts';
import { Metadata } from '@grpc/grpc-js';
import { isEmpty, isNil } from 'lodash-es';

import type { TRpcRouteName } from '../../../def/rpc.ts';
import type { RpcRequestContext } from '../../../rpc/context.ts';

type TMetadataTransformer = <T extends TRpcRouteName>(
    ctx: RpcRequestContext<T>,
    metadata?: Metadata,
) => Metadata;

const withAuthMetadata: TMetadataTransformer = (ctx, metadata = new Metadata()) => {
    const authState = ctx.session.getAuthState();
    if (!isNil(authState) && !isEmpty(authState.rawToken)) {
        const bearerToken: TAuthorizationHeaderValue = `Bearer ${authState.rawToken}`;
        metadata.add(AUTHORIZATION_HEADER, bearerToken);
    }

    return metadata;
};

const withTraceIdMetadata: TMetadataTransformer = (ctx, metadata = new Metadata()) => {
    const traceIdHex = convertTraceIdToHex(ctx.req.traceId || generateTraceId());
    metadata.add(TRACE_ID_HEADER, traceIdHex);

    return metadata;
};

const permanentTransformers: TMetadataTransformer[] = [withAuthMetadata, withTraceIdMetadata];

export const pipeMetadataTransformers =
    <T extends TRpcRouteName>(ctx: RpcRequestContext<T>) =>
    (...transformers: TMetadataTransformer[]): Metadata => {
        return [...permanentTransformers, ...transformers].reduce(
            (currentMetadata, transformer) => {
                return transformer(ctx, currentMetadata);
            },
            new Metadata(),
        );
    };
