import type { TRobotDashboard } from '@frontend/common/src/handlers/def';
import type { TIndicator } from '@frontend/common/src/modules/actions/indicators/defs';
import type { TBacktestingRunId } from '@frontend/common/src/types/domain/backtestings';
import type { TComponentId } from '@frontend/common/src/types/domain/component';
import type { TStorageDashboardId } from '@frontend/common/src/types/domain/dashboardsStorage';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import type { ISO, Someseconds } from '@frontend/common/src/types/time';

export type TUrlParams<T> = {
    [P in keyof T]: T[P] extends unknown[] ? string[] | string : string;
};

export enum EDashboardRoutes {
    Default = 'default',
    Dashboard = 'dashboard',
    ReadonlyRobotDashboard = 'robotDashboard',
    ReadonlyIndicatorsDashboard = 'indicatorsDashboard',
}

type TDefaultDashboardRouteParams = {};

export type TCommonDashboardRouteParams = {
    position?: {
        left: number;
        right: number;
        clientTimeIncrement: Someseconds;
    };
    backtestingId?: TBacktestingRunId;
};

export type TDashboardRouteParams = TCommonDashboardRouteParams & {
    serverId?: TComponentId;
    storageId?: TStorageDashboardId;
};

export type TRobotDashboardRouteParams = TCommonDashboardRouteParams & {
    socket: TSocketName;
    dashboard: TRobotDashboard['name'];
    robotId: TRobotId;
    focusTo?: ISO;
    snapshotDate?: ISO;
    dashboardBacktestingId?: TBacktestingRunId;
};

export type TIndicatorsDashboardRouteParams = TCommonDashboardRouteParams & {
    socket: TSocketName;
    indicators: TIndicator['name'][];
    focusTo?: ISO;
};

export enum EOpenType {
    CurrentWindow = 'CurrentWindow',
    NewWindow = 'NewWindow',
    NoAction = 'NoAction',
}

export type TDashboardRouterData = {
    [EDashboardRoutes.Default]: TDefaultDashboardRouteParams;
    [EDashboardRoutes.Dashboard]: TDashboardRouteParams;
    [EDashboardRoutes.ReadonlyRobotDashboard]: TRobotDashboardRouteParams;
    [EDashboardRoutes.ReadonlyIndicatorsDashboard]: TIndicatorsDashboardRouteParams;
};
