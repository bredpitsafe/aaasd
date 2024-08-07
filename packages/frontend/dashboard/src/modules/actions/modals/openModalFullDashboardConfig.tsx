import type { TraceId } from '@common/utils';
import { assert } from '@common/utils/src/assert.ts';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { TStorageDashboardConfig } from '@frontend/common/src/types/domain/dashboardsStorage';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import {
    mapValueDescriptor,
    switchMapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { of, switchMap } from 'rxjs';

import { usePanelChartEditActions } from '../../../components/hooks/usePanelChartEditActions';
import { ModalFullDashboardEditor } from '../../../components/modals/ModalFullDashboardEditor';
import type { TDashboardItemKey, TFullDashboard } from '../../../types/fullDashboard';
import type { TPanelId } from '../../../types/panel';
import { getDashboardItemKeyFromDashboard } from '../../../utils/dashboards';
import { convertXMLToDashboard } from '../../../utils/dashboards/converters';
import { ModuleRenameDashboard } from '../dashboards/renameDashboard';
import { ModuleUpdateDashboard } from '../dashboards/updateDashboard';
import { ModuleSubscribeToDashboard } from '../fullDashboards/ModuleSubscribeToDashboard';

export const ModuleOpenModalFullDashboardEditor = createObservableProcedure((ctx) => {
    const { show } = ModuleModals(ctx);

    return (
        {
            dashboardItemKey,
            focusPanelId,
        }: {
            dashboardItemKey: TDashboardItemKey;
            focusPanelId?: TPanelId;
        },
        options,
    ) => {
        const cbDestroy = () => modal.destroy();

        const modal = show(
            <InnerModalFullDashboardEditor
                traceId={options.traceId}
                dashboardItemKey={dashboardItemKey}
                focusPanelId={focusPanelId}
                onClose={cbDestroy}
            />,
        );

        return of(true);
    };
});

function InnerModalFullDashboardEditor({
    traceId,
    dashboardItemKey,
    focusPanelId,
    onClose,
}: {
    traceId: TraceId;
    dashboardItemKey: TDashboardItemKey;
    focusPanelId?: TPanelId;
    onClose: VoidFunction;
}) {
    const subscribeToDashboard = useModule(ModuleSubscribeToDashboard);
    const updateFullDashboardFromEditor = useModule(ModuleUpdateFullDashboardFromEditor);

    const dashboardDescriptor = useNotifiedValueDescriptorObservable(
        subscribeToDashboard(dashboardItemKey, { traceId }),
    );

    const [handleConfigApply] = useNotifiedObservableFunction((xml: string) => {
        assert(isSyncedValueDescriptor(dashboardDescriptor), 'dashboard is not synced');

        return updateFullDashboardFromEditor(
            {
                fullDashboard: dashboardDescriptor.value,
                xml: xml as TStorageDashboardConfig,
            },
            { traceId },
        );
    });

    const { updateCharts: handleChartsChange } = usePanelChartEditActions();

    if (isNil(dashboardDescriptor.value)) {
        return null;
    }

    return (
        <ModalFullDashboardEditor
            title={`Dashboard ${dashboardDescriptor.value.dashboard.name}`}
            fullDashboard={dashboardDescriptor.value}
            focusPanelId={focusPanelId}
            onClose={onClose}
            onConfigApply={handleConfigApply}
            onChartsChange={handleChartsChange}
        />
    );
}

const ModuleUpdateFullDashboardFromEditor = createObservableProcedure((ctx) => {
    const renameDashboard = ModuleRenameDashboard(ctx);
    const updateDashboard = ModuleUpdateDashboard(ctx);

    return (
        { fullDashboard, xml }: { fullDashboard: TFullDashboard; xml: TStorageDashboardConfig },
        options,
    ): Observable<TValueDescriptor2<boolean>> => {
        return of(xml).pipe(
            switchMap(convertXMLToDashboard),
            switchMap((dashboard) =>
                dashboard.name === fullDashboard.dashboard.name
                    ? of(createSyncedValueDescriptor(dashboard))
                    : renameDashboard(
                          {
                              dashboardItemKey: getDashboardItemKeyFromDashboard(fullDashboard),
                              name: dashboard.name,
                          },
                          options,
                      ).pipe(
                          mapValueDescriptor(({ value: success }) =>
                              createSyncedValueDescriptor(success ? dashboard : undefined),
                          ),
                      ),
            ),
            switchMapValueDescriptor(({ value: dashboard }) =>
                isNil(dashboard)
                    ? of(createSyncedValueDescriptor(false))
                    : updateDashboard({ ...fullDashboard, dashboard }, options).pipe(
                          mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value)),
                      ),
            ),
        );
    };
});
