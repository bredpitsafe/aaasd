import { assert } from '@common/utils/src/assert.ts';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import {
    switchMapValueDescriptor,
    takeWhileFirstSyncValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { isNil } from 'lodash-es';

import type { TFullDashboard } from '../../../types/fullDashboard';
import type { TPanel } from '../../../types/panel';
import type { EPanelType } from '../../../types/panel';
import { DEFAULT_GRID_CELL, visualOrderCellComparer } from '../../../utils/layout';
import { createPanel } from '../../../utils/panels';
import { ModuleSubscribeToCurrentDashboard } from './currentDashboardSubscription.ts';
import { ModuleUpdateDashboard } from './updateDashboard';

export const ModuleAddPanel = createObservableProcedure((ctx) => {
    const updateDashboard = ModuleUpdateDashboard(ctx);
    const subscribeToCurrentDashboard = ModuleSubscribeToCurrentDashboard(ctx);

    return (type: EPanelType, options) => {
        return subscribeToCurrentDashboard(undefined, options).pipe(
            takeWhileFirstSyncValueDescriptor(),
            switchMapValueDescriptor(({ value: fullDashboard }) =>
                updateDashboard(createDashboardWithNewPanel(fullDashboard, type), options),
            ),
        );
    };
});

function createDashboardWithNewPanel<T extends EPanelType>(
    fullDashboard: TFullDashboard,
    type: T,
): TFullDashboard {
    const { activeLayout, panels } = fullDashboard.dashboard;

    const sortedPanels = panels
        .filter((p) => p.layouts.findIndex(({ name }) => name === activeLayout) !== -1)
        .sort((a, b) => {
            const aLayout = a.layouts.find(({ name }) => name === activeLayout);
            const bLayout = b.layouts.find(({ name }) => name === activeLayout);

            assert(!isNil(aLayout) && !isNil(bLayout), 'Both layouts should be defined');

            return visualOrderCellComparer(aLayout, bLayout);
        });

    const lastPanel = sortedPanels.at(-1);
    const lastBasePanel = sortedPanels.findLast(
        (v): v is Extract<TPanel, { type: T }> => v.type === type,
    );
    const panel = createPanel({
        ...lastBasePanel,
        layouts: lastPanel?.layouts?.map((layout) => ({
            ...layout,
            relX: 0,
            relY: layout.relY + layout.relHeight,
        })) ?? [{ ...DEFAULT_GRID_CELL, name: activeLayout }],
        type,
    });

    return {
        ...fullDashboard,
        dashboard: {
            ...fullDashboard.dashboard,
            panels: fullDashboard.dashboard.panels.concat([panel]),
        },
    };
}
