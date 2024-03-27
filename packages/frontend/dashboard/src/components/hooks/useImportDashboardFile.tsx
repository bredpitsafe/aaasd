import { useModule } from '@frontend/common/src/di/react';
import { EDataType, isJSON } from '@frontend/common/src/utils/dataFormat';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { generateTraceId } from '@frontend/common/src/utils/traceId';

import { ModuleImportDashboard } from '../../modules/actions/modals/importDashboard.tsx';

export function useImportDashboardFile(): (file: string) => Promise<unknown> {
    const importDashboard = useModule(ModuleImportDashboard);
    const [call] = useNotifiedObservableFunction((file: string) => {
        return importDashboard(
            {
                type: isJSON(file) ? EDataType.JSON : EDataType.XML,
                config: file,
                confirmAdd: true,
            },

            { traceId: generateTraceId() },
        );
    });

    return call;
}
