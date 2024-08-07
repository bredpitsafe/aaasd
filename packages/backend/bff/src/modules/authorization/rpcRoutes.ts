import { filter, map } from 'rxjs';

import { EGrpcClientName } from '../../def/grpcClients.ts';
import { ERpcMethod } from '../../rpc/def.ts';
import { createRpcRoutes } from '../../rpc/utils.ts';
import { pipeMetadataTransformers } from '../../transport/grpc/client/metadataTransformers.ts';
import { isDefined } from '../../utils/types.ts';
import { AUTHORIZATION_REQUEST_STAGE, EAuthorizationRouteName } from './def.ts';
import { fetchPolicyTemplatesSnapshotTransformers } from './transformers/fetchPolicyTemplatesSnapshot.ts';
import { grantPolicyTransformers } from './transformers/grantPolicy.ts';
import { removePolicyTransformers } from './transformers/removePolicy.ts';
import { renderPolicyTransformers } from './transformers/renderPolicy.ts';
import { revokePolicyTransformers } from './transformers/revokePolicy.ts';
import { subscribeToGroupSnapshotTransformers } from './transformers/subscribeToGroupSnapshot.ts';
import { subscribeToPermissionsTransformers } from './transformers/subscribeToPermissions.ts';
import { subscribeToPolicySnapshotTransformers } from './transformers/subscribeToPolicySnapshot.ts';
import { subscribeToUserSnapshotTransformers } from './transformers/subscribeToUserSnapshot.ts';
import { upsertPolicyTransformers } from './transformers/upsertPolicy.ts';

const requestStage = () => AUTHORIZATION_REQUEST_STAGE;

export const authorizationRpcRoutes = createRpcRoutes<EAuthorizationRouteName>({
    [EAuthorizationRouteName.SubscribeToUserSnapshot]: {
        method: ERpcMethod.SUBSCRIBE,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.UsersV1)
                .subscribeToUserSnapshot(
                    subscribeToUserSnapshotTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) => subscribeToUserSnapshotTransformers.fromGrpcToResponse(data)),
                    filter(isDefined),
                );
        },
    },
    [EAuthorizationRouteName.SubscribeToGroupSnapshot]: {
        method: ERpcMethod.SUBSCRIBE,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.GroupsV1)
                .subscribeToGroupSnapshot(
                    subscribeToGroupSnapshotTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        subscribeToGroupSnapshotTransformers.fromGrpcToResponse(data),
                    ),
                    filter(isDefined),
                );
        },
    },
    [EAuthorizationRouteName.SubscribeToPermissions]: {
        method: ERpcMethod.SUBSCRIBE,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.PermissionsV1)
                .subscribeToPermissions(
                    subscribeToPermissionsTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) => subscribeToPermissionsTransformers.fromGrpcToResponse(data)),
                    filter(isDefined),
                );
        },
    },
    [EAuthorizationRouteName.SubscribeToPolicySnapshot]: {
        method: ERpcMethod.SUBSCRIBE,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.PoliciesV1)
                .subscribeToPolicySnapshot(
                    subscribeToPolicySnapshotTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        subscribeToPolicySnapshotTransformers.fromGrpcToResponse(data),
                    ),
                    filter(isDefined),
                );
        },
    },
    [EAuthorizationRouteName.GrantPolicy]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.PoliciesV1)
                .grantPolicy(
                    grantPolicyTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(map(({ data }) => grantPolicyTransformers.fromGrpcToResponse(data)));
        },
    },
    [EAuthorizationRouteName.UpsertPolicy]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.PoliciesV1)
                .upsertPolicy(
                    upsertPolicyTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(map(({ data }) => upsertPolicyTransformers.fromGrpcToResponse(data)));
        },
    },
    [EAuthorizationRouteName.RenderPolicy]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.PoliciesV1)
                .renderPolicy(
                    renderPolicyTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(map(({ data }) => renderPolicyTransformers.fromGrpcToResponse(data)));
        },
    },
    [EAuthorizationRouteName.RemovePolicy]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.PoliciesV1)
                .removePolicy(
                    removePolicyTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(map(({ data }) => removePolicyTransformers.fromGrpcToResponse(data)));
        },
    },
    [EAuthorizationRouteName.RevokePolicy]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.PoliciesV1)
                .revokePolicy(
                    revokePolicyTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(map(({ data }) => revokePolicyTransformers.fromGrpcToResponse(data)));
        },
    },
    [EAuthorizationRouteName.FetchPolicyTemplateSnapshot]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.PolicyTemplatesV1)
                .fetchPolicyTemplateSnapshot(
                    fetchPolicyTemplatesSnapshotTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        fetchPolicyTemplatesSnapshotTransformers.fromGrpcToResponse(data),
                    ),
                );
        },
    },
});
