import type { ISO, Opaque, TPrimitive } from '@common/types';

import type { TUserName } from '../../modules/user';

export type TStorageDashboardId = Opaque<'Dashboard Storage ID', string>;
export type TStorageDashboardName = Opaque<'Dashboard Storage Name', string>;
export type TStorageDashboardConfig = Opaque<'Dashboard Storage Config', string>;

export type TScope = Record<string, TPrimitive>;

// TODO: Get this and other interfaces from BFF after Dashboard Storage migration
export type TStorageDashboardListItem = {
    id: TStorageDashboardId;
    name: TStorageDashboardName;
    kind: EStorageDashboardKind;
    status: EStorageDashboardStatus;
    insertionTime: ISO;
    hasDraft: boolean;
    digest: string;
    permission: EStorageDashboardPermission;
    sharePermission: EStorageDashboardSharePermission;
    permissionsCount?: number;
    owners: TUserName[];
    scopes: TScope[];
};

// TODO: TStorageDashboard and TStorageDashboardListItem were concatinated. Now use TStorageDashboard instead of TStorageDashboardListItem
export type TStorageDashboard = TStorageDashboardListItem & {
    draftDigest: string;
};

export type TStorageDashboardPermission = {
    user: TUserName;
    permission: EStorageDashboardPermission;
};

export const enum EStorageDashboardKind {
    User = 'User',
    Robot = 'Robot',
}

export const enum EStorageDashboardStatus {
    Active = 'Active',
    Suspended = 'Suspended',
    Archived = 'Archived',
}

export const enum EStorageDashboardPermission {
    None = 'None',
    Viewer = 'Viewer',
    Editor = 'Editor',
    Owner = 'Owner',
}

export const enum EStorageDashboardSharePermission {
    None = 'None',
    Viewer = 'Viewer',
    Editor = 'Editor',
}

export enum EStorageDashboardErrorType {
    Validation = 'Validation',
    Authorization = 'Authorization',
}
