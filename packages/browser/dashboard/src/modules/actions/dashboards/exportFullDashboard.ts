import type { TContextRef } from '@frontend/common/src/di';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { saveAsString } from '@frontend/common/src/utils/fileSaver';
import { isNil } from 'lodash-es';
import { firstValueFrom, Observable } from 'rxjs';

import type { TFullDashboard } from '../../../types/fullDashboard';
import {
    convertDashboardToExportableDashboardConfig,
    convertDashboardToXml,
} from '../../../utils/dashboards/converters';

export async function exportFullDashboard(
    ctx: TContextRef,
    currentDashboard$: Observable<TFullDashboard | undefined>,
): Promise<void> {
    const currentFullDashboard = await firstValueFrom(currentDashboard$);

    if (isNil(currentFullDashboard)) {
        return;
    }

    const { error } = ModuleNotifications(ctx);
    const { success } = ModuleMessages(ctx);

    try {
        const xmlString = convertDashboardToXml(
            convertDashboardToExportableDashboardConfig(currentFullDashboard.dashboard),
        );

        saveAsString(xmlString, currentFullDashboard.dashboard.name, 'xml');

        await success('Dashboard exported to XML');
    } catch (err) {
        error({
            message: 'Failed to export dashboard',
            description: (err as Error).message,
        });
        throw err;
    }
}
