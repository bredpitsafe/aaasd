import { useModule } from '@frontend/common/src/di/react';
import { EDataType, isJSON } from '@frontend/common/src/utils/dataFormat';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { generateTraceId } from '@frontend/common/src/utils/traceId';

import { ModuleDashboardActions } from '../../modules/actions';

export function useImportDashboardFile(): (file: string) => Promise<unknown> {
    const { importDashboard } = useModule(ModuleDashboardActions);

    return useFunction((file: string) => {
        return importDashboard(
            generateTraceId(),
            isJSON(file) ? EDataType.JSON : EDataType.XML,
            file,
            true,
        );
    });
}
