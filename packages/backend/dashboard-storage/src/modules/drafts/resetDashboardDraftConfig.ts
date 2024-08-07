import type { UnaryRpc } from '@backend/grpc/src/types/rpc-types.ts';
import type { TPermission } from '@grpc-schemas/dashboard_storage-api-sdk/index.services.dashboard_storage.v1';
import type {
    TResetDashboardDraftConfigRequest,
    TResetDashboardDraftConfigResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/draft_api.js';
import { from, map, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';

import { deleteDraft } from '../../db/drafts.ts';
import { getPermissions } from '../../db/permissions.ts';
import { EActorName } from '../../def/actor.ts';
import { ActorError, EActorErrorKind } from '../../utils/errors.ts';
import { metrics } from '../../utils/metrics.ts';
import { handleUnaryRpcInitialization } from '../handlers/handleUnaryRpcInitialization.ts';

export const resetDashboardDraftConfig: UnaryRpc<
    TResetDashboardDraftConfigRequest,
    TResetDashboardDraftConfigResponse
> = function resetDashboardDraftConfig(call, callback) {
    const { logger, messageWithContext, username, logStart, payload, handle$ } =
        handleUnaryRpcInitialization({
            rpc: resetDashboardDraftConfig,
            call,
            callback,
            actor: EActorName.Drafts,
        });

    logStart(payload);

    const allowedLevels: TPermission[] = ['PERMISSION_OWNER', 'PERMISSION_EDITOR'];

    handle$({
        obs$: from(
            getPermissions({
                user: username,
                id: payload.id,
                allowedLevels,
            }),
        ).pipe(
            switchMap(async (permissionRows) => {
                logger.info({
                    message: messageWithContext('permissions received'),
                    id: payload.id,
                    permissionRows,
                });

                if (permissionRows.length === 0) {
                    throw new ActorError({
                        kind: EActorErrorKind.Authorization,
                        title: 'Draft reset failed',
                        description: 'You do not have permission to reset this draft',
                    });
                }

                return deleteDraft({
                    dashboardId: payload.id,
                    user: username,
                });
            }),
            tap(() => {
                logger.info({
                    message: messageWithContext('draft reset'),
                    id: payload.id,
                });
            }),
            tap(() => metrics.drafts.reset.inc()),
            map(() => ({})),
        ),
    });
};
