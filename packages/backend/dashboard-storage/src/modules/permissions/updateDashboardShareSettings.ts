import type { UnaryRpc } from '@backend/grpc/src/types/rpc-types.ts';
import type { TUserName } from '@common/types/src/primitives/index.ts';
import type { TPermission } from '@grpc-schemas/dashboard_storage-api-sdk/index.services.dashboard_storage.v1';
import type {
    TUpdateDashboardShareSettingsRequest,
    TUpdateDashboardShareSettingsResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/sharing_api.js';
import { isEmpty } from 'lodash-es';
import { from, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';

import { getPermissions, upsertPermissions } from '../../db/permissions.ts';
import { EActorName } from '../../def/actor.ts';
import { EGroups } from '../../def/permissions.ts';
import { ActorError, EActorErrorKind } from '../../utils/errors.ts';
import { metrics } from '../../utils/metrics.ts';
import { handleUnaryRpcInitialization } from '../handlers/handleUnaryRpcInitialization.ts';
import { sharePermissionToPermission } from './utils.ts';

export const updateDashboardShareSettings: UnaryRpc<
    TUpdateDashboardShareSettingsRequest,
    TUpdateDashboardShareSettingsResponse
> = function updateDashboardShareSettings(call, callback) {
    const { logger, messageWithContext, username, logStart, payload, handle$ } =
        handleUnaryRpcInitialization({
            rpc: updateDashboardShareSettings,
            call,
            callback,
            actor: EActorName.Permissions,
        });

    logStart(payload);

    const allowedLevels: TPermission[] = ['PERMISSION_OWNER'];

    handle$({
        obs$: from(
            getPermissions({
                user: username,
                id: payload.id,
                allowedLevels,
            }),
        ).pipe(
            switchMap((permissionRows) => {
                logger.info({
                    message: messageWithContext('received permissions'),
                    permissionRows,
                });

                if (isEmpty(permissionRows)) {
                    throw new ActorError({
                        kind: EActorErrorKind.Authorization,
                        title: 'Failed to update permissions',
                        description: `You can't change share settings for this dashboard`,
                    });
                }

                return upsertPermissions(payload.id, [
                    {
                        user: EGroups.All as TUserName,
                        permission: sharePermissionToPermission(payload.sharePermission),
                    },
                ]);
            }),
            tap(() => {
                logger.info({
                    message: messageWithContext('permissions updated'),
                });
            }),
            tap(() => metrics.permissions.shared.inc()),
        ),
    });
};
