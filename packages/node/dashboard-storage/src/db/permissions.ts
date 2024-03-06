import { isEmpty, isEqual, isNil } from 'lodash-es';
import { distinctUntilChanged, map, switchMap } from 'rxjs';

import { TDashboard } from '../def/dashboard.ts';
import { EGroups, TPermission } from '../def/permissions.ts';
import { Permission } from '../def/response.ts';
import { TUserName } from '../def/user.ts';
import { TUser } from '../def/users.ts';
import { ETables } from './constants.ts';
import { client } from './postgres/index.ts';
import { subscribeToTableUpdates } from './subscription.ts';

type TGetPermissionsQuery = {
    user: TUserName;
    id?: TDashboard['id'];
    allowedLevels?: Permission[];
};

type TResetPermissionsQuery = {
    user?: TUserName;
    id: TDashboard['id'];
};

type TGetDashboardPermissionsQuery = {
    user?: TUserName;
    id: TDashboard['id'];
};

type TGetDashboardsOwnersQuery = {
    ids: TDashboard['id'][];
};

type TGetUsersQuery = {
    user: TUserName;
};

type TGetPermissionsCountQuery = {
    ids: TDashboard['id'][];
    user: TUserName;
};

export type TUpdatablePermission = Pick<TPermission, 'user' | 'permission'>;

export async function getPermissions(query: TGetPermissionsQuery): Promise<TPermission[]> {
    const chQuery = `SELECT dashboard_id, "user", permission, insertion_time from ${
        ETables.Permissions
    } WHERE "user" in ({users: Array(String)})${
        query.id ? ` AND dashboard_id = {id: String}` : ''
    }${
        !(isNil(query.allowedLevels) || isEmpty(query.allowedLevels))
            ? ` AND permission in ({allowedLevels: Array(String)})`
            : ''
    } ORDER BY dashboard_id, "user" ASC;`;

    return client.query<TPermission>({
        query: chQuery,
        query_params: {
            id: query.id ?? '',
            users: [query.user, EGroups.All],
            allowedLevels: query.allowedLevels ?? [],
        },
    });
}

export async function getDashboardPermissions(
    query: TGetDashboardPermissionsQuery,
): Promise<TUpdatablePermission[]> {
    const chQuery = `SELECT "user", permission from ${ETables.Permissions} WHERE permission != '${
        Permission.None
    }' AND dashboard_id = {id: String}${
        !isNil(query.user) ? ' AND "user" != {user: String}' : ''
    } AND "user" != '${EGroups.All}' ORDER BY "user" ASC`;

    return client.query<TPermission>({
        query: chQuery,
        query_params: {
            id: query.id,
            user: query.user ?? '',
        },
    });
}

async function getDashboardsOwners(
    query: TGetDashboardsOwnersQuery,
): Promise<Pick<TPermission, 'user' | 'dashboardId'>[]> {
    const chQuery = `SELECT "user", dashboard_id from ${ETables.Permissions} FINAL WHERE permission = {permission: String} AND dashboard_id IN ({ids: Array(String)}) ORDER BY "user" ASC`;

    return client.query<TPermission>({
        query: chQuery,
        query_params: {
            ids: query.ids,
            permission: Permission.Owner,
        },
    });
}

export async function resetDashboardPermissions(query: TResetPermissionsQuery): Promise<void> {
    const permissions = await getDashboardPermissions(query);
    const resetPermissions = permissions.map((p) => ({
        user: p.user,
        permission: Permission.None,
    }));
    await upsertPermissions(query.id, resetPermissions);
}

export async function upsertPermissions(
    dashboardId: TDashboard['id'],
    permissions: TUpdatablePermission[],
) {
    const newPermissions = permissions.map((p) => ({
        ...p,
        dashboardId,
    }));

    await client.insert<TUpdatablePermission>({
        table: ETables.Permissions,
        values: newPermissions,
        upsert: '"user", dashboard_id',
    });

    return dashboardId;
}

function getAllUsers(query: TGetUsersQuery): Promise<TUser[]> {
    const chQuery = `SELECT DISTINCT "user" from ${ETables.Permissions} WHERE permission != '${Permission.None}' AND "user" != {user: String} AND "user" != '${EGroups.All}' ORDER BY "user" ASC`;
    return client.query<TUser>({
        query: chQuery,
        query_params: {
            user: query.user,
        },
    });
}
function getPermissionsCount(
    query: TGetPermissionsCountQuery,
): Promise<{ dashboardId: TDashboard['id']; count: string }[]> {
    const chQuery = `SELECT count(DISTINCT "user") as count, dashboard_id from ${ETables.Permissions} FINAL WHERE dashboard_id in ({ids: Array(String)}) AND permission != '${Permission.None}' AND "user" != {user: String} AND "user" != '${EGroups.All}' GROUP BY dashboard_id`;

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
        distinctUntilChanged<TPermission[]>(isEqual),
    );
}
export function subscribeToDashboardPermissionsUpdates(query: TGetDashboardPermissionsQuery) {
    return trigger$.pipe(
        switchMap(() => getDashboardPermissions(query)),
        distinctUntilChanged<TUpdatablePermission[]>(isEqual),
    );
}

export function subscribeToUsersUpdates(query: TGetUsersQuery) {
    return trigger$.pipe(
        switchMap(() => getAllUsers(query)),
        distinctUntilChanged<TUser[]>(isEqual),
    );
}

export function subscribeToPermissionsCountUpdates(query: TGetPermissionsCountQuery) {
    return trigger$.pipe(
        switchMap(() => getPermissionsCount(query)),
        map(
            (items) =>
                items.reduce((acc: Record<TDashboard['id'], { count: number }>, item) => {
                    acc[item.dashboardId] = { count: Number(item.count) };
                    return acc;
                }, {}),
            distinctUntilChanged<Record<TDashboard['id'], { count: number }>>(isEqual),
        ),
    );
}

export function subscribeToDashboardsOwnersUpdates(query: TGetDashboardsOwnersQuery) {
    return trigger$.pipe(
        switchMap(() => getDashboardsOwners(query)),
        map(
            (items) =>
                items.reduce((acc: Record<TPermission['dashboardId'], TUser[]>, item) => {
                    const { user, dashboardId: id } = item;
                    if (isNil(acc[id])) {
                        acc[id] = [];
                    }
                    acc[id].push({ user });
                    return acc;
                }, {}),
            distinctUntilChanged<Record<TPermission['dashboardId'], TUser[]>>(isEqual),
        ),
    );
}
