import type { TContextRef } from '@frontend/common/src/di';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import {
    switchMapValueDescriptor,
    takeWhileFirstSyncValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { compact, isNil } from 'lodash-es';

import type { TDashboardItemKey, TFullDashboard } from '../../../types/fullDashboard';
import type { TPanelContent, TPanelLayout } from '../../../types/panel';
import { DEFAULT_GRID_CELL, getLastCellLayout } from '../../../utils/layout';
import { createPanelId } from '../../../utils/panels';
import { ModuleSubscribeToDashboard } from '../fullDashboards/ModuleSubscribeToDashboard.ts';
import { ModuleSubscribeToCurrentDashboard } from './currentDashboardSubscription.ts';
import { ModuleUpdateDashboard } from './updateDashboard';

export const ModuleClonePanel = createObservableProcedure((ctx: TContextRef) => {
    const updateDashboard = ModuleUpdateDashboard(ctx);
    const subscribeToDashboard = ModuleSubscribeToDashboard(ctx);
    const subscribeToCurrentDashboard = ModuleSubscribeToCurrentDashboard(ctx);

    return (
        {
            panel,
            relWidth,
            relHeight,
            dashboardItemKey,
        }: {
            panel: TPanelContent;
            relWidth: number;
            relHeight: number;
            dashboardItemKey?: TDashboardItemKey;
        },
        options,
    ) => {
        const destinationDashboard$ = isNil(dashboardItemKey)
            ? subscribeToCurrentDashboard(undefined, options)
            : subscribeToDashboard(dashboardItemKey, options);

        return destinationDashboard$.pipe(
            takeWhileFirstSyncValueDescriptor(),
            switchMapValueDescriptor(({ value: fullDashboard }) =>
                updateDashboard(
                    createDashboardWithPanel(fullDashboard, panel, relWidth, relHeight),
                    options,
                ),
            ),
        );
    };
});

function createDashboardWithPanel(
    fullDashboard: TFullDashboard,
    panel: TPanelContent,
    relWidth: number,
    relHeight: number,
): TFullDashboard {
    const {
        dashboard: { activeLayout, panels, grid },
    } = fullDashboard;

    if (fullDashboard.dashboard.panels.length === 0) {
        return {
            ...fullDashboard,
            dashboard: {
                ...fullDashboard.dashboard,
                panels: [
                    {
                        ...panel,
                        panelId: createPanelId(),
                        layouts: [
                            {
                                name: fullDashboard.dashboard.activeLayout,
                                ...DEFAULT_GRID_CELL,
                                ...fullDashboard.dashboard.grid?.panel,
                                relWidth,
                                relHeight,
                            },
                        ],
                    },
                ],
            },
        };
    }

    const allLayoutNames = Array.from(
        panels.reduce(
            (set, { layouts }) => {
                layouts.forEach(({ name }) => set.add(name));

                return set;
            },
            new Set<string | undefined>([activeLayout]),
        ),
    );

    const panelLayouts = allLayoutNames.map((layoutName): TPanelLayout => {
        const existingLayouts = compact(
            panels.map(({ layouts }) => layouts.find(({ name }) => name === layoutName)),
        );

        const lastLayout = getLastCellLayout(existingLayouts);

        return {
            name: layoutName,
            relX: 0,
            relY: isNil(lastLayout) ? 0 : lastLayout.relY + lastLayout.relHeight,
            relWidth,
            relHeight,
            relMinWidth: grid.panel?.relMinWidth,
            relMinHeight: grid.panel?.relMinHeight,
        };
    });

    return {
        ...fullDashboard,
        dashboard: {
            ...fullDashboard.dashboard,
            panels: panels.concat([
                {
                    ...panel,
                    panelId: createPanelId(),
                    layouts: panelLayouts,
                },
            ]),
        },
    };
}
