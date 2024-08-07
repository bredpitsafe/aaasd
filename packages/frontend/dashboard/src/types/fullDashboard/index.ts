import type { ISO } from '@common/types';
import type { TRobotDashboard } from '@frontend/common/src/modules/actions/def.ts';
import type { TIndicator } from '@frontend/common/src/modules/actions/indicators/defs';
import type { TBacktestingRunId } from '@frontend/common/src/types/domain/backtestings';
import type {
    TStorageDashboard,
    TStorageDashboardId,
    TStorageDashboardListItem,
    TStorageDashboardName,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';

import type { TDashboard } from '../dashboard';

export type TFullStorageDashboard = {
    storageDashboardItemKey: TStorageDashboardItemKey;
    item: TStorageDashboard;
    dashboard: TDashboard;
};

export type TFullRobotDashboard = {
    robotDashboardKey: TRobotDashboardItemKey;
    item: TExternalDashboardMetadata;
    dashboard: TDashboard;
};

export type TFullIndicatorsDashboard = {
    indicatorsDashboardKey: TIndicatorsDashboardItemKey;
    item: TExternalDashboardMetadata;
    dashboard: TDashboard;
};

export type TFullDashboard = TFullStorageDashboard | TFullRobotDashboard | TFullIndicatorsDashboard;

export type TStorageDashboardItem = {
    storageDashboardItemKey: TStorageDashboardItemKey;
    item: TStorageDashboardListItem;
    name: TStorageDashboardName;
};

export type TRobotDashboardItem = {
    robotDashboardKey: TRobotDashboardItemKey;
    item: TExternalDashboardMetadata;
    name: TStorageDashboardName;
};

export type TIndicatorsDashboardItem = {
    indicatorsDashboardKey: TIndicatorsDashboardItemKey;
    item: TExternalDashboardMetadata;
    name: TStorageDashboardName;
};

export type TDashboardItem = TStorageDashboardItem | TRobotDashboardItem | TIndicatorsDashboardItem;

export type TStorageDashboardItemKey = {
    storageId: TStorageDashboardId;
};

export type TRobotDashboardItemKey = {
    socket: TSocketName;
    robotId: TRobotId;
    dashboard: TRobotDashboard['name'];
    focusTo?: ISO;
    snapshotDate?: ISO;
    backtestingId?: TBacktestingRunId;
};

export type TIndicatorsDashboardItemKey = {
    socket: TSocketName;
    indicators: TIndicator['name'][];
    focusTo?: ISO;
};

export type TDashboardItemKey =
    | TStorageDashboardItemKey
    | TRobotDashboardItemKey
    | TIndicatorsDashboardItemKey;

type TExternalDashboardMetadata = {
    hasDraft: boolean;
};
