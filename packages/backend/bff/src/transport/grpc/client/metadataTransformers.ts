import { generateTraceId } from '@backend/utils/src/traceId/index.ts';
import { Metadata } from '@grpc/grpc-js';
import { isEmpty, isNil } from 'lodash-es';

import { RpcRequestContext } from '../../../rpc/context.ts';

type TMetadataTransformer = (ctx: RpcRequestContext, metadata?: Metadata) => Metadata;

const AUTHORIZATION_HEADER = 'Authorization';

const withAuthMetadata: TMetadataTransformer = (ctx, metadata = new Metadata()) => {
    const authState = ctx.session.getAuthState();
    if (!isNil(authState) && !isEmpty(authState.rawToken)) {
        metadata.add(AUTHORIZATION_HEADER, `Bearer ${authState.rawToken}`);
    }
    return metadata;
};

const TRACE_ID_HEADER = 'X-B3-TraceId';
const withTraceIdMetadata: TMetadataTransformer = (ctx, metadata = new Metadata()) => {
    const traceId = ctx.req.traceId || generateTraceId();
    metadata.add(TRACE_ID_HEADER, traceId);

    return metadata;
};

const permanentTransformers: TMetadataTransformer[] = [withAuthMetadata, withTraceIdMetadata];

export const pipeMetadataTransformers =
    (ctx: RpcRequestContext) =>
    (...transformers: TMetadataTransformer[]): Metadata => {
        return [...permanentTransformers, ...transformers].reduce(
            (currentMetadata, transformer) => {
                return transformer(ctx, currentMetadata);
            },
            new Metadata(),
        );
    };
