import { randomUUID } from 'crypto';
import { intersection, isEmpty, isEqual, isNil, keyBy } from 'lodash-es';
import {
    combineLatest,
    combineLatestWith,
    distinctUntilChanged,
    finalize,
    from,
    map,
    Observable,
    of,
    shareReplay,
    switchMap,
} from 'rxjs';
import { tap } from 'rxjs/operators';

import {
    getDashboardAtRevision,
    getDashboardById,
    getDashboardByLegacyId,
    getDashboardsByDigest,
    subscribeToDashboardUpdates,
    upsertDashboard,
} from '../../db/dashboards.ts';
import {
    deleteDraft,
    getDraftById,
    subscribeToDashboardDraftLookupUpdates,
} from '../../db/drafts.ts';
import {
    getPermissions,
    resetDashboardPermissions,
    subscribeToDashboardsOwnersUpdates,
    subscribeToPermissionsCountUpdates,
    subscribeToPermissionsUpdates,
    TUpdatablePermission,
    upsertPermissions,
} from '../../db/permissions.ts';
import { getDigest } from '../../db/utils.ts';
import { EActorName, TActorRequest } from '../../def/actor.ts';
import { EGroups } from '../../def/permissions.ts';
import type {
    CreateDashboardRequest,
    DeleteDashboardRequest,
    FetchDashboardConfigRequest,
    FetchDashboardDraftRequest,
    FetchDashboardIdByLegacyIdRequest,
    ImportDashboardRequest,
    RenameDashboardRequest,
    SubscribeToDashboardRequest,
    SubscribeToDashboardsListRequest,
    UpdateDashboardRequest,
} from '../../def/request.ts';
import type {
    CreateDashboardResponse,
    DashboardItem,
    DeleteDashboardResponse,
    FetchDashboardConfigResponse,
    FetchDashboardDraftResponse,
    FetchDashboardIdByLegacyIdResponse,
    ImportDashboardResponse,
    RenameDashboardResponse,
    SubscribeToDashboardResponse,
    SubscribeToDashboardsListResponse,
    UpdateDashboardResponse,
} from '../../def/response.ts';
import { DashboardsListItem, Permission, SharePermission, Status } from '../../def/response.ts';
import { ActorError, EActorErrorKind } from '../../utils/errors.ts';
import { logger } from '../../utils/logger.ts';
import { metrics } from '../../utils/metrics.ts';
import { tapOnce } from '../../utils/rx/tap.ts';
import { getMaxPermission, sharePermissionToPermission } from '../permissions/utils.ts';

