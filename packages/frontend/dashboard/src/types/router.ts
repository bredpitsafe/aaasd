import type { ISO, Someseconds } from '@common/types';
import type { TRobotDashboard } from '@frontend/common/src/modules/actions/def.ts';
import type { TIndicator } from '@frontend/common/src/modules/actions/indicators/defs';
import type { TBacktestingRunId } from '@frontend/common/src/types/domain/backtestings';
import type {
    TScope,
    TStorageDashboardId,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';

export type TUrlParams<T> = {
    [P in keyof T]: T[P] extends unknown[] ? string[] | string : string;
};

export enum EDashboardRoutes {
    Default = 'default',
    Dashboard = 'dashboard',
    ReadonlyRobotDashboard = 'robotDashboard',
    ReadonlyIndicatorsDashboard = 'indicatorsDashboard',
}

type TScopeRouteParam = {
    scope?: TScope;
};

export type TDefaultRouteParams = TScopeRouteParam;

export type TCommonDashboardRouteParams = {
    position?: {
        left: number;
        right: number;
        clientTimeIncrement: Someseconds;
    };
    backtestingId?: TBacktestingRunId;
};

export type TDashboardRouteParams = TCommonDashboardRouteParams & {
    storageId?: TStorageDashboardId;
} & TScopeRouteParam;

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
    [EDashboardRoutes.Default]: TDefaultRouteParams;
    [EDashboardRoutes.Dashboard]: TDashboardRouteParams;
    [EDashboardRoutes.ReadonlyRobotDashboard]: TRobotDashboardRouteParams;
    [EDashboardRoutes.ReadonlyIndicatorsDashboard]: TIndicatorsDashboardRouteParams;
};
