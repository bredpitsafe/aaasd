import type { TUserName } from '@common/types/src/primitives/index.ts';
import type { TPermission } from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/common';

import type { TDbDashboard } from './dashboard.ts';
import type { Permission } from './response.ts';

export type TDbPermissionRow = {
    dashboardId: TDbDashboard['id'];
    user: TUserName;
    permission: Permission;
    // This is update time actually
    insertionTime: string;
};

export type TGrpcPermissionRow = Omit<TDbPermissionRow, 'permission'> & {
    permission: TPermission;
};

export enum EGroups {
    All = '@all',
}
