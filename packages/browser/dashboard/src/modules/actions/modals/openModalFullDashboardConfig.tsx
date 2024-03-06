import type { TContextRef } from '@frontend/common/src/di';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { ModuleBaseActions } from '@frontend/common/src/modules/actions';
import type { TStorageDashboardConfig } from '@frontend/common/src/types/domain/dashboardsStorage';
import { assert } from '@frontend/common/src/utils/assert';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import { tapError } from '@frontend/common/src/utils/Rx/tap';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { logger } from '@frontend/common/src/utils/Tracing';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import { firstValueFrom, of, switchMap } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { usePanelChartEditActions } from '../../../components/hooks/usePanelChartEditActions';
import { ModalFullDashboardEditor } from '../../../components/modals/ModalFullDashboardEditor';
import type { TDashboard } from '../../../types/dashboard';
import type { TDashboardItemKey, TFullDashboard } from '../../../types/fullDashboard';
import type { TPanelId } from '../../../types/panel';
import { getDashboardItemKeyFromDashboard } from '../../../utils/dashboards';
import { convertXMLToDashboard } from '../../../utils/dashboards/converters';
import { resetDashboardDraft } from '../dashboards/resetDashboardDraft';
import { ModuleGetDashboardValueDescriptor } from '../fullDashboards/ModuleGetDashboardValueDescriptor';
import { ModuleDashboardActions } from '../index';

export async function openModalFullDashboardEditor(
    ctx: TContextRef,
    traceId: TraceId,
    dashboardItemKey: TDashboardItemKey,
    focusPanelId?: TPanelId,
): Promise<void> {
    const { show } = ModuleModals(ctx);

    const cbDestroy = () => modal.destroy();

    const modal = show(
        <InnerModalFullDashboardEditor
            ctx={ctx}
            traceId={traceId}
            dashboardItemKey={dashboardItemKey}
            focusPanelId={focusPanelId}
            onClose={cbDestroy}
        />,
    );
}

function InnerModalFullDashboardEditor({
    ctx,
    traceId,
    dashboardItemKey,
    focusPanelId,
    onClose,
}: {
    ctx: TContextRef;
    traceId: TraceId;
    dashboardItemKey: TDashboardItemKey;
    focusPanelId?: TPanelId;
    onClose: VoidFunction;
}) {
    const getDashboard$ = useModule(ModuleGetDashboardValueDescriptor);
    const dashboardDescriptor = useNotifiedValueDescriptorObservable(
        getDashboard$(dashboardItemKey),
    );

    const handleConfigApply = useFunction(async (xml: string) => {
        assert(isSyncedValueDescriptor(dashboardDescriptor), 'dashboard is not synced');

        await updateFullDashboardFromEditor(
            ctx,
            traceId,
            dashboardDescriptor.value,
            xml as TStorageDashboardConfig,
        );
    });
    const handleConfigDiscard = useFunction(async () => {
        assert(isSyncedValueDescriptor(dashboardDescriptor), 'dashboard is not synced');

        await firstValueFrom(
            resetDashboardDraft(
                ctx,
                traceId,
                getDashboardItemKeyFromDashboard(dashboardDescriptor.value),
            ),
        );
    });

    const {
        addChart: handleChartAdd,
        deleteChart: handleChartDelete,
        updateChart: handleChartChange,
        sortCharts: handleChartsSort,
    } = usePanelChartEditActions();

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
            onConfigDiscard={handleConfigDiscard}
            onChartAdd={handleChartAdd}
            onChartDelete={handleChartDelete}
            onChartChange={handleChartChange}
            onChartsSort={handleChartsSort}
        />
    );
}

async function updateFullDashboardFromEditor(
    ctx: TContextRef,
    traceId: TraceId,
    fullDashboard: TFullDashboard,
    xml: TStorageDashboardConfig,
): Promise<TDashboard | void> {
    const { success } = ModuleMessages(ctx);
    const { showError } = ModuleBaseActions(ctx);
    const { updateDashboard, renameDashboard } = ModuleDashboardActions(ctx);

    of(xml)
        .pipe(
            switchMap(convertXMLToDashboard),
            switchMap((dashboard) =>
                dashboard.name === fullDashboard.dashboard.name
                    ? of(dashboard)
                    : renameDashboard(
                          getDashboardItemKeyFromDashboard(fullDashboard),
                          dashboard.name,
                          traceId,
                      ).pipe(map((success) => (success ? dashboard : undefined))),
            ),
            switchMap((dashboard) =>
                isNil(dashboard)
                    ? of(false)
                    : updateDashboard(traceId, {
                          ...fullDashboard,
                          dashboard,
                      }),
            ),
            tapError((err) => {
                showError(err);
                logger.error(err);
            }),
            tap((status) => {
                if (status) {
                    success('Success update dashboard!');
                }
            }),
        )
        .subscribe();
}
