import { isEmpty, uniqBy } from 'lodash-es';
import { from, map, Observable, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
    getDashboardPermissions,
    getPermissions,
    subscribeToDashboardPermissionsUpdates,
    subscribeToPermissionsUpdates,
    TUpdatablePermission,
    upsertPermissions,
} from '../../db/permissions.ts';
import { EActorName, TActorRequest } from '../../def/actor.ts';
import { EGroups } from '../../def/permissions.ts';
import {
    SubscribeToDashboardPermissionsRequest,
    UpdateDashboardPermissionsRequest,
    UpdateDashboardShareSettingsRequest,
} from '../../def/request.ts';
import {
    Permission,
    SubscribeToDashboardPermissionsResponse,
    UpdateDashboardPermissionsResponse,
    UpdateDashboardShareSettingsResponse,
} from '../../def/response.ts';
import { TUserName } from '../../def/user.ts';
import { ActorError, EActorErrorKind } from '../../utils/errors.ts';
import { logger } from '../../utils/logger.ts';
import { metrics } from '../../utils/metrics.ts';
import { sharePermissionToPermission } from './utils.ts';

export function updateDashboardPermissions(
    req: TActorRequest<UpdateDashboardPermissionsRequest>,
): Observable<UpdateDashboardPermissionsResponse> {
    const allowedLevels = [Permission.Owner];

    logger.info({
        message: '`updateDashboardPermissions` - started',
        actor: EActorName.Permissions,
        traceId: req.traceId,
        correlationId: req.correlationId,
        id: req.payload.id,
    });
    return from(
        getPermissions({
            user: req.username!,
            id: req.payload.id,
            allowedLevels,
        }),
    ).pipe(
        switchMap(async (permissions) => {
            logger.info({
                message: '`updateDashboardPermissions` - received permissions',
                actor: EActorName.Permissions,
                traceId: req.traceId,
                correlationId: req.correlationId,
                permissions,
            });

            if (isEmpty(permissions)) {
                throw new ActorError({
                    kind: EActorErrorKind.Authorization,
                    title: 'Failed to update permissions',
                    description: `You can't edit permissions for this dashboard`,
                });
            }

            // All current permissions, other than stated in request, must be reset
            const resetPermissions: TUpdatablePermission[] = (
                await getDashboardPermissions({
                    id: req.payload.id,
                    user: req.username,
                })
            ).map((p) => ({
                user: p.user,
                permission: Permission.None,
            }));

            // Calculate resulting permissions with grouping by user, where request permissions are prioritized over current.
            // @ts-ignore
            const newPermissions: TUpdatablePermission[] = uniqBy(
                // @ts-ignore
                req.payload.permissions.concat(resetPermissions),
                'user',
            ).filter((p) => p.user !== req.username);

            if (isEmpty(newPermissions)) {
                logger.info({
                    message:
                        '`updateDashboardPermissions` - nothing to update, skipping database write',
                    actor: EActorName.Permissions,
                    traceId: req.traceId,
                    correlationId: req.correlationId,
                });
                return;
            }

            return upsertPermissions(req.payload.id, newPermissions);
        }),
        tap(() => {
            logger.info({
                message: '`updateDashboardPermissions` - permissions updated',
                actor: EActorName.Permissions,
                traceId: req.traceId,
                correlationId: req.correlationId,
            });
        }),
        map(() => {
            return {
                type: 'PermissionsUpdated',
            } as UpdateDashboardPermissionsResponse;
        }),
        tap(() => metrics.permissions.updated.inc()),
    );
}

export function updateDashboardShareSettings(
    req: TActorRequest<UpdateDashboardShareSettingsRequest>,
): Observable<UpdateDashboardShareSettingsResponse> {
    const allowedLevels = [Permission.Owner];

    logger.info({
        message: '`updateDashboardShareSettings` - started',
        actor: EActorName.Permissions,
        traceId: req.traceId,
        correlationId: req.correlationId,
        id: req.payload.id,
    });

    return from(
        getPermissions({
            user: req.username!,
            id: req.payload.id,
            allowedLevels,
        }),
    ).pipe(
        switchMap((permissions) => {
            logger.info({
                message: '`updateDashboardShareSettings` - received permissions',
                actor: EActorName.Permissions,
                traceId: req.traceId,
                correlationId: req.correlationId,
                permissions,
            });

            if (isEmpty(permissions)) {
                throw new ActorError({
                    kind: EActorErrorKind.Authorization,
                    title: 'Failed to update permissions',
                    description: `You can't change share settings for this dashboard`,
                });
            }

            return upsertPermissions(req.payload.id, [
                {
                    user: EGroups.All as TUserName,
                    permission: sharePermissionToPermission(req.payload.sharePermission),
                },
            ]);
        }),
        tap(() => {
            logger.info({
                message: '`updateDashboardShareSettings` - permissions updated',
                actor: EActorName.Permissions,
                traceId: req.traceId,
                correlationId: req.correlationId,
            });
        }),
        map(() => {
            return {
                type: 'DashboardShareSettingsUpdated',
            } as UpdateDashboardShareSettingsResponse;
        }),
        tap(() => metrics.permissions.shared.inc()),
    );
}

export function subscribeToDashboardPermissions(
    req: TActorRequest<SubscribeToDashboardPermissionsRequest>,
): Observable<SubscribeToDashboardPermissionsResponse> {
    logger.info({
        message: '`fetchDashboardPermissions` - started',
        actor: EActorName.Permissions,
        traceId: req.traceId,
        correlationId: req.correlationId,
        id: req.payload.id,
    });

    return from(
        // Check that only the owner can access this dashboard's permissions
        subscribeToPermissionsUpdates({
            user: req.username!,
            id: req.payload.id,
            allowedLevels: [Permission.Owner],
        }),
    ).pipe(
        switchMap((permissions) => {
            logger.info({
                message: '`fetchDashboardPermissions` - owner permissions received',
                actor: EActorName.Permissions,
                traceId: req.traceId,
                correlationId: req.correlationId,
                id: req.payload.id,
                permissions,
            });

            if (permissions.length === 0) {
                throw new ActorError({
                    kind: EActorErrorKind.Authorization,
                    title: 'Getting dashboard permissions failed',
                    description:
                        'You do not have permission to list permissions for this dashboard',
                });
            }
            // After that, subscribe to all permissions for this dashboard
            return subscribeToDashboardPermissionsUpdates({
                id: req.payload.id,
                user: req.username,
            });
        }),
        tap((permissions) => {
            logger.info({
                message: '`fetchDashboardPermissions` - all permissions received',
                actor: EActorName.Permissions,
                traceId: req.traceId,
                correlationId: req.correlationId,
                id: req.payload.id,
                permissions,
            });
        }),
        map((list) => {
            return {
                type: 'DashboardPermissionsList',
                list,
            };
        }),
    );
}
