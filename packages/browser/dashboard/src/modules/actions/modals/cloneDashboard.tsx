import type { TContextRef } from '@frontend/common/src/di';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { ModuleBaseActions } from '@frontend/common/src/modules/actions';
import type { TStorageDashboardName } from '@frontend/common/src/types/domain/dashboardsStorage';
import {
    convertValueDescriptorObservableToPromise,
    convertValueDescriptorObservableToPromise2,
} from '@frontend/common/src/utils/Rx/convertValueDescriptorObservableToPromise';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { logger } from '@frontend/common/src/utils/Tracing';
import { isNil } from 'lodash-es';
import { firstValueFrom } from 'rxjs';

import type { TDashboardItemKey } from '../../../types/fullDashboard';
import { EOpenType } from '../../../types/router';
import { ModuleUI } from '../../ui/module';
import { ModuleDashboardsStorage } from '../fullDashboards';
import { ModuleGetDashboardValueDescriptor } from '../fullDashboards/ModuleGetDashboardValueDescriptor';
import { ModuleDashboardActions } from '../index';

export async function cloneDashboard(
    ctx: TContextRef,
    dashboardItemKey: TDashboardItemKey,
    traceId: TraceId,
): Promise<boolean> {
    const { show } = ModuleModals(ctx);
    const { createDashboard, navigateByDashboardItemKey } = ModuleDashboardActions(ctx);
    const { showError } = ModuleBaseActions(ctx);
    const { dashboardList$ } = ModuleDashboardsStorage(ctx);
    const { currentDashboardItemKey$ } = ModuleUI(ctx);
    const getDashboard$ = ModuleGetDashboardValueDescriptor(ctx);

    try {
        const fullDashboard = await convertValueDescriptorObservableToPromise2(
            getDashboard$(dashboardItemKey),
        );
        const dashboardItems = await convertValueDescriptorObservableToPromise(dashboardList$);
        const currentDashboardItemKey = await firstValueFrom(currentDashboardItemKey$);

        const { SelectDashboardNameDialog } = await import(
            '../../../components/modals/SelectDashboardNameDialog'
        );

        return new Promise<boolean>(async (resolve) => {
            const { dashboard } = fullDashboard;

            const modal = show(
                <SelectDashboardNameDialog
                    title="Clone dashboard"
                    name={dashboard.name}
                    dashboardItems={dashboardItems}
                    allowToChooseNewTab={!isNil(currentDashboardItemKey)}
                    allowExistingDashboard={false}
                    onSet={cbSet}
                    onCancel={cbCancel}
                />,
            );

            async function cbSet(
                id: TDashboardItemKey | undefined,
                name: TStorageDashboardName,
                openType: EOpenType,
            ) {
                modal.destroy();

                try {
                    const dashboardItemKey = await firstValueFrom(
                        createDashboard(traceId, { ...dashboard, name }),
                    );

                    await navigateByDashboardItemKey(dashboardItemKey, openType);

                    resolve(true);
                } catch (err) {
                    showError(err as Error);
                    logger.error(err as Error);

                    resolve(false);
                }
            }

            function cbCancel() {
                modal.destroy();
                resolve(false);
            }
        });
    } catch {
        return false;
    }
}
