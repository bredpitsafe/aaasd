import { saveAsString } from '@frontend/common/src/utils/fileSaver';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import {
    createSyncedValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { takeWhile } from 'rxjs';

import {
    convertDashboardToExportableDashboardConfig,
    convertDashboardToXml,
} from '../../../utils/dashboards/converters';
import { ModuleSubscribeToCurrentDashboard } from './currentDashboardSubscription.ts';

export const ModuleExportFullDashboard = createObservableProcedure((ctx) => {
    const subscribeToCurrentDashboard = ModuleSubscribeToCurrentDashboard(ctx);

    return (_: undefined, options) => {
        return subscribeToCurrentDashboard(undefined, options).pipe(
            takeWhile((vd) => !isSyncedValueDescriptor(vd), true),
            mapValueDescriptor(({ value: fullDashboard }) => {
                const xmlString = convertDashboardToXml(
                    convertDashboardToExportableDashboardConfig(fullDashboard.dashboard),
                );

                saveAsString(xmlString, fullDashboard.dashboard.name, 'xml');

                return createSyncedValueDescriptor(true);
            }),
        );
    };
});
