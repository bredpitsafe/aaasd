import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { TStorageDashboardName } from '@frontend/common/src/types/domain/dashboardsStorage';
import { Defer } from '@frontend/common/src/utils/Defer.ts';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { ModuleNotifyErrorAndFail } from '@frontend/common/src/utils/Rx/ModuleNotify.ts';
import {
    squashValueDescriptors,
    switchMapValueDescriptor,
    takeWhileFirstSyncValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import { combineLatest, from, of } from 'rxjs';
import { first, map } from 'rxjs/operators';

import type { TDashboard } from '../../../types/dashboard';
import type { TDashboardItemKey } from '../../../types/fullDashboard';
import type { EOpenType } from '../../../types/router';
import {
    convertDashboardToExportableDashboardEditor,
    convertDashboardToXml,
} from '../../../utils/dashboards/converters.tsx';
import { ModuleUI } from '../../ui/module';
import { ModuleCreateDashboard } from '../dashboards/createDashboard';
import { ModuleGetDashboardList } from '../fullDashboards/getDashboardList';
import { ModuleSubscribeToDashboard } from '../fullDashboards/ModuleSubscribeToDashboard.ts';
import { ModuleNavigateByDashboardItemKey } from '../navigation/navigateByDashboardItemKey.ts';

export const ModuleCloneDashboard = createObservableProcedure((ctx) => {
    const { show } = ModuleModals(ctx);
    const notifyErrorAndFail = ModuleNotifyErrorAndFail(ctx);
    const { currentDashboardItemKey$ } = ModuleUI(ctx);
    const createDashboard = ModuleCreateDashboard(ctx);
    const getDashboardList = ModuleGetDashboardList(ctx);
    const subscribeToDashboard = ModuleSubscribeToDashboard(ctx);
    const navigateByDashboardItemKey = ModuleNavigateByDashboardItemKey(ctx);

    return (dashboardItemKey: TDashboardItemKey, options) => {
        const SelectDashboardNameDialogModule = import(
            '../../../components/modals/SelectDashboardNameDialog'
        );

        return combineLatest([
            subscribeToDashboard(dashboardItemKey, options),
            getDashboardList(undefined, options),
            currentDashboardItemKey$.pipe(first(), map(createSyncedValueDescriptor)),
            SelectDashboardNameDialogModule.then((m) =>
                createSyncedValueDescriptor(m.SelectDashboardNameDialog),
            ),
        ]).pipe(
            squashValueDescriptors(),
            takeWhileFirstSyncValueDescriptor(),
            switchMapValueDescriptor(({ value }) => {
                const defer = new Defer<
                    | undefined
                    | {
                          name: TStorageDashboardName;
                          openType: EOpenType;
                          dashboard: TDashboard;
                      }
                >();

                const [
                    fullDashboard,
                    dashboardItems,
                    currentDashboardItemKey,
                    SelectDashboardNameDialog,
                ] = value;
                const { dashboard } = fullDashboard;
                const handleSet = (
                    id: TDashboardItemKey | undefined,
                    name: TStorageDashboardName,
                    openType: EOpenType,
                ) => {
                    modal.destroy();
                    defer.resolve({ name, openType, dashboard });
                };
                const handleCancel = () => {
                    modal.destroy();
                    defer.resolve(undefined);
                };

                const modal = show(
                    <SelectDashboardNameDialog
                        title="Clone dashboard"
                        name={dashboard.name}
                        dashboardItems={dashboardItems}
                        allowToChooseNewTab={!isNil(currentDashboardItemKey)}
                        allowExistingDashboard={false}
                        onSet={handleSet}
                        onCancel={handleCancel}
                    />,
                );

                return from(defer.promise.then(createSyncedValueDescriptor));
            }),
            switchMapValueDescriptor(({ value: props }) => {
                if (isNil(props)) return of(createSyncedValueDescriptor(false));
                return createDashboard(
                    {
                        name: props.name,
                        config: convertDashboardToXml(
                            convertDashboardToExportableDashboardEditor(props.dashboard),
                        ),
                    },
                    options,
                ).pipe(
                    switchMapValueDescriptor(({ value: key }) => {
                        return navigateByDashboardItemKey(
                            { key, openType: props.openType },
                            options,
                        ).pipe(map(() => createSyncedValueDescriptor(true)));
                    }),
                );
            }),
            notifyErrorAndFail(),
        );
    };
});
