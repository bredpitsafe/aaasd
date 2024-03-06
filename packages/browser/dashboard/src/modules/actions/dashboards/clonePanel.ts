import type { TContextRef } from '@frontend/common/src/di';
import { mergeMapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { compact, isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { EMPTY, of } from 'rxjs';
import { filter, first, map, switchMap } from 'rxjs/operators';

import type { TDashboardItemKey, TFullDashboard } from '../../../types/fullDashboard';
import type { TPanelContent, TPanelLayout } from '../../../types/panel';
import { DEFAULT_GRID_CELL, getLastCellLayout } from '../../../utils/layout';
import { createPanelId } from '../../../utils/panels';
import { ModuleGetDashboardValueDescriptor } from '../fullDashboards/ModuleGetDashboardValueDescriptor';
import { ModuleDashboardActions } from '../index';

export function clonePanel(
    ctx: TContextRef,
    currentDashboard$: Observable<TFullDashboard | undefined>,
    traceId: TraceId,
    panel: TPanelContent,
    relWidth: number,
    relHeight: number,
    dashboardItemKey?: TDashboardItemKey,
): Observable<boolean> {
    const { updateDashboard } = ModuleDashboardActions(ctx);
    const getDashboard$ = ModuleGetDashboardValueDescriptor(ctx);

    const destinationDashboard$ = isNil(dashboardItemKey)
        ? currentDashboard$
        : getDashboard$(dashboardItemKey).pipe(
              mergeMapValueDescriptor({
                  unsynced: () => EMPTY,
                  synced: ({ value }) => of(value),
              }),
          );

    return destinationDashboard$.pipe(
        first(),
        map((fullDashboard) =>
            isNil(fullDashboard)
                ? undefined
                : createDashboardWithPanel(fullDashboard, panel, relWidth, relHeight),
        ),
        filter((fullDashboard): fullDashboard is TFullDashboard => !isNil(fullDashboard)),
        switchMap((fullDashboard) => updateDashboard(traceId, fullDashboard)),
    );
}

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
