import type { ServerStreamingRpc } from '@backend/grpc/src/types/rpc-types.ts';
import { tapOnce } from '@common/rx';
import type {
    TDashboardItem,
    TPermission,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/common';
import type {
    TSubscribeToDashboardRequest,
    TSubscribeToDashboardResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api';
import { isEmpty, isEqual, isNil } from 'lodash-es';
import {
    combineLatestWith,
    distinctUntilChanged,
    finalize,
    map,
    of,
    shareReplay,
    switchMap,
} from 'rxjs';
import { tap } from 'rxjs/operators';

import { subscribeToDashboardUpdates } from '../../db/dashboards.ts';
import { subscribeToDashboardDraftLookupUpdates } from '../../db/drafts.ts';
import {
    subscribeToDashboardsOwnersUpdates,
    subscribeToPermissionsCountUpdates,
    subscribeToPermissionsUpdates,
    upsertPermissions,
} from '../../db/permissions.ts';
import { scopesIndex } from '../../db/scopes/scopes.db.index.ts';
import { EActorName } from '../../def/actor.ts';
import { EGroups } from '../../def/permissions.ts';
import { ActorError, EActorErrorKind } from '../../utils/errors.ts';
import { metrics } from '../../utils/metrics.ts';
import { handleSubscriptionRpcInitialization } from '../handlers/handleSubscriptionRpcInitialization.ts';
import { getMaxPermission, sharePermissionToPermission } from '../permissions/utils.ts';

export const subscribeToDashboard: ServerStreamingRpc<
    TSubscribeToDashboardRequest,
    TSubscribeToDashboardResponse
> = function subscribeToDashboard(call) {
    const {
        logger,
        messageWithContext,
        traceId,
        username,
        logStart,
        payload,
        takeUntilChannelClose,
        handleResponse,
        handleError,
        handleComplete,
    } = handleSubscriptionRpcInitialization({
        rpc: subscribeToDashboard,
        call,
        metadata: call.metadata,
        actor: EActorName.Dashboards,
    });

    logStart(payload);

    try {
        const allowedLevels: TPermission[] = [
            'PERMISSION_OWNER',
            'PERMISSION_EDITOR',
            'PERMISSION_VIEWER',
        ];

        const permission$ = subscribeToPermissionsUpdates({
            user: username,
            id: payload.id,
            allowedLevels,
        }).pipe(
            tapOnce(async (permissionRows) => {
                // If permission shows that dashboard has shared access enabled for this user
                // We must explicitly grant `viewer` access to the current user
                const { permissionRow, sharePermission } = getMaxPermission(permissionRows);
                if (
                    sharePermission !== 'SHARE_PERMISSION_NONE' &&
                    permissionRow.user === EGroups.All
                ) {
                    await upsertPermissions(payload.id, [
                        {
                            user: username,
                            permission: sharePermissionToPermission(sharePermission),
                        },
                    ]);
                }
            }),
            map((permissions) => {
                logger.info({
                    message: messageWithContext('permissions received'),
                    id: payload.id,
                    permissions,
                });

                if (permissions.length === 0) {
                    throw new ActorError({
                        kind: EActorErrorKind.Authorization,
                        title: 'Failed to subscribe to dashboard',
                        description: 'You do not have permission to view this dashboard',
                    });
                }
                return getMaxPermission(permissions);
            }),
            shareReplay({ refCount: true, bufferSize: 1 }),
        );

        metrics.dashboards.dashboard.inc();

        permission$
            .pipe(
                finalize(() => metrics.dashboards.dashboard.dec()),
                switchMap(({ permissionRow }) => {
                    const { dashboardId } = permissionRow;
                    logger.info({
                        message: messageWithContext(
                            'permissions checked, subscribing to dashboard updates',
                        ),
                        permissionRow,
                    });

                    return subscribeToDashboardUpdates({ ids: [dashboardId] });
                }),
                map((dashboards) => {
                    const [dashboard] = dashboards;

                    logger.info({
                        message: messageWithContext('dashboard update received'),
                        id: payload.id,
                        dashboard: dashboard.id,
                        digest: dashboard.digest,
                    });

                    return dashboard;
                }),
                combineLatestWith(
                    permission$,
                    subscribeToDashboardDraftLookupUpdates({
                        ids: [payload.id],
                        user: username,
                    }).pipe(
                        map((drafts) => drafts[0]),
                        tap((draft) => {
                            logger.info({
                                message: messageWithContext('draft update received'),
                                id: payload.id,
                                hasDraft: !isEmpty(draft),
                                draftDigest: draft?.digest,
                            });
                        }),
                    ),
                    subscribeToDashboardsOwnersUpdates({
                        ids: [payload.id],
                    }),
                    permission$.pipe(
                        switchMap(({ permissionRow }) => {
                            if (permissionRow.permission === 'PERMISSION_OWNER') {
                                return subscribeToPermissionsCountUpdates({
                                    ids: [payload.id],
                                    user: username,
                                });
                            }
                            return of(undefined);
                        }),
                    ),
                    scopesIndex.subscribeToScopesUpdatesGroupedById(
                        { include: { dashboardIds: [payload.id] } },
                        traceId,
                    ),
                ),
                map(
                    ([
                        dashboard,
                        { permissionRow, sharePermission },
                        draft,
                        owners,
                        permissionsCount,
                        scopesGroupedByIds,
                    ]) => {
                        const hasDraft = !isNil(draft);
                        const dashboardWithDraft: TDashboardItem = {
                            ...dashboard,
                            hasDraft,
                            draftDigest: draft?.digest ?? '',
                            permission: permissionRow.permission,
                            sharePermission,
                            owners: owners[dashboard.id] as string[],
                            permissionsCount: permissionsCount
                                ? permissionsCount[dashboard.id]?.count ?? 0
                                : undefined,
                            scopes: scopesGroupedByIds[payload.id] ?? [],
                        };

                        return {
                            dashboard: dashboardWithDraft,
                        };
                    },
                ),
                distinctUntilChanged<TSubscribeToDashboardResponse>(isEqual),
                takeUntilChannelClose(),
            )
            .subscribe({
                next: (response) => {
                    call.write(response);

                    handleResponse({
                        id: payload.id,
                        digest: response.dashboard.digest,
                    });
                },
                error: (error) => {
                    throw error;
                },
                complete: () => {
                    handleComplete();
                },
            });
    } catch (error) {
        handleError(error);
    }
};
