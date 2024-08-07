import type { ServerStreamingRpc } from '@backend/grpc/src/types/rpc-types.ts';
import { shortenLoggingArray } from '@common/utils';
import type {
    TDashboardItem,
    TPermission,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/common';
import type {
    TSubscribeToDashboardListRequest,
    TSubscribeToDashboardListResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api';
import { isEmpty, isEqual, keyBy } from 'lodash-es';
import {
    combineLatest,
    distinctUntilChanged,
    finalize,
    map,
    of,
    shareReplay,
    switchMap,
} from 'rxjs';

import { subscribeToDashboardUpdates } from '../../db/dashboards.ts';
import { subscribeToDashboardDraftLookupUpdates } from '../../db/drafts.ts';
import {
    subscribeToDashboardsOwnersUpdates,
    subscribeToPermissionsCountUpdates,
    subscribeToPermissionsUpdates,
} from '../../db/permissions.ts';
import { scopesIndex } from '../../db/scopes/scopes.db.index.ts';
import { EActorName } from '../../def/actor.ts';
import { EGroups } from '../../def/permissions.ts';
import { metrics } from '../../utils/metrics.ts';
import { handleSubscriptionRpcInitialization } from '../handlers/handleSubscriptionRpcInitialization.ts';
import { getMaxPermission } from '../permissions/utils.ts';

export const subscribeToDashboardList: ServerStreamingRpc<
    TSubscribeToDashboardListRequest,
    TSubscribeToDashboardListResponse
> = function subscribeToDashboardList(call) {
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
        rpc: subscribeToDashboardList,
        call,
        metadata: call.metadata,
        actor: EActorName.Dashboards,
    });

    logStart({ ...payload.filters });

    const allowedLevels: TPermission[] = [
        'PERMISSION_OWNER',
        'PERMISSION_EDITOR',
        'PERMISSION_VIEWER',
    ];

    try {
        const availablePermissions$ = subscribeToPermissionsUpdates({
            user: username,
            allowedLevels,
        }).pipe(shareReplay({ refCount: true, bufferSize: 1 }));

        const scopes$ =
            payload.filters?.include?.scopes || payload.filters?.exclude?.scopes
                ? scopesIndex.subscribeToScopeUpdates(payload.filters, traceId)
                : of(undefined);

        metrics.dashboards.list.inc();

        combineLatest([availablePermissions$, scopes$])
            .pipe(
                finalize(() => metrics.dashboards.list.dec()),
                switchMap(([availablePermissions, scopes]) => {
                    const ids = availablePermissions
                        .filter((availablePermission) => availablePermission.user !== EGroups.All)
                        .map((availablePermission) => availablePermission.dashboardId)
                        .filter((permittedDashboardId) =>
                            scopes
                                ? scopes.find((scope) => scope.dashboardId === permittedDashboardId)
                                : true,
                        );

                    logger.info({
                        message: messageWithContext('permissions received'),
                        ids,
                    });

                    if (ids.length === 0) {
                        return of([]);
                    }

                    // Suboptimal decision as a whole new list is returned after updating a single dashboard
                    return combineLatest([
                        availablePermissions$,
                        subscribeToDashboardUpdates({ ids }),
                        subscribeToDashboardDraftLookupUpdates({ ids, user: username }),
                        subscribeToDashboardsOwnersUpdates({ ids }),
                        subscribeToPermissionsCountUpdates({ ids, user: username }),
                        scopesIndex.subscribeToScopesUpdatesGroupedById(
                            { include: { dashboardIds: ids } },
                            traceId,
                        ),
                    ]).pipe(
                        map(
                            ([
                                permissions,
                                list,
                                drafts,
                                owners,
                                permissionCounts,
                                scopesGroupedByIds,
                            ]) => {
                                logger.debug({
                                    message: 'combine latest',
                                    permissions,
                                    list,
                                    drafts,
                                    owners,
                                    permissionCounts,
                                    scopesGroupedByIds,
                                });

                                const draftsMap = keyBy(drafts, 'dashboardId');

                                logger.debug({
                                    list,
                                    message: 'list',
                                });

                                return list
                                    .map((listItem) => {
                                        const draftItem = draftsMap[listItem.id];
                                        const hasDraft = !isEmpty(draftItem);
                                        const filteredPermissions = permissions.filter(
                                            (p) => p.dashboardId === listItem.id,
                                        );
                                        const { permissionRow, sharePermission } =
                                            getMaxPermission(filteredPermissions);

                                        return {
                                            ...listItem,
                                            scopes: scopesGroupedByIds[listItem.id] ?? [],
                                            sharePermission,
                                            hasDraft,
                                            draftDigest: draftItem?.digest ?? '',
                                            permission: permissionRow.permission,
                                            owners: owners[listItem.id] as string[],
                                            // Display permissions count only for dashboard owners
                                            permissionsCount:
                                                permissionRow.permission === 'PERMISSION_OWNER'
                                                    ? permissionCounts[listItem.id]?.count ?? 0
                                                    : undefined,
                                        } as TDashboardItem;
                                    })
                                    .sort((a, b) => (a.insertionTime > b.insertionTime ? 1 : -1));
                            },
                        ),
                    );
                }),
                map((list) => {
                    return {
                        list,
                    };
                }),
                distinctUntilChanged<TSubscribeToDashboardListResponse>(isEqual),
                takeUntilChannelClose(),
            )
            .subscribe({
                next: (response) => {
                    call.write(response);

                    handleResponse({ list: shortenLoggingArray(response.list, 3) });
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