export const createDashboard = (
    req: TActorRequest<CreateDashboardRequest>,
): Observable<CreateDashboardResponse> => {
    logger.info({
        message: '`createDashboard` - started',
        actor: EActorName.Dashboards,
        traceId: req.traceId,
        correlationId: req.correlationId,
    });

    return from(upsertDashboard({ ...req.payload, status: Status.Active, id: randomUUID() })).pipe(
        tap((id) => {
            logger.info({
                message: '`createDashboard` - dashboard created',
                actor: EActorName.Dashboards,
                traceId: req.traceId,
                correlationId: req.correlationId,
                id,
            });
        }),
        switchMap((id) =>
            upsertPermissions(id, [
                {
                    user: req.username!,
                    permission: Permission.Owner,
                },
            ]),
        ),
        tap((id) => {
            logger.info({
                message: '`createDashboard` - permissions upserted',
                actor: EActorName.Dashboards,
                traceId: req.traceId,
                correlationId: req.correlationId,
                id,
            });
        }),
        map((id) => ({ type: 'DashboardCreated', id }) as CreateDashboardResponse),
    );
};
export const importDashboard = (
    req: TActorRequest<ImportDashboardRequest>,
): Observable<ImportDashboardResponse> => {
    const permission: TUpdatablePermission = {
        user: req.username!,
        // @ts-ignore
        permission: req.payload.permission,
    };

    logger.info({
        message: '`importDashboard` - started',
        actor: EActorName.Dashboards,
        traceId: req.traceId,
        correlationId: req.correlationId,
        legacyId: req.payload.legacyId,
    });

    return (
        req.payload.legacyId === 0
            ? of(undefined)
            : from(getDashboardByLegacyId(req.payload.legacyId))
    ).pipe(
        switchMap(async (legacyDashboard) => {
            if (isNil(legacyDashboard)) {
                logger.info({
                    message: '`importDashboard` - Dashboard not found by legacy id',
                    traceId: req.traceId,
                    correlationId: req.correlationId,
                    actor: EActorName.Dashboards,
                    legacyId: req.payload.legacyId,
                });
                // Deduplicate existing dashboards by digest (per user)
                const digest = getDigest(req.payload);
                const dashboardIds = (await getDashboardsByDigest(digest)).map((d) => d.id);
                const allowedLevels = [Permission.Owner, Permission.Editor, Permission.Viewer];
                const permissionDashboardIds = (
                    await getPermissions({ allowedLevels, user: req.username! })
                ).map((p) => p.dashboardId);
                let id: string | undefined = intersection(dashboardIds, permissionDashboardIds)[0];

                if (!isNil(id)) {
                    logger.info({
                        message: '`importDashboard` - dashboard duplicate found by digest',
                        traceId: req.traceId,
                        correlationId: req.correlationId,
                        actor: EActorName.Dashboards,
                        id,
                        digest,
                    });

                    return Promise.resolve(id);
                }

                id = randomUUID();

                logger.info({
                    message: '`importDashboard` - creating a new dashboard',
                    traceId: req.traceId,
                    correlationId: req.correlationId,
                    actor: EActorName.Dashboards,
                    id,
                });
                return upsertDashboard({ ...req.payload, status: Status.Active, id });
            }
            logger.info({
                message: '`importDashboard` - dashboard already exists',
                traceId: req.traceId,
                correlationId: req.correlationId,
                actor: EActorName.Dashboards,
            });
            return Promise.resolve(legacyDashboard.id);
        }),
        tap((id) => {
            logger.info({
                message: '`importDashboard` - dashboard created if not exists',
                traceId: req.traceId,
                correlationId: req.correlationId,
                actor: EActorName.Dashboards,
                id,
            });
        }),
        switchMap((id) => upsertPermissions(id, [permission])),
        tap((id) => {
            logger.info({
                message: '`importDashboard` - permissions upserted',
                traceId: req.traceId,
                correlationId: req.correlationId,
                actor: EActorName.Dashboards,
                id,
            });
        }),
        map((id) => ({ type: 'DashboardImported', id })),
    );
};

export const updateDashboard = (
    req: TActorRequest<UpdateDashboardRequest>,
): Observable<UpdateDashboardResponse> => {
    const allowedLevels = [Permission.Owner, Permission.Editor];

    logger.info({
        message: '`updateDashboard` - started',
        actor: EActorName.Dashboards,
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
                message: '`updateDashboard` - permissions received',
                actor: EActorName.Dashboards,
                traceId: req.traceId,
                correlationId: req.correlationId,
                id: req.payload.id,
                permissions,
            });

            if (permissions.length === 0) {
                throw new ActorError({
                    kind: EActorErrorKind.Authorization,
                    title: 'Dashboard update failed',
                    description: 'You do not have permission to edit this dashboard',
                });
            }

            // Check whether old and new digests match.
            // If not, the user is trying to update an outdated config.
            // Such operation must be denied.
            return getDashboardById(req.payload.id);
        }),
        switchMap((currentDashboard) => {
            if (isNil(currentDashboard)) {
                throw new ActorError({
                    kind: EActorErrorKind.Authorization,
                    title: 'Dashboard not found',
                    description: 'Dashboard may have been deleted from storage by the owner',
                });
            }

            if (currentDashboard.digest !== req.payload.digest) {
                throw new ActorError({
                    kind: EActorErrorKind.Validation,
                    title: 'Dashboard update failed',
                    description: 'Digest mismatch. You are trying to update an outdated dashboard.',
                    args: {
                        currentDigest: currentDashboard.digest,
                        receivedDigest: req.payload.digest,
                    },
                });
            }

            // @ts-ignore
            const newDigest = getDigest(req.payload);

            if (newDigest === req.payload.digest) {
                logger.info({
                    message: '`updateDashboard` - same digest detected, skipping update',
                    actor: EActorName.Dashboards,
                    traceId: req.traceId,
                    correlationId: req.correlationId,
                    id: req.payload.id,
                });
                return of(currentDashboard.id);
            }

            logger.info({
                message: '`updateDashboard` - digests checked, upserting dashboard',
                actor: EActorName.Dashboards,
                traceId: req.traceId,
                correlationId: req.correlationId,
                id: req.payload.id,
            });

            return upsertDashboard({
                id: req.payload.id,
                name: req.payload.name,
                config: req.payload.config,
                // @ts-ignore
                status: req.payload.status,
            });
        }),
        switchMap((dashboardId) => {
            // Reset draft after updating a dashboard config
            logger.info({
                message: '`updateDashboard` - dashboard updated, resetting draft',
                actor: EActorName.Dashboards,
                traceId: req.traceId,
                correlationId: req.correlationId,
                id: req.payload.id,
            });

            return deleteDraft({
                dashboardId,
                user: req.username!,
            });
        }),
        tap(() => {
            logger.info({
                message: '`updateDashboard` - draft reset, finishing',
                actor: EActorName.Dashboards,
                traceId: req.traceId,
                correlationId: req.correlationId,
                id: req.payload.id,
            });
        }),
        map(() => {
            return { type: 'DashboardUpdated' } as UpdateDashboardResponse;
        }),
    );
};

