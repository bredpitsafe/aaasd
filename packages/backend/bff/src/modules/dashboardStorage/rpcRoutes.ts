import { filter, map } from 'rxjs';

import { EGrpcClientName } from '../../def/grpcClients.ts';
import { ERpcMethod } from '../../rpc/def.ts';
import { createRpcRoutes } from '../../rpc/utils.ts';
import { pipeMetadataTransformers } from '../../transport/grpc/client/metadataTransformers.ts';
import { isDefined } from '../../utils/types.ts';
import { DASHBOARD_STORAGE_REQUEST_STAGE, EDashboardStorageRouteName } from './def.ts';
import { createDashboardTransformers } from './transformers/createDashboard.transformers.ts';
import { deleteDashboardTransformers } from './transformers/deleteDashboard.transformers.ts';
import { fetchDashboardConfigTransformers } from './transformers/fetchDashboardConfig.transformers.ts';
import { fetchDashboardDraftConfigTransformers } from './transformers/fetchDashboardDraftConfig.transformers.ts';
import { importDashboardTransformers } from './transformers/importDashboard.transformers copy.ts';
import { renameDashboardTransformers } from './transformers/renameDashboard.transformers.ts';
import { resetDashboardDraftConfigTransformers } from './transformers/resetDashboardDraftConfig.transformers.ts';
import { submitDashboardDraftConfigTransformers } from './transformers/submitDashboardDraftConfig.transformers.ts';
import { subscribeToDashboardListTransformers } from './transformers/subscribeToDashboard.transformers.ts';
import { subscribeToDashboardTransformers } from './transformers/subscribeToDashboardList.transformers.ts';
import { subscribeToDashboardPermissionsTransformers } from './transformers/subscribeToDashboardPermissions.transformers.ts';
import { updateDashboardDraftConfigTransformers } from './transformers/updateDashboardDraftConfig.transformers.ts';
import { updateDashboardPermissionsTransformers } from './transformers/updateDashboardPermissions.transformers.ts';
import { updateDashboardScopeBindingTransformers } from './transformers/updateDashboardScopeBinding.transformers.ts';
import { updateDashboardShareSettingsTransformers } from './transformers/updateDashboardShareSettings.transformers.ts';

const requestStage = () => DASHBOARD_STORAGE_REQUEST_STAGE;

export const dashboardStorageRpcRoutes = createRpcRoutes<EDashboardStorageRouteName>({
    [EDashboardStorageRouteName.CreateDashboard]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.DashboardStorageV1)
                .createDashboard(
                    createDashboardTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(map(({ data }) => createDashboardTransformers.fromGrpcToResponse(data)));
        },
    },
    [EDashboardStorageRouteName.ImportDashboard]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.DashboardStorageV1)
                .importDashboard(
                    importDashboardTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(map(({ data }) => importDashboardTransformers.fromGrpcToResponse(data)));
        },
    },
    [EDashboardStorageRouteName.DeleteDashboard]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.DashboardStorageV1)
                .deleteDashboard(
                    deleteDashboardTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(map(({ data }) => deleteDashboardTransformers.fromGrpcToResponse(data)));
        },
    },
    [EDashboardStorageRouteName.RenameDashboard]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.DashboardStorageV1)
                .renameDashboard(
                    renameDashboardTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(map(({ data }) => renameDashboardTransformers.fromGrpcToResponse(data)));
        },
    },
    [EDashboardStorageRouteName.UpdateDashboardScopeBinding]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.DashboardStorageV1)
                .updateDashboardScopeBinding(
                    updateDashboardScopeBindingTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        updateDashboardScopeBindingTransformers.fromGrpcToResponse(data),
                    ),
                );
        },
    },
    [EDashboardStorageRouteName.FetchDashboardConfig]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.DashboardStorageV1)
                .fetchDashboardConfig(
                    fetchDashboardConfigTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(map(({ data }) => fetchDashboardConfigTransformers.fromGrpcToResponse(data)));
        },
    },
    [EDashboardStorageRouteName.SubscribeToDashboard]: {
        method: ERpcMethod.SUBSCRIBE,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.DashboardStorageV1)
                .subscribeToDashboard(
                    subscribeToDashboardTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) => subscribeToDashboardTransformers.fromGrpcToResponse(data)),
                    filter(isDefined),
                );
        },
    },
    [EDashboardStorageRouteName.SubscribeToDashboardList]: {
        method: ERpcMethod.SUBSCRIBE,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.DashboardStorageV1)
                .subscribeToDashboardList(
                    subscribeToDashboardListTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        subscribeToDashboardListTransformers.fromGrpcToResponse(data),
                    ),
                    filter(isDefined),
                );
        },
    },
    [EDashboardStorageRouteName.FetchDashboardDraftConfig]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.DashboardDraftV1)
                .fetchDashboardDraftConfig(
                    fetchDashboardDraftConfigTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        fetchDashboardDraftConfigTransformers.fromGrpcToResponse(data),
                    ),
                );
        },
    },
    [EDashboardStorageRouteName.ResetDashboardDraftConfig]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.DashboardDraftV1)
                .resetDashboardDraftConfig(
                    resetDashboardDraftConfigTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        resetDashboardDraftConfigTransformers.fromGrpcToResponse(data),
                    ),
                );
        },
    },
    [EDashboardStorageRouteName.SubmitDashboardDraftConfig]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.DashboardDraftV1)
                .submitDashboardDraftConfig(
                    submitDashboardDraftConfigTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        submitDashboardDraftConfigTransformers.fromGrpcToResponse(data),
                    ),
                );
        },
    },
    [EDashboardStorageRouteName.UpdateDashboardDraftConfig]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.DashboardDraftV1)
                .updateDashboardDraftConfig(
                    updateDashboardDraftConfigTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        updateDashboardDraftConfigTransformers.fromGrpcToResponse(data),
                    ),
                );
        },
    },
    [EDashboardStorageRouteName.UpdateDashboardPermissions]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.DashboardSharingV1)
                .updateDashboardPermissions(
                    updateDashboardPermissionsTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        updateDashboardPermissionsTransformers.fromGrpcToResponse(data),
                    ),
                );
        },
    },
    [EDashboardStorageRouteName.UpdateDashboardShareSettings]: {
        method: ERpcMethod.CALL,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.DashboardSharingV1)
                .updateDashboardShareSettings(
                    updateDashboardShareSettingsTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        updateDashboardShareSettingsTransformers.fromGrpcToResponse(data),
                    ),
                );
        },
    },
    [EDashboardStorageRouteName.SubscribeToDashboardPermissions]: {
        method: ERpcMethod.SUBSCRIBE,
        requestStage,
        handler(ctx) {
            return ctx
                .getGrpcClient(EGrpcClientName.DashboardSharingV1)
                .subscribeToDashboardPermissions(
                    subscribeToDashboardPermissionsTransformers.fromRequestToGrpc(ctx.req),
                    pipeMetadataTransformers(ctx)(),
                )
                .pipe(
                    map(({ data }) =>
                        subscribeToDashboardPermissionsTransformers.fromGrpcToResponse(data),
                    ),
                    filter(isDefined),
                );
        },
    },
});
