import type { Opaque } from '@common/types';
import { assertNever } from '@common/utils/src/assert.ts';
import type {
    TStorageDashboardListItem,
    TStorageDashboardName,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { EStorageDashboardPermission } from '@frontend/common/src/types/domain/dashboardsStorage';
import type { TSemverVersion } from '@frontend/common/src/utils/Semver/def';
import { compact, isEmpty, isNil, uniqBy } from 'lodash-es';

import type { TDashboard } from '../../types/dashboard';
import type { TDashboardItem, TDashboardItemKey, TFullDashboard } from '../../types/fullDashboard';
import {
    isIndicatorsDashboard,
    isIndicatorsDashboardItem,
    isIndicatorsDashboardItemKey,
    isRobotDashboard,
    isRobotDashboardItem,
    isRobotDashboardItemKey,
    isStorageDashboard,
    isStorageDashboardItem,
    isStorageDashboardItemKey,
} from '../../types/fullDashboard/guards';
import type { TGridSettings } from '../../types/layout';
import type { TPanel } from '../../types/panel';
import { isChartPanel } from '../../types/panel/guards';
import { createDefaultGridCellSize, getLastCellLayout, getNextLayout, grid60x60 } from '../layout';
import { createChartPanelChartProps, createPanelId, getGridCellPositionByIndex } from '../panels';

export const CURRENT_DASHBOARD_VERSION = '0.0.0' as TSemverVersion;

export function hasDashboardOwnership(dashboardItem: TStorageDashboardListItem): boolean {
    return dashboardItem.permission === EStorageDashboardPermission.Owner;
}

export function hasDraftDashboardItem(dashboardItem: TDashboardItem['item']): boolean {
    return dashboardItem.hasDraft;
}

export function hasDashboardDraft(dashboard: TFullDashboard): boolean {
    return dashboard.item.hasDraft;
}

export function isReadonlyDashboard(dashboard: TFullDashboard): boolean {
    return isStorageDashboard(dashboard) && isReadonlyDashboardsStorageItem(dashboard.item);
}

export function isReadonlyDashboardsStorageItem(dashboardItem: TStorageDashboardListItem): boolean {
    return (
        dashboardItem.permission !== EStorageDashboardPermission.Owner &&
        dashboardItem.permission !== EStorageDashboardPermission.Editor
    );
}

export function getDashboardItemKeyFromItem(item: TDashboardItem): TDashboardItemKey {
    if (isStorageDashboardItem(item)) {
        return item.storageDashboardItemKey;
    }

    if (isRobotDashboardItem(item)) {
        return item.robotDashboardKey;
    }

    if (isIndicatorsDashboardItem(item)) {
        return item.indicatorsDashboardKey;
    }

    assertNever(item);
}

export function getDashboardItemKeyFromDashboard(dashboard: TFullDashboard): TDashboardItemKey {
    if (isStorageDashboard(dashboard)) {
        return dashboard.storageDashboardItemKey;
    }

    if (isRobotDashboard(dashboard)) {
        return dashboard.robotDashboardKey;
    }

    if (isIndicatorsDashboard(dashboard)) {
        return dashboard.indicatorsDashboardKey;
    }

    assertNever(dashboard);
}

export function getUniqueDashboardItemKey(
    itemKey: TDashboardItemKey,
): Opaque<'Stable Unique Key', string> {
    if (isStorageDashboardItemKey(itemKey)) {
        return `ServerDashboard: ${itemKey.storageId}` as ReturnType<
            typeof getUniqueDashboardItemKey
        >;
    }

    if (isRobotDashboardItemKey(itemKey)) {
        return `RobotDashboard: ${[itemKey.socket, itemKey.robotId, itemKey.dashboard]
            .sort()
            .join(' | ')}` as ReturnType<typeof getUniqueDashboardItemKey>;
    }

    if (isIndicatorsDashboardItemKey(itemKey)) {
        return `IndicatorsDashboard: ${[itemKey.socket, itemKey.indicators.join(',')].join(
            ' | ',
        )}` as ReturnType<typeof getUniqueDashboardItemKey>;
    }

    assertNever(itemKey);
}

export function areDashboardItemKeysEqual(
    first: TDashboardItemKey,
    second: TDashboardItemKey,
): boolean {
    if (isStorageDashboardItemKey(first)) {
        return isStorageDashboardItemKey(second) && first.storageId === second.storageId;
    }

    if (isRobotDashboardItemKey(first)) {
        return (
            isRobotDashboardItemKey(second) &&
            first.socket === second.socket &&
            first.robotId === second.robotId &&
            first.dashboard === second.dashboard &&
            ((isNil(first.backtestingId) && isNil(second.backtestingId)) ||
                first.backtestingId === second.backtestingId)
        );
    }

    if (isIndicatorsDashboardItemKey(first)) {
        return (
            isIndicatorsDashboardItemKey(second) &&
            first.socket === second.socket &&
            first.indicators.length === second.indicators.length &&
            (first.indicators.length === 0 ||
                first.indicators.every((indicator) => second.indicators.includes(indicator)))
        );
    }

    assertNever(first);
}

export function createEmptyDashboard(
    name: TStorageDashboardName,
    grid?: TGridSettings,
): TDashboard {
    return {
        version: CURRENT_DASHBOARD_VERSION,
        activeLayout: undefined,
        name: name,
        grid: grid ?? grid60x60,
        panels: [],
    };
}

export function addMissingPanelLayouts(
    activeLayout: undefined | string,
    panels: TPanel[],
    gridSettings?: TGridSettings,
): TPanel[] {
    if (panels.length === 0) {
        return panels;
    }

    const compactLayoutPanels = panels.map((panel) => ({
        ...panel,
        layouts: uniqBy(
            !isNil(activeLayout)
                ? panel.layouts.filter(({ name }) => !isEmpty(name))
                : panel.layouts,
            ({ name }) => name,
        ),
    }));

    const allLayoutNames = Array.from(
        compactLayoutPanels.reduce(
            (set, { layouts }) => {
                layouts.forEach(({ name }) => set.add(name));

                return set;
            },
            new Set<string | undefined>([activeLayout]),
        ),
    );

    for (const layoutName of allLayoutNames) {
        const existingLayouts = compact(
            compactLayoutPanels.map(({ layouts }) =>
                layouts.find(({ name }) => name === layoutName),
            ),
        );

        if (existingLayouts.length === 0 && !isNil(gridSettings)) {
            const defaultCell: TGridSettings['panel'] = {
                ...createDefaultGridCellSize(gridSettings.colsCount, gridSettings.rowsCount),
                relMinWidth: gridSettings.panel.relMinWidth,
                relMinHeight: gridSettings.panel.relMinHeight,
            };

            compactLayoutPanels.forEach((panel, index) => {
                panel.layouts.push({
                    name: layoutName,
                    ...defaultCell,
                    ...getGridCellPositionByIndex(gridSettings, index),
                });
            });

            continue;
        }

        let lastCellGrid = getLastCellLayout(existingLayouts);

        for (const panel of compactLayoutPanels) {
            const layout = panel.layouts.find(({ name }) => name === layoutName);

            if (!isNil(layout)) {
                continue;
            }

            lastCellGrid = getNextLayout(lastCellGrid);

            panel.layouts.push(
                isNil(layoutName)
                    ? lastCellGrid
                    : {
                          name: layoutName,
                          ...lastCellGrid,
                      },
            );
        }
    }

    return compactLayoutPanels;
}

export function unifyIds(dashboard: TDashboard): TDashboard {
    return {
        ...dashboard,
        panels: dashboard.panels.map((panel) => {
            if (isChartPanel(panel)) {
                return {
                    ...panel,
                    charts: panel.charts.map(createChartPanelChartProps),
                    panelId: createPanelId(),
                };
            }

            return {
                ...panel,
                panelId: createPanelId(),
            };
        }),
    };
}

export function sortDashboardItems(items: TDashboardItem[]): TDashboardItem[] {
    return [...items].sort((first, second) => {
        const fistIsStorage = isStorageDashboardItem(first);
        const secondIsStorage = isStorageDashboardItem(second);

        if (fistIsStorage && secondIsStorage) {
            return first.name.localeCompare(second.name);
        }

        if (!fistIsStorage) {
            return -1;
        }

        if (!secondIsStorage) {
            return 1;
        }

        return first.name.localeCompare(second.name);
    });
}
