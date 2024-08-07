import type { UnaryRpc } from '@backend/grpc/src/types/rpc-types.ts';
import type { TPermission } from '@grpc-schemas/dashboard_storage-api-sdk/index.services.dashboard_storage.v1';
import type {
    TFetchDashboardDraftConfigRequest,
    TFetchDashboardDraftConfigResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/draft_api.js';
import { isNil } from 'lodash-es';
import { from, map, switchMap } from 'rxjs';

import { getDraftById } from '../../db/drafts.ts';
import { getPermissions } from '../../db/permissions.ts';
import { EActorName } from '../../def/actor.ts';
import { ActorError, EActorErrorKind } from '../../utils/errors.ts';
import { handleUnaryRpcInitialization } from '../handlers/handleUnaryRpcInitialization.ts';
import { getMaxPermission } from '../permissions/utils.ts';

export const fetchDashboardDraftConfig: UnaryRpc<
    TFetchDashboardDraftConfigRequest,
    TFetchDashboardDraftConfigResponse
> = function fetchDashboardDraftConfig(call, callback) {
    const { logger, messageWithContext, username, logStart, payload, handle$ } =
        handleUnaryRpcInitialization({
            rpc: fetchDashboardDraftConfig,
            call,
            callback,
            actor: EActorName.Drafts,
        });

    logStart(payload);

    const allowedLevels: TPermission[] = [
        'PERMISSION_OWNER',
        'PERMISSION_EDITOR',
        'PERMISSION_VIEWER',
    ];

    handle$({
        obs$: from(
            getPermissions({
                user: username,
                id: payload.id,
                allowedLevels,
            }),
        ).pipe(
            map((permissionRows) => {
                if (permissionRows.length === 0) {
                    throw new ActorError({
                        kind: EActorErrorKind.Authorization,
                        title: 'Failed to fetch dashboard',
                        description: 'You do not have permission to view this dashboard',
                    });
                }
                return getMaxPermission(permissionRows);
            }),
            switchMap(({ permissionRow }) => {
                const { dashboardId } = permissionRow;
                logger.info({
                    message: messageWithContext('permissions checked, getting draft'),
                    permissionRow,
                });

                return getDraftById(username, dashboardId);
            }),
            map((draft) => {
                if (isNil(draft)) {
                    throw new ActorError({
                        kind: EActorErrorKind.NotFound,
                        title: 'Failed to fetch dashboard draft',
                        description: 'Draft does not exist',
                    });
                }

                return {
                    config: draft.config,
                    digest: draft.digest,
                };
            }),
        ),
    });
};
