import type { TUserName } from '../../modules/user';
import type { Opaque } from '../index';
import type { ISO } from '../time';

export type TStorageDashboardId = Opaque<'Dashboard Storage ID', string>;
export type TStorageDashboardName = Opaque<'Dashboard Storage Name', string>;
export type TStorageDashboardConfig = Opaque<'Dashboard Storage Config', string>;

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
    owners: {
        user: TUserName;
    }[];
};

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