export function fetchDashboardConfig(
    req: TActorRequest<FetchDashboardConfigRequest>,
): Observable<FetchDashboardConfigResponse> {
    const allowedLevels = [Permission.Owner, Permission.Editor, Permission.Viewer];

    metrics.dashboards.dashboard.inc();

    logger.info({
        message: '`fetchDashboard` - started',
        actor: EActorName.Dashboards,
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
        finalize(() => metrics.dashboards.dashboard.dec()),
        map((permissions) => {
            logger.info({
                message: '`fetchDashboard` - permissions received',
                actor: EActorName.Dashboards,
                traceId: req.traceId,
                correlationId: req.correlationId,
                id: req.payload.id,
                permissions,
            });

            if (permissions.length === 0) {
                throw new ActorError({
                    kind: EActorErrorKind.Authorization,
                    title: 'Failed to fetch dashboard',
                    description: 'You do not have permission to view this dashboard',
                });
            }
            return getMaxPermission(permissions);
        }),
        switchMap(({ permission }) => {
            const { dashboardId } = permission;
            logger.info({
                message: '`fetchDashboard` - permissions checked, loading dashboard',
                actor: EActorName.Dashboards,
                traceId: req.traceId,
                correlationId: req.correlationId,
                permission,
            });

            return isNil(req.payload.digest)
                ? getDashboardById(dashboardId)
                : getDashboardAtRevision(dashboardId, req.payload.digest);
        }),
        map((dashboard) => {
            if (isNil(dashboard)) {
                throw new ActorError({
                    kind: EActorErrorKind.Authorization,
                    title: 'Dashboard not found',
                    description: 'Dashboard may have been deleted from storage by the owner',
                });
            }

            logger.info({
                message: '`fetchDashboard` - dashboard received',
                actor: EActorName.Dashboards,
                traceId: req.traceId,
                correlationId: req.correlationId,
                id: req.payload.id,
                dashboard: dashboard.id,
                digest: dashboard.digest,
            });

            return dashboard;
        }),
        map((dashboard) => {
            return {
                type: 'DashboardConfig',
                config: dashboard.config,
                digest: dashboard.digest,
            } as FetchDashboardConfigResponse;
        }),
        tap((res) =>
            logger.info({
                message: '`fetchDashboard` - sending response',
                actor: EActorName.Dashboards,
                traceId: req.traceId,
                correlationId: req.correlationId,
                id: req.payload.id,
                digest: req.payload.digest,
                configSize: res.config.length,
            }),
        ),
    );
}

export function fetchDashboardDraft(
    req: TActorRequest<FetchDashboardDraftRequest>,
): Observable<FetchDashboardDraftResponse> {
    const allowedLevels = [Permission.Owner, Permission.Editor, Permission.Viewer];
    return from(
        getPermissions({
            user: req.username!,
            id: req.payload.id,
            allowedLevels,
        }),
    ).pipe(
        map((permissions) => {
            if (permissions.length === 0) {
                throw new ActorError({
                    kind: EActorErrorKind.Authorization,
                    title: 'Failed to fetch dashboard',
                    description: 'You do not have permission to view this dashboard',
                });
            }
            return getMaxPermission(permissions);
        }),
        switchMap(({ permission }) => {
            const { dashboardId } = permission;
            logger.info({
                message: '`fetchDashboard` - permissions checked, getting draft',
                actor: EActorName.Dashboards,
                traceId: req.traceId,
                correlationId: req.correlationId,
                permission,
            });

            return getDraftById(req.username!, dashboardId);
        }),
        map((draft) => {
            if (isNil(draft)) {
                throw new ActorError({
                    kind: EActorErrorKind.Authorization,
                    title: 'Failed to fetch dashboard draft',
                    description: 'Draft does not exist',
                });
            }

            return {
                type: 'DashboardDraft',
                draft: draft.config,
                digest: draft.digest,
            } as FetchDashboardDraftResponse;
        }),
    );
}

export function subscribeToDashboardsList(
    req: TActorRequest<SubscribeToDashboardsListRequest>,
): Observable<SubscribeToDashboardsListResponse> {
    const allowedLevels = [Permission.Owner, Permission.Editor, Permission.Viewer];

    logger.info({
        message: '`subscribeToDashboardsList` - started',
        actor: EActorName.Dashboards,
        traceId: req.traceId,
        correlationId: req.correlationId,
    });

    const permissions$ = subscribeToPermissionsUpdates({
        user: req.username!,
        allowedLevels,
    }).pipe(shareReplay({ refCount: true, bufferSize: 1 }));

    metrics.dashboards.list.inc();
    return permissions$.pipe(
        finalize(() => metrics.dashboards.list.dec()),
        switchMap((permissions) => {
            const ids = permissions.filter((p) => p.user !== EGroups.All).map((p) => p.dashboardId);

            logger.info({
                message: '`subscribeToDashboardsList` - permissions received',
                actor: EActorName.Dashboards,
                traceId: req.traceId,
                correlationId: req.correlationId,
                ids,
            });

            if (ids.length === 0) {
                return of([]);
            }

            // Suboptimal decision as a whole new list is returned after updating a single dashboard
            return combineLatest([
                permissions$,
                subscribeToDashboardUpdates({ ids }),
                subscribeToDashboardDraftLookupUpdates({ ids, user: req.username! }),
                subscribeToDashboardsOwnersUpdates({ ids }),
                subscribeToPermissionsCountUpdates({ ids, user: req.username! }),
            ]).pipe(
                map(([permissions, list, drafts, owners, permissionCounts]) => {
                    const draftsMap = keyBy(drafts, 'dashboardId');

                    return list
                        .map((listItem): DashboardsListItem => {
                            const draftItem = draftsMap[listItem.id];
                            const hasDraft = !isEmpty(draftItem);
                            const filteredPermissions = permissions.filter(
                                (p) => p.dashboardId === listItem.id,
                            );
                            const { permission, sharePermission } =
                                getMaxPermission(filteredPermissions);
                            return {
                                ...listItem,
                                sharePermission,
                                hasDraft,
                                permission: permission.permission,
                                owners: owners[listItem.id],
                                // Display permissions count only for dashboard owners
                                permissionsCount:
                                    permission.permission === Permission.Owner
                                        ? permissionCounts[listItem.id]?.count ?? 0
                                        : undefined,
                            };
                        })
                        .sort((a, b) => (a.insertionTime > b.insertionTime ? 1 : -1));
                }),
            );
        }),
        map((list) => {
            return {
                type: 'DashboardsList',
                list,
            } as SubscribeToDashboardsListResponse;
        }),
        distinctUntilChanged<SubscribeToDashboardsListResponse>(isEqual),
        tap((res) =>
            logger.info({
                message: '`subscribeToDashboardsList` - sending update',
                actor: EActorName.Dashboards,
                traceId: req.traceId,
                correlationId: req.correlationId,
                list: res.list.length,
            }),
        ),
    );
}

export function subscribeToDashboard(
    req: TActorRequest<SubscribeToDashboardRequest>,
): Observable<SubscribeToDashboardResponse> {
    const allowedLevels = [Permission.Owner, Permission.Editor, Permission.Viewer];

    logger.info({
        message: '`subscribeToDashboard` - started',
        actor: EActorName.Dashboards,
        traceId: req.traceId,
        correlationId: req.correlationId,
        id: req.payload.id,
    });

    const permission$ = subscribeToPermissionsUpdates({
        user: req.username!,
        id: req.payload.id,
        allowedLevels,
    }).pipe(
        tapOnce(async (permissions) => {
            // If permission shows that dashboard has shared access enabled for this user
            // We must explicitly grant `viewer` access to the current user
            const { permission, sharePermission } = getMaxPermission(permissions);
            if (sharePermission !== SharePermission.None && permission.user === EGroups.All) {
                await upsertPermissions(req.payload.id, [
                    {
                        user: req.username!,
                        permission: sharePermissionToPermission(sharePermission),
                    },
                ]);
            }
        }),
        map((permissions) => {
            logger.info({
                message: '`subscribeToDashboard` - permissions received',
                actor: EActorName.Dashboards,
                traceId: req.traceId,
                correlationId: req.correlationId,
                id: req.payload.id,
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
    return permission$.pipe(
        finalize(() => metrics.dashboards.dashboard.dec()),
        switchMap(({ permission }) => {
            const { dashboardId } = permission;
            logger.info({
                message:
                    '`subscribeToDashboard` - permissions checked, subscribing to dashboard updates',
                actor: EActorName.Dashboards,
                traceId: req.traceId,
                correlationId: req.correlationId,
                permission,
            });

            return subscribeToDashboardUpdates({ ids: [dashboardId] });
        }),
        map((dashboards) => {
            const [dashboard] = dashboards;

            logger.info({
                message: '`subscribeToDashboard` - dashboard update received',
                actor: EActorName.Dashboards,
                traceId: req.traceId,
                correlationId: req.correlationId,
                id: req.payload.id,
                dashboard: dashboard.id,
                digest: dashboard.digest,
            });

            return dashboard;
        }),
        combineLatestWith(
            permission$,
            subscribeToDashboardDraftLookupUpdates({
                ids: [req.payload.id],
                user: req.username!,
            }).pipe(
                map((drafts) => drafts[0]),
                tap((draft) => {
                    logger.info({
                        message: '`subscribeToDashboard` - draft update received',
                        actor: EActorName.Dashboards,
                        traceId: req.traceId,
                        correlationId: req.correlationId,
                        id: req.payload.id,
                        hasDraft: !isEmpty(draft),
                        draftDigest: draft?.digest,
                    });
                }),
            ),
            subscribeToDashboardsOwnersUpdates({
                ids: [req.payload.id],
            }),
            permission$.pipe(
                switchMap(({ permission }) => {
                    if (permission.permission === Permission.Owner) {
                        return subscribeToPermissionsCountUpdates({
                            ids: [req.payload.id],
                            user: req.username!,
                        });
                    }
                    return of(undefined);
                }),
            ),
        ),
        map(([dashboard, { permission, sharePermission }, draft, owners, permissionsCount]) => {
            const hasDraft = !isNil(draft);
            const dashboardWithDraft: DashboardItem = {
                ...dashboard,
                hasDraft,
                draftDigest: draft?.digest ?? '',
                permission: permission.permission,
                sharePermission,
                owners: owners[dashboard.id],
                permissionsCount: permissionsCount
                    ? permissionsCount[dashboard.id]?.count ?? 0
                    : undefined,
            };

            return {
                type: 'Dashboard',
                dashboard: dashboardWithDraft,
            } as SubscribeToDashboardResponse;
        }),
        distinctUntilChanged<SubscribeToDashboardResponse>(isEqual),
        tap((res) =>
            logger.info({
                message: '`subscribeToDashboard` - sending update',
                actor: EActorName.Dashboards,
                traceId: req.traceId,
                correlationId: req.correlationId,
                id: req.payload.id,
                digest: res.dashboard.digest,
            }),
        ),
    );
}

export function deleteDashboard(
    req: TActorRequest<DeleteDashboardRequest>,
): Observable<DeleteDashboardResponse> {
    logger.info({
        message: '`deleteDashboard` - started',
        actor: EActorName.Dashboards,
        traceId: req.traceId,
        correlationId: req.correlationId,
    });

    const allowedLevels = [Permission.Viewer, Permission.Editor];
    const ownerLevels = [Permission.Owner];
    return of(true).pipe(
        switchMap(async () => {
            const ownerPermissions = await getPermissions({
                id: req.payload.id,
                user: req.username!,
                allowedLevels: ownerLevels,
            });
            const permissions = await getPermissions({
                id: req.payload.id,
                user: req.username!,
                allowedLevels,
            });
            logger.info({
                message: '`deleteDashboard` - permissions received',
                actor: EActorName.Dashboards,
                id: req.payload.id,
                traceId: req.traceId,
                correlationId: req.correlationId,
                ownerPermissions,
                permissions,
            });

            if (isEmpty(ownerPermissions) && isEmpty(permissions)) {
                throw new ActorError({
                    kind: EActorErrorKind.Authorization,
                    title: 'Dashboard delete failed',
                    description: 'The dashboard doesnt exist or has been deleted before.',
                });
            }

            // If owner deletes dashboard, we should reset everybody's permissions
            // It will remove the dashboard from everyone.
            if (!isEmpty(ownerPermissions)) {
                await resetDashboardPermissions({ id: req.payload.id });
            } else {
                // If not-owner deletes dashboard, we should update only his permissions,
                // otherwise leaving dashboard as-is.
                await upsertPermissions(req.payload.id, [
                    { user: req.username!, permission: Permission.None },
                ]);
            }

            // Delete draft for the current user after deleting dashboard from his list
            await deleteDraft({ user: req.username!, dashboardId: req.payload.id });
        }),
        map(() => {
            return {
                type: 'DashboardDeleted',
            } as DeleteDashboardResponse;
        }),
    );
}

export function fetchDashboardIdByLegacyId(
    req: TActorRequest<FetchDashboardIdByLegacyIdRequest>,
): Observable<FetchDashboardIdByLegacyIdResponse> {
    logger.info({
        message: '`fetchDashboardIdByLegacyId` - started',
        actor: EActorName.Dashboards,
        traceId: req.traceId,
        correlationId: req.correlationId,
    });

    return from(getDashboardByLegacyId(req.payload.legacyId)).pipe(
        map((dashboard) => {
            if (isNil(dashboard)) {
                throw new ActorError({
                    kind: EActorErrorKind.Authorization,
                    title: 'Dashboard not found',
                    description: `Dashboard does not exist in storage. Ask initial owner to manually upload it.`,
                });
            }

            return {
                type: 'DashboardId',
                id: dashboard.id,
            };
        }),
    );
}

export function renameDashboard(
    req: TActorRequest<RenameDashboardRequest>,
): Observable<RenameDashboardResponse> {
    logger.info({
        message: '`renameDashboard` - started',
        actor: EActorName.Dashboards,
        traceId: req.traceId,
        correlationId: req.correlationId,
    });

    const allowedLevels = [Permission.Owner, Permission.Editor];
    return from(
        getPermissions({
            id: req.payload.id,
            user: req.username!,
            allowedLevels,
        }),
    ).pipe(
        map((permissions) => {
            if (permissions.length === 0) {
                throw new ActorError({
                    kind: EActorErrorKind.Authorization,
                    title: 'Failed to rename dashboard',
                    description: 'You do not have permission to rename this dashboard',
                });
            }
        }),
        switchMap(() => getDashboardById(req.payload.id)),
        switchMap((dashboard) => {
            if (isNil(dashboard)) {
                throw new ActorError({
                    kind: EActorErrorKind.Authorization,
                    title: 'Dashboard not found',
                    description: `Dashboard does not exist in storage. Nothing to rename.`,
                });
            }

            return upsertDashboard({ ...dashboard, name: req.payload.name });
        }),
        map((id) => {
            logger.info({
                message: '`renameDashboard` - dashboard upserted',
                traceId: req.traceId,
                correlationId: req.correlationId,
                actor: EActorName.Dashboards,
                id,
            });

            return { type: 'DashboardRenamed' };
        }),
    );
}
