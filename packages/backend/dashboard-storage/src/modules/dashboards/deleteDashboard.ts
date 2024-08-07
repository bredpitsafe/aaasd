import type { UnaryRpc } from '@backend/grpc/src/types/rpc-types.ts';
import type { TPermission } from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/common';
import type {
    TDeleteDashboardRequest,
    TDeleteDashboardResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api';
import { isEmpty } from 'lodash-es';
import { map, of, switchMap } from 'rxjs';

import { deleteDraft } from '../../db/drafts.ts';
import {
    getPermissions,
    resetDashboardPermissions,
    upsertPermissions,
} from '../../db/permissions.ts';
import { EActorName } from '../../def/actor.ts';
import { ActorError, EActorErrorKind } from '../../utils/errors.ts';
import { handleUnaryRpcInitialization } from '../handlers/handleUnaryRpcInitialization.ts';

export const deleteDashboard: UnaryRpc<TDeleteDashboardRequest, TDeleteDashboardResponse> =
    function deleteDashboard(call, callback) {
        const { logger, messageWithContext, username, logStart, payload, handle$ } =
            handleUnaryRpcInitialization({
                rpc: deleteDashboard,
                call,
                callback,
                actor: EActorName.Dashboards,
            });

        logStart();

        const allowedLevels: TPermission[] = ['PERMISSION_VIEWER', 'PERMISSION_EDITOR'];
        const ownerLevels: TPermission[] = ['PERMISSION_OWNER'];

        handle$({
            obs$: of(true).pipe(
                switchMap(async () => {
                    const ownerPermissionRows = await getPermissions({
                        id: payload.id,
                        user: username,
                        allowedLevels: ownerLevels,
                    });
                    const permissionRows = await getPermissions({
                        id: payload.id,
                        user: username,
                        allowedLevels,
                    });

                    logger.info({
                        message: messageWithContext('permissions received'),
                        id: payload.id,
                        ownerPermissionRows,
                        permissionRows,
                    });

                    if (isEmpty(ownerPermissionRows) && isEmpty(permissionRows)) {
                        throw new ActorError({
                            kind: EActorErrorKind.Authorization,
                            title: 'Dashboard delete failed',
                            description: `The dashboard doesn't exist or has been deleted before.`,
                        });
                    }

                    // If owner deletes dashboard, we should reset everybody's permissions
                    // It will remove the dashboard from everyone.
                    if (!isEmpty(ownerPermissionRows)) {
                        await resetDashboardPermissions({ id: payload.id });
                    } else {
                        // If not-owner deletes dashboard, we should update only his permissions,
                        // otherwise leaving dashboard as-is.
                        await upsertPermissions(payload.id, [
                            { user: username, permission: 'PERMISSION_NONE' },
                        ]);
                    }

                    // Delete draft for the current user after deleting dashboard from his list
                    await deleteDraft({ user: username, dashboardId: payload.id });
                }),
                map(() => ({})),
            ),
        });
    };
