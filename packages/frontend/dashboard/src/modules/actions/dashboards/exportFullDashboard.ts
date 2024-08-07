import { saveAsString } from '@frontend/common/src/utils/fileSaver';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import {
    mapValueDescriptor,
    takeWhileFirstSyncValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEmpty, omit } from 'lodash-es';

import type { TExportableDashboardFileWrapped } from '../../../types/dashboard/exportable';
import type { TExportablePanel } from '../../../types/panel/exportable';
import {
    convertDashboardToExportableDashboardConfig,
    convertDashboardToXml,
} from '../../../utils/dashboards/converters';
import { ModuleSubscribeToCurrentDashboard } from './currentDashboardSubscription.ts';

export const ModuleExportFullDashboard = createObservableProcedure((ctx) => {
    const subscribeToCurrentDashboard = ModuleSubscribeToCurrentDashboard(ctx);

    return (_: undefined, options) => {
        return subscribeToCurrentDashboard(undefined, options).pipe(
            takeWhileFirstSyncValueDescriptor(),
            mapValueDescriptor(({ value: fullDashboard }) => {
                const exportableDashboard = convertDashboardToExportableDashboardConfig(
                    fullDashboard.dashboard,
                );

                const withoutPanelIds: TExportableDashboardFileWrapped = isEmpty(
                    exportableDashboard.dashboard.panels.panel,
                )
                    ? exportableDashboard
                    : {
                          ...exportableDashboard,
                          dashboard: {
                              ...exportableDashboard.dashboard,
                              panels: {
                                  panel: exportableDashboard.dashboard.panels.panel.map(
                                      (panel) =>
                                          omit(panel, 'panelId') as Omit<
                                              TExportablePanel,
                                              'panelId'
                                          >,
                                  ),
                              },
                          },
                      };

                const xmlString = convertDashboardToXml(withoutPanelIds);

                saveAsString(xmlString, fullDashboard.dashboard.name, 'xml');

                return createSyncedValueDescriptor(true);
            }),
        );
    };
});
