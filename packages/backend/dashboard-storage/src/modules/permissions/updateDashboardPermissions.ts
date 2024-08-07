import type { UnaryRpc } from '@backend/grpc/src/types/rpc-types.ts';
import type { TPermission } from '@grpc-schemas/dashboard_storage-api-sdk/index.services.dashboard_storage.v1';
import type {
    TUpdateDashboardPermissionsRequest,
    TUpdateDashboardPermissionsResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/sharing_api.js';
import { isEmpty, uniqBy } from 'lodash-es';
import { from, switchMap } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import type { TUpdatableGrpcPermissionRow } from '../../db/permissions.ts';
import {
    getDashboardPermissions,
    getPermissions,
    upsertPermissions,
} from '../../db/permissions.ts';
import { EActorName } from '../../def/actor.ts';
import { ActorError, EActorErrorKind } from '../../utils/errors.ts';
import { metrics } from '../../utils/metrics.ts';
import { handleUnaryRpcInitialization } from '../handlers/handleUnaryRpcInitialization.ts';

export const updateDashboardPermissions: UnaryRpc<
    TUpdateDashboardPermissionsRequest,
    TUpdateDashboardPermissionsResponse
> = function updateDashboardPermissions(call, callback) {
    const { logger, messageWithContext, username, logStart, payload, handle$ } =
        handleUnaryRpcInitialization({
            rpc: updateDashboardPermissions,
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
            switchMap(async (permissionRows) => {
                logger.info({
                    message: messageWithContext('received permissions'),
                    permissionRows,
                });

                if (isEmpty(permissionRows)) {
                    throw new ActorError({
                        kind: EActorErrorKind.Authorization,
                        title: 'Failed to update permissions',
                        description: `You can't edit permissions for this dashboard`,
                    });
                }

                // All current permissions, other than stated in request, must be reset
                const resetPermissionRows: TUpdatableGrpcPermissionRow[] = (
                    await getDashboardPermissions({
                        id: payload.id,
                        user: username,
                    })
                ).map((p) => ({
                    user: p.user,
                    permission: 'PERMISSION_NONE',
                }));

                // Calculate resulting permissions with grouping by user, where request permissions are prioritized over current.
                const newPermissions = uniqBy(
                    payload.permissions.concat(resetPermissionRows),
                    'user',
                ).filter((p) => p.user !== username);

                if (isEmpty(newPermissions)) {
                    logger.info({
                        message: messageWithContext('nothing to update, skipping database write'),
                    });

                    return;
                }

                return upsertPermissions(
                    payload.id,
                    newPermissions as TUpdatableGrpcPermissionRow[],
                );
            }),
            map(() => {
                logger.info({
                    message: messageWithContext('permissions updated'),
                });

                return {};
            }),
            tap(() => metrics.permissions.updated.inc()),
        ),
    });
};
