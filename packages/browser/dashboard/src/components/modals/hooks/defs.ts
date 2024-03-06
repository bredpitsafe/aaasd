import type { TUserName } from '@frontend/common/src/modules/user';
import {
    EStorageDashboardPermission,
    EStorageDashboardSharePermission,
} from '@frontend/common/src/types/domain/dashboardsStorage';

export const EVERYONE_PERMISSION_KEY = '';

export type TPermissionKey = TUserName | typeof EVERYONE_PERMISSION_KEY;
export type TDashboardPermission = EStorageDashboardSharePermission | EStorageDashboardPermission;
