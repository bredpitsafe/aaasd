import type { TContextRef } from '@frontend/common/src/di';
import { assert } from '@frontend/common/src/utils/assert';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { filter, first, map, switchMap } from 'rxjs/operators';

import type { TFullDashboard } from '../../../types/fullDashboard';
import type { TPanel } from '../../../types/panel';
import { EPanelType } from '../../../types/panel';
import { visualOrderCellComparer } from '../../../utils/layout';
import { createPanel } from '../../../utils/panels';
import { ModuleDashboardActions } from '../index';

export function addPanel(
    ctx: TContextRef,
    currentDashboard$: Observable<TFullDashboard | undefined>,
    type: EPanelType,
    traceId: TraceId,
): Observable<boolean> {
    const { updateDashboard } = ModuleDashboardActions(ctx);

    return currentDashboard$.pipe(
        first(),
        map((fullDashboard) =>
            isNil(fullDashboard) ? undefined : createDashboardWithNewPanel(fullDashboard, type),
        ),
        filter((fullDashboard): fullDashboard is TFullDashboard => !isNil(fullDashboard)),
        switchMap((fullDashboard) => updateDashboard(traceId, fullDashboard)),
    );
}

function createDashboardWithNewPanel<T extends EPanelType>(
    fullDashboard: TFullDashboard,
    type: T,
): TFullDashboard | undefined {
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
        layouts: lastPanel?.layouts ?? [],
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
