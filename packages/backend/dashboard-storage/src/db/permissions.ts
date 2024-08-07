import type { TUserName } from '@common/types/src/primitives/index.ts';
import type { TPermission } from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/common';
import { isEmpty, isEqual, isNil } from 'lodash-es';
import { distinctUntilChanged, map, switchMap } from 'rxjs';

import type { TDbDashboard, TGrpcDashboard } from '../def/dashboard.ts';
import type { TDbPermissionRow, TGrpcPermissionRow } from '../def/permissions.ts';
import { EGroups } from '../def/permissions.ts';
import { Permission } from '../def/response.ts';
import { ETable } from './constants.ts';
import { fromGrpcPermission, toGrcpPermission } from './enum-convertors/permission.convertor.ts';
import { client } from './postgres/index.ts';
import { subscribeToTableUpdates } from './subscription.ts';

type TGetPermissionsQuery = {
    user: TUserName;
    id?: TDbDashboard['id'];
    allowedLevels?: TPermission[];
};

type TResetPermissionsQuery = {
    user?: TUserName;
    id: TDbDashboard['id'];
};

type TGetDashboardPermissionsQuery = {
    user?: TUserName;
    id: TDbDashboard['id'];
};

type TGetDashboardsOwnersQuery = {
    ids: TDbDashboard['id'][];
};

type TGetPermissionsCountQuery = {
    ids: TDbDashboard['id'][];
    user: TUserName;
};

type TUpdatableDbPermissionRow = Pick<TDbPermissionRow, 'user' | 'permission'>;
export type TUpdatableGrpcPermissionRow = Pick<TGrpcPermissionRow, 'user' | 'permission'>;

export async function getPermissions(query: TGetPermissionsQuery): Promise<TGrpcPermissionRow[]> {
    const chQuery = `SELECT dashboard_id, "user", permission, insertion_time from ${
        ETable.Permissions
    } WHERE "user" in ({users: Array(String)})${
        query.id ? ` AND dashboard_id = {id: String}` : ''
    }${
        !(isNil(query.allowedLevels) || isEmpty(query.allowedLevels))
            ? ` AND permission in ({allowedLevels: Array(String)})`
            : ''
    } ORDER BY dashboard_id, "user" ASC;`;

    const dbPermissionRows = await client.query<TDbPermissionRow>({
        query: chQuery,
        query_params: {
            id: query.id ?? '',
            users: [query.user, EGroups.All],
            allowedLevels: query.allowedLevels?.map((level) => fromGrpcPermission(level)) ?? [],
        },
    });

    return dbPermissionRows.map((dbPermissionRow) => ({
        ...dbPermissionRow,
        permission: toGrcpPermission(dbPermissionRow.permission),
    }));
}

export async function getDashboardPermissions(
    query: TGetDashboardPermissionsQuery,
): Promise<TUpdatableGrpcPermissionRow[]> {
    const chQuery = `SELECT "user", permission from ${ETable.Permissions} WHERE permission != '${
        Permission.None
    }' AND dashboard_id = {id: String}${
        !isNil(query.user) ? ' AND "user" != {user: String}' : ''
    } AND "user" != '${EGroups.All}' ORDER BY "user" ASC`;

    const dbPermissionRows = await client.query<TDbPermissionRow>({
        query: chQuery,
        query_params: {
            id: query.id,
            user: query.user ?? '',
        },
    });

    return dbPermissionRows.map((dbPermissionRow) => ({
        ...dbPermissionRow,
        permission: toGrcpPermission(dbPermissionRow.permission),
    }));
}

async function getDashboardsOwners(
    query: TGetDashboardsOwnersQuery,
): Promise<Pick<TDbPermissionRow, 'user' | 'dashboardId'>[]> {
    const chQuery = `SELECT "user", dashboard_id from ${ETable.Permissions} FINAL WHERE permission = {permission: String} AND dashboard_id IN ({ids: Array(String)}) ORDER BY "user" ASC`;

    return client.query<TDbPermissionRow>({
        query: chQuery,
        query_params: {
            ids: query.ids,
            permission: Permission.Owner,
        },
    });
}

export async function resetDashboardPermissions(query: TResetPermissionsQuery): Promise<void> {
    const permissionRows = await getDashboardPermissions(query);
    const resetPermissionRows: TUpdatableGrpcPermissionRow[] = permissionRows.map(
        (permissionRow) => ({
            user: permissionRow.user,
            permission: 'PERMISSION_NONE',
        }),
    );
    await upsertPermissions(query.id, resetPermissionRows);
}

export async function upsertPermissions(
    dashboardId: TGrpcDashboard['id'],
    grpcPermissionRows: TUpdatableGrpcPermissionRow[],
) {
    const newDbPermissionRows = grpcPermissionRows.map((grpcPermissionRow) => ({
        ...grpcPermissionRow,
        permission: fromGrpcPermission(grpcPermissionRow.permission),
        dashboardId,
    }));

    await client.insert<TUpdatableDbPermissionRow>({
        table: ETable.Permissions,
        values: newDbPermissionRows,
        upsert: '"user", dashboard_id',
    });

    return dashboardId;
}

function getPermissionsCount(
    query: TGetPermissionsCountQuery,
): Promise<{ dashboardId: TDbDashboard['id']; count: string }[]> {
    const chQuery = `SELECT count(DISTINCT "user") as count, dashboard_id from ${ETable.Permissions} FINAL WHERE dashboard_id in ({ids: Array(String)}) AND permission != '${Permission.None}' AND "user" != {user: String} AND "user" != '${EGroups.All}' GROUP BY dashboard_id`;

    return client.query({
        query: chQuery,
        query_params: {
            ids: query.ids,
            user: query.user,
        },
    });
}

const trigger$ = subscribeToTableUpdates('permissions_update');

export function subscribeToPermissionsUpdates(query: TGetPermissionsQuery) {
    return trigger$.pipe(
        switchMap(() => getPermissions(query)),
        distinctUntilChanged<TGrpcPermissionRow[]>(isEqual),
    );
}

export function subscribeToDashboardPermissionsUpdates(query: TGetDashboardPermissionsQuery) {
    return trigger$.pipe(
        switchMap(() => getDashboardPermissions(query)),
        distinctUntilChanged<TUpdatableGrpcPermissionRow[]>(isEqual),
    );
}

export function subscribeToPermissionsCountUpdates(query: TGetPermissionsCountQuery) {
    return trigger$.pipe(
        switchMap(() => getPermissionsCount(query)),
        map(
            (items) =>
                items.reduce((acc: Record<TDbDashboard['id'], { count: number }>, item) => {
                    acc[item.dashboardId] = { count: Number(item.count) };
                    return acc;
                }, {}),
            distinctUntilChanged<Record<TDbDashboard['id'], { count: number }>>(isEqual),
        ),
    );
}

export function subscribeToDashboardsOwnersUpdates(query: TGetDashboardsOwnersQuery) {
    return trigger$.pipe(
        switchMap(() => getDashboardsOwners(query)),
        map(
            (items) =>
                items.reduce((acc: Record<TDbPermissionRow['dashboardId'], TUserName[]>, item) => {
                    const { user, dashboardId: id } = item;
                    if (isNil(acc[id])) {
                        acc[id] = [];
                    }
                    acc[id].push(user);
                    return acc;
                }, {}),
            distinctUntilChanged<Record<TDbPermissionRow['dashboardId'], TUserName[]>>(isEqual),
        ),
    );
}
