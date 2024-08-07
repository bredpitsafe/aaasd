import type { UnaryRpc } from '@backend/grpc/src/types/rpc-types.ts';
import type { TPermission } from '@grpc-schemas/dashboard_storage-api-sdk/index.services.dashboard_storage.v1';
import type {
    TUpdateDashboardScopeBindingRequest,
    TUpdateDashboardScopeBindingResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/scope_api';
import { from, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

import { getPermissions } from '../../db/permissions.ts';
import { upsertDashboardScopeBinding } from '../../db/scopes/scopes.db.ts';
import { EActorName } from '../../def/actor.ts';
import { ActorError, EActorErrorKind } from '../../utils/errors.ts';
import { handleUnaryRpcInitialization } from '../handlers/handleUnaryRpcInitialization.ts';
import { validateScopeObject } from './utils.ts';

export const updateDashboardScopeBinding: UnaryRpc<
    TUpdateDashboardScopeBindingRequest,
    TUpdateDashboardScopeBindingResponse
> = function updateDashboardScopeBinding(call, callback) {
    const { logger, messageWithContext, username, logStart, payload, handle$ } =
        handleUnaryRpcInitialization({
            rpc: updateDashboardScopeBinding,
            call,
            callback,
            actor: EActorName.Scopes,
        });

    logStart(payload);

    const allowedLevels: TPermission[] = ['PERMISSION_OWNER', 'PERMISSION_EDITOR'];

    handle$({
        obs$: from(
            getPermissions({
                user: username,
                id: payload.dashboardId,
                allowedLevels,
            }),
        ).pipe(
            // TODO: replace with checkPermissions abstraction here including getPermissions call
            switchMap((permissionRows) => {
                logger.info({
                    message: messageWithContext('permissions received'),
                    dashboardId: payload.dashboardId,
                    permissionRows,
                });

                if (permissionRows.length === 0) {
                    throw new ActorError({
                        kind: EActorErrorKind.Authorization,
                        title: 'Dashboard update failed',
                        description:
                            'You do not have permission to update scope binding of this dashboard',
                    });
                }

                validateScopeObject(payload.scope);

                return upsertDashboardScopeBinding(payload);
            }),
            map(() => {
                logger.info({
                    message: messageWithContext('finished'),
                    dashboardId: payload.dashboardId,
                });

                return {};
            }),
        ),
    });
};
