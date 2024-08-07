import { keyExists } from '../utils';
import type {
    TDashboardItem,
    TDashboardItemKey,
    TFullDashboard,
    TFullIndicatorsDashboard,
    TFullRobotDashboard,
    TFullStorageDashboard,
    TIndicatorsDashboardItem,
    TIndicatorsDashboardItemKey,
    TRobotDashboardItem,
    TRobotDashboardItemKey,
    TStorageDashboardItem,
    TStorageDashboardItemKey,
} from './index';

export function isStorageDashboard(
    fullDashboard: TFullDashboard,
): fullDashboard is TFullStorageDashboard {
    return keyExists<TFullStorageDashboard>(fullDashboard, 'storageDashboardItemKey');
}

export function isRobotDashboard(
    fullDashboard: TFullDashboard,
): fullDashboard is TFullRobotDashboard {
    return keyExists<TFullRobotDashboard>(fullDashboard, 'robotDashboardKey');
}

export function isIndicatorsDashboard(
    fullDashboard: TFullDashboard,
): fullDashboard is TFullIndicatorsDashboard {
    return keyExists<TFullIndicatorsDashboard>(fullDashboard, 'indicatorsDashboardKey');
}

export function isStorageDashboardItem(
    dashboardItem: TDashboardItem,
): dashboardItem is TStorageDashboardItem {
    return keyExists<TStorageDashboardItem>(dashboardItem, 'storageDashboardItemKey');
}

export function isRobotDashboardItem(
    dashboardItem: TDashboardItem,
): dashboardItem is TRobotDashboardItem {
    return keyExists<TRobotDashboardItem>(dashboardItem, 'robotDashboardKey');
}

export function isIndicatorsDashboardItem(
    dashboardItem: TDashboardItem,
): dashboardItem is TIndicatorsDashboardItem {
    return keyExists<TIndicatorsDashboardItem>(dashboardItem, 'indicatorsDashboardKey');
}

export function isStorageDashboardItemKey(
    dashboardItemKey: TDashboardItemKey,
): dashboardItemKey is TStorageDashboardItemKey {
    return keyExists<TStorageDashboardItemKey>(dashboardItemKey, 'storageId');
}

export function isRobotDashboardItemKey(
    dashboardItemKey: unknown,
): dashboardItemKey is TRobotDashboardItemKey {
    return keyExists<TRobotDashboardItemKey>(dashboardItemKey, 'socket', 'robotId', 'dashboard');
}

export function isIndicatorsDashboardItemKey(
    dashboardItemKey: TDashboardItemKey,
): dashboardItemKey is TIndicatorsDashboardItemKey {
    return keyExists<TIndicatorsDashboardItemKey>(dashboardItemKey, 'socket', 'indicators');
}
